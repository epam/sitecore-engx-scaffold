param
(
[Parameter(Mandatory=$true)]
[ValidateSet("project", "feature", "foundation", "configuration")]
[string]$Type,
[Parameter(Mandatory=$true)]
[string]$SolutionFile,
[Parameter(Mandatory=$true)]
[string]$Name,
[Parameter(Mandatory=$true)]
[bool]$IsNewProjectSolutionFolder,
[Parameter(Mandatory=$true)]
[string]$ProjectPath,
[Parameter(Mandatory=$true)]
[string]$ShortProjectPath,
[Parameter(Mandatory=$true)]
[string]$SolutionFolderName,
[Parameter(Mandatory=$true)]
[string]$ProjectType,
[Parameter(Mandatory=$true)]
[string]$ProjectFolderGuid,
[Parameter(Mandatory=$true)]
[string]$ProjectGuid,
[Parameter(Mandatory=$false)]
[bool]$TouchSolutionDate=$true
)

. $PSScriptRoot\Get-SolutionFolderId.ps1
. $PSScriptRoot\Add-ModuleFolderToSolutionFile.ps1
. $PSScriptRoot\Add-ProjectToSolutionFile.ps1

Write-Host "Adding project $Name."

## Get Layer forlder ID
$layerFolderId = Get-SolutionFolderId -SolutionFile $SolutionFile -Type $Type

## Add module sub-folder
Add-ModuleFolderToSolutionFile -SolutionFile  $SolutionFile -Type $Type -LayerFolderId $layerFolderId -ModuleFolderName $SolutionFolderName -ModuleFolderId $ProjectFolderGuid

## Add module project
Add-ProjectToSolutionFile -SolutionFile  $SolutionFile -Type $Type -LayerFolderId $layerFolderId -ModuleFolderName $SolutionFolderName -ModuleFolderId $ProjectFolderGuid -ProjectName $Name -ProjectPath $ProjectPath -ShortProjectPath $ShortProjectPath -ProjectType $ProjectType -ProjectGuid $ProjectGuid  

#Setting LastWriteTime to tell Visual Studio that solution has changed.
if ($TouchSolutionDate) {
	Set-ItemProperty -Path $SolutionFile -Name LastWriteTime -Value (get-date)
}
