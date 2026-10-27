import { PeHeaderConfig } from '../types/pe-types';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface PeValidationIssue {
  id: string;
  ruleCode: string;
  severity: ValidationSeverity;
  title: string;
  description: string;
  affectedFields: (keyof PeHeaderConfig)[];
  recommendation: string;
  autoFix?: {
    label: string;
    patch: Partial<PeHeaderConfig>;
  };
}

export interface PeValidationReport {
  issues: PeValidationIssue[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
  isValid: boolean;
  score: number; // 0 - 100
}

/**
 * Validates PE Header configuration against Windows kernel loader specifications,
 * PE/COFF standard constraints, and Electron runtime compatibility.
 */
export function validatePeHeaderConfig(config: PeHeaderConfig): PeValidationReport {
  const issues: PeValidationIssue[] = [];

  // 1. RULE: High Entropy VA is incompatible with 32-bit (x86 / ia32) architecture
  // In PE32 format, pointer width is 32 bits, making 64-bit high entropy randomizations invalid.
  if (config.machine === 'ia32' && config.highEntropyVa) {
    issues.push({
      id: 'ERR_IA32_HIGH_ENTROPY_VA',
      ruleCode: 'PE_SEC_01',
      severity: 'error',
      title: 'Incompatible 64-bit High Entropy VA on 32-bit x86 Architecture',
      description: 'IMAGE_DLLCHARACTERISTICS_HIGH_ENTROPY_VA (0x0020) requires a 64-bit address space (PE32+). Setting it on 32-bit (ia32) will cause the Windows NT loader to reject the binary or silently strip the flag.',
      affectedFields: ['machine', 'highEntropyVa'],
      recommendation: 'Either disable High Entropy 64-bit VA for 32-bit builds, or switch the target architecture to x64.',
      autoFix: {
        label: 'Disable High Entropy VA',
        patch: { highEntropyVa: false }
      }
    });
  }

  // 2. RULE: High Entropy VA requires Dynamic Base (ASLR)
  if (config.highEntropyVa && !config.dynamicBase) {
    issues.push({
      id: 'ERR_HIGH_ENTROPY_WITHOUT_ASLR',
      ruleCode: 'PE_SEC_02',
      severity: 'error',
      title: 'High Entropy VA Requires ASLR (Dynamic Base)',
      description: 'IMAGE_DLLCHARACTERISTICS_HIGH_ENTROPY_VA is meaningless without IMAGE_DLLCHARACTERISTICS_DYNAMIC_BASE (0x0040). The Windows loader cannot randomize addresses with high entropy if base relocation is disabled.',
      affectedFields: ['highEntropyVa', 'dynamicBase'],
      recommendation: 'Enable Dynamic Base (ASLR) so the Windows memory manager can apply high entropy address space layout randomization.',
      autoFix: {
        label: 'Enable Dynamic Base (ASLR)',
        patch: { dynamicBase: true }
      }
    });
  }

  // 3. RULE: Minimum Windows Subsystem Version for 64-bit / ARM64
  // Electron 30+ and modern Chromium require Windows NT 10.0+ (or at least Windows 7 NT 6.1 for legacy).
  if ((config.machine === 'x64' || config.machine === 'arm64') && config.majorSubsystemVersion < 6) {
    issues.push({
      id: 'ERR_OBSOLETE_SUBSYSTEM_VERSION',
      ruleCode: 'PE_SYS_01',
      severity: 'error',
      title: 'Subsystem Version Too Low for 64-bit Architecture',
      description: `Subsystem version ${config.majorSubsystemVersion}.${config.minorSubsystemVersion} represents legacy 32-bit Windows XP/2000. 64-bit Windows architectures require at least Subsystem version 6.0 (Vista) or 10.0 (Windows 10/11) for Electron.`,
      affectedFields: ['majorSubsystemVersion', 'minorSubsystemVersion'],
      recommendation: 'Upgrade Major Subsystem Version to 10.0 to match Windows 10/11 modern desktop execution.',
      autoFix: {
        label: 'Set Subsystem to 10.0 (Win 10/11)',
        patch: { majorSubsystemVersion: 10, minorSubsystemVersion: 0 }
      }
    });
  }

  // 4. RULE: PerMonitorV2 DPI awareness requires Windows 10/11 manifest declaration
  if (config.dpiAwareness === 'PerMonitorV2' && !config.compatWindows10_11) {
    issues.push({
      id: 'WARN_PERMONITORV2_WITHOUT_WIN10_GUID',
      ruleCode: 'MAN_DPI_01',
      severity: 'warning',
      title: 'Per-Monitor V2 DPI Set Without Windows 10/11 Manifest Declaration',
      description: 'PerMonitorV2 DPI scaling was introduced in Windows 10 Creators Update (Build 1703). Without the Windows 10/11 SupportedOS GUID in RT_MANIFEST, the Windows Desktop Window Manager (DWM) will fallback to System DPI or bitmap stretching.',
      affectedFields: ['dpiAwareness', 'compatWindows10_11'],
      recommendation: 'Declare Windows 10 & 11 compatibility GUID in the application manifest, or fallback to System DPI awareness.',
      autoFix: {
        label: 'Declare Windows 10/11 Support in Manifest',
        patch: { compatWindows10_11: true }
      }
    });
  }

  // 5. RULE: Stack Commit size must not exceed or equal Stack Reserve size
  if (config.sizeOfStackCommit >= config.sizeOfStackReserve) {
    issues.push({
      id: 'ERR_STACK_COMMIT_EXCEEDS_RESERVE',
      ruleCode: 'PE_MEM_01',
      severity: 'error',
      title: 'Virtual Stack Commit Exceeds or Equals Stack Reserve',
      description: `Stack Commit (${config.sizeOfStackCommit.toLocaleString()} bytes) cannot be greater than or equal to Stack Reserve (${config.sizeOfStackReserve.toLocaleString()} bytes). Windows requires committed thread memory to fit strictly within the reserved virtual address range.`,
      affectedFields: ['sizeOfStackReserve', 'sizeOfStackCommit'],
      recommendation: 'Ensure Stack Commit is smaller than Stack Reserve (typically 4 KB commit vs 1 MB reserve).',
      autoFix: {
        label: 'Reset Stack (1MB Reserve / 4KB Commit)',
        patch: { sizeOfStackReserve: 1048576, sizeOfStackCommit: 4096 }
      }
    });
  }

  // 6. RULE: Heap Commit size must not exceed Heap Reserve size
  if (config.sizeOfHeapCommit >= config.sizeOfHeapReserve) {
    issues.push({
      id: 'ERR_HEAP_COMMIT_EXCEEDS_RESERVE',
      ruleCode: 'PE_MEM_02',
      severity: 'error',
      title: 'Heap Commit Exceeds or Equals Heap Reserve',
      description: `Heap Commit (${config.sizeOfHeapCommit.toLocaleString()} bytes) must be less than Heap Reserve (${config.sizeOfHeapReserve.toLocaleString()} bytes).`,
      affectedFields: ['sizeOfHeapReserve', 'sizeOfHeapCommit'],
      recommendation: 'Adjust heap sizes so that physical page commitment is lower than virtual reservation.',
      autoFix: {
        label: 'Reset Heap (1MB Reserve / 4KB Commit)',
        patch: { sizeOfHeapReserve: 1048576, sizeOfHeapCommit: 4096 }
      }
    });
  }

  // 7. RULE: Windows FileVersion Quad-Numeric Format
  const quadRegex = /^\d+\.\d+\.\d+\.\d+$/;
  if (!quadRegex.test(config.fileVersion.trim())) {
    issues.push({
      id: 'WARN_INVALID_FILE_VERSION_FORMAT',
      ruleCode: 'RES_VER_01',
      severity: 'warning',
      title: 'File Version Not in Windows Quad-Numeric Format (X.X.X.X)',
      description: `Windows VS_FIXEDFILEINFO requires FileVersion to map to two 32-bit words (dwFileVersionMS and dwFileVersionLS), formatted as four dot-separated integers. Current value "${config.fileVersion}" may fail when parsed by Windows Explorer or installers.`,
      affectedFields: ['fileVersion'],
      recommendation: 'Format version as four dot-separated integers (e.g. "1.0.0.0").',
      autoFix: {
        label: 'Format as 1.0.0.0',
        patch: { fileVersion: '1.0.0.0' }
      }
    });
  }

  // 8. RULE: OriginalFilename should end with .exe
  if (config.originalFilename && !config.originalFilename.toLowerCase().endsWith('.exe')) {
    issues.push({
      id: 'INFO_FILENAME_EXTENSION',
      ruleCode: 'RES_VER_02',
      severity: 'info',
      title: 'Original Filename Missing .exe Extension',
      description: `Windows PE version resource OriginalFilename currently is "${config.originalFilename}". Windows resource parsers expect standard .exe executable extensions.`,
      affectedFields: ['originalFilename'],
      recommendation: 'Append .exe to OriginalFilename.',
      autoFix: {
        label: `Append .exe (${config.originalFilename}.exe)`,
        patch: { originalFilename: `${config.originalFilename}.exe` }
      }
    });
  }

  // 9. RULE: UAC requireAdministrator in GUI app without signing notice
  if (config.requestedExecutionLevel === 'requireAdministrator') {
    issues.push({
      id: 'WARN_UAC_ADMIN_PROMPT',
      ruleCode: 'SEC_UAC_01',
      severity: 'warning',
      title: 'UAC Elevation Forced for All Desktop Users',
      description: 'Setting requestedExecutionLevel="requireAdministrator" will trigger the Windows UAC Shield prompt on every single launch. If your application does not modify protected system directories (C:\\Program Files or registry HKLM), standard users without admin rights will be blocked.',
      affectedFields: ['requestedExecutionLevel'],
      recommendation: 'Use "asInvoker" for regular desktop applications, or "highestAvailable" if optional admin privileges are needed.',
      autoFix: {
        label: 'Switch UAC to asInvoker (Standard User)',
        patch: { requestedExecutionLevel: 'asInvoker' }
      }
    });
  }

  // Calculate scores
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  let score = 100;
  score -= errorCount * 35;
  score -= warningCount * 12;
  score -= infoCount * 3;
  if (score < 0) score = 0;

  return {
    issues,
    errorCount,
    warningCount,
    infoCount,
    isValid: errorCount === 0,
    score
  };
}

/**
 * Applies a specific fix patch to the PE Header config
 */
export function applyPeFix(
  config: PeHeaderConfig,
  patch: Partial<PeHeaderConfig>
): PeHeaderConfig {
  return {
    ...config,
    ...patch
  };
}

/**
 * Automatically applies all available recommended fixes to resolve all errors and warnings
 */
export function autoFixAllPeIssues(config: PeHeaderConfig): PeHeaderConfig {
  let updated = { ...config };
  const report = validatePeHeaderConfig(updated);

  for (const issue of report.issues) {
    if (issue.autoFix) {
      updated = {
        ...updated,
        ...issue.autoFix.patch
      };
    }
  }

  return updated;
}
