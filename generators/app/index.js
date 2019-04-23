'use strict';
const Generator = require('yeoman-generator');

var globby = require('globby');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');

const utils = require('../../lib/utils.js');

const baseIgnore = require('../../config/ignore.json');
const msg = require('../../config/messages.json');
const versions = require('../../config/versions.json');

module.exports = class HelixGenerator extends Generator {
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);
    this.option('solutionName', {
      type: String,
      required: false,
      desc: 'The name of the solution.',
      default: this.appname,
    });
    this.option('sitecoreVersion', {
      type: String,
      required: false,
      desc: 'The version of sitecore to use.',
      default: versions[0].value,
    });
    this.option('sitecoreUpdate', {
      type: String,
      required: false,
      desc: 'The version of sitecore to use.',
      default: versions[0].value[0].value,
    });
  }

  // yeoman events
  initializing() {
    this.log(yosay('Welcome to ' + chalk.red.bold('Sitecore EngX Accelerator') + ' generator!'));

    this.log('');
    this.log(chalk.red.bold('YOU MUST RUN THIS GENERATOR AS AN ADMINISTRATOR.'));
    this.log('');
  }

  prompting() {
    const self = this;

    return self
      .prompt([{
        name: 'solutionName',
        message: msg.solutionName.prompt,
        default: self.appname,
      },
      {
        type: 'list',
        name: 'sitecoreVersion',
        message: msg.sitecoreVersion.prompt,
        choices: versions,
      },
      ])
      .then(function (answers) {
        self.options = Object.assign({}, self.options, answers);
        return self.prompt([{
          type: 'list',
          name: 'sitecoreUpdate',
          message: msg.sitecoreUpdate.prompt,
          choices: self.options.sitecoreVersion.value ?
            self.options.sitecoreVersion.value : self.options.sitecoreVersion,
        },]);
      })
      .then(function (answers) {
        self.options = Object.assign({}, self.options, answers);

        self.options.vagrantBoxName = (self.options.sitecoreUpdate.value ?
          self.options.sitecoreUpdate.value :
          self.options.sitecoreUpdate
        ).vagrantBoxName;

        self.options.solutionNameUri = self.options.solutionName.replace(/[^a-z0-9\-]/ig, '-').toLowerCase();

        self.async();
      });
  }

  writing() {
    const self = this;

    self.options.solutionSettings = JSON.stringify({
      solutionName: self.options.solutionName,
      solutionNameUri: self.options.solutionNameUri,
      sitecoreVersion: self.options.sitecoreVersion,
      sitecoreUpdate: self.options.sitecoreUpdate,
    });

    const baseGlobOptions = {
      dot: true,
      sync: true,
      debug: true,
    };

    /* Copy ymls without solution and guid transforms */
    this._copy(self.templatePath('**/*.yml'), self.destinationPath(self.options.solutionName),
      {
        solutionX: this.options.solutionName
      },
      {
        ...baseGlobOptions,
        process: this._processYmlFile.bind(this)
      },
      {
        preProcessPath: this._processPathSolutionToken
      }
    )

    /* Copy dlls without any transforms */
    this._copy(self.templatePath('**/*.dll'), self.destinationPath(self.options.solutionName), {}, baseGlobOptions, {});

    /* Copy majority of files with regular template transforms */
    this._copyTpl(self.templatePath('**/*'), self.destinationPath(self.options.solutionName),
      {
        exactVersion: this.options.sitecoreUpdate.exactVersion,
        majorVersion: this.options.sitecoreUpdate.majorVersion,
        netFrameworkVersion: this.options.sitecoreUpdate.netFrameworkVersion,
        kernelVersion: this.options.sitecoreUpdate.kernelVersion,
        solutionX: this.options.solutionName,
        solutionSettingsX: this.options.solutionName,
        vagrantBoxNameX: this.options.vagrantBoxName,
        solutionUriX: this.options.solutionNameUri
      },
      {
        ...baseGlobOptions,
        ignore: [...baseIgnore, ...['**/*.dll', '**/*.yml']]
      },
      {
        preProcessPath: this._processPathSolutionToken
      }
    )
  }

  _processYmlFile(content, path) {
    let result = content instanceof Buffer ? content.toString('utf8') : content;
    result = result.replace(/SolutionX/g, this.options.solutionName);

    if (path.match(/.*SolutionRoots.*\.yml/gi) || path.match(/.*serialization\.content.*\.yml/gi)) {
      result = utils.generateHashBasedItemIdsInYamlFile(result, path);
    } else if (path.match(/.*\.yml/gi)) {
      result = utils.generateHashBasedItemIdsInYamlFile(result, path, true);
    }

    return result;
  }

  _processPathSolutionToken(destPath) {
    return destPath.replace('SolutionX', '<%= solutionX %>')
  };

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
      var commonPath = utils.geCommonPath(sourcePath);
      var toFile = path.relative(commonPath, sourceFilePath);
      var destPath = path.join(destinationPath, toFile);
      destPath = !customOptions.preProcessPath ? destPath : customOptions.preProcessPath(destPath);
      return { sourceFilePath, destPath };
    });
  }

  end() {
    const self = this;

    utils.addCredentialsToWindowsVault('sc9.local', 'vagrant', 'vagrant').then(() => {
      console.log('');
      console.log('Solution name ' + chalk.green.bold(self.options.solutionName) + ' has been created.');
    });
  }
};