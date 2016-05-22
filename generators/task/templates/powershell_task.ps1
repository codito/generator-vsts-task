[CmdletBinding(DefaultParameterSetName = 'None')]
param
(
   [String]
   $Name
)


function Write-Hello($str) {
    Write-Output "Hello $str"
}

Write-Hello $Name
