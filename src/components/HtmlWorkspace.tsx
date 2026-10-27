import React, { useState, useRef } from 'react';
import { ProjectFiles } from '../types/pe-types';
import { STARTER_TEMPLATES } from '../constants/templates';
import { Code2, FileCode, Palette, Terminal, Upload, RefreshCw, Sparkles, Eye, Check } from 'lucide-react';

interface HtmlWorkspaceProps {
  files: ProjectFiles;
  onChangeFiles: (newFiles: ProjectFiles) => void;
  onSelectTemplate: (templateId: string) => void;
}

type FileTab = 'index.html' | 'styles.css' | 'app.js';

export const HtmlWorkspace: React.FC<HtmlWorkspaceProps> = ({
  files,
  onChangeFiles,
  onSelectTemplate
}) => {
  const [activeFile, setActiveFile] = useState<FileTab>('index.html');
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChangeFiles({
      ...files,
      [activeFile]: e.target.value
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (uploadedFile.name.endsWith('.css')) {
        onChangeFiles({ ...files, 'styles.css': content });
        setActiveFile('styles.css');
      } else if (uploadedFile.name.endsWith('.js')) {
        onChangeFiles({ ...files, 'app.js': content });
        setActiveFile('app.js');
      } else {
        onChangeFiles({ ...files, 'index.html': content });
        setActiveFile('index.html');
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleInsertElectronHook = () => {
    const hookCode = `
// Electron Native Desktop Bridge Hook
if (window.electronAPI) {
  console.log("Running in native Windows environment via Electron");
  document.getElementById('my-min-btn')?.addEventListener('click', () => window.electronAPI.minimize());
  document.getElementById('my-close-btn')?.addEventListener('click', () => window.electronAPI.close());
}`;
    onChangeFiles({
      ...files,
      'app.js': files['app.js'] + '\n' + hookCode
    });
    setActiveFile('app.js');
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // Compile combined HTML document for live iframe preview
  const previewHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    ${files['styles.css']}
  </style>
</head>
<body>
  ${files['index.html']}
  <script>
    // Mock electronAPI in iframe preview so user scripts never throw
    window.electronAPI = {
      minimize: () => console.log('[Simulated Electron IPC] Window Minimized'),
      maximize: () => console.log('[Simulated Electron IPC] Window Maximized'),
      close: () => console.log('[Simulated Electron IPC] Window Closed'),
      platform: 'win32',
      isElectron: true
    };
    try {
      ${files['app.js']}
    } catch(err) {
      console.error('Renderer execution error:', err);
    }
  </script>
</body>
</html>`;

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-200 overflow-hidden">
      {/* Workspace Sub-Toolbar */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-neutral-900/90 border-b border-neutral-800 text-xs gap-4 shrink-0">
        <div className="flex items-center gap-2">
          {/* File Switcher Tabs */}
          <div className="flex items-center p-0.5 bg-neutral-950 rounded-lg border border-neutral-800">
            <button
              onClick={() => setActiveFile('index.html')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeFile === 'index.html'
                  ? 'bg-neutral-800 text-blue-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>index.html</span>
            </button>
            <button
              onClick={() => setActiveFile('styles.css')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeFile === 'styles.css'
                  ? 'bg-neutral-800 text-cyan-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>styles.css</span>
            </button>
            <button
              onClick={() => setActiveFile('app.js')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeFile === 'app.js'
                  ? 'bg-neutral-800 text-amber-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>app.js</span>
            </button>
          </div>

          {/* Quick template selector */}
          <div className="hidden sm:flex items-center gap-1.5 ml-3 text-neutral-400">
            <span>Template:</span>
            <select
              onChange={(e) => onSelectTemplate(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-neutral-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {STARTER_TEMPLATES.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleInsertElectronHook}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title="Inject sample Electron window control hook into app.js"
          >
            {copiedSnippet ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Hook Added</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>+ Electron API Hook</span>
              </>
            )}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".html,.css,.js,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title="Upload existing web asset"
          >
            <Upload className="w-3.5 h-3.5 text-neutral-400" />
            <span>Upload File</span>
          </button>

          <button
            onClick={() => setPreviewKey((prev) => prev + 1)}
            className="p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title="Reload preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor & Preview Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
        {/* Left: Code Editor */}
        <div className="flex flex-col h-full bg-neutral-950 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/60 border-b border-neutral-800/80 text-xs text-neutral-400 font-mono">
            <span>{activeFile}</span>
            <span>{files[activeFile].length.toLocaleString()} characters · {files[activeFile].split('\n').length} lines</span>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <textarea
              value={files[activeFile]}
              onChange={handleCodeChange}
              spellCheck={false}
              className="w-full h-full p-4 bg-neutral-950 text-neutral-200 font-mono text-xs leading-relaxed resize-none focus:outline-none selection:bg-blue-600/50"
              placeholder={`Write or paste ${activeFile} code here...`}
            />
          </div>
        </div>

        {/* Right: Live Desktop Preview */}
        <div className="flex flex-col h-full bg-neutral-900/40 overflow-hidden">
          {/* Virtual Window Frame Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800 text-xs text-neutral-400 select-none">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-medium text-neutral-300">Live Window Preview</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-mono">
              <span>Renderer Engine: Chromium 130</span>
            </div>
          </div>

          <div className="flex-1 p-3 bg-neutral-950 flex flex-col min-h-0">
            <div className="flex-1 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 shadow-xl flex flex-col">
              {/* Simulated Desktop Window Chrome */}
              <div className="h-8 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-3 text-xs text-neutral-400 select-none">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded bg-blue-500"></div>
                  <span className="text-[11px] font-medium text-neutral-300 truncate max-w-[200px]">Packaged App Preview</span>
                </div>
                <div className="flex items-center">
                  <button className="w-7 h-6 flex items-center justify-center hover:bg-neutral-800 text-neutral-400 text-xs">―</button>
                  <button className="w-7 h-6 flex items-center justify-center hover:bg-neutral-800 text-neutral-400 text-xs">□</button>
                  <button className="w-7 h-6 flex items-center justify-center hover:bg-red-600 hover:text-white text-neutral-400 text-xs">✕</button>
                </div>
              </div>

              {/* Iframe Viewport */}
              <iframe
                key={previewKey}
                title="Desktop HTML Preview"
                srcDoc={previewHtml}
                sandbox="allow-scripts allow-modals allow-same-origin"
                className="w-full flex-1 border-none bg-neutral-900"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
