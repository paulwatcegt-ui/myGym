param([switch]$Offline)
$ErrorActionPreference = 'Stop'
$repoRoot = $PSScriptRoot
$workspaceRoot = Split-Path $repoRoot
$gradleSource = [IO.File]::ReadAllText((Join-Path $repoRoot 'frontend/android/app/build.gradle'))
$codeMatch = [regex]::Match($gradleSource, '(?m)^\s*versionCode\s+(\d+)\s*$')
$nameMatch = [regex]::Match($gradleSource, '(?m)^\s*versionName\s+"([^"]+)"')
if (!$codeMatch.Success -or !$nameMatch.Success) { throw 'Could not read the Android release version.' }
$plannedCode = [int]$codeMatch.Groups[1].Value
$plannedName = $nameMatch.Groups[1].Value
$frontendVersion = (Get-Content -LiteralPath (Join-Path $repoRoot 'frontend/package.json') -Raw | ConvertFrom-Json).version
if ($frontendVersion -ne $plannedName) { throw 'Android versionName and frontend package version must match.' }
$deliveryRoot = Join-Path $repoRoot 'release-local'
if (Test-Path -LiteralPath $deliveryRoot) {
    foreach ($saved in Get-ChildItem -LiteralPath $deliveryRoot -File -Filter '*.apk') {
        if ($saved.Name -match '-code(\d+)-release\.apk$' -and [int]$Matches[1] -ge $plannedCode) {
            throw 'A saved release has this or a higher versionCode. Increase versionCode and keep previous APKs.'
        }
    }
}
$signingRoot = Join-Path $workspaceRoot '.local-tools/mygym-release-signing'
$credentialsPath = Join-Path $signingRoot 'signing.json'
if (!(Test-Path -LiteralPath $credentialsPath)) { throw 'Restore the fixed release key and signing.json; never generate a replacement key for an existing installation.' }
$credentials = Get-Content -LiteralPath $credentialsPath -Raw | ConvertFrom-Json
$keyPath = Join-Path $signingRoot $credentials.keyFile
if (!(Test-Path -LiteralPath $keyPath)) { throw 'The fixed release keystore is missing.' }
$previousLocation = Get-Location
$mapped = $false
$verificationCert = $null
$environmentBefore = @{}
foreach ($name in @('PATH', 'JAVA_HOME', 'ANDROID_HOME', 'ANDROID_SDK_ROOT', 'ANDROID_USER_HOME', 'GRADLE_USER_HOME', 'GRADLE_OPTS', 'TEMP', 'TMP')) {
    $environmentBefore[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
}
try {
    . (Join-Path $repoRoot 'use-android-env.ps1')
    $env:MYGYM_KEYSTORE_FILE = $keyPath
    $env:MYGYM_KEYSTORE_PASSWORD = $credentials.storePassword
    $env:MYGYM_KEY_ALIAS = $credentials.alias
    $env:MYGYM_KEY_PASSWORD = $credentials.keyPassword
    # Pin the certificate before building, so an accidental replacement key is rejected.
    $verificationCert = Join-Path $signingRoot ('verify-' + [Guid]::NewGuid().ToString('N') + '.cer')
    & "$env:JAVA_HOME/bin/keytool.exe" -exportcert -keystore $keyPath -alias $credentials.alias -storepass:env MYGYM_KEYSTORE_PASSWORD -file $verificationCert
    if ($LASTEXITCODE -ne 0) { throw 'Could not read the fixed signing certificate.' }
    $fingerprint = (Get-FileHash -LiteralPath $verificationCert -Algorithm SHA256).Hash.ToLowerInvariant()
    $pinned = (Get-Content -LiteralPath (Join-Path $repoRoot 'release-signing-certificate.sha256') -Raw).Trim()
    if ($fingerprint -ne $pinned) { throw 'Signing certificate differs from the pinned myGym release certificate.' }

    Push-Location (Join-Path $repoRoot 'frontend')
    try {
        & npm.cmd run build:mobile -- android
        if ($LASTEXITCODE -ne 0) { throw 'Mobile build failed.' }
    } finally { Pop-Location }

    # Android native tools need an ASCII path on this Windows workspace.
    if (Test-Path Y:\) { throw 'Y: is occupied. Free it before running this script.' }
    & subst.exe Y: $workspaceRoot
    if ($LASTEXITCODE -ne 0) { throw 'Could not create the temporary Y: mapping.' }
    $mapped = $true
    $mappedRepo = Join-Path 'Y:\' (Split-Path $repoRoot -Leaf)
    Set-Location $mappedRepo
    . (Join-Path $mappedRepo 'use-android-env.ps1')
    $gradleArgs = @('-p', 'frontend/android', ':app:assembleRelease', ':app:lintRelease', '--no-daemon', '--max-workers=1')
    if ($Offline) { $gradleArgs += '--offline' }
    & .\frontend\android\gradlew.bat @gradleArgs
    if ($LASTEXITCODE -ne 0) { throw 'Release build or lint failed; no delivery APK was copied.' }

    $builtApk = Join-Path $mappedRepo 'frontend/android/app/build/outputs/apk/release/app-release.apk'
    $buildTools = Join-Path $env:ANDROID_HOME 'build-tools/35.0.0'
    $signature = & (Join-Path $buildTools 'apksigner.bat') verify --verbose --print-certs $builtApk 2>&1
    if ($LASTEXITCODE -ne 0) { throw 'Release APK signature verification failed.' }
    if (!(($signature -join "`n").Contains("certificate SHA-256 digest: $fingerprint"))) { throw 'APK certificate does not match the pinned key.' }
    $badging = & (Join-Path $buildTools 'aapt.exe') dump badging $builtApk
    if ($LASTEXITCODE -ne 0) { throw 'Could not inspect the release APK.' }
    $packageLine = $badging | Where-Object { $_ -like 'package:*' } | Select-Object -First 1
    if ($packageLine -notmatch "name='io.github.paulwatcegt_ui.mygym' versionCode='(\d+)' versionName='([^']+)'") { throw 'Unexpected release package identity.' }
    $versionCode = [int]$Matches[1]
    $versionName = $Matches[2]
    if ($badging -contains 'application-debuggable') { throw 'The release APK is debuggable.' }
    $outputDir = Join-Path $repoRoot 'release-local'
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    $output = Join-Path $outputDir "myGym-v$versionName-code$versionCode-release.apk"
    if (Test-Path -LiteralPath $output) { throw "Delivery file already exists; keep previous versions and increase versionCode: $output" }
    Copy-Item -LiteralPath $builtApk -Destination $output
    $apkHash = (Get-FileHash -LiteralPath $output -Algorithm SHA256).Hash.ToLowerInvariant()
    [IO.File]::WriteAllText($output + '.sha256', "$apkHash  $([IO.Path]::GetFileName($output))`n")
    $signature | Set-Content -LiteralPath ($output + '.signature.txt') -Encoding UTF8
    $badging | Set-Content -LiteralPath ($output + '.badging.txt') -Encoding UTF8
    Write-Output "Verified release APK: $output"
    Write-Output "SHA-256: $apkHash"
} finally {
    Set-Location $previousLocation
    if ($mapped) { & subst.exe Y: /D }
    if ($verificationCert -and (Test-Path -LiteralPath $verificationCert)) { Remove-Item -LiteralPath $verificationCert }
    foreach ($name in @('MYGYM_KEYSTORE_FILE', 'MYGYM_KEYSTORE_PASSWORD', 'MYGYM_KEY_ALIAS', 'MYGYM_KEY_PASSWORD')) {
        [Environment]::SetEnvironmentVariable($name, $null, 'Process')
    }
    foreach ($name in $environmentBefore.Keys) {
        [Environment]::SetEnvironmentVariable($name, $environmentBefore[$name], 'Process')
    }
    $credentials = $null
}
