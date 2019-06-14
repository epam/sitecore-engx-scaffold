const Generator = require('yeoman-generator');
var globby = require('globby');
const path = require('path');

const utils = require('./utils.js');

/**
    Base generator has capability for processing ejs template tokens directly inside file paths.
    However, win-based paths itself does not support ejs syntaxis. This base class contains number of decorators, which
    bring the capability for path preprocessing so that default yo generator can fully leverage ejs.

    Example:
    We are going to create solution named: 'SampleProject'. Sample flow below shows how generator calculates the final dest path:

    Default dest path:      <TargetFolder>\Project\src\Foundation\FoundationProject\code\SolutionX.Foundation.FoundationProject.csproj
    Preprocessed dest path: <TargetFolder>\Project\src\Foundation\FoundationProject\code\<%= SolutionX %>.Foundation.FoundationProject.csproj
    Final dest path:        <TargetFolder>\Project\src\Foundation\FoundationProject\code\SampleProject.Foundation.FoundationProject.csproj 
*/

module.exports = class BaseGenerator extends Generator {

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
        var diskFiles = globby.sync(sourcePath, globOptions);
        return diskFiles.map(sourceFilePath => {
            var commonPath = utils.getCommonPath(sourcePath);
            var toFile = path.relative(commonPath, sourceFilePath);
            var destPath = path.join(destinationPath, toFile);
            destPath = !customOptions.preProcessPath ? destPath : customOptions.preProcessPath(destPath);
            return { sourceFilePath, destPath };
        });
    }

    _runPipeline(versionKey, destinationPath, pipeline) {
        var patches = require(this.sourceRoot() + '/patch.json');
        var rootPaths = ['default', ...(patches[versionKey] || [])];
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
