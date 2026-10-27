import React, { useState } from 'react';
import { PeHeaderConfig } from '../types/pe-types';
import {
  validatePeHeaderConfig,
  applyPeFix,
  autoFixAllPeIssues,
  PeValidationIssue
} from '../utils/pe-validator';
import {
  Shield,
  Cpu,
  Lock,
  FileText,
  Layers,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Wrench,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PeHeaderConfiguratorProps {
  config: PeHeaderConfig;
  onChange: (newConfig: PeHeaderConfig) => void;
  onNavigateToResources?: () => void;
}

export const PeHeaderConfigurator: React.FC<PeHeaderConfiguratorProps> = ({
  config,
  onChange,
  onNavigateToResources
}) => {
  const [showDiagnosticsDetail, setShowDiagnosticsDetail] = useState<boolean>(true);

  // Real-time validation report computed on every state change
  const report = validatePeHeaderConfig(config);

  const updateField = <K extends keyof PeHeaderConfig>(key: K, value: PeHeaderConfig[K]) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  const handleApplyFix = (issue: PeValidationIssue) => {
    if (issue.autoFix) {
      const updated = applyPeFix(config, issue.autoFix.patch);
      onChange(updated);
    }
  };

  const handleFixAll = () => {
    const fixed = autoFixAllPeIssues(config);
    onChange(fixed);
  };

  // Helper to check if a specific field is flagged by any error or warning
  const getFieldIssues = (fieldName: keyof PeHeaderConfig) => {
    return report.issues.filter((issue) => issue.affectedFields.includes(fieldName));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-neutral-950 text-neutral-200">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Intro Banner */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Portable Executable (PE) & Windows Subsystem Engine</h2>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Configure binary PE headers, COFF machine specifications, security mitigations (ASLR, DEP),
                UAC execution manifests, and Windows version metadata embedded into the output Windows executable.
              </p>
            </div>
          </div>

          {/* Quick preset tests for verification */}
          <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Test Incompatibility Presets</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onChange({ ...config, machine: 'ia32', highEntropyVa: true })}
                className="px-2 py-1 rounded text-[11px] bg-neutral-800 hover:bg-neutral-700 text-amber-400 transition-colors"
                title="Sets 32-bit architecture with 64-bit High Entropy VA"
              >
                Trigger 32-bit + High Entropy
              </button>
              <button
                onClick={() => onChange({ ...config, dynamicBase: false, highEntropyVa: true })}
                className="px-2 py-1 rounded text-[11px] bg-neutral-800 hover:bg-neutral-700 text-amber-400 transition-colors"
                title="Sets High Entropy VA without ASLR"
              >
                Trigger ASLR Conflict
              </button>
              <button
                onClick={() => onChange({ ...config, majorSubsystemVersion: 5, minorSubsystemVersion: 1 })}
                className="px-2 py-1 rounded text-[11px] bg-neutral-800 hover:bg-neutral-700 text-amber-400 transition-colors"
                title="Sets Subsystem to Windows XP on 64-bit"
              >
                Trigger XP Subsystem
              </button>
            </div>
          </div>
        </div>

        {/* Real-time PE Header Validation & Compatibility Inspector */}
        <section
          className={`rounded-xl border transition-all overflow-hidden ${
            report.errorCount > 0
              ? 'bg-red-950/20 border-red-800/60'
              : report.warningCount > 0
              ? 'bg-amber-950/20 border-amber-800/60'
              : 'bg-emerald-950/20 border-emerald-800/60'
          }`}
        >
          {/* Header Summary Strip */}
          <div className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  report.errorCount > 0
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                    : report.warningCount > 0
                    ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {report.errorCount > 0 ? (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                ) : report.warningCount > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-white">
                    Real-Time PE Header Validation & Kernel Loader Pre-Check
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      report.errorCount > 0
                        ? 'bg-red-900/60 text-red-200 border border-red-700'
                        : report.warningCount > 0
                        ? 'bg-amber-900/60 text-amber-200 border border-amber-700'
                        : 'bg-emerald-900/60 text-emerald-200 border border-emerald-700'
                    }`}
                  >
                    {report.errorCount > 0
                      ? `${report.errorCount} INCOMPATIBLE CONFIGURATION${report.errorCount > 1 ? 'S' : ''}`
                      : report.warningCount > 0
                      ? `${report.warningCount} ADVISORY RECOMMENDATION${report.warningCount > 1 ? 'S' : ''}`
                      : 'ALL INVARIANTS COMPLIANT (100%)'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {report.errorCount > 0
                    ? 'Critical PE/COFF architecture or subsystem contradictions detected. The Windows loader or Electron will fail to boot.'
                    : report.warningCount > 0
                    ? 'Valid image structure with potential runtime or Windows DWM scaling advisories.'
                    : 'Binary headers, DLL characteristics, and RT_MANIFEST conform cleanly to Windows NT 10.0+ specifications.'}
                </p>
              </div>
            </div>

            {/* Actions: Fix All & Toggle Details */}
            <div className="flex items-center gap-2">
              {report.issues.length > 0 && (
                <button
                  onClick={handleFixAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Auto-Fix All Incompatibilities</span>
                </button>
              )}

              <button
                onClick={() => setShowDiagnosticsDetail(!showDiagnosticsDetail)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs border border-neutral-800 transition-colors"
              >
                <span>{showDiagnosticsDetail ? 'Hide Details' : 'View Diagnostics'}</span>
                {showDiagnosticsDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Diagnostic Issues List with 1-Click Fixes */}
          {showDiagnosticsDetail && report.issues.length > 0 && (
            <div className="border-t border-neutral-800/80 p-4 space-y-3 bg-neutral-950/60">
              {report.issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-3.5 rounded-lg border text-xs space-y-2.5 ${
                    issue.severity === 'error'
                      ? 'bg-red-950/30 border-red-800/80'
                      : issue.severity === 'warning'
                      ? 'bg-amber-950/30 border-amber-800/80'
                      : 'bg-blue-950/20 border-blue-800/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-neutral-500 uppercase px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                        {issue.ruleCode}
                      </span>
                      <span
                        className={`font-semibold ${
                          issue.severity === 'error'
                            ? 'text-red-300'
                            : issue.severity === 'warning'
                            ? 'text-amber-300'
                            : 'text-blue-300'
                        }`}
                      >
                        {issue.title}
                      </span>
                    </div>

                    {/* Affected Fields indicator */}
                    <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
                      <span>Fields:</span>
                      {issue.affectedFields.map((f) => (
                        <span key={f} className="text-neutral-300 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    {issue.description}
                  </p>

                  {/* Recommendation & One-Click Fix Button */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800/60">
                    <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{issue.recommendation}</span>
                    </div>

                    {issue.autoFix && (
                      <button
                        onClick={() => handleApplyFix(issue)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          issue.severity === 'error'
                            ? 'bg-red-600 hover:bg-red-500 text-white'
                            : 'bg-amber-600 hover:bg-amber-500 text-white'
                        }`}
                      >
                        <Wrench className="w-3 h-3" />
                        <span>Apply Fix: {issue.autoFix.label}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 1: Architecture & Windows Subsystem */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">01. Target Architecture & Windows Subsystem</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Machine */}
            <div
              className={`p-4 rounded-lg bg-neutral-900/60 border space-y-3 transition-colors ${
                getFieldIssues('machine').some((i) => i.severity === 'error')
                  ? 'border-red-700 bg-red-950/10'
                  : 'border-neutral-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-neutral-300">
                  Target Architecture (COFF Machine)
                </label>
                {getFieldIssues('machine').length > 0 && (
                  <span className="text-[10px] text-red-400 flex items-center gap-1 font-mono">
                    <AlertCircle className="w-3 h-3" /> Flagged Incompatible
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {[
                  { id: 'x64', label: 'x64 (AMD64 / EM_AMD64 0x8664)', desc: 'Standard 64-bit Windows systems (Recommended)' },
                  { id: 'ia32', label: 'x86 (Intel 386 / EM_386 0x014C)', desc: 'Legacy 32-bit Windows systems (No 64-bit High Entropy VA)' },
                  { id: 'arm64', label: 'ARM64 (EM_AARCH64 0xAA64)', desc: 'Snapdragon X Elite & Surface ARM devices' }
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                      config.machine === item.id
                        ? 'bg-blue-950/30 border-blue-600/50 text-white'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="machine_arch"
                      checked={config.machine === item.id}
                      onChange={() => updateField('machine', item.id as any)}
                      className="mt-0.5 text-blue-600 focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-medium text-neutral-200">{item.label}</div>
                      <div className="text-[11px] text-neutral-500">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Subsystem Version Configuration */}
              <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-300">Minimum Major Subsystem Version</label>
                  <span className="text-[10px] font-mono text-neutral-400">Windows NT {config.majorSubsystemVersion}.{config.minorSubsystemVersion}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-neutral-500 block mb-1">Major Version</span>
                    <input
                      type="number"
                      value={config.majorSubsystemVersion}
                      onChange={(e) => updateField('majorSubsystemVersion', parseInt(e.target.value) || 0)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block mb-1">Minor Version</span>
                    <input
                      type="number"
                      value={config.minorSubsystemVersion}
                      onChange={(e) => updateField('minorSubsystemVersion', parseInt(e.target.value) || 0)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>
                {getFieldIssues('majorSubsystemVersion').length > 0 && (
                  <p className="text-[10px] text-red-400">
                    Subsystem version &lt; 6.0 is invalid for 64-bit architectures. Recommended: 10.0.
                  </p>
                )}
              </div>
            </div>

            {/* Windows Subsystem */}
            <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-3">
              <label className="block text-xs font-medium text-neutral-300">
                Windows Executable Subsystem
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'windows_gui',
                    label: 'IMAGE_SUBSYSTEM_WINDOWS_GUI (0x0002)',
                    desc: 'Stealth launch. Does NOT open or flash a black console terminal window. Perfect for native GUI apps.'
                  },
                  {
                    id: 'windows_cui',
                    label: 'IMAGE_SUBSYSTEM_WINDOWS_CUI (0x0003)',
                    desc: 'Console subsystem. Attaches or spawns a Windows command prompt terminal for stdout/stderr logs.'
                  }
                ].map((sub) => (
                  <label
                    key={sub.id}
                    className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                      config.subsystem === sub.id
                        ? 'bg-blue-950/30 border-blue-600/50 text-white'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="subsystem"
                      checked={config.subsystem === sub.id}
                      onChange={() => updateField('subsystem', sub.id as any)}
                      className="mt-0.5 text-blue-600 focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-medium text-neutral-200">{sub.label}</div>
                      <div className="text-[11px] text-neutral-500 leading-normal mt-0.5">{sub.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Binary Hardening & DLL Characteristics */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">02. PE Binary Hardening & DLL Characteristics</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                key: 'dynamicBase',
                label: 'ASLR (Dynamic Base)',
                bit: '0x0040',
                desc: 'Randomizes module base address in memory on execution.'
              },
              {
                key: 'nxCompat',
                label: 'DEP (NX Compat)',
                bit: '0x0100',
                desc: 'Data Execution Prevention marks heap & stack non-executable.'
              },
              {
                key: 'highEntropyVa',
                label: 'High Entropy 64-bit VA',
                bit: '0x0020',
                desc: 'Enables 64-bit high entropy address space randomizations (x64/ARM64 only).'
              },
              {
                key: 'terminalServerAware',
                label: 'Terminal Server Aware',
                bit: '0x8000',
                desc: 'Compatible with Windows Remote Desktop and TS environments.'
              },
              {
                key: 'guardCf',
                label: 'Control Flow Guard (CFG)',
                bit: '0x4000',
                desc: 'Compiler-assisted indirect call target validation.'
              },
              {
                key: 'noSeh',
                label: 'No SEH Handlers',
                bit: '0x0400',
                desc: 'Omits Structured Exception Handling table from image.'
              }
            ].map((char) => {
              const fieldIssues = getFieldIssues(char.key as any);
              const hasError = fieldIssues.some((i) => i.severity === 'error');
              const hasWarning = fieldIssues.some((i) => i.severity === 'warning');

              return (
                <label
                  key={char.key}
                  className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                    hasError
                      ? 'bg-red-950/25 border-red-700'
                      : hasWarning
                      ? 'bg-amber-950/20 border-amber-700'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean((config as any)[char.key])}
                    onChange={(e) => updateField(char.key as any, e.target.checked as any)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-0 bg-neutral-950 border-neutral-700"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-neutral-200">{char.label}</span>
                      <span className="text-[10px] font-mono text-neutral-500">{char.bit}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">{char.desc}</p>
                    {hasError && (
                      <p className="text-[10px] text-red-400 font-medium pt-1">
                        ⚠ Incompatible: {fieldIssues[0].recommendation}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        {/* Section 3: Stack & Heap Virtual Memory Allocations */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">03. Virtual Memory Stack & Heap Allocations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-neutral-900/60 border border-neutral-800">
            {/* Stack Allocation */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-white">Thread Stack Sizing</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Stack Reserve (bytes)</label>
                  <input
                    type="number"
                    value={config.sizeOfStackReserve}
                    onChange={(e) => updateField('sizeOfStackReserve', parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-xs font-mono text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                    {(config.sizeOfStackReserve / 1024).toLocaleString()} KB
                  </span>
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Stack Commit (bytes)</label>
                  <input
                    type="number"
                    value={config.sizeOfStackCommit}
                    onChange={(e) => updateField('sizeOfStackCommit', parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-xs font-mono text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                    {(config.sizeOfStackCommit / 1024).toLocaleString()} KB
                  </span>
                </div>
              </div>
              {getFieldIssues('sizeOfStackCommit').length > 0 && (
                <div className="p-2 rounded bg-red-950/40 border border-red-800 text-[11px] text-red-300">
                  ⚠ Error: Stack Commit must be strictly smaller than Stack Reserve.
                </div>
              )}
            </div>

            {/* Heap Allocation */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-white">Process Heap Sizing</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Heap Reserve (bytes)</label>
                  <input
                    type="number"
                    value={config.sizeOfHeapReserve}
                    onChange={(e) => updateField('sizeOfHeapReserve', parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-xs font-mono text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                    {(config.sizeOfHeapReserve / 1024).toLocaleString()} KB
                  </span>
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Heap Commit (bytes)</label>
                  <input
                    type="number"
                    value={config.sizeOfHeapCommit}
                    onChange={(e) => updateField('sizeOfHeapCommit', parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-xs font-mono text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                    {(config.sizeOfHeapCommit / 1024).toLocaleString()} KB
                  </span>
                </div>
              </div>
              {getFieldIssues('sizeOfHeapCommit').length > 0 && (
                <div className="p-2 rounded bg-red-950/40 border border-red-800 text-[11px] text-red-300">
                  ⚠ Error: Heap Commit must be strictly smaller than Heap Reserve.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 4: Windows Application Manifest (RT_MANIFEST) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
            <Shield className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">04. Windows Manifest & UAC Privilege Level</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* UAC Elevation Level */}
            <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-3">
              <label className="block text-xs font-medium text-neutral-300">
                UAC Requested Execution Level
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'asInvoker',
                    label: 'asInvoker (Standard User)',
                    desc: 'Runs with normal user rights. No UAC elevation prompt on launch (Recommended).'
                  },
                  {
                    id: 'requireAdministrator',
                    label: 'requireAdministrator (Elevated)',
                    desc: 'Triggers Windows UAC Shield prompt. Requires Administrator privileges.'
                  },
                  {
                    id: 'highestAvailable',
                    label: 'highestAvailable (Adaptive)',
                    desc: 'Runs as admin if user is in Administrators group, else standard user.'
                  }
                ].map((uac) => (
                  <label
                    key={uac.id}
                    className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                      config.requestedExecutionLevel === uac.id
                        ? 'bg-purple-950/30 border-purple-600/50 text-white'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="uac_level"
                      checked={config.requestedExecutionLevel === uac.id}
                      onChange={() => updateField('requestedExecutionLevel', uac.id as any)}
                      className="mt-0.5 text-purple-600 focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-medium text-neutral-200">{uac.label}</div>
                      <div className="text-[11px] text-neutral-500">{uac.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* DPI & Compatibility */}
            <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  High-DPI Awareness Mode
                </label>
                <select
                  value={config.dpiAwareness}
                  onChange={(e) => updateField('dpiAwareness', e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="PerMonitorV2">PerMonitorV2 (Windows 10/11 Dynamic Multi-Monitor - Recommended)</option>
                  <option value="System">System DPI Aware (Fixed to primary display)</option>
                  <option value="Unaware">DPI Unaware (Bitmap stretched by DWM)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.longPathAware}
                    onChange={(e) => updateField('longPathAware', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0 bg-neutral-950 border-neutral-700"
                  />
                  <span>Enable Windows Long Path Awareness (&gt;260 chars)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.compatWindows10_11}
                    onChange={(e) => updateField('compatWindows10_11', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0 bg-neutral-950 border-neutral-700"
                  />
                  <span>Declare Windows 10 & 11 Compatibility GUID</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.compatWindows8_1}
                    onChange={(e) => updateField('compatWindows8_1', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0 bg-neutral-950 border-neutral-700"
                  />
                  <span>Declare Windows 8.1 Compatibility GUID</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Version Information (VS_VERSION_INFO) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">05. Windows File Explorer Details (VS_VERSION_INFO)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-neutral-900/60 border border-neutral-800">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-neutral-400">File Version (Quad-numeric X.X.X.X)</label>
                {getFieldIssues('fileVersion').length > 0 && (
                  <span className="text-[10px] text-amber-400 font-mono">Format Warning</span>
                )}
              </div>
              <input
                type="text"
                value={config.fileVersion}
                onChange={(e) => updateField('fileVersion', e.target.value)}
                placeholder="1.0.0.0"
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Product Version</label>
              <input
                type="text"
                value={config.productVersion}
                onChange={(e) => updateField('productVersion', e.target.value)}
                placeholder="1.0.0.0"
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Product Name</label>
              <input
                type="text"
                value={config.productName}
                onChange={(e) => updateField('productName', e.target.value)}
                placeholder="My Desktop Application"
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Company / Organization Name</label>
              <input
                type="text"
                value={config.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                placeholder="Acme Corporation"
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-neutral-400 mb-1">File Description (Shows in Task Manager)</label>
              <input
                type="text"
                value={config.fileDescription}
                onChange={(e) => updateField('fileDescription', e.target.value)}
                placeholder="Desktop Workspace and Utilities"
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Legal Copyright</label>
              <input
                type="text"
                value={config.legalCopyright}
                onChange={(e) => updateField('legalCopyright', e.target.value)}
                placeholder="Copyright © 2026 Acme Corp. All rights reserved."
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Original Filename</label>
              <input
                type="text"
                value={config.originalFilename}
                onChange={(e) => updateField('originalFilename', e.target.value)}
                placeholder="myapp.exe"
                className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Section 6: Windows Icon Resource Preview */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">06. Windows Executable Icon (RT_GROUP_ICON)</h3>
          </div>

          <div className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-lg border border-white/20">
                EXE
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-white">assets/icon.ico</div>
                <div className="text-[11px] text-neutral-400">Multi-resolution Windows Icon Container</div>
                <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                  <span>16x16</span> · <span>32x32</span> · <span>48x48</span> · <span>256x256</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-neutral-400 bg-neutral-950 px-3 py-2 rounded-md border border-neutral-800">
                <span className="text-emerald-400 font-medium">Valid RT_GROUP_ICON</span> generated automatically in packaging zip.
              </div>
              {onNavigateToResources && (
                <button
                  onClick={onNavigateToResources}
                  className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Manage Icons & Version Strings →</span>
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
