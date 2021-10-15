# <%= solutionX %> solution

## Prerequisites

### Environment
* VirtualBox 5.2.4+ - [here](https://www.virtualbox.org/wiki/Downloads)
* VirtualBox Extension Pack
* Vagrant 2.0.1+ - [here](https://www.vagrantup.com/downloads.html)
* Vagrant plugin vagrant-hostmanager
* at least 30gb free space on C: drive and 10 gb for downloaded box file

### Development
* NodeJS / npm - [here](https://nodejs.org/en/)
* Visual Studio 2017 or/and VS Code
* *(optional)* Visual Studio plugin Cake for Visual Studio - [here](https://marketplace.visualstudio.com/items?itemName=vs-publisher-1392591.CakeforVisualStudio)
* *(optional)* Resharper
* *(optional)* Resharper plugin StyleCop for ReSharper - [here](https://github.com/StyleCop/StyleCop.ReSharper)

## Installation

1.  Download source code
1.  Install VirtualBox
1.  Install Vargant
1.  Add Sitecore box and install plugin for vagrant.
    ```powershell
    vagrant box add w16s-sc930 <local path to box file>
    vagrant plugin install vagrant-hostmanager # this plugin will automatically set hosts entries
    ```
1.  Start vagrant (as administrator).
    This will create a VM with IP address `192.168.50.4` which could be accessed with `vagrant/vagrant` account/password.
    ```powershell
    vagrant up
    ```
1.  Place your license.xml file to *(gitroot)* and *(gitroot)*/src folders.
1.  Install SitecoreRootCert.pfx certificate to your host TrustedRootCertificationAuthorities from "c:\certificates\SitecoreRootCert.pfx" to get rid of SSL warnings in browser (may require reboot). Default password is `vagrant`.
1.  Run cake build
    ```powershell
    cd ./src
    ./build.ps1
    ```
1.  Login into Sitecore `http://sc9.local/sitecore` and republish the site.

_\*\*\* NOTE: You might need to manually install some packages in case of errors with automation. Do following steps and restart step 6 above._

1.  Download package
1.  Log in to a site http://<%= solutionX %>.local/sitecore or http://<%= solutionX %>-local.azurewebsites.net/sitecore and install the package.
    _Note: after installation, you might need to manually update `web.config` with package specific assembly redirects._

#### Using vagrant box

* `vagrant up` - start
* `vagrant halt` - stop
* `vagrant destroy` - destroy box

#### Credentials

1. Website:
    * address: http://sc9.local

1. Sitecore Admin:
    * address: http://sc9.local/sitecore
    * creds: admin/b

1. Remote Desktop Connection
    * ip: sc9.local
    * creds: vagrant/vagrant

1. Network file share
    * address: \\sc9.local\c$\inetpub\wwwroot\
    * creds: vagrant/vagrant

1. SQL connection
    * ip: sc9.local
    * creds: sa/Vagrant42

## Build

### HTML/CSS/JS

Front-end code is processed using webpack. In order to start build run following commands.

```bash
cd ./src
npm start dev:local # will start build and use local sitecore installation as a source for layout
```

```bash
##### Additional commands for UI development:
npm run dev:static-content # run UI development in disconnected mode using local JSON
npm run dev:dev # will use layout date from DEV
npm run dev:qat # will use layout date from QAT
```

### Sitecore

Sitecore project could be build using standard Visual Studio tools. However, in order to deploy all project required for the solution it is better to use `cake` script

```powershell
cd ./src
./build.ps1 -Target Full # this will run full build including tests. Consider using it once new branch is checked-out.
```

```powershell
##### "Light" build command
cd ./src
./build.ps1 # this will run ONLY UI and SC build/deployment.
```

#### Cake Task Runner for Visual Studio

1.  Install cake extension for Visual Studio: https://marketplace.visualstudio.com/items?itemName=vs-publisher-1392591.CakeforVisualStudio
2.  Run PowerShell and navigate to "src" folder, then execute script "cake.ps1" in order to install cake executable
3.  Open Visual Studio and add external tool location, Open "Tools -> Options -> Project and Solutions -> Web Package Management -> External Tools", and add location of nodejs folder, by default it is: "C:\Program Files\nodejs"
4.  Make sure you are not using Visual Studio running under Administrator privileges

### Other

#### WinRT access to the box (sample of NodeJS installation)

```powershell
Enable-PSRemoting -SkipNetworkProfileCheck
winrm quickconfig
winrm set winrm/config/client '@{TrustedHosts="192.168.50.4"}'
$pwd = ConvertTo-SecureString "vagrant" -AsPlainText -Force
$creds = New-Object System.Management.Automation.PSCredential ("vagrant", $pwd)
Enter-PSSession -ComputerName 192.168.50.4 -Credential $creds
choco install nodejs.install --version 8.9.4 -y
exit
```
