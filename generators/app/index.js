'use strict';
const Generator = require('yeoman-generator');

var globby = require('globby');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');

const utils = require('../../lib/utils.js');

const msg = require('../../config/messages.json');
const versions = require('../../config/versions.json');
const replacements = require('../../config/replacements.json');

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
        // Nuget version update
        self.options.nuget = [{
          old: '9.0.171219',
          new: (self.options.sitecoreUpdate.value ? self.options.sitecoreUpdate.value : self.options.sitecoreUpdate)
            .nugetVersion,
        },];

        self.options.vagrantBoxName = (self.options.sitecoreUpdate.value ?
          self.options.sitecoreUpdate.value :
          self.options.sitecoreUpdate
        ).vagrantBoxName;

        self.options.solutionNameUri = self.options.solutionName.replace(/[^a-z0-9\-]/ig, '-');

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

    const ignoreOptions = [
      // completely ignore
      '**/code/bin/**/*.*',
      '**/code/obj/**/*.*',
      '**/*.user',

      // packages
      '**/src/packages/**/*',
      '**/src/node_modules/**/*',

      // vs
      '**/.vs*/**/*',

      '**/code/((Web|web|packages).config|*.csproj)',
    ];

    this._copy(self.templatePath('**/*'), self.destinationPath(self.options.solutionName),
      { solutionX: this.options.solutionName },
      {
        ...baseGlobOptions,
        ignore: ignoreOptions,
        process: function (content, path) {
          if (typeof content === 'undefined') {
            return;
          }

          if (path.match(/.*\.dll.*/gi)) {
            return content;
          }

          var result = self._replaceTokens(content, self.options);

          self.options.nuget.forEach((id) => {
            result = result.replace(new RegExp(utils.escapeRegExp(id.old), 'g'), id.new);
          });

          replacements[self.options.sitecoreUpdate.name].forEach((pair) => {
            result = result.replace(new RegExp(utils.escapeRegExp(pair.old), 'g'), pair.new);
          });

          // scope to modifications of rainbow YAML fils only
          if (path.match(/.*SolutionRoots.*\.yml/gi) ||
            path.match(/.*serialization\.content.*\.yml/gi)
          ) {
            result = utils.generateHashBasedItemIdsInYamlFile(result, path);
          } else if (path.match(/.*\.yml/gi)) {
            result = utils.generateHashBasedItemIdsInYamlFile(result, path, true);
          }

          // Cannot set VM name if it contains periods 
          if (path.match(/.*Vagrantfile/gi)) {
            const hostname = self.options.solutionName.replace(/[^a-z0-9\-]/ig, '-').toLowerCase();
            result = result.replace(new RegExp(utils.escapeRegExp(self.options.solutionName), "g"), hostname);
          }

          return result;
        }
      },
      {
        preProcessPath: function (destPath) {
          return destPath.replace('SolutionX', '<%= solutionX %>');
        }
      }
    )

    this._copyTpl(self.templatePath('**/code/((Web|web|packages).config|*.csproj)'), self.destinationPath(self.options.solutionName),
      {
        updateVersion: this.options.sitecoreUpdate.updateVersion,
        majorVersion: this.options.sitecoreUpdate.majorVersion,
        netFrameworkVersion: this.options.sitecoreUpdate.netFrameworkVersion,
        kernelVersion: this.options.sitecoreUpdate.kernelVersion,
        solutionX: this.options.solutionName
      },
      baseGlobOptions,
      {
        preProcessPath: function (destPath) {
          return destPath.replace('SolutionX', '<%= solutionX %>');
        }
      }
    )
  }

  _copyTpl(sourcePath, destinationPath, context, globOptions, customOptions) {
    this._baseCopy(sourcePath, destinationPath, context, globOptions, customOptions,
      (filePath, destPath) => {
        this.fs.copyTpl(filePath, destPath, context, globOptions);
      })
  }

  _copy(sourcePath, destinationPath, context, globOptions, customOptions) {
    this._baseCopy(sourcePath, destinationPath, context, globOptions, customOptions,
      (filePath, destPath) => {
        this.fs.copy(filePath, destPath, globOptions, context);
      })
  }

  _baseCopy(sourcePath, destinationPath, context, globOptions, customOptions, copyFunc) {
    var diskFiles = globby.sync(sourcePath, globOptions);
    diskFiles.forEach(filePath => {
      var commonPath = utils.geCommonPath(sourcePath);
      var toFile = path.relative(commonPath, filePath);
      var destPath = path.join(destinationPath, toFile);
      destPath = customOptions.preProcessPath(destPath);
      copyFunc(filePath, destPath);
    });
  }

  end() {
    const self = this;

    utils.addCredentialsToWindowsVault('sc9.local', 'vagrant', 'vagrant').then(() => {
      console.log('');
      console.log('Solution name ' + chalk.green.bold(self.options.solutionName) + ' has been created.');
    });
  }

  _replaceTokens(input, options) {
    if (typeof input === 'undefined') {
      return input;
    }

    var content = input instanceof Buffer ? input.toString('utf8') : input;

    return content
      .replace(/SolutionSettingsX/g, options.solutionSettings)
      .replace(/SolutionX/g, options.solutionName)
      .replace(/VagrantBoxNameX/g, options.vagrantBoxName)
      .replace(/SolutionUriX/g, options.solutionNameUri);
  }
};