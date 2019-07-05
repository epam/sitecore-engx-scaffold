var uuidv4 = require('uuid/v4');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var shell = require('node-powershell');
var chalk = require('chalk');

const guid = function (input) {
  if (!input || input.length < 1) { // no parameter supplied
    return uuidv4(); // return guid v4() uuid
  } else { // create a consistent (non-random!) UUID
    var hash = crypto.createHash('sha256').update(input.toString()).digest('hex').substring(0, 36);
    var chars = hash.split('');
    chars[8] = '-';
    chars[13] = '-';
    // chars[14] = '4';
    chars[18] = '-';
    // chars[19] = '8';
    chars[23] = '-';
    hash = chars.join('');
    return hash;
  }
};

module.exports = {
  escapeRegExp: function (input) {
    if (typeof input === 'undefined') {
      return '';
    }
    return input.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  },
  guid: guid,
  generateHashBasedItemIdsInYamlFile: function (content, path, replaceParentID) {
    var result = content;

    var pathRegex = new RegExp(/^Path: ((\/[^/\r\n]+(?:\/[^/\r\n]+)+)\/(?:[^/\r\n]+))$/, 'gm');
    var matches = pathRegex.exec(result);

    if (matches.length > 2) {
      const ymlPath = matches[1];
      const ymlParentPath = matches[2];

      // Replace template item ID with ID generated from path hash
      const hashedID = guid(ymlPath);
      result = result.replace(/^ID: ".+?"$/gmi, 'ID: "' + hashedID + '"');

      // Generate Parent hash-based ID only for Layers Roots 
      if (replaceParentID) {
        const hashedParentID = guid(ymlParentPath);
        result = result.replace(/^Parent: ".+?"$/gmi, 'Parent: "' + hashedParentID + '"');
      }
    }
    return result
  },

  addHelixBasedProject: async function (options) {
    const {
      solutionName, projectName, projectFileExtension, fsFolder, helixLayerType, projectNameSuffix, ...restOptions
    } = options;

    const LayeredPrefixName = `${solutionName}.${helixLayerType}.${projectName}${projectNameSuffix}`;

    const projectPath = `src\\${helixLayerType}\\${projectName}\\${fsFolder}\\${LayeredPrefixName}${projectFileExtension}`;
    const projectShortPath = `${helixLayerType}\\${projectName}\\${fsFolder}\\${LayeredPrefixName}${projectFileExtension}`;

    await this.addProject({
      ...restOptions,
      rootFolderName: helixLayerType,
      projectFolderName: projectName,
      projectName: LayeredPrefixName,
      projectPath, 
      projectShortPath
    });
  },

  addProject: async function (options) {
    const {
      sourceRoot, solutionFilePath, rootFolderName, projectFolderGuid, projectFolderName, projectName, projectPath, projectShortPath, projectGuid, projectTypeGuid, isNewProjectSolutionFolder
    } = options;

    const apostrophizeValue = (originalValue) => `\'${(originalValue || '')}\'`;
    const buildScriptParameters = (parameters) => Object.keys(parameters)
      .reduce((acc, name) => `${acc} -${name} ${apostrophizeValue(parameters[name])}`, '');

    // TODO: use Guid type in PS scripts
    const scriptParameters = buildScriptParameters({
      "SolutionFile": solutionFilePath,
      "RootFolderName": rootFolderName,
      "ProjectFolderGuid": projectFolderGuid.toUpperCase(),
      "ProjectFolderName": projectFolderName,
      "ProjectName": projectName,
      "ProjectPath": projectPath,
      "ProjectShortPath": projectShortPath,
      "ProjectGuid": projectGuid.toUpperCase(),
      "ProjectTypeGuid": projectTypeGuid.toUpperCase()
    });

    const pathToAddProjectScript = path.join(sourceRoot, '../../../powershell/add-project.ps1');

    const ps = new shell({
      executionPolicy: 'Unrestricted'
    });

    ps.addCommand(pathToAddProjectScript + ' ' + scriptParameters);
    ps.addCommand('Pop-Location');

    try {
      const output = await ps.invoke();
      console.log(chalk.green.bold('SUCCESS: installation finished'));
      console.log(output);
    } catch (err) {
      // TODO: investigate why the exceptions are not forwarded
      console.log(chalk.red.bold('FAILED: installation finished with an error'));
      console.log(chalk.red.bold(err));
    } finally {
      ps.dispose();
    }
  },

  addCredentialsToWindowsVault: async function (ip, username, password) {
    const ps = new shell({
      executionPolicy: 'Unrestricted'
    });

    ps.addCommand(`cmdkey /delete:${ip}; cmdkey /add:${ip} /user:${username} /pass:${password};`);

    try {
      const output = await ps.invoke();
      console.log(chalk.green.bold('SUCCESS: credentials added to Windows Vault'));
      console.log(output);
    } catch (err) {
      console.log(chalk.red.bold('FAILED: failed to add credentials'));
      console.log(chalk.red.bold(err));
    } finally {
      ps.dispose();
    }
  },
  getCommonPath: function (filePath) {
    if (Array.isArray(filePath)) {
      filePath = filePath
        .filter(notNullOrExclusion)
        .map(this.getCommonPath.bind(this));

      return commondir(filePath);
    }
  
    var globStartIndex = filePath.indexOf('*');
    if (globStartIndex !== -1) {
      filePath = filePath.substring(0, globStartIndex + 1);
    } else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      return filePath;
    }

    return path.dirname(filePath);
  }
}