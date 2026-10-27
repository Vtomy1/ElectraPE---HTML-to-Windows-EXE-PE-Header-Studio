export type Architecture = 'x64' | 'ia32' | 'arm64';
export type WindowsSubsystem = 'windows_gui' | 'windows_cui';
export type ExecutionLevel = 'asInvoker' | 'requireAdministrator' | 'highestAvailable';
export type DpiAwareness = 'PerMonitorV2' | 'System' | 'Unaware';
export type PackageTarget = 'nsis' | 'portable' | 'dir';

export interface PeHeaderConfig {
  // Machine & Architecture
  machine: Architecture;
  subsystem: WindowsSubsystem; // 2 = GUI, 3 = CUI (Console)
  majorSubsystemVersion: number;
  minorSubsystemVersion: number;
  
  // Security & Mitigations (DLL Characteristics)
  dynamicBase: boolean; // ASLR (0x0040)
  nxCompat: boolean; // DEP (0x0100)
  highEntropyVa: boolean; // 64-bit ASLR (0x0020)
  terminalServerAware: boolean; // (0x8000)
  guardCf: boolean; // Control Flow Guard (0x4000)
  noSeh: boolean; // No SEH (0x0400)
  
  // Memory
  sizeOfStackReserve: number; // e.g. 1048576 (1MB)
  sizeOfStackCommit: number; // e.g. 4096 (4KB)
  sizeOfHeapReserve: number; // e.g. 1048576 (1MB)
  sizeOfHeapCommit: number; // e.g. 4096 (4KB)

  // Manifest (RT_MANIFEST)
  requestedExecutionLevel: ExecutionLevel;
  uiAccess: boolean;
  dpiAwareness: DpiAwareness;
  longPathAware: boolean;
  compatWindows10_11: boolean;
  compatWindows8_1: boolean;
  compatWindows7: boolean;

  // Version Resource (VS_VERSION_INFO)
  fileVersion: string; // e.g. "1.0.0.0"
  productVersion: string; // e.g. "1.0.0.0"
  companyName: string;
  fileDescription: string;
  internalName: string;
  legalCopyright: string;
  originalFilename: string;
  productName: string;

  // Icon
  iconBase64?: string;
  iconDataUrl?: string;
  iconName: string;

  // Extended Version Resources (VS_VERSION_INFO StringFileInfo)
  customVersionStrings?: { key: string; value: string }[];
}

export interface ElectronConfig {
  appName: string;
  appId: string;
  version: string;
  description: string;
  author: string;
  windowWidth: number;
  windowHeight: number;
  minWidth: number;
  minHeight: number;
  resizable: boolean;
  frame: boolean;
  titleBarStyle: 'default' | 'hidden' | 'hiddenInset';
  transparent: boolean;
  backgroundColor: string;
  themeSource: 'system' | 'dark' | 'light';
  singleInstanceLock: boolean;
  disableHardwareAcceleration: boolean;
  nodeIntegration: boolean;
  contextIsolation: boolean;
  sandbox: boolean;
  trayIcon: boolean;
  targetFormat: PackageTarget;
  oneClickInstaller: boolean;
  createDesktopShortcut: boolean;
  createStartMenuShortcut: boolean;
}

export interface ProjectFiles {
  'index.html': string;
  'styles.css': string;
  'app.js': string;
}

export interface PeSectionInfo {
  name: string;
  virtualAddress: string;
  virtualSize: string;
  rawSize: string;
  characteristics: string;
  description: string;
}
