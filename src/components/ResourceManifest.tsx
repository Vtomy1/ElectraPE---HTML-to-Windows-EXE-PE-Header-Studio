import React, { useState, useRef } from 'react';
import { PeHeaderConfig } from '../types/pe-types';
import {
  Layers,
  Upload,
  Download,
  Plus,
  Trash2,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Info,
  Copy,
  Check,
  Eye,
  Sliders
} from 'lucide-react';

interface ResourceManifestProps {
  peConfig: PeHeaderConfig;
  onChangePeConfig: (newConfig: PeHeaderConfig) => void;
}

// Preset icon definitions
const ICON_PRESETS = [
  {
    id: 'blue-app',
    name: 'Modern Fluent Blue',
    bg: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    text: 'EXE',
    color: '#ffffff'
  },
  {
    id: 'cyan-cyber',
    name: 'Terminal Cyan',
    bg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    text: '>_',
    color: '#082f49'
  },
  {
    id: 'emerald-shield',
    name: 'Security Shield',
    bg: 'linear-gradient(135deg, #10b981, #059669)',
    text: 'SEC',
    color: '#ffffff'
  },
  {
    id: 'purple-studio',
    name: 'Electra Studio',
    bg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    text: 'PE',
    color: '#ffffff'
  },
  {
    id: 'amber-engine',
    name: 'Industrial Amber',
    bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
    text: 'WIN',
    color: '#ffffff'
  }
];

export const ResourceManifest: React.FC<ResourceManifestProps> = ({
  peConfig,
  onChangePeConfig
}) => {
  const [activeTab, setActiveTab] = useState<'icons' | 'version_info' | 'preview_dialog'>('icons');
  const [selectedPreset, setSelectedPreset] = useState<string>('blue-app');
  const [iconSize, setIconSize] = useState<string>('32x32');
  const [copiedRc, setCopiedRc] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const customStrings = peConfig.customVersionStrings || [];

  const updateField = <K extends keyof PeHeaderConfig>(key: K, value: PeHeaderConfig[K]) => {
    onChangePeConfig({
      ...peConfig,
      [key]: value
    });
  };

  // Icon upload handler
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onChangePeConfig({
        ...peConfig,
        iconDataUrl: dataUrl,
        iconName: file.name
      });
      setSelectedPreset('custom');
    };
    reader.readAsDataURL(file);
  };

  // Add custom version string resource
  const handleAddCustomString = (keyName = 'LegalTrademarks', defaultValue = '') => {
    const exists = customStrings.some((s) => s.key.toLowerCase() === keyName.toLowerCase());
    if (exists) return;

    const updated = [...customStrings, { key: keyName, value: defaultValue }];
    updateField('customVersionStrings', updated);
  };

  const handleUpdateCustomString = (index: number, newKey: string, newValue: string) => {
    const updated = [...customStrings];
    updated[index] = { key: newKey, value: newValue };
    updateField('customVersionStrings', updated);
  };

  const handleRemoveCustomString = (index: number) => {
    const updated = customStrings.filter((_, i) => i !== index);
    updateField('customVersionStrings', updated);
  };

  // Select preset icon
  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    // Remove custom uploaded DataURL when selecting a preset
    const updated = { ...peConfig };
    delete updated.iconDataUrl;
    onChangePeConfig(updated);
  };

  // Download client-generated .ico file
  const handleDownloadIco = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (peConfig.iconDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 32, 32);
        exportCanvasToIco(canvas);
      };
      img.src = peConfig.iconDataUrl;
    } else {
      const preset = ICON_PRESETS.find((p) => p.id === selectedPreset) || ICON_PRESETS[0];
      ctx.fillStyle = preset.id === 'cyan-cyber' ? '#0891b2' : preset.id === 'emerald-shield' ? '#059669' : '#2563eb';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(preset.text, 16, 16);
      exportCanvasToIco(canvas);
    }
  };

  const exportCanvasToIco = (canvas: HTMLCanvasElement) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = peConfig.iconName || 'app-icon.ico';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  // Render icon preview box
  const renderIconPreview = (sizePx: number) => {
    if (peConfig.iconDataUrl) {
      return (
        <img
          src={peConfig.iconDataUrl}
          alt="Executable Icon"
          className="object-contain rounded-md"
          style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
        />
      );
    }

    const preset = ICON_PRESETS.find((p) => p.id === selectedPreset) || ICON_PRESETS[0];
    const fontSize = Math.max(9, Math.floor(sizePx * 0.32));

    return (
      <div
        className="rounded-md flex items-center justify-center font-bold tracking-tight shadow-sm select-none"
        style={{
          width: `${sizePx}px`,
          height: `${sizePx}px`,
          background: preset.bg,
          color: preset.color,
          fontSize: `${fontSize}px`
        }}
      >
        {preset.text}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-neutral-950 text-neutral-200">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Introduction */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-amber-600/10 border border-amber-500/20 text-amber-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Windows PE Resource & Manifest Manager</h2>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Embed custom multi-resolution icon resources (<code className="text-neutral-300">RT_GROUP_ICON</code>) and
                version metadata tables (<code className="text-neutral-300">VS_VERSION_INFO</code>) into the Windows executable headers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-lg border border-neutral-800 text-xs shrink-0">
            <button
              onClick={() => setActiveTab('icons')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'icons'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Icon Resources</span>
            </button>
            <button
              onClick={() => setActiveTab('version_info')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'version_info'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Version String Table</span>
            </button>
            <button
              onClick={() => setActiveTab('preview_dialog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'preview_dialog'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Windows Properties Preview</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Application Icon Manager */}
        {activeTab === 'icons' && (
          <div className="space-y-6">
            {/* Upload & Preset Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Custom File Upload Box */}
              <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Upload Custom Executable Icon (.ico or .png)</span>
                  </h3>
                  {peConfig.iconDataUrl && (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Custom Active
                    </span>
                  )}
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-700 hover:border-amber-500/80 rounded-xl p-6 text-center cursor-pointer transition-colors bg-neutral-950/40 hover:bg-neutral-950/80 flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white">Click or drag & drop icon file</span>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Supports high-res PNG (256x256+) or Windows ICO container</p>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleIconUpload}
                  accept=".ico,.png"
                  className="hidden"
                />

                <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-800">
                  <span className="font-mono text-[11px]">Filename: {peConfig.iconName || 'icon.ico'}</span>
                  <button
                    onClick={handleDownloadIco}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download .ICO File</span>
                  </button>
                </div>
              </div>

              {/* Built-in High-Resolution Icon Presets */}
              <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Standard Icon Presets</span>
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Select a ready-to-use branded Windows icon template if you do not have a custom graphic.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {ICON_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPreset(p.id)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition-colors ${
                        selectedPreset === p.id && !peConfig.iconDataUrl
                          ? 'bg-blue-950/30 border-blue-500 text-white'
                          : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs select-none shrink-0"
                        style={{ background: p.bg, color: p.color }}
                      >
                        {p.text}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-medium text-white truncate">{p.name}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">32-bit RGBA</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Multi-Resolution Windows Icon Directory Preview */}
            <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <div>
                  <h3 className="text-xs font-semibold text-white">
                    Multi-Resolution Icon Directory (RT_GROUP_ICON)
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Windows Desktop Window Manager (DWM) dynamically selects matching resolution based on DPI and view mode.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-neutral-500">
                  Target: 7 Sub-Images (16px to 256px)
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
                {[
                  { size: 16, label: '16x16', usage: 'Titlebar / Tray' },
                  { size: 24, label: '24x24', usage: 'Status Bar' },
                  { size: 32, label: '32x32', usage: 'Taskbar / Standard' },
                  { size: 48, label: '48x48', usage: 'Large Desktop' },
                  { size: 64, label: '64x64', usage: 'Start Menu Tile' },
                  { size: 128, label: '128x128', usage: 'Jumbo View' },
                  { size: 256, label: '256x256', usage: 'Windows 11 4K' }
                ].map((item) => (
                  <div
                    key={item.size}
                    className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-between text-center space-y-2"
                  >
                    <div className="flex items-center justify-center min-h-[64px]">
                      {renderIconPreview(Math.min(item.size, 56))}
                    </div>
                    <div>
                      <div className="text-xs font-mono font-semibold text-white">{item.label}</div>
                      <div className="text-[10px] text-neutral-500">{item.usage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Version Information Resources */}
        {activeTab === 'version_info' && (
          <div className="space-y-6">
            {/* Core Version Strings */}
            <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <div>
                  <h3 className="text-xs font-semibold text-white">Fixed File Version & Primary Identity</h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Defines the standard fixed words embedded in <code className="text-blue-400">VS_FIXEDFILEINFO</code>.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">Codepage 1200 (Unicode)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    FileVersion (dwFileVersionMS / LS quad-numeric)
                  </label>
                  <input
                    type="text"
                    value={peConfig.fileVersion}
                    onChange={(e) => updateField('fileVersion', e.target.value)}
                    placeholder="1.0.0.0"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    ProductVersion (dwProductVersionMS / LS)
                  </label>
                  <input
                    type="text"
                    value={peConfig.productVersion}
                    onChange={(e) => updateField('productVersion', e.target.value)}
                    placeholder="1.0.0.0"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">CompanyName</label>
                  <input
                    type="text"
                    value={peConfig.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    placeholder="Acme Corporation"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">ProductName</label>
                  <input
                    type="text"
                    value={peConfig.productName}
                    onChange={(e) => updateField('productName', e.target.value)}
                    placeholder="Application Name"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-neutral-400 mb-1">FileDescription</label>
                  <input
                    type="text"
                    value={peConfig.fileDescription}
                    onChange={(e) => updateField('fileDescription', e.target.value)}
                    placeholder="Brief description visible in Windows Task Manager"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">OriginalFilename</label>
                  <input
                    type="text"
                    value={peConfig.originalFilename}
                    onChange={(e) => updateField('originalFilename', e.target.value)}
                    placeholder="app.exe"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">LegalCopyright</label>
                  <input
                    type="text"
                    value={peConfig.legalCopyright}
                    onChange={(e) => updateField('legalCopyright', e.target.value)}
                    placeholder="Copyright © 2026 Acme Corp."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Extended StringFileInfo Custom Key-Value Pairs */}
            <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <div>
                  <h3 className="text-xs font-semibold text-white">Extended Version Strings (StringFileInfo)</h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Add custom metadata strings like LegalTrademarks, Comments, PrivateBuild, or SupportURL.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddCustomString('LegalTrademarks', 'Registered Trademark ™')}
                    className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-300 transition-colors"
                  >
                    + LegalTrademarks
                  </button>
                  <button
                    onClick={() => handleAddCustomString('Comments', 'Built with Electron and Hardened PE Headers')}
                    className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-300 transition-colors"
                  >
                    + Comments
                  </button>
                  <button
                    onClick={() => handleAddCustomString('CustomKey', 'CustomValue')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-[11px] text-white font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Key</span>
                  </button>
                </div>
              </div>

              {customStrings.length === 0 ? (
                <div className="p-4 rounded-lg bg-neutral-950/60 border border-neutral-800 text-center text-xs text-neutral-500">
                  No extended version strings configured. Click "+ Add Custom Key" to add extra metadata.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {customStrings.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs"
                    >
                      <input
                        type="text"
                        value={item.key}
                        onChange={(e) => handleUpdateCustomString(idx, e.target.value, item.value)}
                        placeholder="Key (e.g. Comments)"
                        className="w-44 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 font-mono text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-neutral-500 font-mono">=</span>
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => handleUpdateCustomString(idx, item.key, e.target.value)}
                        placeholder="Value string"
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleRemoveCustomString(idx)}
                        className="p-1.5 rounded hover:bg-red-950/60 text-neutral-500 hover:text-red-400 transition-colors"
                        title="Remove string resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Windows Explorer Properties Modal Simulation */}
        {activeTab === 'preview_dialog' && (
          <div className="flex justify-center p-4">
            <div className="w-full max-w-lg bg-[#202020] rounded-xl border border-neutral-700 shadow-2xl overflow-hidden text-neutral-200 select-none font-sans text-xs">
              {/* Windows Window Titlebar */}
              <div className="bg-[#181818] px-4 py-2.5 flex items-center justify-between border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white">
                    EXE
                  </div>
                  <span className="font-semibold text-white">
                    {peConfig.originalFilename || 'app.exe'} Properties
                  </span>
                </div>
                <div className="flex items-center gap-1 text-neutral-400">
                  <span className="hover:text-white px-1 cursor-pointer">✕</span>
                </div>
              </div>

              {/* Windows Tabs */}
              <div className="flex items-center gap-1 px-4 pt-2 bg-[#202020] border-b border-neutral-700/80 text-[11px]">
                <button className="px-3 py-1.5 text-neutral-400 hover:text-white transition-colors">General</button>
                <button className="px-3 py-1.5 text-neutral-400 hover:text-white transition-colors">Compatibility</button>
                <button className="px-3 py-1.5 text-white font-semibold border-b-2 border-blue-500 -mb-[1px]">Details</button>
                <button className="px-3 py-1.5 text-neutral-400 hover:text-white transition-colors">Previous Versions</button>
              </div>

              {/* Details Tab Content */}
              <div className="p-4 space-y-4 max-h-[480px] overflow-y-auto bg-[#1c1c1c]">
                <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
                  <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                    {renderIconPreview(28)}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-xs">{peConfig.originalFilename}</div>
                    <div className="text-[11px] text-neutral-400">{peConfig.fileDescription}</div>
                  </div>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="text-neutral-500 font-semibold uppercase text-[10px] tracking-wider pt-1">Description</div>
                  <div className="grid grid-cols-3 py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">File description</span>
                    <span className="col-span-2 text-white">{peConfig.fileDescription || '—'}</span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">Type</span>
                    <span className="col-span-2 text-white">Application (.exe)</span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">File version</span>
                    <span className="col-span-2 text-white font-mono">{peConfig.fileVersion}</span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">Product name</span>
                    <span className="col-span-2 text-white">{peConfig.productName}</span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">Product version</span>
                    <span className="col-span-2 text-white font-mono">{peConfig.productVersion}</span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">Copyright</span>
                    <span className="col-span-2 text-white">{peConfig.legalCopyright}</span>
                  </div>

                  {customStrings.length > 0 && (
                    <>
                      <div className="text-neutral-500 font-semibold uppercase text-[10px] tracking-wider pt-3">Extended Properties</div>
                      {customStrings.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-3 py-1 border-b border-neutral-800/60">
                          <span className="text-neutral-400">{item.key}</span>
                          <span className="col-span-2 text-white">{item.value || '—'}</span>
                        </div>
                      ))}
                    </>
                  )}

                  <div className="text-neutral-500 font-semibold uppercase text-[10px] tracking-wider pt-3">Binary File Info</div>
                  <div className="grid grid-cols-3 py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">Original filename</span>
                    <span className="col-span-2 text-white font-mono">{peConfig.originalFilename}</span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">Target Machine</span>
                    <span className="col-span-2 text-white font-mono">{peConfig.machine.toUpperCase()} (64-bit)</span>
                  </div>
                  <div className="grid grid-cols-3 py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">Language</span>
                    <span className="col-span-2 text-white">English (United States) - 0x0409</span>
                  </div>
                </div>
              </div>

              {/* Windows Dialog Buttons */}
              <div className="bg-[#202020] px-4 py-2.5 border-t border-neutral-800 flex justify-end gap-2 text-xs">
                <button className="px-4 py-1 rounded bg-[#2b2b2b] hover:bg-[#353535] text-white font-medium border border-neutral-700">OK</button>
                <button className="px-4 py-1 rounded bg-[#2b2b2b] hover:bg-[#353535] text-neutral-300 border border-neutral-700">Cancel</button>
                <button className="px-4 py-1 rounded bg-[#2b2b2b] text-neutral-500 border border-neutral-800 cursor-not-allowed">Apply</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
