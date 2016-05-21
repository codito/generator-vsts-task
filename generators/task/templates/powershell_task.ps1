[CmdletBinding(DefaultParameterSetName = 'None')]
param
(
   [String] [Parameter(Mandatory = $true)]
   $Name
)


function Write-Hello($str) {
    Write-Output "Hello $str"
}

Write-Hello $Name
