import React, { useState } from 'react';
import { ActiveTab, Header } from './components/Header';
import { HtmlWorkspace } from './components/HtmlWorkspace';
import { PeHeaderConfigurator } from './components/PeHeaderConfigurator';
import { ResourceManifest } from './components/ResourceManifest';
import { PeHexInspector } from './components/PeHexInspector';
import { ElectronConfigurator } from './components/ElectronConfigurator';
import { BuildPipeline } from './components/BuildPipeline';
import { GeneratedCodeViewer } from './components/GeneratedCodeViewer';
import { WindowsSimulator } from './components/WindowsSimulator';
import { ExportModal } from './components/ExportModal';
import { TemplateLibrary } from './components/TemplateLibrary';
import { ElectronConfig, PeHeaderConfig, ProjectFiles } from './types/pe-types';
import { STARTER_TEMPLATES, TemplateDefinition } from './constants/templates';
import { Cpu, Shield, Package, Play, Layers } from 'lucide-react';

import { validatePeHeaderConfig } from './utils/pe-validator';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState<boolean>(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>('dashboard');

  // Initial Project Files (from Dashboard template)
  const [files, setFiles] = useState<ProjectFiles>(STARTER_TEMPLATES[0].files);

  // PE Header & Windows Subsystem Configuration
  const [peConfig, setPeConfig] = useState<PeHeaderConfig>({
    machine: 'x64',
    subsystem: 'windows_gui',
    majorSubsystemVersion: 10,
    minorSubsystemVersion: 0,
    dynamicBase: true, // ASLR
    nxCompat: true, // DEP
    highEntropyVa: true, // 64-bit ASLR
    terminalServerAware: true,
    guardCf: true,
    noSeh: false,
    sizeOfStackReserve: 1048576, // 1MB
    sizeOfStackCommit: 4096, // 4KB
    sizeOfHeapReserve: 1048576,
    sizeOfHeapCommit: 4096,
    requestedExecutionLevel: 'asInvoker',
    uiAccess: false,
    dpiAwareness: 'PerMonitorV2',
    longPathAware: true,
    compatWindows10_11: true,
    compatWindows8_1: true,
    compatWindows7: false,
    fileVersion: '1.0.0.0',
    productVersion: '1.0.0.0',
    companyName: 'Acme Software Labs',
    fileDescription: 'Telemetry & Workspace Hub Native Desktop Executable',
    internalName: 'app_win_x64',
    legalCopyright: 'Copyright © 2026 Acme Software Labs. All rights reserved.',
    originalFilename: 'hub_desktop.exe',
    productName: 'Telemetry & Workspace Hub',
    iconName: 'icon.ico'
  });

  // Calculate live validation report
  const validationReport = validatePeHeaderConfig(peConfig);

  // Electron Packaging Configuration
  const [electronConfig, setElectronConfig] = useState<ElectronConfig>({
    appName: 'Telemetry & Workspace Hub',
    appId: 'com.acme.telemetryhub',
    version: '1.0.0',
    description: 'Packaged native Windows desktop application with hardened PE headers.',
    author: 'Acme Software Labs',
    windowWidth: 1100,
    windowHeight: 720,
    minWidth: 800,
    minHeight: 550,
    resizable: true,
    frame: true,
    titleBarStyle: 'default',
    transparent: false,
    backgroundColor: '#0f172a',
    themeSource: 'dark',
    singleInstanceLock: true,
    disableHardwareAcceleration: false,
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    trayIcon: true,
    targetFormat: 'portable',
    oneClickInstaller: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  });

  const handleSelectTemplate = (templateOrId: string | TemplateDefinition) => {
    const selected = typeof templateOrId === 'string'
      ? STARTER_TEMPLATES.find((t) => t.id === templateOrId)
      : templateOrId;

    if (selected) {
      setCurrentTemplateId(selected.id);
      setFiles(selected.files);
      setElectronConfig((prev) => ({
        ...prev,
        appName: selected.name,
        description: selected.description,
        windowWidth: selected.recommendedWindow.width,
        windowHeight: selected.recommendedWindow.height,
        frame: selected.recommendedWindow.frame,
        titleBarStyle: selected.recommendedWindow.titleBarStyle || 'default'
      }));
      setPeConfig((prev) => ({
        ...prev,
        productName: selected.name,
        fileDescription: selected.description,
        originalFilename: `${selected.id}_app.exe`,
        ...(selected.recommendedPe || {})
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Universal Top Bar (Strict 3-zone contract) */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenExport={() => setIsExportModalOpen(true)}
        onQuickSimulate={() => setActiveTab('simulator')}
        onOpenTemplates={() => setIsTemplateLibraryOpen(true)}
        validationErrorCount={validationReport.errorCount}
      />

      {/* Quick Status Sub-Strip */}
      <div className="flex items-center justify-between px-6 py-2 bg-neutral-900/90 border-b border-neutral-800 text-xs shrink-0">
        <div className="flex items-center gap-4 text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-neutral-500">Arch:</span>
            <span className="font-mono text-white font-medium">{peConfig.machine.toUpperCase()}</span>
          </div>

          <span className="text-neutral-700">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">Subsystem:</span>
            <span className="text-neutral-200">
              {peConfig.subsystem === 'windows_gui' ? 'IMAGE_SUBSYSTEM_WINDOWS_GUI' : 'IMAGE_SUBSYSTEM_WINDOWS_CUI'}
            </span>
          </div>

          <span className="text-neutral-700 hidden sm:inline">|</span>

          <div className="hidden sm:flex items-center gap-1.5">
            <Shield className={`w-3.5 h-3.5 ${validationReport.errorCount > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
            <span className="text-neutral-500">PE Integrity:</span>
            {validationReport.errorCount > 0 ? (
              <button
                onClick={() => setActiveTab('pe_header')}
                className="text-red-400 font-semibold hover:underline"
              >
                {validationReport.errorCount} Incompatible Flag{validationReport.errorCount > 1 ? 's' : ''} (Resolve)
              </button>
            ) : (
              <span className="text-emerald-400 font-medium">Valid & Hardened (100%)</span>
            )}
          </div>

          <span className="text-neutral-700 hidden md:inline">|</span>

          <div className="hidden md:flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-neutral-500">Target:</span>
            <span className="text-purple-300 font-mono uppercase">{electronConfig.targetFormat} (.exe)</span>
          </div>
        </div>

        {/* Quick Simulator CTA if not in simulator */}
        {activeTab !== 'simulator' && (
          <button
            onClick={() => setActiveTab('simulator')}
            className="flex items-center gap-1.5 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Play className="w-3 h-3" />
            <span>Preview in Windows 11</span>
          </button>
        )}
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {activeTab === 'editor' && (
          <HtmlWorkspace
            files={files}
            onChangeFiles={setFiles}
            onSelectTemplate={handleSelectTemplate}
            onOpenTemplateLibrary={() => setIsTemplateLibraryOpen(true)}
          />
        )}

        {activeTab === 'pe_header' && (
          <PeHeaderConfigurator
            config={peConfig}
            onChange={setPeConfig}
            onNavigateToResources={() => setActiveTab('resources')}
          />
        )}

        {activeTab === 'resources' && (
          <ResourceManifest peConfig={peConfig} onChangePeConfig={setPeConfig} />
        )}

        {activeTab === 'pe_hex' && (
          <PeHexInspector config={peConfig} />
        )}

        {activeTab === 'electron_config' && (
          <ElectronConfigurator config={electronConfig} onChange={setElectronConfig} />
        )}

        {activeTab === 'pipeline' && (
          <BuildPipeline electronConfig={electronConfig} peConfig={peConfig} />
        )}

        {activeTab === 'generated_code' && (
          <GeneratedCodeViewer electronConfig={electronConfig} peConfig={peConfig} />
        )}

        {activeTab === 'simulator' && (
          <WindowsSimulator
            electronConfig={electronConfig}
            peConfig={peConfig}
            files={files}
          />
        )}
      </main>

      {/* Export & Packaging Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        electronConfig={electronConfig}
        peConfig={peConfig}
        files={files}
      />

      {/* Starter Template Library Modal */}
      <TemplateLibrary
        isOpen={isTemplateLibraryOpen}
        onClose={() => setIsTemplateLibraryOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        currentTemplateId={currentTemplateId}
      />
    </div>
  );
}
