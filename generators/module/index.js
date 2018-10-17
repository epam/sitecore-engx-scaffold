'use strict';
const chalk = require('chalk');
const Generator = require('yeoman-generator-asmagin');
const uuidv4 = require('uuid/v4');

const utils = require('../../lib/utils.js');

const msg = require('../../config/messages.json');
const versions = require('../../config/versions.json');
const moduleTypes = require('../../config/moduleTypes.json');
const settings = require('../../config/projectSettings.json');

module.exports = class extends Generator {
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

    this.options.unicornSerializationDependenciesX = '';
    this.options.unicornSerializationIncludeNames = [];

    this.options.solutionSettings = '';

    try {
      this.options.solutionSettings = require(this.destinationPath('SolutionSettings.json'));
    } catch (ex) {}

    if (this.options.solutionSettings && this.options.solutionSettings.solutionName) {
      this.options.solutionName = this.options.solutionSettings.solutionName;
    }

    if (this.options.solutionSettings && this.options.solutionSettings.solutionNameUri) {
      this.options.solutionNameUri = this.options.solutionSettings.solutionNameUri;
    }

    if (this.options.solutionSettings && this.options.solutionSettings.sitecoreVersion) {
      this.options.sitecoreVersion = this.options.solutionSettings.sitecoreVersion;
    }

    if (this.options.sitecoreVersion == 'latest') {
      this.options.sitecoreVersion = versions[0];
    }

    versions.forEach((version) => {
      if (this.options.sitecoreVersion == version.name) {
        this.options.sitecoreVersion = version;
        return;
      }
    });

    if (this.options.solutionSettings && this.options.solutionSettings.sitecoreUpdate) {
      this.options.sitecoreUpdate = this.options.solutionSettings.sitecoreUpdate;
    }

    if (this.options.sitecoreUpdate == 'latest') {
      this.options.sitecoreUpdate = this.options.sitecoreVersion.value[0];
    }

    if (this.options.sitecoreVersion && this.options.sitecoreVersion.value) {
      this.options.sitecoreVersion.value.forEach((update) => {
        if (this.options.sitecoreUpdate == update.name) {
          this.options.sitecoreUpdate = update;
          return;
        }
      });
    }
  }

  prompting() {
    const self = this;
    return self
      .prompt([{
          name: 'solutionName',
          message: msg.solutionName.prompt,
          default: this.options.solutionSettings.solutionName || self.appname,
          when: !self.options.solutionName,
        },
        {
          type: 'list',
          name: 'moduleType',
          message: msg.moduleType.prompt,
          default: 'Feature',
          choices: moduleTypes,
          when: !self.options.moduleType,
        },
        {
          name: 'moduleName',
          message: msg.moduleName.prompt,
          when: !self.options.moduleName,
        },
        {
          type: 'list',
          name: 'sitecoreVersion',
          message: msg.sitecoreVersion.prompt,
          default: self.options.sitecoreVersion,
          choices: versions,
          when: !self.options.sitecoreVersion,
        },
      ])
      .then(function (answers) {
        self.options = Object.assign({}, self.options, answers);

        self.options.guidSeed =
          self.options.solutionName + '.' + self.options.moduleType + '.' + self.options.moduleName;

        self.options.codeGuid = utils.guid(self.options.guidSeed);

        if (self.options.moduleType == 'Project') {
          self.options.unicornSerializationDependenciesX = self.options.solutionName + '.Feature.*';
        } else if (self.options.moduleType == 'Feature') {
          self.options.unicornSerializationDependenciesX = self.options.solutionName + '.Foundation.*';
        }

        return self.prompt([{
          type: 'list',
          name: 'sitecoreUpdate',
          message: msg.sitecoreUpdate.prompt,
          choices: self.options.sitecoreVersion.value ?
            self.options.sitecoreVersion.value : self.options.sitecoreVersion,
          when: !self.options.sitecoreUpdate,
        }, ]);
      })
      .then(function (answers) {
        self.options = Object.assign({}, self.options, answers);

        // Nuget version update
        self.options.nuget = [{
          old: '9.0.171219',
          new: (self.options.sitecoreUpdate.value ? self.options.sitecoreUpdate.value : self.options.sitecoreUpdate)
            .nugetVersion,
        }, ];

        self.async();
      });
  }

  writing() {
    const self = this;


    const globOptions = {
      dot: true,
      sync: true,
      debug: true,
      ignore: [
        // completely ignore
        '**/code/bin/**/*.*',
        '**/code/obj/**/*.*',
        '**/*.user',

        // packages
        '**/src/packages/**/*',
        '**/src/node_modules/**/*',

        // vs
        '**/.vs*/**/*',
      ],
    };


    self.fs.copy(self.templatePath('**/*.*'), self.destinationPath(), {
      globOptions,
      process: function (content, path) {
        var result = self._replaceTokens(content, self.options);

        // Replace sitecore version
        self.options.nuget.forEach((id) => {
          result = result.replace(new RegExp(utils.escapeRegExp(id.old), 'g'), id.new);
        });

        result = result.replace(/(UnicornSerializationDependenciesX)/g, self.options.unicornSerializationDependenciesX);

        // scope to modifications of rainbow YAML fils only
        if (path.match(/.*\.yml/gi)) {
          result = utils.generateHashBasedItemIdsInYamlFile(result, path, true);
        }

        return result;
      },
      processPath: function (path) {
        return self._replaceTokens(path, self.options);
      }
    });
  }

  end() {
    const self = this;

    var projectFolder = uuidv4();
    var destinationPath = this.destinationPath();
    var sourceRoot = this._sourceRoot;

    // Add the main code project
    console.log(self.options.codeGuid);
    utils
      .addProject(
        self.options.solutionName,
        self.options.moduleName,
        projectFolder,
        settings.codeProject,
        settings.codeProjectExtension,
        self.options.codeGuid,
        settings.codeProjectFolder,
        self.options.moduleType,
        settings.codePrefixExtension,
        destinationPath,
        sourceRoot,
        1
      )
      .then(() => {
        console.log(chalk.yellow.bold('Successfully added code project'));

        // Add the test project
        utils
          .addProject(
            self.options.solutionName,
            self.options.moduleName,
            projectFolder,
            settings.codeProject,
            settings.codeProjectExtension,
            utils.guid(self.options.guidSeed + '.Tests'),
            settings.testCodeProjectFolder,
            self.options.moduleType,
            settings.testPrefixExtension,
            destinationPath,
            sourceRoot,
            0
          )
          .then(() => {
            console.log(chalk.yellow.bold('Successfully added Test project'));
            console.log('');
            console.log(
              'Your ' +
              self.options.moduleType +
              ' module ' +
              chalk.green.bold(
                self.options.solutionName + '.' + self.options.moduleType + '.' + self.options.moduleName
              ) +
              ' has been created and added to ' +
              chalk.green.bold(self.options.solutionName)
            );
          });
      });
  }

  _replaceTokens(input, options) {
    if (typeof input === 'undefined') {
      return input;
    }

    var content = input instanceof Buffer ? input.toString('utf8') : input;

    return content
      .replace(/(ModuleNameX)/g, options.moduleName)
      .replace(/(ModuleTypeX)/g, options.moduleType)
      .replace(/(SolutionSettingsX)/g, options.solutionSettings)
      .replace(/(SolutionX)/g, options.solutionName)
	  .replace(/SolutionUriX/g, options.solutionNameUri);
  };
};