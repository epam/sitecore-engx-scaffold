Function Add-ProjectToSolutionFile {
    [CmdletBinding()]
    Param(
    [Parameter(Mandatory=$true)]
    [string]$SolutionFile,
    [Parameter(Mandatory=$true)]
    [string]$type,
    [Parameter(Mandatory=$true)]
    [string]$LayerFolderId,
    [Parameter(Mandatory=$true)]
    [string]$ModuleFolderName,
    [Parameter(Mandatory=$true)]
    [string]$ModuleFolderId,
    [Parameter(Mandatory=$true)]
    [string]$ProjectName,
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath,
    [Parameter(Mandatory=$true)]
    [string]$ShortProjectPath,
    [Parameter(Mandatory=$true)]
    [string]$ProjectType,
    [Parameter(Mandatory=$true)]
    [string]$ProjectGuid  )

    $projectLine = 'Project("' + $ProjectType + '") = "' + $ProjectName + '", "' + $ShortProjectPath + '", "{' + $ProjectGuid + '}"';

    $slnFileContent = Get-Content $SolutionFile -Raw

    Write-Output $projectLine

    if(-not($slnFileContent.Contains($projectLine)))   {
        $slnFileContent = $slnFileContent -replace '(?ms)(.*EndProject)(.*Global.*)', ('$1' + "`r`n$projectLine`r`nEndProject" + '$2' )

        $projectConfigLines = ("`t{$ProjectGuid}.Debug|Any CPU.ActiveCfg = Debug|Any CPU`r`n" + 
            "`t`t{$ProjectGuid}.Debug|Any CPU.Build.0 = Debug|Any CPU`r`n" + 
            "`t`t{$ProjectGuid}.Release|Any CPU.ActiveCfg = Release|Any CPU`r`n" + 
            "`t`t{$ProjectGuid}.Release|Any CPU.Build.0 = Release|Any CPU`r`n`t")
        $slnFileContent = $slnFileContent -replace '(?ms)(.*)(EndGlobalSection.*?GlobalSection\(SolutionProperties\).*)', ('$1'+$projectConfigLines+'$2' )


        $nestedProjectsLine = "`t{$ProjectGuid} = {$ModuleFolderId}`r`n`t"
        $slnFileContent = $slnFileContent -replace '(?ms)(.*)(EndGlobalSection.*?GlobalSection\(ExtensibilityGlobals\).*)', ('$1'+$nestedProjectsLine+'$2' )

        $slnFileContent = $slnFileContent -replace '(?ms)(.*)(EndGlobal.*)', ('$1EndGlobal')

        Set-Content $slnFileContent -Path $SolutionFile
    }
}
