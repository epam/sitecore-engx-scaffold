# Sitecore EngX Scaffold

[![npm version](https://badge.fury.io/js/generator-sitecore-engx-scaffold.svg)](https://badge.fury.io/js/generator-sitecore-engx-scaffold)
[![Build status](https://ci.appveyor.com/api/projects/status/a7qjl56tmurpn7qq?svg=true)](https://ci.appveyor.com/project/asmagin/sitecore-engx-scaffold)

## OVERVIEW
The scaffold is a generator based on [Yeoman](http://yeoman.io/). It is designed to simplify and unify initial solution setup. It can save you time on configuration on early stages of the project.
#### Sitecore Versions
* 9.0 Update 1
* 9.0 Update 2

## FEATURES
* Generate a repository with a standard file structure.
* .NET and JS projects
* CAKE-build scripts
* vagrant scripts for development VM setup

Generated solution is fully compliant with [Sitecore Helix Guidelines](http://helix.sitecore.net/)

## INSTALLATION
As Sitecore is pretty heavy system you should have around **i5+ with 4+ logical cores, 16GB RAM 50GB**. VMs contains full operating system so they might be pretty heavy to start and require **up to 50GB of free space on HDD**

#### Pre-requisites
* Administrator rights to the system
* `Node.js v8.9.3` and higher ([download](https://nodejs.org/en/download/))
* `VirtualBox 5.2.4` and higher ([download](https://www.virtualbox.org/wiki/Downloads))
* `Vagrant 2.0.4` and higher ([download](https://www.vagrantup.com/downloads.html))
* Visual Studio 2017

#### Initial generation
1. There are two possible ways to get generator:
    1. [npmjs.org] `npm i generator-sitecore-engx-scaffold`
    2. [Manual]
        * Clone repository or update to current version, if you have it already.
        * In repository root following run Powershell (as Administrator) command `npm link`
		* when a problems with npm link: https://catalin.me/how-to-fix-node-js-gyp-err-cant-find-python-executable-python-on-windows/
3. Navigate to a location where you usually store your projects. Create a directory with a customer name (by default folder name would be used as a solution name. Do not include spaces or any special characters in it)
4. Inside the folder run following PS command (again as Administrator) and follow instructions of the generator.

``` powershell
npm i yo -g
npm i generator-sitecore-engx-scaffold -g
yo sitecore-engx-scaffold
```
5. Follow the generator instructions.

#### Adding Helix modules
Once the solution is generated, run following command in the repository root and follow instructions of the generator.:
``` powershell
yo sitecore-engx-scaffold:module
```

#### Re-generation
While you do not want to do this in the middle of the project, it is possible to run generation once again. Yeoman will detect conflicts and provide you with options to discard or override changes.

## FEEDBACK
If you had some issues during installation, you have ideas or feedback, please, post them to [GitHub issues section of this project](https://github.com/epam/sitecore-engx-scaffold/issues)
