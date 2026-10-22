# Dot-source this script. Tools and caches stay outside the source repository.
$androidToolsRoot = Join-Path (Split-Path $PSScriptRoot) '.local-tools'
. (Join-Path (Split-Path $PSScriptRoot) 'use-dev-env.ps1')
$jdkPath = Get-ChildItem (Join-Path $androidToolsRoot 'jdk21') -Directory | Select-Object -First 1
if (!$jdkPath) { throw 'JDK 21 is missing from the workspace tools directory.' }
$env:JAVA_HOME = $jdkPath.FullName
$env:ANDROID_HOME = Join-Path $androidToolsRoot 'android-sdk'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:ANDROID_USER_HOME = Join-Path $androidToolsRoot 'android-user'
$env:GRADLE_USER_HOME = Join-Path $androidToolsRoot 'gradle-user'
$env:TEMP = $androidToolsRoot
$env:TMP = $androidToolsRoot
# Plugin modules live outside android/ and also need the Windows path override.
$env:GRADLE_OPTS = "$env:GRADLE_OPTS -Dcom.android.build.gradle.overridePathCheck=true"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:PATH"
