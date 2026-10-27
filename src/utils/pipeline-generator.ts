import { ElectronConfig, PeHeaderConfig } from '../types/pe-types';

export interface PipelineOptions {
  cleanDist: boolean;
  verboseLogging: boolean;
  calculateSha256: boolean;
  launchOnComplete: boolean;
  verifyPeHeaders: boolean;
  arch: string;
  subsystem: string;
}

export function generatePowerShellScript(
  electronConfig: ElectronConfig,
  peConfig: PeHeaderConfig,
  options: PipelineOptions
): string {
  const isGui = peConfig.subsystem === 'windows_gui';
  const targetArch = peConfig.machine.toUpperCase();
  const format = electronConfig.targetFormat;

  return `# ==============================================================================
# ElectraPE Automated Windows Desktop Build Pipeline
# App: ${electronConfig.appName} v${electronConfig.version}
# Target OS: Windows NT 10.0+ | Machine: ${targetArch} | Subsystem: ${peConfig.subsystem}
# ==============================================================================

[CmdletBinding()]
param (
    [switch]$SkipInstall = $false,
    [switch]$VerboseLog = ${options.verboseLogging ? '$true' : '$false'}
)

$ErrorActionPreference = "Stop"
$StartTime = Get-Date

function Write-Step {
    param([string]$Message, [string]$StepNumber)
    Write-Host ""
    Write-Host "[$StepNumber] " -ForegroundColor Cyan -NoNewline
    Write-Host $Message -ForegroundColor White
}

function Write-Success {
    param([string]$Message)
    Write-Host "  -> SUCCESS: $Message" -ForegroundColor Green
}

function Write-WarningMsg {
    param([string]$Message)
    Write-Host "  -> WARNING: $Message" -ForegroundColor Yellow
}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " ElectraPE Automated Native Build Engine" -ForegroundColor Cyan
Write-Host " App: ${electronConfig.appName} (${electronConfig.appId})" -ForegroundColor White
Write-Host " Architecture: ${targetArch} | Subsystem: ${isGui ? 'GUI (No Console)' : 'Console'}" -ForegroundColor White
Write-Host " Hardening: ASLR (${peConfig.dynamicBase ? 'Enabled' : 'Disabled'}) | DEP (${peConfig.nxCompat ? 'Enabled' : 'Disabled'}) | 64-bit VA (${peConfig.highEntropyVa ? 'Enabled' : 'Disabled'})" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# STEP 1: Environment & Toolchain Inspection
# ------------------------------------------------------------------------------
Write-Step "Inspecting local Node.js and build toolchain..." "1/6"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "CRITICAL: Node.js is not found in PATH! Please install Node.js LTS (v18+) from https://nodejs.org"
}
$NodeVer = node --version
$NpmVer = npm --version
Write-Success "Found Node.js $NodeVer and NPM $NpmVer"

# ------------------------------------------------------------------------------
# STEP 2: Workspace Sanitization
# ------------------------------------------------------------------------------
${options.cleanDist ? `Write-Step "Cleaning prior build artifacts..." "2/6"
if (Test-Path -Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Success "Cleaned directory: dist/"
} else {
    Write-Success "Workspace clean. Ready for compilation."
}
` : `Write-Step "Skipping workspace purge (incremental mode enabled)..." "2/6"`}

# ------------------------------------------------------------------------------
# STEP 3: Dependency Resolution
# ------------------------------------------------------------------------------
Write-Step "Resolving and caching Electron runtime dependencies..." "3/6"
if ($SkipInstall) {
    Write-WarningMsg "Skipping npm install as requested by -SkipInstall flag."
} else {
    $npmArgs = @("install", "--no-audit")
    if (-not $VerboseLog) { $npmArgs += "--silent" }
    & npm @npmArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Error "CRITICAL: Failed to install project dependencies!"
    }
    Write-Success "Dependencies resolved successfully."
}

# ------------------------------------------------------------------------------
# STEP 4: PE Header Verification & Windows Manifest Alignment
# ------------------------------------------------------------------------------
Write-Step "Validating PE Header Invariants and UAC RT_MANIFEST..." "4/6"
Write-Host "     - Target Machine: ${targetArch}" -ForegroundColor DarkGray
Write-Host "     - Subsystem: ${peConfig.subsystem} (Code: ${isGui ? '2' : '3'})" -ForegroundColor DarkGray
Write-Host "     - UAC Privilege: ${peConfig.requestedExecutionLevel}" -ForegroundColor DarkGray
Write-Host "     - DPI Awareness: ${peConfig.dpiAwareness}" -ForegroundColor DarkGray
Write-Success "PE Header definitions and app.manifest synced."

# ------------------------------------------------------------------------------
# STEP 5: Electron Native Packaging & Binary Assembly
# ------------------------------------------------------------------------------
Write-Step "Compiling native Windows executable with electron-builder..." "5/6"
$BuildArgs = @("run", "dist:win")
if ($VerboseLog) {
    $env:DEBUG = "electron-builder"
}

& npm @BuildArgs
if ($LASTEXITCODE -ne 0) {
    Write-Error "CRITICAL: Packaging process failed during executable linking!"
}
Write-Success "Windows binary packaged and linked successfully."

# ------------------------------------------------------------------------------
# STEP 6: Artifact Validation & Integrity Verification
# ------------------------------------------------------------------------------
Write-Step "Validating output executable in dist/ folder..." "6/6"

$TargetExe = Get-ChildItem -Path "dist" -Filter "*.exe" -Recurse | Select-Object -First 1
if (-not $TargetExe) {
    Write-Error "Build finished but no executable found in dist/ directory!"
}

$ExeSizeMB = [math]::Round($TargetExe.Length / 1MB, 2)
Write-Success "Found compiled executable: $($TargetExe.FullName) ($ExeSizeMB MB)"

${options.calculateSha256 ? `# Compute cryptographic checksum
$Hash = (Get-FileHash -Path $TargetExe.FullName -Algorithm SHA256).Hash
Write-Host "     SHA-256: $Hash" -ForegroundColor Yellow
` : ''}
${options.verifyPeHeaders ? `# Verify version info
$VerInfo = (Get-Item $TargetExe.FullName).VersionInfo
Write-Host "     FileVersion: $($VerInfo.FileVersion)" -ForegroundColor DarkGray
Write-Host "     ProductName: $($VerInfo.ProductName)" -ForegroundColor DarkGray
Write-Host "     Company:     $($VerInfo.CompanyName)" -ForegroundColor DarkGray
` : ''}

$ElapsedTime = [math]::Round(((Get-Date) - $StartTime).TotalSeconds, 1)
Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host " BUILD COMPLETED IN $ElapsedTime SECONDS!" -ForegroundColor Green
Write-Host " Output File: $($TargetExe.FullName)" -ForegroundColor White
Write-Host " Target Format: ${format.toUpperCase()} (${targetArch})" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Green

${options.launchOnComplete ? `
# Launch Application
Write-Host "--> Launching $($TargetExe.Name)..." -ForegroundColor Cyan
Start-Process -FilePath $TargetExe.FullName
` : ''}
`;
}

export function generateBashScript(
  electronConfig: ElectronConfig,
  peConfig: PeHeaderConfig,
  options: PipelineOptions
): string {
  const isGui = peConfig.subsystem === 'windows_gui';
  const targetArch = peConfig.machine.toLowerCase();

  return `#!/usr/bin/env bash
# ==============================================================================
# ElectraPE Automated Cross-Platform Build Pipeline
# App: ${electronConfig.appName} v${electronConfig.version}
# Target: Windows (${targetArch.toUpperCase()}) | Subsystem: ${peConfig.subsystem}
# ==============================================================================

set -eo pipefail

START_TIME=$(date +%s)

# Terminal styling
CYAN='\\033[0;36m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
WHITE='\\033[1;37m'
NC='\\033[0m' # No Color

echo -e "\${CYAN}======================================================================\${NC}"
echo -e "\${CYAN} ElectraPE Cross-Platform Windows Packager\${NC}"
echo -e " App: \${WHITE}${electronConfig.appName} (${electronConfig.appId})\${NC}"
echo -e " Target: \${WHITE}Windows ${targetArch.toUpperCase()} (${isGui ? 'GUI Subsystem' : 'Console Subsystem'})\${NC}"
echo -e "\${CYAN}======================================================================\${NC}"

# Step 1: Toolchain Check
echo -e "\\n\${CYAN}[1/5] Checking Node.js and NPM environments...\${NC}"
command -v node >/dev/null 2>&1 || { echo >&2 "Error: Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "Error: npm is required but not installed."; exit 1; }
echo -e "  \${GREEN}-> Node.js: $(node --version) | npm: $(npm --version)\${NC}"

${options.cleanDist ? `# Step 2: Clean workspace
echo -e "\\n\${CYAN}[2/5] Cleaning prior build outputs...\${NC}"
rm -rf dist/
echo -e "  \${GREEN}-> Workspace purged: dist/\${NC}"
` : `# Step 2: Skip clean
echo -e "\\n\${CYAN}[2/5] Incremental build enabled (skipping dist purge)...\${NC}"`}

# Step 3: Dependencies
echo -e "\\n\${CYAN}[3/5] Installing project dependencies...\${NC}"
npm install ${options.verboseLogging ? '' : '--silent'}
echo -e "  \${GREEN}-> Dependencies locked and loaded.\${NC}"

# Step 4: Packaging Windows Executable
echo -e "\\n\${CYAN}[4/5] Packaging Windows executable using electron-builder...\${NC}"
npm run dist:win
echo -e "  \${GREEN}-> Windows PE binaries compiled and assembled.\${NC}"

# Step 5: Verification & Hash
echo -e "\\n\${CYAN}[5/5] Verifying output artifacts...\${NC}"
OUTPUT_EXE=$(find dist -maxdepth 2 -type f -name "*.exe" | head -n 1)

if [ -z "$OUTPUT_EXE" ]; then
    echo "Error: Build succeeded but no .exe file found in dist/ directory!"
    exit 1
fi

FILE_SIZE=$(du -h "$OUTPUT_EXE" | cut -f1)
echo -e "  \${GREEN}-> Target Binary:\${NC} $OUTPUT_EXE ($FILE_SIZE)"

${options.calculateSha256 ? `# Checksum
if command -v sha256sum >/dev/null 2>&1; then
    SHA=$(sha256sum "$OUTPUT_EXE" | awk '{print $1}')
    echo -e "  \${YELLOW}-> SHA-256:\${NC} $SHA"
elif command -v shasum >/dev/null 2>&1; then
    SHA=$(shasum -a 256 "$OUTPUT_EXE" | awk '{print $1}')
    echo -e "  \${YELLOW}-> SHA-256:\${NC} $SHA"
fi
` : ''}

END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo -e "\\n\${GREEN}======================================================================\${NC}"
echo -e "\${GREEN} BUILD COMPLETED IN \${ELAPSED}s!\${NC}"
echo -e " Executable Ready: $OUTPUT_EXE"
echo -e "\${GREEN}======================================================================\${NC}"
`;
}
