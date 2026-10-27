import React, { useState } from 'react';
import { ElectronConfig, PeHeaderConfig } from '../types/pe-types';
import {
  generateMainJs,
  generatePreloadJs,
  generatePackageJson,
  generateWindowsManifest,
  generateResourceScript,
  generateBuildBat,
  generateReadme
} from '../utils/electron-config-generator';
import { Code2, Copy, Check, FileText } from 'lucide-react';

interface GeneratedCodeViewerProps {
  electronConfig: ElectronConfig;
  peConfig: PeHeaderConfig;
}

type GeneratedFileName =
  | 'main.js'
  | 'preload.js'
  | 'package.json'
  | 'app.manifest'
  | 'resource.rc'
  | 'build-windows-exe.bat'
  | 'README.md';

export const GeneratedCodeViewer: React.FC<GeneratedCodeViewerProps> = ({
  electronConfig,
  peConfig
}) => {
  const [selectedFile, setSelectedFile] = useState<GeneratedFileName>('main.js');
  const [copied, setCopied] = useState<boolean>(false);

  const getFileContent = (filename: GeneratedFileName): string => {
    switch (filename) {
      case 'main.js':
        return generateMainJs(electronConfig, peConfig);
      case 'preload.js':
        return generatePreloadJs();
      case 'package.json':
        return generatePackageJson(electronConfig, peConfig);
      case 'app.manifest':
        return generateWindowsManifest(peConfig, electronConfig);
      case 'resource.rc':
        return generateResourceScript(peConfig);
      case 'build-windows-exe.bat':
        return generateBuildBat(electronConfig, peConfig);
      case 'README.md':
        return generateReadme(electronConfig, peConfig);
      default:
        return '';
    }
  };

  const currentContent = getFileContent(selectedFile);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filesList: { name: GeneratedFileName; desc: string }[] = [
    { name: 'main.js', desc: 'Electron native lifecycle & window management' },
    { name: 'preload.js', desc: 'Safe IPC ContextBridge bridge' },
    { name: 'package.json', desc: 'Electron-builder build specifications' },
    { name: 'app.manifest', desc: 'Windows PE RT_MANIFEST (UAC & DPI)' },
    { name: 'resource.rc', desc: 'Windows Resource Compiler script' },
    { name: 'build-windows-exe.bat', desc: 'Windows 1-click terminal build script' },
    { name: 'README.md', desc: 'Step-by-step build documentation' }
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-neutral-950 text-neutral-200">
      {/* File Sidebar */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-neutral-800 bg-neutral-900/50 p-4 space-y-2 shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Native Build Files
          </span>
        </div>
        <div className="space-y-1">
          {filesList.map((item) => (
            <button
              key={item.name}
              onClick={() => setSelectedFile(item.name)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors flex flex-col ${
                selectedFile === item.name
                  ? 'bg-neutral-800 text-white font-medium border border-neutral-700/60'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
              }`}
            >
              <span className="font-mono text-xs">{item.name}</span>
              <span className="text-[10px] text-neutral-500 font-sans truncate">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Code Display Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-neutral-950">
        {/* File Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 text-xs">
          <div className="flex items-center gap-2 font-mono text-white">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span>{selectedFile}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy File</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 bg-neutral-950">
          <pre className="font-mono text-xs text-neutral-300 leading-relaxed whitespace-pre selection:bg-blue-600/40">
            <code>{currentContent}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
