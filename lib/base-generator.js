'use strict';
const Generator = require('yeoman-generator');
const globby = require('globby');
const path = require('path');

const { withEnhancedConflicter } = require('./decorators.js');
const utils = require('./utils.js');

/*
  Base generator has capability for processing ejs template tokens directly inside file paths.
  However, win-based paths itself does not support ejs syntaxis. This base class contains number of decorators, which
  bring the capability for path preprocessing so that default yo generator can fully leverage ejs.

  Example:
  We are going to create solution named: 'SampleProject'. Sample flow below shows how generator calculates the final dest path:

  Default dest path:      <TargetFolder>\Project\src\Foundation\FoundationProject\website\SolutionX.Foundation.FoundationProject.csproj
  Preprocessed dest path: <TargetFolder>\Project\src\Foundation\FoundationProject\website\<%= SolutionX %>.Foundation.FoundationProject.csproj
  Final dest path:        <TargetFolder>\Project\src\Foundation\FoundationProject\website\SampleProject.Foundation.FoundationProject.csproj
*/

class BaseGenerator extends Generator {

  // Decorates default copyTpl function. Allows preprocessing through the customOptions.preProcessPath function
  _copyTpl(sourcePath, destinationPath, ctx, globOptions, customOptions) {
    this._mapFiles(sourcePath, destinationPath, globOptions, customOptions)
      .forEach(({ sourceFilePath, destPath }) => this.fs.copyTpl(sourceFilePath, destPath, ctx, globOptions));
  }

  // Decorates default copy function. Allows preprocessing through the customOptions.preProcessPath function
  _copy(sourcePath, destinationPath, ctx, globOptions, customOptions) {
    this._mapFiles(sourcePath, destinationPath, globOptions, customOptions)
      .forEach(({ sourceFilePath, destPath }) => this.fs.copy(sourceFilePath, destPath, globOptions, ctx));
  }

  _mapFiles(sourcePath, destinationPath, globOptions, customOptions) {
    const diskFiles = globby.sync(sourcePath, globOptions);
    return diskFiles.map(sourceFilePath => {
      const commonPath = utils.getCommonPath(sourcePath);
      const toFile = path.relative(commonPath, sourceFilePath);
      let destPath = path.join(destinationPath, toFile);
      destPath = !customOptions.preProcessPath ? destPath : customOptions.preProcessPath(destPath);
      return { sourceFilePath, destPath };
    });
  }

  _updateFileContent(filePath, transformations, options) {
    let contents = this.fs.read(filePath);

    contents = transformations.reduce((contents, f) => f(contents, options), contents);

    this.fs.write(filePath, contents);
  }

  _runPipeline(versionKey, destinationPath, pipeline) {
    const patches = require(this.sourceRoot() + '/patch.json');
    const rootPaths = ['default', ...(patches[versionKey] || [])];
    pipeline.forEach(f => rootPaths.forEach(rootPath => f.bind(this)(rootPath, destinationPath)));
  }

  _baseGlobOptions() {
    return {
      dot: true,
      sync: true,
      debug: false,
    };
  }
}

module.exports = withEnhancedConflicter(BaseGenerator);
