'use strict';
const chalk = require('chalk');
const yosay = require('yosay');

const BaseGenerator = require('../../lib/base-generator');
const utils = require('../../lib/utils.js');

const baseIgnore = require('../../config/ignore.json');
const msg = require('../../config/messages.json');
const versions = require('../../config/versions.json');
const settings = require('../../config/settings.json');

module.exports = class HelixGenerator extends BaseGenerator {

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

  async prompting() {
    let answers = await this.prompt([
      {
        name: 'solutionName',
        message: msg.solutionName.prompt,
        default: this.appname,
        store: true,
      }, {
        type: 'list',
        name: 'sitecoreVersion',
        message: msg.sitecoreVersion.prompt,
        choices: versions,
        store: true,
      }
    ]);

    this.options = { ...this.options, ...answers };

    answers = await this.prompt([
      {
        type: 'list',
        name: 'sitecoreUpdate',
        message: msg.sitecoreUpdate.prompt,
        choices: this.options.sitecoreVersion.value ? this.options.sitecoreVersion.value : this.options.sitecoreVersion,
        store: true,
      }
    ]);

    this.options = { ...this.options, ...answers };

    this.options.vagrantBoxName = (this.options.sitecoreUpdate.value || this.options.sitecoreUpdate).vagrantBoxName;
    this.options.hostNames = settings.hostNames;

    this.options.solutionNameUri = this.options.solutionName.replace(/[^a-z0-9\-]/ig, '-').toLowerCase();
    this.config.set('solutionNameUri', this.options.solutionNameUri);
  }

  writing() {
    super._runPipeline(this.options.sitecoreUpdate.exactVersion, this.destinationPath(), [
      this._copyYmls,
      this._copyDlls,
      this._copyAll,
    ]);
  }

  /* Copy ymls with solution and guid transforms */
  _copyYmls(rootPath, destinationPath) {
    super._copy(this.templatePath(`${rootPath}/**/*.yml`), destinationPath, {
      solutionX: this.options.solutionName
    }, {
      ...super._baseGlobOptions(),
      process: this._processYmlFile.bind(this)
    }, {
      preProcessPath: this._processPathSolutionToken
    });
  }

  /* Copy dlls without any transforms */
  _copyDlls(rootPath, destinationPath) {
    super._copy(this.templatePath(`${rootPath}/**/*.dll`), destinationPath, {}, super._baseGlobOptions(), {});
  }

  /* Copy majority of files with regular template transforms */
  _copyAll(rootPath, destinationPath) {
    super._copyTpl(this.templatePath(`${rootPath}/**/*`), destinationPath, {
      exactVersion: this.options.sitecoreUpdate.exactVersion,
      majorVersion: this.options.sitecoreUpdate.majorVersion,
      netFrameworkVersion: this.options.sitecoreUpdate.netFrameworkVersion,
      kernelVersion: this.options.sitecoreUpdate.kernelVersion,
      solutionX: this.options.solutionName,
      vagrantBoxNameX: this.options.vagrantBoxName,
      solutionUriX: this.options.solutionNameUri,
      hostNamesX: this.options.hostNames || [],
	  utils: utils
    }, {
      ...super._baseGlobOptions(),
      ignore: [...baseIgnore, ...['**/*.dll', '**/*.yml']]
    }, {
      preProcessPath: this._processPathSolutionToken
    });
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
    return destPath.replace(/SolutionX/g, '<%= solutionX %>');
  }

  async end() {
    await utils.addCredentialsToWindowsVault('sc9.local', 'vagrant', 'vagrant');

    console.log('');
    console.log('Solution name ' + chalk.green.bold(this.options.solutionName) + ' has been created.');
  }
};