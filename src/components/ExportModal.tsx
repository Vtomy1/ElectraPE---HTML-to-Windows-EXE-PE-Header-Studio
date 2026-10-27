import React, { useState } from 'react';
import { ElectronConfig, PeHeaderConfig, ProjectFiles } from '../types/pe-types';
import { downloadElectronProjectZip, downloadStandaloneExe } from '../utils/zip-exporter';
import {
  Download,
  X,
  FileArchive,
  Binary,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  Cpu,
  Layers,
  Copy,
  Check
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  electronConfig: ElectronConfig;
  peConfig: PeHeaderConfig;
  files: ProjectFiles;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  electronConfig,
  peConfig,
  files
}) => {
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [downloadComplete, setDownloadComplete] = useState<boolean>(false);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadElectronProjectZip(electronConfig, peConfig, files);
      setDownloadComplete(true);
      setTimeout(() => setDownloadComplete(false), 4000);
    } catch (err) {
      console.error('Failed to create zip', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadExe = () => {
    downloadStandaloneExe(electronConfig, peConfig, files);
  };

  const copyBuildScript = () => {
    navigator.clipboard.writeText('npm install && npm run dist:win');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Package & Export Windows Executable</h3>
              <p className="text-[11px] text-neutral-400">
                Native Electron package with customized PE Header and security manifest
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Target Summary Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <div>
              <span className="text-[10px] text-neutral-500 block">Target Architecture</span>
              <span className="font-semibold text-white font-mono">{peConfig.machine.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block">Subsystem</span>
              <span className="font-semibold text-white">
                {peConfig.subsystem === 'windows_gui' ? 'GUI (No Console)' : 'Console'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block">Security ASLR / DEP</span>
              <span className="font-semibold text-emerald-400">Enabled</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block">Package Format</span>
              <span className="font-semibold text-purple-400 uppercase font-mono">
                {electronConfig.targetFormat}
              </span>
            </div>
          </div>

          {/* Option 1: Complete Electron Source + Automated Build scripts */}
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-blue-600/30 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
                  <FileArchive className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    Complete Electron Windows Package (.ZIP)
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-normal">
                    Includes all ready-to-run files: <code className="text-blue-400">package.json</code>,{' '}
                    <code className="text-blue-400">main.js</code>, <code className="text-blue-400">preload.js</code>,{' '}
                    <code className="text-blue-400">app.manifest</code>, <code className="text-blue-400">build-windows-exe.bat</code>,{' '}
                    and your compiled web assets.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Double-click <code className="text-neutral-300">build-windows-exe.bat</code> on any PC to compile!</span>
              </div>
              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors flex items-center gap-2 shadow-md shadow-blue-900/30"
              >
                {isZipping ? (
                  <span>Generating ZIP...</span>
                ) : downloadComplete ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Electron Workspace (.ZIP)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 2: Standalone PE Binary (.EXE) */}
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-neutral-800 text-amber-400 shrink-0 mt-0.5">
                  <Binary className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    Direct Windows PE Executable Binary (.EXE)
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-normal">
                    Download the pre-assembled portable executable file containing the actual MS-DOS MZ header,
                    PE signature, 64-bit Optional Header, and embedded HTML application payload.
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownloadExe}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Download .EXE</span>
              </button>
            </div>
          </div>

          {/* Quick Terminal Command */}
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Command line packaging command:</span>
              </div>
              <button
                onClick={copyBuildScript}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
              >
                {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="font-mono text-[11px] text-emerald-400 bg-neutral-900 p-2 rounded border border-neutral-800/80 overflow-x-auto">
              <code>npm install && npm run dist:win</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
