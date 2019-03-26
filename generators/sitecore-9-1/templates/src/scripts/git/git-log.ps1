param(
    [parameter(Position = 0, Mandatory = $true)]
    [string]$SinceCommit,
    [parameter(Position = 1, Mandatory = $true)]
    [string]$outputFilePath
)

$output = & 'git' 'log' "${SinceCommit}.." 
$output | Set-Content "${outputFilePath}" -Force