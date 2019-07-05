Function Add-ProjectToSolutionFile {
    [CmdletBinding()]
    Param(
        [Parameter(Mandatory=$true)]
        [string]$SolutionFile,
        [Parameter(Mandatory=$true)]
        [string]$ParentFolderName,
        [Parameter(Mandatory=$true)]
        [string]$ParentFolderGuid,
        [Parameter(Mandatory=$true)]
        [string]$ProjectTypeGuid,
        [Parameter(Mandatory=$true)]
        [string]$ProjectName,
        [Parameter(Mandatory=$true)]
        [string]$ProjectPath,
        [Parameter(Mandatory=$true)]
        [string]$ProjectShortPath,
        [Parameter(Mandatory=$true)]
        [string]$ProjectGuid
    )

    $projectLine = 'Project("' + $ProjectTypeGuid + '") = "' + $ProjectName + '", "' + $ProjectShortPath + '", "{' + $ProjectGuid + '}"'
    Write-Host "Adding '$projectLine' to $SolutionFile."

    $slnFileContent = Get-Content $SolutionFile -Raw

    if ($slnFileContent.Contains($projectLine)) {
        Write-Warning "The project '$ProjectName/$ProjectShortPath/$ProjectGuid` already exists in $SolutionFile solution"
        return
    }

    $slnFileContent = $slnFileContent -replace '(?ms)(.*EndProject)(.*Global.*)', ('$1' + "`r`n$projectLine`r`nEndProject" + '$2' )

    $projectConfigLines = ("`t{$ProjectGuid}.Debug|Any CPU.ActiveCfg = Debug|Any CPU`r`n" + 
        "`t`t{$ProjectGuid}.Debug|Any CPU.Build.0 = Debug|Any CPU`r`n" + 
        "`t`t{$ProjectGuid}.Release|Any CPU.ActiveCfg = Release|Any CPU`r`n" + 
        "`t`t{$ProjectGuid}.Release|Any CPU.Build.0 = Release|Any CPU`r`n`t")
    $slnFileContent = $slnFileContent -replace '(?ms)(.*)(EndGlobalSection.*?GlobalSection\(SolutionProperties\).*)', ('$1'+$projectConfigLines+'$2' )

    $nestedProjectsLine = "`t{$ProjectGuid} = {$ParentFolderGuid}`r`n`t"
    $slnFileContent = $slnFileContent -replace '(?ms)(.*)(EndGlobalSection.*?GlobalSection\(ExtensibilityGlobals\).*)', ('$1'+$nestedProjectsLine+'$2' )

    $slnFileContent = $slnFileContent -replace '(?ms)(.*)(EndGlobal.*)', ('$1EndGlobal')

    Set-Content $slnFileContent -Path $SolutionFile
}
