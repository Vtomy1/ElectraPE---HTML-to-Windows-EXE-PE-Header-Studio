import React, { useState, useEffect, useRef } from 'react';
import { ElectronConfig, PeHeaderConfig, ProjectFiles } from '../types/pe-types';
import {
  MonitorPlay,
  Minus,
  Square,
  X,
  Bell,
  Terminal,
  ShieldAlert,
  Info,
  Maximize2,
  RefreshCw,
  Sun,
  Moon,
  ExternalLink
} from 'lucide-react';

interface WindowsSimulatorProps {
  electronConfig: ElectronConfig;
  peConfig: PeHeaderConfig;
  files: ProjectFiles;
}

export const WindowsSimulator: React.FC<WindowsSimulatorProps> = ({
  electronConfig,
  peConfig,
  files
}) => {
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isClosed, setIsClosed] = useState<boolean>(false);
  const [simTheme, setSimTheme] = useState<'dark' | 'light'>(
    electronConfig.themeSource === 'light' ? 'light' : 'dark'
  );
  const [activeDevTab, setActiveDevTab] = useState<'ipc' | 'logs' | 'pe_state'>('ipc');
  const [ipcEvents, setIpcEvents] = useState<{ id: string; time: string; event: string; detail: string }[]>([
    {
      id: '1',
      time: new Date().toLocaleTimeString(),
      event: 'app:ready',
      detail: 'Electron main process initialized. Window created with contextIsolation: true.'
    },
    {
      id: '2',
      time: new Date().toLocaleTimeString(),
      event: 'pe:loaded',
      detail: `Subsystem: ${peConfig.subsystem} · Arch: ${peConfig.machine} · UAC: ${peConfig.requestedExecutionLevel}`
    }
  ]);
  const [consoleLogs, setConsoleLogs] = useState<{ time: string; text: string; type: 'log' | 'info' | 'warn' }[]>([
    { time: new Date().toLocaleTimeString(), text: 'DOM Content Loaded: index.html', type: 'info' }
  ]);
  const [showToastNotification, setShowToastNotification] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showUacModal, setShowUacModal] = useState<boolean>(false);

  const addIpcEvent = (event: string, detail: string) => {
    setIpcEvents((prev) => [
      {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        event,
        detail
      },
      ...prev.slice(0, 30)
    ]);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    addIpcEvent('window:minimize', 'Window collapsed into Windows Taskbar.');
  };

  const handleRestoreFromTaskbar = () => {
    setIsMinimized(false);
    setIsClosed(false);
    addIpcEvent('window:restore', 'Window restored to foreground.');
  };

  const handleMaximizeToggle = () => {
    const next = !isMaximized;
    setIsMaximized(next);
    addIpcEvent(
      next ? 'window:maximize' : 'window:unmaximize',
      next ? 'Window scaled to virtual screen boundaries.' : 'Window returned to standard dimensions.'
    );
  };

  const handleClose = () => {
    setIsClosed(true);
    addIpcEvent('window:close', 'Window destroyed. Single instance lock freed.');
  };

  const triggerToast = (title: string, body: string) => {
    setToastMessage(`${title}: ${body}`);
    setShowToastNotification(true);
    addIpcEvent('notification:display', `Windows Action Center notification triggered: "${title}"`);
    setTimeout(() => {
      setShowToastNotification(false);
    }, 4000);
  };

  const handleSimulateUac = () => {
    setShowUacModal(true);
    addIpcEvent(
      'uac:consent_requested',
      `Prompting user consent for requestedExecutionLevel="${peConfig.requestedExecutionLevel}"`
    );
  };

  const combinedHtml = `
<!DOCTYPE html>
<html class="${simTheme}">
<head>
  <meta charset="UTF-8">
  <style>
    ${files['styles.css']}
  </style>
</head>
<body>
  ${files['index.html']}
  <script>
    // Bridge simulated Electron IPC to parent simulator
    window.electronAPI = {
      minimize: () => window.parent.postMessage({ type: 'ELECTRA_IPC', action: 'minimize' }, '*'),
      maximize: () => window.parent.postMessage({ type: 'ELECTRA_IPC', action: 'maximize' }, '*'),
      close: () => window.parent.postMessage({ type: 'ELECTRA_IPC', action: 'close' }, '*'),
      notify: (title, body) => window.parent.postMessage({ type: 'ELECTRA_IPC', action: 'notify', title, body }, '*'),
      platform: 'win32',
      isElectron: true
    };

    // Forward console logs to simulator console tab
    const _origLog = console.log;
    console.log = function(...args) {
      _origLog.apply(console, args);
      window.parent.postMessage({ type: 'ELECTRA_LOG', log: args.join(' '), logType: 'log' }, '*');
    };
    const _origError = console.error;
    console.error = function(...args) {
      _origError.apply(console, args);
      window.parent.postMessage({ type: 'ELECTRA_LOG', log: args.join(' '), logType: 'warn' }, '*');
    };

    try {
      ${files['app.js']}
    } catch(e) {
      console.error(e);
    }
  </script>
</body>
</html>`;

  // Listen to postMessages from simulated iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'ELECTRA_IPC') {
        if (e.data.action === 'minimize') handleMinimize();
        if (e.data.action === 'maximize') handleMaximizeToggle();
        if (e.data.action === 'close') handleClose();
        if (e.data.action === 'notify') triggerToast(e.data.title || 'App Notification', e.data.body || '');
      } else if (e.data?.type === 'ELECTRA_LOG') {
        setConsoleLogs((prev) => [
          { time: new Date().toLocaleTimeString(), text: e.data.log, type: e.data.logType || 'log' },
          ...prev.slice(0, 40)
        ]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isMaximized]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-950 text-neutral-200">
      {/* Simulator Control Toolbar */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-neutral-900 border-b border-neutral-800 text-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <MonitorPlay className="w-4 h-4 text-cyan-400" />
            <span>Virtual Windows 11 Desktop Sandbox</span>
          </div>
          <span className="text-neutral-500 font-mono text-[11px]">
            Target: Windows {peConfig.machine.toUpperCase()} ({peConfig.subsystem === 'windows_gui' ? 'GUI' : 'Console'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerToast(electronConfig.appName, 'Desktop Toast Notification successfully handled!')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Toast</span>
          </button>

          <button
            onClick={handleSimulateUac}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>Test UAC Prompt</span>
          </button>

          <button
            onClick={() => setSimTheme(simTheme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title="Toggle Windows System Theme"
          >
            {simTheme === 'dark' ? <Moon className="w-3.5 h-3.5 text-blue-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Main Virtual Desktop Canvas */}
      <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-4 relative overflow-hidden">
        {/* Toast Notification Simulation */}
        {showToastNotification && (
          <div className="absolute bottom-16 right-6 z-50 w-80 p-4 rounded-xl bg-neutral-900/95 backdrop-blur-md border border-neutral-700 shadow-2xl text-xs space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between text-neutral-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-600 text-[10px] text-white flex items-center justify-center font-bold">
                  W
                </div>
                <span className="font-medium text-neutral-200">{electronConfig.appName}</span>
              </div>
              <span className="text-[10px]">Just now</span>
            </div>
            <p className="text-white pt-1">{toastMessage}</p>
          </div>
        )}

        {/* UAC Elevation Modal Simulation */}
        {showUacModal && (
          <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-neutral-900 rounded-xl border border-neutral-700 shadow-2xl overflow-hidden text-xs">
              <div className="bg-amber-600 px-4 py-3 flex items-center gap-3 text-white font-semibold">
                <ShieldAlert className="w-5 h-5" />
                <span>User Account Control (UAC)</span>
              </div>
              <div className="p-5 space-y-4 text-neutral-300">
                <p className="font-medium text-white text-sm">
                  Do you want to allow this app to make changes to your device?
                </p>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1.5 font-mono text-[11px]">
                  <div><span className="text-neutral-500">Program:</span> {electronConfig.appName}.exe</div>
                  <div><span className="text-neutral-500">Publisher:</span> {peConfig.companyName}</div>
                  <div><span className="text-neutral-500">Level:</span> {peConfig.requestedExecutionLevel}</div>
                  <div><span className="text-neutral-500">Subsystem:</span> {peConfig.subsystem}</div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setShowUacModal(false);
                      addIpcEvent('uac:granted', 'Elevation consent granted by user.');
                    }}
                    className="px-4 py-1.5 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-500"
                  >
                    Yes (Consent)
                  </button>
                  <button
                    onClick={() => {
                      setShowUacModal(false);
                      addIpcEvent('uac:denied', 'Elevation denied by user.');
                    }}
                    className="px-4 py-1.5 rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  >
                    No (Abort)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* The Desktop Window */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {!isClosed && !isMinimized ? (
            <div
              className={`flex flex-col rounded-xl overflow-hidden border border-neutral-700/80 bg-neutral-900 shadow-2xl transition-all duration-150 ${
                isMaximized ? 'w-full h-full' : 'w-full max-w-4xl h-[92%] mx-auto my-auto'
              }`}
            >
              {/* Windows 11 Titlebar */}
              {electronConfig.frame && (
                <div className="h-9 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-3 select-none shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white">
                      EXE
                    </div>
                    <span className="text-xs font-medium text-neutral-200 truncate max-w-[280px]">
                      {electronConfig.appName}
                    </span>
                    {/* Simulated native menu */}
                    <div className="hidden sm:flex items-center gap-3 ml-4 text-xs text-neutral-400">
                      <span className="hover:text-white cursor-pointer">File</span>
                      <span className="hover:text-white cursor-pointer">Edit</span>
                      <span className="hover:text-white cursor-pointer">View</span>
                      <span className="hover:text-white cursor-pointer">Help</span>
                    </div>
                  </div>

                  {/* Window Minimize/Maximize/Close Controls */}
                  <div className="flex items-center -mr-3">
                    <button
                      onClick={handleMinimize}
                      className="w-11 h-9 flex items-center justify-center hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                      title="Minimize"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleMaximizeToggle}
                      className="w-11 h-9 flex items-center justify-center hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                      title={isMaximized ? 'Restore' : 'Maximize'}
                    >
                      <Square className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleClose}
                      className="w-11 h-9 flex items-center justify-center hover:bg-red-600 hover:text-white text-neutral-400 transition-colors"
                      title="Close"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Main Application Window Viewport */}
              <div className="flex-1 relative min-h-0 bg-neutral-950">
                <iframe
                  title="Virtual Windows Window"
                  srcDoc={combinedHtml}
                  sandbox="allow-scripts allow-modals allow-same-origin"
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-6 text-neutral-400">
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  {isMinimized ? 'Application is minimized in the Windows Taskbar.' : 'Application window has been closed.'}
                </p>
                <button
                  onClick={handleRestoreFromTaskbar}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors text-xs"
                >
                  Relaunch / Restore Window
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Windows 11 Taskbar */}
        <div className="h-12 bg-neutral-900/90 backdrop-blur-md border-t border-neutral-800 flex items-center justify-between px-4 mt-2 rounded-lg select-none shrink-0 shadow-lg">
          <div className="flex items-center gap-1 mx-auto">
            {/* Windows Start Button */}
            <button className="w-9 h-9 rounded-md hover:bg-neutral-800 flex items-center justify-center text-blue-400 transition-colors">
              <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                <div className="bg-blue-400 rounded-xs"></div>
                <div className="bg-blue-400 rounded-xs"></div>
                <div className="bg-blue-400 rounded-xs"></div>
                <div className="bg-blue-400 rounded-xs"></div>
              </div>
            </button>

            {/* App Taskbar Icon */}
            <button
              onClick={handleRestoreFromTaskbar}
              className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors relative ${
                !isClosed && !isMinimized ? 'bg-neutral-800' : 'hover:bg-neutral-800/60'
              }`}
              title={electronConfig.appName}
            >
              <div className="w-5 h-5 rounded bg-blue-600 text-[10px] text-white flex items-center justify-center font-bold">
                EXE
              </div>
              {!isClosed && (
                <div className="absolute bottom-1 w-3 h-0.5 bg-blue-400 rounded-full"></div>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 text-neutral-400 text-xs font-mono">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Bottom Drawer: Simulated DevTools & IPC Telemetry */}
      <div className="h-44 bg-neutral-900 border-t border-neutral-800 flex flex-col shrink-0">
        <div className="flex items-center justify-between px-4 py-1.5 bg-neutral-950 border-b border-neutral-800 text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-neutral-300">Desktop Diagnostic Console</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveDevTab('ipc')}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                activeDevTab === 'ipc' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Electron IPC Pipeline ({ipcEvents.length})
            </button>
            <button
              onClick={() => setActiveDevTab('logs')}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                activeDevTab === 'logs' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Renderer Logs ({consoleLogs.length})
            </button>
            <button
              onClick={() => setActiveDevTab('pe_state')}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                activeDevTab === 'pe_state' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Active PE Flag Map
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1">
          {activeDevTab === 'ipc' &&
            ipcEvents.map((evt) => (
              <div key={evt.id} className="flex items-start gap-2.5 leading-normal">
                <span className="text-neutral-500 shrink-0">{evt.time}</span>
                <span className="text-cyan-400 font-semibold shrink-0">[{evt.event}]</span>
                <span className="text-neutral-300">{evt.detail}</span>
              </div>
            ))}

          {activeDevTab === 'logs' &&
            consoleLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2.5 leading-normal">
                <span className="text-neutral-500 shrink-0">{log.time}</span>
                <span className={log.type === 'warn' ? 'text-amber-400' : 'text-emerald-400'}>
                  {log.text}
                </span>
              </div>
            ))}

          {activeDevTab === 'pe_state' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-neutral-300">
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                <div className="text-[10px] text-neutral-500">PE Subsystem</div>
                <div className="text-white font-semibold">{peConfig.subsystem}</div>
              </div>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                <div className="text-[10px] text-neutral-500">Machine Arch</div>
                <div className="text-white font-semibold">{peConfig.machine}</div>
              </div>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                <div className="text-[10px] text-neutral-500">ASLR Mitigation</div>
                <div className={peConfig.dynamicBase ? 'text-emerald-400 font-semibold' : 'text-red-400'}>
                  {peConfig.dynamicBase ? '0x0040 (Enabled)' : 'Disabled'}
                </div>
              </div>
              <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                <div className="text-[10px] text-neutral-500">DEP / NX</div>
                <div className={peConfig.nxCompat ? 'text-emerald-400 font-semibold' : 'text-red-400'}>
                  {peConfig.nxCompat ? '0x0100 (Enabled)' : 'Disabled'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
