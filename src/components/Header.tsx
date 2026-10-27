import React from 'react';
import { Package, Download, Play, Shield, Cpu, Code2, MonitorPlay, LayoutTemplate } from 'lucide-react';

export type ActiveTab = 'editor' | 'pe_header' | 'resources' | 'pe_hex' | 'electron_config' | 'pipeline' | 'generated_code' | 'simulator';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenExport: () => void;
  onQuickSimulate: () => void;
  onOpenTemplates?: () => void;
  validationErrorCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenExport,
  onQuickSimulate,
  onOpenTemplates,
  validationErrorCount = 0
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-neutral-900 border-b border-neutral-800 text-neutral-200 shrink-0">
      {/* Zone 1: Brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-900/30">
          <Package className="w-4 h-4" />
        </div>
        <span className="text-base font-semibold tracking-tight text-white whitespace-nowrap shrink-0">
          ElectraPE Studio
        </span>
      </div>

      {/* Zone 2: Concise navigation tabs (single line, clean hover states) */}
      <nav className="hidden lg:flex items-center gap-1 text-xs font-medium shrink-0 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
        <button
          onClick={() => onTabChange('editor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'editor'
              ? 'bg-neutral-800 text-white font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-blue-400" />
          <span>HTML Source</span>
        </button>

        <button
          onClick={() => onTabChange('pe_header')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'pe_header'
              ? 'bg-neutral-800 text-white font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Shield className={`w-3.5 h-3.5 ${validationErrorCount > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
          <span>PE Header & Subsystem</span>
          {validationErrorCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono rounded bg-red-600 text-white font-bold">
              {validationErrorCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('resources')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'resources'
              ? 'bg-neutral-800 text-white font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-amber-400" />
          <span>Icons & Resources</span>
        </button>

        <button
          onClick={() => onTabChange('pe_hex')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'pe_hex'
              ? 'bg-neutral-800 text-white font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span>Binary & Hex Dissector</span>
        </button>

        <button
          onClick={() => onTabChange('electron_config')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'electron_config'
              ? 'bg-neutral-800 text-white font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-purple-400" />
          <span>Electron Packaging</span>
        </button>

        <button
          onClick={() => onTabChange('pipeline')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'pipeline'
              ? 'bg-neutral-800 text-white font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>Build Pipeline</span>
        </button>

        <button
          onClick={() => onTabChange('generated_code')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'generated_code'
              ? 'bg-neutral-800 text-white font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <span>Generated Files</span>
        </button>

        <button
          onClick={() => onTabChange('simulator')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'simulator'
              ? 'bg-blue-600/30 text-blue-200 border border-blue-500/40 font-semibold'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
          }`}
        >
          <MonitorPlay className="w-3.5 h-3.5 text-cyan-400" />
          <span>Windows 11 Simulator</span>
        </button>
      </nav>

      {/* Zone 3: Primary action button */}
      <div className="flex items-center gap-2.5 shrink-0">
        {onOpenTemplates && (
          <button
            onClick={onOpenTemplates}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors whitespace-nowrap shrink-0"
            title="Browse starter template library"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-blue-400" />
            <span>Templates</span>
          </button>
        )}

        <button
          onClick={onQuickSimulate}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors whitespace-nowrap shrink-0"
          title="Run in virtual Windows Desktop environment"
        >
          <Play className="w-3.5 h-3.5 text-emerald-400" />
          <span>Launch Simulator</span>
        </button>

        <button
          onClick={onOpenExport}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-sm shadow-blue-900/40 whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Package Executable</span>
        </button>
      </div>
    </header>
  );
};
