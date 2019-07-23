Function Ensure-FolderInSolutionFile {
    [CmdletBinding()]
    Param(
        [Parameter(Mandatory=$true)]
        [string]$SolutionFile,
        [Parameter(Mandatory=$false)]
        [string]$ParentFolderGuid,
        [Parameter(Mandatory=$true)]
        [string]$NewFolderName,
        [Parameter(Mandatory=$true)]
        [string]$NewFolderId
    )

    $projectLine = 'Project("{2150E333-8FDC-42A3-9474-1A3956D46DE8}") = "'+$NewFolderName+'", "'+$NewFolderName+'", "{'+$NewFolderId+'}"'
    Write-Host "Added '$projectLine' to $SolutionFile."

    $slnFileContent = Get-Content $SolutionFile -Raw
    if (-not ($slnFileContent.Contains($projectLine))) {
        $slnFileContent = $slnFileContent -replace '(?ms)(.*EndProject)(.*Global.*)', ('$1' + "`r`n$projectLine`r`nEndProject" + '$2' )

        if (-not ([string]::IsNullOrEmpty($ParentFolderGuid))) {
            $nestedProjectsLine = "`t{$NewFolderId} = $ParentFolderGuid`r`n`t"
            $slnFileContent = $slnFileContent -replace '(?ms)(.*)(EndGlobalSection.*?GlobalSection\(ExtensibilityGlobals\).*)', ('$1'+$nestedProjectsLine+'$2' )
        }

        $slnFileContent = $slnFileContent -replace '(?ms)(.*)(EndGlobal.*)', ('$1EndGlobal');

        Set-Content $slnFileContent -Path $SolutionFile
    }
}
