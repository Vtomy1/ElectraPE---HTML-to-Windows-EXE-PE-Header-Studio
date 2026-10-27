import React, { useState } from 'react';
import { STARTER_TEMPLATES, TemplateDefinition } from '../constants/templates';
import {
  LayoutTemplate,
  X,
  Eye,
  Check,
  Sparkles,
  AppWindow,
  Shield,
  Layers,
  ArrowRight,
  Code2,
  MonitorPlay,
  RotateCcw
} from 'lucide-react';

interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateDefinition) => void;
  currentTemplateId?: string;
}

type CategoryFilter = 'All' | 'Productivity' | 'Data Tools' | 'Kiosk & Retail' | 'Games & Creative';

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  currentTemplateId
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition | null>(null);
  const [justAppliedId, setJustAppliedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories: CategoryFilter[] = [
    'All',
    'Productivity',
    'Data Tools',
    'Kiosk & Retail',
    'Games & Creative'
  ];

  const filteredTemplates = STARTER_TEMPLATES.filter((tpl) => {
    if (selectedCategory === 'All') return true;
    return tpl.category === selectedCategory;
  });

  const handleApply = (tpl: TemplateDefinition) => {
    onSelectTemplate(tpl);
    setJustAppliedId(tpl.id);
    setTimeout(() => {
      setJustAppliedId(null);
      onClose();
    }, 600);
  };

  // Compile combined HTML for preview iframe
  const getPreviewHtml = (tpl: TemplateDefinition): string => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    ${tpl.files['styles.css']}
  </style>
</head>
<body>
  ${tpl.files['index.html']}
  <script>
    window.electronAPI = {
      minimize: () => console.log('Window minimized'),
      maximize: () => console.log('Window maximized'),
      close: () => console.log('Window closed'),
      platform: 'win32',
      isElectron: true
    };
    try {
      ${tpl.files['app.js']}
    } catch(e) {
      console.error(e);
    }
  </script>
</body>
</html>`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[88vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-200 text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Starter Template Library</h2>
              <p className="text-[11px] text-neutral-400">
                Choose a pre-architected web application template and configure native Windows PE packaging.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Bar & Search */}
        <div className="px-6 py-3 bg-neutral-950 border-b border-neutral-800/80 flex items-center justify-between gap-4 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-neutral-800 text-white shadow-xs font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                {cat}
                <span className="ml-1.5 text-[10px] text-neutral-500 font-mono">
                  (
                  {cat === 'All'
                    ? STARTER_TEMPLATES.length
                    : STARTER_TEMPLATES.filter((t) => t.category === cat).length}
                  )
                </span>
              </button>
            ))}
          </div>

          <div className="text-[11px] text-neutral-500 font-mono hidden sm:block">
            {filteredTemplates.length} Templates Available
          </div>
        </div>

        {/* Modal Body: Cards Grid + Interactive Preview Pane */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Left / Center: Template Cards Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((tpl) => {
                const isCurrent = currentTemplateId === tpl.id;
                const isSelectedForPreview = previewTemplate?.id === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                      isSelectedForPreview
                        ? 'border-blue-500 bg-blue-950/20 shadow-lg'
                        : isCurrent
                        ? 'border-neutral-700 bg-neutral-900/90'
                        : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900/80'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-blue-400 font-mono text-[10px] uppercase font-semibold">
                          {tpl.category}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                            <Check className="w-3 h-3" /> Active Project
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-sm font-semibold text-white">{tpl.name}</h3>
                        <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>

                      {/* Feature Bullet Points */}
                      <div className="space-y-1 pt-1">
                        {tpl.features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                            <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0"></span>
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* Specs */}
                      <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                        <span>Window: {tpl.recommendedWindow.width}×{tpl.recommendedWindow.height}</span>
                        <span>{tpl.recommendedWindow.frame ? 'Standard Chrome' : 'Frameless Kiosk'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 mt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setPreviewTemplate(tpl)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isSelectedForPreview
                            ? 'bg-blue-600 text-white'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live Preview</span>
                      </button>

                      <button
                        onClick={() => handleApply(tpl)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          justAppliedId === tpl.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-800 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {justAppliedId === tpl.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Applied!</span>
                          </>
                        ) : (
                          <>
                            <span>Apply Template</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Interactive Live Preview Drawer (when a template is selected) */}
          {previewTemplate && (
            <div className="w-[460px] border-l border-neutral-800 bg-neutral-950 flex flex-col shrink-0">
              {/* Preview Header */}
              <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs">{previewTemplate.name}</span>
                    <span className="text-[10px] font-mono text-neutral-500">Preview</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate max-w-[320px]">{previewTemplate.description}</p>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1 rounded text-neutral-500 hover:text-white hover:bg-neutral-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Virtual Desktop Window Frame */}
              <div className="flex-1 p-3 flex flex-col min-h-0 bg-neutral-950">
                <div className="flex-1 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 flex flex-col shadow-xl">
                  {/* Window Chrome Header */}
                  <div className="h-7 bg-neutral-900 border-b border-neutral-800 px-3 flex items-center justify-between text-[11px] text-neutral-400 select-none">
                    <span className="font-medium text-neutral-300 truncate max-w-[200px]">{previewTemplate.name}</span>
                    <div className="flex items-center gap-2">
                      <span>―</span>
                      <span>□</span>
                      <span>✕</span>
                    </div>
                  </div>

                  {/* Iframe */}
                  <iframe
                    title="Template Live Preview"
                    srcDoc={getPreviewHtml(previewTemplate)}
                    sandbox="allow-scripts allow-modals allow-same-origin"
                    className="flex-1 w-full border-none bg-neutral-950"
                  />
                </div>
              </div>

              {/* Preview Footer Actions */}
              <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between gap-3">
                <div className="text-[11px] text-neutral-400 font-mono">
                  <span>HTML ({previewTemplate.files['index.html'].split('\n').length} lines)</span> ·{' '}
                  <span>JS ({previewTemplate.files['app.js'].split('\n').length} lines)</span>
                </div>

                <button
                  onClick={() => handleApply(previewTemplate)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply This Template</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/80 flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <span>Click "Live Preview" on any template to test it in the built-in browser window before applying.</span>
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
