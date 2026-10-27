import React from 'react';
import { ElectronConfig } from '../types/pe-types';
import { Package, AppWindow, ShieldAlert, Sliders, Box, Layers } from 'lucide-react';

interface ElectronConfiguratorProps {
  config: ElectronConfig;
  onChange: (newConfig: ElectronConfig) => void;
}

export const ElectronConfigurator: React.FC<ElectronConfiguratorProps> = ({
  config,
  onChange
}) => {
  const updateField = <K extends keyof ElectronConfig>(key: K, value: ElectronConfig[K]) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-neutral-950 text-neutral-200">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Intro Banner */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Electron Native Desktop Packaging Engine</h2>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Configure BrowserWindow creation parameters, Chromium sandbox security, single instance locking,
              and choose between a standalone Portable EXE or full NSIS Setup Installer.
            </p>
          </div>
        </div>

        {/* Section 1: Application Identity */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
            <Box className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">01. Windows Application Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Application Name</label>
              <input
                type="text"
                value={config.appName}
                onChange={(e) => updateField('appName', e.target.value)}
                placeholder="ElectraDesktopApp"
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">AppUserModelId / App ID</label>
              <input
                type="text"
                value={config.appId}
                onChange={(e) => updateField('appId', e.target.value)}
                placeholder="com.acme.desktop"
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">SemVer Version</label>
              <input
                type="text"
                value={config.version}
                onChange={(e) => updateField('version', e.target.value)}
                placeholder="1.0.0"
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Windows Packaging Target Format */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">02. Windows Packaging Target</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                id: 'portable',
                title: 'Single Portable (.exe)',
                desc: 'Self-extracting standalone executable. Zero installer required, launches immediately from any folder or USB stick.'
              },
              {
                id: 'nsis',
                title: 'NSIS Setup Installer (.exe)',
                desc: 'Standard Windows setup wizard with Desktop shortcuts, Start Menu entry, and Windows Add/Remove Programs registry.'
              },
              {
                id: 'dir',
                title: 'Unpacked Directory (win-unpacked)',
                desc: 'Raw unpacked folder with electron.exe renamed to your app and packaged resources/app.asar.'
              }
            ].map((tgt) => (
              <label
                key={tgt.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors space-y-2 ${
                  config.targetFormat === tgt.id
                    ? 'bg-blue-950/30 border-blue-600/50 text-white'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{tgt.title}</span>
                  <input
                    type="radio"
                    name="target_format"
                    checked={config.targetFormat === tgt.id}
                    onChange={() => updateField('targetFormat', tgt.id as any)}
                    className="text-blue-600 focus:ring-0"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 leading-normal">{tgt.desc}</p>
              </label>
            ))}
          </div>

          {/* NSIS Extra Settings */}
          {config.targetFormat === 'nsis' && (
            <div className="p-4 rounded-lg bg-neutral-900/40 border border-neutral-800 flex flex-wrap items-center gap-6 text-xs text-neutral-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.createDesktopShortcut}
                  onChange={(e) => updateField('createDesktopShortcut', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 bg-neutral-950 border-neutral-700"
                />
                <span>Create Desktop Shortcut</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.createStartMenuShortcut}
                  onChange={(e) => updateField('createStartMenuShortcut', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 bg-neutral-950 border-neutral-700"
                />
                <span>Create Start Menu Shortcut</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.oneClickInstaller}
                  onChange={(e) => updateField('oneClickInstaller', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 bg-neutral-950 border-neutral-700"
                />
                <span>One-Click Fast Install (No wizard prompts)</span>
              </label>
            </div>
          )}
        </section>

        {/* Section 3: Native Window Chrome & Geometry */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
            <AppWindow className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">03. Windows BrowserWindow Presentation</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Window Width (px)</label>
                  <input
                    type="number"
                    value={config.windowWidth}
                    onChange={(e) => updateField('windowWidth', parseInt(e.target.value) || 800)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Window Height (px)</label>
                  <input
                    type="number"
                    value={config.windowHeight}
                    onChange={(e) => updateField('windowHeight', parseInt(e.target.value) || 600)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Window Frame Style</label>
                <select
                  value={config.frame ? 'standard' : 'frameless'}
                  onChange={(e) => updateField('frame', e.target.value === 'standard')}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-neutral-200 focus:outline-none"
                >
                  <option value="standard">Standard Windows 11 Chrome (Titlebar & Min/Max/Close)</option>
                  <option value="frameless">Frameless Window (Custom HTML/CSS Window Controls)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Theme Source (nativeTheme)</label>
                <select
                  value={config.themeSource}
                  onChange={(e) => updateField('themeSource', e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-neutral-200 focus:outline-none"
                >
                  <option value="dark">Dark Theme (Force Dark Mode)</option>
                  <option value="system">Follow Windows System Theme</option>
                  <option value="light">Light Theme</option>
                </select>
              </div>
            </div>

            {/* Window flags */}
            <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-3">
              <label className="block text-xs font-medium text-neutral-300">
                Runtime Capabilities
              </label>

              <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.resizable}
                  onChange={(e) => updateField('resizable', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 bg-neutral-950 border-neutral-700"
                />
                <span>Allow Window Resizing</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.singleInstanceLock}
                  onChange={(e) => updateField('singleInstanceLock', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 bg-neutral-950 border-neutral-700"
                />
                <span>Single Instance Lock (Focus existing window if reopened)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.disableHardwareAcceleration}
                  onChange={(e) => updateField('disableHardwareAcceleration', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 bg-neutral-950 border-neutral-700"
                />
                <span>Disable Hardware Acceleration (For software-only rendering)</span>
              </label>
            </div>
          </div>
        </section>

        {/* Section 4: Security Hardening (Context Isolation) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">04. Electron Security Hardening (webPreferences)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Context Isolation</span>
                <span className="text-[10px] font-mono text-emerald-400">ENFORCED</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Runs scripts in separate JavaScript contexts. Prevents website scripts from accessing Electron internal APIs.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Node Integration</span>
                <span className="text-[10px] font-mono text-emerald-400">DISABLED</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Disabled in renderer window to prevent arbitrary remote code execution. APIs exposed strictly via contextBridge.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Chromium Sandbox</span>
                <span className="text-[10px] font-mono text-emerald-400">ENABLED</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Restricts the renderer process using native OS-level process sandboxing on Windows NT.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
