Function Get-SolutionFolderId {
    [CmdletBinding()]
    Param(
        [Parameter(Mandatory=$true)]
        [string]$SolutionFile,
        [Parameter(Mandatory=$true)]
        [string]$FolderName
    )

    $pattern = '.*Project\("{2150E333-8FDC-42A3-9474-1A3956D46DE8}"\) = "'+ $FolderName + '", "' + $FolderName + '", "(\{.*?\})".*'

    $slnFileContent = Get-Content $SolutionFile
    $projectLine = $slnFileContent | Select-String -Pattern $pattern | Select -First 1
    $result = $projectLine -replace $pattern, '$1'

    return $result
}
