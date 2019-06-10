# <%= solutionX %> solution

## Prerequisites

* Visual Studio 2017 or/and VS Code
* Vagrant 2.0.1+
* VirtualBox 5.2.4+

## Installation

1.  Download source code
1.  Install VirtualBox
1.  Install Vargant
1.  Add Sitecore 9.0 box and install plugin for vagrant. (Find more details about vagrant boxes creation [here](https://github.com/asmagin/sitecore-packer))

```powershell
vagrant box add w16s-sc901 <local path to box file>
vagrant plugin install vagrant-hostsupdater # this plugin will automatically set hosts entries
```

5.  Start vagrant (as administrator).
    This will create a VM with IP address `192.168.50.4` which could be accessed with `vagrant/vagrant` account/password.

```powershell
vagrant up
```

6.  Run cake build

```powershell
cd ./src
./build.ps1
```

7.  Login into Sitecore and republish the site.

_\*\*\* NOTE: You might need to manually install some packages in case of errors with automation. Do following steps and restart step 6 above._

1.  Download package
1.  Log in to a site http://<%= solutionX %>-local.azurewebsites.net/sitecore/shell or http://<%= solutionX %>.local and install the package.
    _Note: after installation, you might need to manually update `web.config` with package specific assembly redirects._

#### Using vagrant box

* `vagrant up` - start
* `vagrant halt` - stop
* `vagrant destroy` - destroy box

#### Credentials

##### GUI & WinRM

```powershell
vagrant # User
vagrant # Password
```

##### SQL Server

```powershell
sa # User
Vagrant42 # SQL SA password
```

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
