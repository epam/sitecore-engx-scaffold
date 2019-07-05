Param (
    [Parameter(Mandatory=$true)]
    [string]$SolutionFile,
    [Parameter(Mandatory=$false)]
    [string]$RootFolderName,
    [Parameter(Mandatory=$true)]
    [string]$ProjectFolderGuid,
    [Parameter(Mandatory=$true)]
    [string]$ProjectFolderName,
    [Parameter(Mandatory=$true)]
    [string]$ProjectName,
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath,
    [Parameter(Mandatory=$true)]
    [string]$ProjectShortPath,
    [Parameter(Mandatory=$true)]
    [string]$ProjectGuid,
    [Parameter(Mandatory=$true)]
    [string]$ProjectTypeGuid,
    [Parameter(Mandatory=$false)]
    [bool]$TouchSolutionDate=$true
)

. $PSScriptRoot\Get-SolutionFolderId.ps1
. $PSScriptRoot\Ensure-FolderInSolutionFile.ps1
. $PSScriptRoot\Add-ProjectToSolutionFile.ps1

Write-Host "Adding project $ProjectName to $SolutionFile."

## Get root folder ID
if (-not ([string]::IsNullOrEmpty($RootFolderName))) {
    $rootFolderGuid = Get-SolutionFolderId -SolutionFile $SolutionFile -FolderName $RootFolderName
    if ([string]::IsNullOrEmpty($rootFolderGuid)) {
        Write-Error -Message "Root folder name '$RootFolderName' is not found." -ErrorAction Stop
    }
}

## Add module sub-folder
Ensure-FolderInSolutionFile -SolutionFile $SolutionFile -ParentFolderGuid $rootFolderGuid -NewFolderName $ProjectFolderName -NewFolderId $ProjectFolderGuid

## Add module project
Add-ProjectToSolutionFile -SolutionFile $SolutionFile -ParentFolderName $ProjectFolderName -ParentFolderGuid $ProjectFolderGuid -ProjectName $ProjectName -ProjectPath $ProjectPath -ProjectShortPath $ProjectShortPath -ProjectTypeGuid $ProjectTypeGuid -ProjectGuid $ProjectGuid

#Setting LastWriteTime to tell Visual Studio that solution has changed.
if ($TouchSolutionDate) {
    Set-ItemProperty -Path $SolutionFile -Name LastWriteTime -Value (Get-Date)
}
