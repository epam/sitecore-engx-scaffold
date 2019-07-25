'use strict';
const chalk = require('chalk');

const projectSettings = require('../config/projectSettings.json');

const findProject = (contents, project) => {
  const { projectTypeGuid, projectName, projectPath, projectGuid } = project;
  const valueOrAny = (value) => value ? `(${value})` : `(.*?)`;
  const guidOrAny = (value) => value ? `{(${value.toUpperCase()})}` : `{(.*?)}`;

  const regex = new RegExp(`Project\\("${guidOrAny(projectTypeGuid)}"\\) = "${valueOrAny(projectName)}", "${valueOrAny(projectPath)}", "${guidOrAny(projectGuid)}"[\\s\\r\\n]+?EndProject`, "g");
  const match = regex.exec(contents);

  return match && {
    projectTypeGuid: match[1],
    projectName: match[2],
    projectPath: match[3],
    projectGuid: match[4],
  };
};

const addProject = (contents, project, parentProjectGuid, configurations) => {
  const { projectTypeGuid, projectName, projectPath, projectGuid } = project;

  const foundProject = findProject(contents, { projectGuid });
  if (foundProject) {
    throw `Project (guid='${projectGuid}', name='${foundProject.projectName}') is already exists.`;
  }

  const projectBeginBlock = `Project("{${projectTypeGuid.toUpperCase()}}") = "${projectName}", "${projectPath}", "{${projectGuid.toUpperCase()}}"`;
  const projectEndBlock = `EndProject`;
  contents = contents.replace(/(EndProject.*)([\n\r]+)(.*Global)/g, `$1$2${projectBeginBlock}$2${projectEndBlock}$2$3`);

  if (parentProjectGuid) {
    const nestedProjectsLine = `{${projectGuid.toUpperCase()}} = {${parentProjectGuid.toUpperCase()}}`;
    contents = contents.replace(
      /(GlobalSection\(NestedProjects\) = preSolution.*)(\s+)([\s\S]+?)(\s+)(.*EndGlobalSection)/g,
      `$1$2$3$2${nestedProjectsLine}$4$5`);
  }

  for (const configuration of configurations || []) {
    const activeConfigLine = `{${projectGuid.toUpperCase()}}.${configuration}.ActiveCfg = ${configuration}`;
    const build0ConfigLine = `{${projectGuid.toUpperCase()}}.${configuration}.Build.0 = ${configuration}`;
    contents = contents.replace(
      /(GlobalSection\(ProjectConfigurationPlatforms\) = postSolution.*)(\s+)([\s\S]+?)(\s+)(.*EndGlobalSection)/g,
      `$1$2$3$2${activeConfigLine}$2${build0ConfigLine}$4$5`);
  }

  return contents;
};

module.exports = {

  addProject: function (solutionFileContents, options) {
    const {
      rootFolderName, projectFolderGuid, projectFolderName, projectName, projectPath, projectGuid, projectTypeGuid
    } = options;
    const originalContents = solutionFileContents;

    try {
      console.log();
      console.log(chalk.green("Adding project $ProjectName to $SolutionFile."));

      // Get root folder guid if applicable
      let rootFolderInfo = null;
      if (rootFolderName) {
        rootFolderInfo = findProject(solutionFileContents, { projectName: rootFolderName, projectTypeGuid: projectSettings.folderProject });
        if (!rootFolderInfo) {
          throw `Root folder name '${rootFolderName}' is not found`;
        }
      }

      // Find or Add module sub-folder
      let folderProjectInfo = findProject(solutionFileContents, { projectName: projectFolderName, projectGuid: projectFolderGuid, projectTypeGuid: projectSettings.folderProject });
      if (!folderProjectInfo) {
        folderProjectInfo = {
          projectTypeGuid: projectSettings.folderProject,
          projectName: projectFolderName,
          projectPath: projectFolderName,
          projectGuid: projectFolderGuid
        };

        solutionFileContents = addProject(solutionFileContents, folderProjectInfo, rootFolderInfo && rootFolderInfo.projectGuid);
      }

      // Add module project
      solutionFileContents = addProject(solutionFileContents, {
        projectTypeGuid,
        projectName,
        projectPath: projectPath,
        projectGuid
      }, folderProjectInfo.projectGuid, projectSettings.buildConfiguration);

      console.log(chalk.green.bold(`SUCCESS: Adding project (guid='${projectGuid}', name='${projectName}') was successfully requested.`));

      return solutionFileContents;
    }
    catch (err) {
      console.log(chalk.red.bold(`FAILED: Unable to add project (guid='${projectGuid}', name='${projectName}') to the solution file.`));
      console.log(chalk.red.bold(err));
    }

    return originalContents;
  },

  addHelixBasedProject: function (solutionFileContents, options) {
    const {
      solutionName, projectName, projectFileExtension, fsFolder, helixLayerType, projectNameSuffix, ...restOptions
    } = options;

    const LayeredPrefixName = `${solutionName}.${helixLayerType}.${projectName}${projectNameSuffix}`;

    const projectPath = `${helixLayerType}\\${projectName}\\${fsFolder}\\${LayeredPrefixName}${projectFileExtension}`;

    return this.addProject(solutionFileContents, {
      ...restOptions,
      rootFolderName: helixLayerType,
      projectFolderName: projectName,
      projectName: LayeredPrefixName,
      projectPath,
    });
  },

}