const Generator = require('yeoman-generator');
var globby = require('globby');
const path = require('path');

const utils = require('./utils.js');

module.exports = class HelixGenerator extends Generator {

    _copyTpl(sourcePath, destinationPath, ctx, globOptions, customOptions) {
        this._mapFiles(sourcePath, destinationPath, globOptions, customOptions)
            .forEach(({ sourceFilePath, destPath }) => this.fs.copyTpl(sourceFilePath, destPath, ctx, globOptions));
    }

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
}
