'use strict';
const chalk = require('chalk');
const Generator = require('yeoman-generator-asmagin');
const yosay = require('yosay');

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
        }, ]);
      })
      .then(function (answers) {
        self.options = Object.assign({}, self.options, answers);
        // Nuget version update
        var newNugetVersion = (self.options.sitecoreUpdate.value ?
          self.options.sitecoreUpdate.value :
          self.options.sitecoreUpdate).nugetVersion
        if (newNugetVersion && newNugetVersion !== "") {
          self.options.nuget = [{
            old: '9.0.171219',
            new: (self.options.sitecoreUpdate.value ? self.options.sitecoreUpdate.value : self.options.sitecoreUpdate)
              .nugetVersion,
          }, ];
        }

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

    // // Rename files
    // this.registerTransformStream(getRenameTransformStream(this.options));

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

    self.fs.copy(self.templatePath('**/*'), self.destinationPath(self.options.solutionName), {
      globOptions,
      process: function (content, path) {
        if (typeof content === 'undefined') {
          return;
        }

        if (path.match(/.*\.dll.*/gi)) {
          return content;
        }

        var result = self._replaceTokens(content, self.options);

        if (self.options.nuget) {
          self.options.nuget.forEach((id) => {
            result = result.replace(new RegExp(utils.escapeRegExp(id.old), 'g'), id.new);
          });
        }

        replacements[self.options.sitecoreUpdate.name].forEach((replacement) => {
          if (replacement.filePartsFilter && path.includes(replacement.filePartsFilter)) {
            result = result.replace(replacement.old, replacement.new);
          } else if (!replacement.filePartsFilter) {
            result = result.replace(new RegExp(utils.escapeRegExp(replacement.old), 'g'), replacement.new);
          }
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
      },
      processPath: function (path) {
        return self._replaceTokens(path, self.options);
      },
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