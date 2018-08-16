Function Add-ModuleFolderToSolutionFile {
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
    [string]$ModuleFolderId)

    $projectLine = 'Project("{2150E333-8FDC-42A3-9474-1A3956D46DE8}") = "'+$ModuleFolderName+'", "'+$ModuleFolderName+'", "{'+$ModuleFolderId+'}"';

    $slnFileContent = Get-Content $SolutionFile -Raw

    Write-Output $projectLine

    if(-not($slnFileContent.Contains($projectLine)))  {
        $nestedProjectsLine = "`t{$ModuleFolderId} = $LayerFolderId`r`n`t"

        $slnFileContent = $slnFileContent -replace '(?ms)(.*EndProject)(.*Global.*)', ('$1' + "`r`n$projectLine`r`nEndProject" + '$2' )
        $slnFileContent = $slnFileContent -replace '(?ms)(.*)(EndGlobalSection.*?GlobalSection\(ExtensibilityGlobals\).*)', ('$1'+$nestedProjectsLine+'$2' )

        $slnFileContent = $slnFileContent -replace '(?ms)(.*)(EndGlobal.*)', ('$1EndGlobal')

        Set-Content $slnFileContent -Path $SolutionFile
    }
}
