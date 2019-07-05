'use strict';
const chalk = require('chalk');
const BaseGenerator = require('../../lib/base-generator');
const uuidv4 = require('uuid/v4');

const utils = require('../../lib/utils.js');

const msg = require('../../config/messages.json');
const versions = require('../../config/versions.json');
const moduleTypes = require('../../config/moduleTypes.json');
const settings = require('../../config/projectSettings.json');

const baseIgnore = require('../../config/ignore.json');

module.exports = class extends BaseGenerator {
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);
    
    this.option('solutionName', {
      type: String,
      required: false,
      desc: 'The name of the solution.',
    });
    this.option('moduleType', {
      type: String,
      required: false,
      desc: 'The type of the module (Foundation|Feature|Project).',
    });
    this.option('moduleName', {
      type: String,
      required: false,
      desc: 'The name of the module.',
    });
    this.option('sitecoreVersion', {
      type: String,
      required: false,
      desc: 'The version of sitecore to use.',
    });
    this.option('sitecoreUpdate', {
      type: String,
      required: false,
      desc: 'The version of sitecore to use.',
    });

    var config = this.config.getAll();

    if (config && config.promptValues) {
      this.options.solutionName = config.promptValues.solutionName;
      this.options.sitecoreVersion = config.promptValues.sitecoreVersion;
      this.options.sitecoreUpdate = config.promptValues.sitecoreUpdate;
    }

    this.options.solutionNameUri = config && config.solutionNameUri;
    this.options.unicornSerializationDependenciesX = '';
  }

  async prompting() {
    var answers = await this.prompt([
      {
        name: 'solutionName',
        message: msg.solutionName.prompt,
        default: this.options.solutionName || this.appname,
        when: !this.options.solutionName,
      },
      {
        type: 'list',
        name: 'moduleType',
        message: msg.moduleType.prompt,
        default: 'Feature',
        choices: moduleTypes,
        when: !this.options.moduleType,
      },
      {
        name: 'moduleName',
        message: msg.moduleName.prompt,
        when: !this.options.moduleName,
      },
      {
        type: 'list',
        name: 'sitecoreVersion',
        message: msg.sitecoreVersion.prompt,
        default: this.options.sitecoreVersion,
        choices: versions,
        when: !this.options.sitecoreVersion,
      },
    ]);

    this.options = { ...this.options, ...answers };

    this.options.guidSeed = this.options.solutionName + '.' + this.options.moduleType + '.' + this.options.moduleName;
    this.options.codeGuid = utils.guid(this.options.guidSeed);

    if (this.options.moduleType == 'Project') {
      this.options.unicornSerializationDependenciesX = this.options.solutionName + '.Feature.*';
    } else if (this.options.moduleType == 'Feature') {
      this.options.unicornSerializationDependenciesX = this.options.solutionName + '.Foundation.*';
    }

    var sitecoreUpdateAnswers = await this.prompt([{
        type: 'list',
        name: 'sitecoreUpdate',
        message: msg.sitecoreUpdate.prompt,
        choices: this.options.sitecoreVersion.value && this.options.sitecoreVersion.value,
        when: !this.options.sitecoreVersion,
      },
    ]);
  }

  writing() {
    var destinationPath = this.destinationPath(`src/${this.options.moduleType}/${this.options.moduleName}`);

    super._runPipeline(this.options.sitecoreUpdate.exactVersion, destinationPath,
      [
        this._copyYmls,
        this._copyAll,
      ]);
  }

  /* Copy majority of files with regular template transforms */
  _copyAll(rootPath, destinationPath) {
    super._copyTpl(this.templatePath(`${rootPath}/**/*`), destinationPath,
      {
        exactVersion: this.options.sitecoreUpdate.exactVersion,
        majorVersion: this.options.sitecoreUpdate.majorVersion,
        netFrameworkVersion: this.options.sitecoreUpdate.netFrameworkVersion,
        kernelVersion: this.options.sitecoreUpdate.kernelVersion,
        solutionX: this.options.solutionName,
        moduleTypeX: this.options.moduleType,
        moduleNameX: this.options.moduleName,
        solutionUriX: this.options.solutionNameUri,
        unicornSerializationDependenciesX: this.options.unicornSerializationDependenciesX,
      },
      {
        ...super._baseGlobOptions(),
        ignore: [...baseIgnore, ...['**/*.yml']]
      },
      {
        preProcessPath: this._processPathModuleTokens
      }
    );
  }

   /* Copy ymls with solution and guid transforms */
   _copyYmls(rootPath, destinationPath) {
    super._copy(this.templatePath(`${rootPath}/**/*.yml`), destinationPath,
    {
      solutionX: this.options.solutionName,
      moduleTypeX: this.options.moduleType,
      moduleNameX: this.options.moduleName,
    },
    {
      ...super._baseGlobOptions(),
      process: this._processYmlFile.bind(this)
    },
    {
      preProcessPath: this._processPathModuleTokens
    }
  )
 }

  _processYmlFile(content, path) {
    var result = this._replaceTokens(content, this.options);
    result = result.replace(/(UnicornSerializationDependenciesX)/g, this.options.unicornSerializationDependenciesX);

    // scope to modifications of rainbow YAML fils only
    if (path.match(/.*\.yml/gi)) {
      result = utils.generateHashBasedItemIdsInYamlFile(result, path, true);
    }

    return result;
  }

  _processPathModuleTokens(destPath) {
    return destPath
      .replace(/SolutionX/g, '<%= solutionX %>')
      .replace(/ModuleNameX/g, '<%= moduleNameX %>')
      .replace(/ModuleTypeX/g, '<%= moduleTypeX %>');
  };

  async end() {
    var projectFolderGuid = uuidv4();
    var destinationPath = this.destinationPath();
    var sourceRoot = this._sourceRoot;
    var solutionFilePath = `${destinationPath}\\src\\${this.options.solutionName}.sln`;

    // Add the main code project
    console.log(this.options.codeGuid);
    await utils.addHelixBasedProject({
      sourceRoot,
      solutionFilePath,
      solutionName: this.options.solutionName,
      projectName: this.options.moduleName, 
      projectFolderGuid,
      projectTypeGuid: settings.codeProject,
      projectFileExtension: settings.codeProjectExtension, 
      projectGuid: this.options.codeGuid,
      fsFolder: settings.codeProjectFolder,
      helixLayerType: this.options.moduleType, 
      projectNameSuffix: settings.codePrefixExtension,
      isNewProjectSolutionFolder: 1
    });

    console.log(chalk.yellow.bold('Successfully added code project'));

    // Add the test project
    await utils.addHelixBasedProject({
      sourceRoot,
      solutionFilePath,
      solutionName: this.options.solutionName,
      projectName: this.options.moduleName, 
      projectFolderGuid,
      projectTypeGuid: settings.codeProject,
      projectFileExtension: settings.codeProjectExtension, 
      projectGuid: utils.guid(this.options.guidSeed + '.Tests'),
      fsFolder: settings.testCodeProjectFolder,
      helixLayerType: this.options.moduleType, 
      projectNameSuffix: settings.testPrefixExtension,
      isNewProjectSolutionFolder: 0
    });

    console.log(chalk.yellow.bold('Successfully added Test project'));
    console.log('');
    console.log('Your ' + this.options.moduleType + ' module '
      + chalk.green.bold(this.options.solutionName + '.' + this.options.moduleType + '.' + this.options.moduleName)
      + ' has been created and added to ' + chalk.green.bold(this.options.solutionName)
    );
  }

  _replaceTokens(input, options) {
    var content = input instanceof Buffer ? input.toString('utf8') : input;
    return content
      .replace(/(ModuleNameX)/g, options.moduleName)
      .replace(/(ModuleTypeX)/g, options.moduleType)
      .replace(/(SolutionX)/g, options.solutionName)
  };
};