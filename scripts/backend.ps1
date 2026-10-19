param([ValidateSet('run', 'test', 'package')][string]$Task = 'run')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path $projectRoot 'backend'
$envFile = Join-Path $backendRoot '.env'
if (Test-Path -LiteralPath $envFile) {
    Get-Content -LiteralPath $envFile | ForEach-Object {
        if ($_ -match '^([A-Z][A-Z0-9_]*)=(.*)$') {
            [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process')
        }
    }
}
$goal = switch ($Task) { 'run' { 'spring-boot:run' } 'test' { 'test' } 'package' { 'package' } }
$mavenArgs = @('-B', '--no-transfer-progress', '-f', (Join-Path $backendRoot 'pom.xml'))
$localCache = Join-Path $projectRoot '.cache/m2'
if (Test-Path -LiteralPath $localCache) { $mavenArgs += "-Dmaven.repo.local=$localCache" }
$mavenArgs += $goal
$wrapper = Join-Path $backendRoot 'mvnw.cmd'
if (Test-Path -LiteralPath $wrapper) { & $wrapper @mavenArgs } else { & mvn.cmd @mavenArgs }
exit $LASTEXITCODE
