import React, { useState } from 'react';
import { ElectronConfig, PeHeaderConfig } from '../types/pe-types';
import {
  generatePowerShellScript,
  generateBashScript,
  PipelineOptions
} from '../utils/pipeline-generator';
import {
  Terminal,
  Download,
  Copy,
  Check,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  Shield,
  Cpu,
  FileCode,
  Sliders,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface BuildPipelineProps {
  electronConfig: ElectronConfig;
  peConfig: PeHeaderConfig;
}

export const BuildPipeline: React.FC<BuildPipelineProps> = ({
  electronConfig,
  peConfig
}) => {
  const [shellType, setShellType] = useState<'powershell' | 'bash'>('powershell');
  const [copied, setCopied] = useState<boolean>(false);
  const [pipelineOptions, setPipelineOptions] = useState<PipelineOptions>({
    cleanDist: true,
    verboseLogging: false,
    calculateSha256: true,
    launchOnComplete: false,
    verifyPeHeaders: true,
    arch: peConfig.machine,
    subsystem: peConfig.subsystem
  });

  // Simulator state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);
  const [simulationComplete, setSimulationComplete] = useState<boolean>(false);

  const activeScript =
    shellType === 'powershell'
      ? generatePowerShellScript(electronConfig, peConfig, pipelineOptions)
      : generateBashScript(electronConfig, peConfig, pipelineOptions);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadScript = () => {
    const filename = shellType === 'powershell' ? 'build.ps1' : 'build.sh';
    const mime = shellType === 'powershell' ? 'application/x-powershell' : 'application/x-sh';
    const blob = new Blob([activeScript], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Run simulated build pipeline
  const runSimulation = () => {
    setIsSimulating(true);
    setCurrentStep(1);
    setSimulationComplete(false);
    setSimulatedLogs([
      `[SIMULATOR] Initializing ${shellType.toUpperCase()} pipeline for ${electronConfig.appName}...`,
      `[1/6] Inspecting runtime: Node.js v20.12.0, npm v10.5.0, Windows NT Kernel 10.0+`
    ]);

    setTimeout(() => {
      setCurrentStep(2);
      setSimulatedLogs((prev) => [
        ...prev,
        pipelineOptions.cleanDist
          ? `[2/6] Sanitizing workspace: Removed dist/ folder successfully.`
          : `[2/6] Incremental mode: dist/ preserved.`
      ]);
    }, 900);

    setTimeout(() => {
      setCurrentStep(3);
      setSimulatedLogs((prev) => [
        ...prev,
        `[3/6] Resolving dependencies: electron@33.2.1, electron-builder@25.1.8 ready.`
      ]);
    }, 1800);

    setTimeout(() => {
      setCurrentStep(4);
      setSimulatedLogs((prev) => [
        ...prev,
        `[4/6] Stamping PE Header: Arch=${peConfig.machine.toUpperCase()}, Subsystem=${peConfig.subsystem}, ASLR=0x0040, DEP=0x0100.`
      ]);
    }, 2700);

    setTimeout(() => {
      setCurrentStep(5);
      setSimulatedLogs((prev) => [
        ...prev,
        `[5/6] Packaging native binary: Assembling asar, linking Chromium, building ${electronConfig.targetFormat.toUpperCase()} package...`
      ]);
    }, 3700);

    setTimeout(() => {
      setCurrentStep(6);
      const fakeHash = 'd41d8cd98f00b204e9800998ecf8427e' + Math.random().toString(16).substring(2, 10);
      setSimulatedLogs((prev) => [
        ...prev,
        `[6/6] Verifying artifact: dist/${peConfig.originalFilename || 'app.exe'} (68.4 MB)`,
        pipelineOptions.calculateSha256 ? `      SHA-256: ${fakeHash.toUpperCase()}` : '',
        `======================================================================`,
        ` BUILD SUCCESSFUL in 4.8 seconds! Artifact ready for Windows deployment.`,
        `======================================================================`
      ].filter(Boolean));
      setIsSimulating(false);
      setSimulationComplete(true);
    }, 4800);
  };

  const stepsList = [
    { num: 1, name: 'Toolchain Audit', desc: 'Node.js & npm validation' },
    { num: 2, name: 'Workspace Clean', desc: 'Purge prior dist/ binaries' },
    { num: 3, name: 'Dependencies', desc: 'npm install runtime locks' },
    { num: 4, name: 'PE & Manifest Stamp', desc: 'Inject ASLR/DEP & UAC level' },
    { num: 5, name: 'Native Electron Link', desc: 'Compile & link Windows binary' },
    { num: 6, name: 'Integrity Check', desc: 'SHA-256 & version verification' }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-neutral-950 text-neutral-200">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Introduction */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Automated Desktop Build Pipeline (build.ps1 / build.sh)</h2>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Generate production-ready terminal automation scripts configured for your exact PE headers,
                Windows architecture, and Electron packaging targets. Run locally or in CI/CD pipelines (GitHub Actions, Azure DevOps).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadScript}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {shellType === 'powershell' ? 'build.ps1' : 'build.sh'}</span>
            </button>
          </div>
        </div>

        {/* Visual Pipeline Stages */}
        <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div>
              <h3 className="text-xs font-semibold text-white">Local Execution Pipeline Stages</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Automated workflow executed sequentially by the generated script.</p>
            </div>
            <span className="text-[11px] font-mono text-neutral-500">Target: {peConfig.machine.toUpperCase()} ({electronConfig.targetFormat})</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stepsList.map((step) => {
              const isActive = isSimulating && currentStep === step.num;
              const isDone = simulationComplete || (isSimulating && currentStep > step.num);

              return (
                <div
                  key={step.num}
                  className={`p-3 rounded-lg border flex flex-col justify-between transition-colors ${
                    isActive
                      ? 'bg-blue-950/40 border-blue-500 text-white'
                      : isDone
                      ? 'bg-emerald-950/20 border-emerald-700/60 text-neutral-200'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold">{step.num}</span>
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isActive ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                    ) : (
                      <span className="text-[10px] text-neutral-600 font-mono">IDLE</span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white leading-tight">{step.name}</div>
                    <div className="text-[10px] text-neutral-500 mt-1 leading-normal">{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Script Viewer & Customizer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Script Configuration Parameters */}
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-semibold text-white">Pipeline Options</h3>
                </div>
              </div>

              {/* Shell Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">Script Target Environment</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShellType('powershell')}
                    className={`px-3 py-2 rounded-lg border text-xs font-mono font-medium transition-colors ${
                      shellType === 'powershell'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    build.ps1 (PowerShell)
                  </button>
                  <button
                    onClick={() => setShellType('bash')}
                    className={`px-3 py-2 rounded-lg border text-xs font-mono font-medium transition-colors ${
                      shellType === 'bash'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    build.sh (Bash / Linux)
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 pt-2 border-t border-neutral-800/80 text-xs text-neutral-300">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pipelineOptions.cleanDist}
                    onChange={(e) => setPipelineOptions({ ...pipelineOptions, cleanDist: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-0 bg-neutral-950 border-neutral-700"
                  />
                  <span>Purge output directory (<code className="text-neutral-400">dist/</code>) before building</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pipelineOptions.calculateSha256}
                    onChange={(e) => setPipelineOptions({ ...pipelineOptions, calculateSha256: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-0 bg-neutral-950 border-neutral-700"
                  />
                  <span>Compute SHA-256 checksum on build output</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pipelineOptions.verifyPeHeaders}
                    onChange={(e) => setPipelineOptions({ ...pipelineOptions, verifyPeHeaders: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-0 bg-neutral-950 border-neutral-700"
                  />
                  <span>Validate PE FileVersion & details after build</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pipelineOptions.verboseLogging}
                    onChange={(e) => setPipelineOptions({ ...pipelineOptions, verboseLogging: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-0 bg-neutral-950 border-neutral-700"
                  />
                  <span>Verbose debug logs (<code className="text-neutral-400">DEBUG=electron-builder</code>)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pipelineOptions.launchOnComplete}
                    onChange={(e) => setPipelineOptions({ ...pipelineOptions, launchOnComplete: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-0 bg-neutral-950 border-neutral-700"
                  />
                  <span>Auto-launch application on successful build</span>
                </label>
              </div>

              {/* Simulation Runner */}
              <div className="pt-3 border-t border-neutral-800/80">
                <button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isSimulating ? 'Executing Simulated Pipeline...' : 'Run Pipeline Dry-Run Simulation'}</span>
                </button>
              </div>
            </div>

            {/* Quick Run Instruction Card */}
            <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-2 text-xs text-neutral-400">
              <span className="font-semibold text-white block">How to Run on Windows:</span>
              <p className="text-[11px] leading-normal">
                Open PowerShell in your project directory and execute:
              </p>
              <pre className="p-2 rounded bg-neutral-950 border border-neutral-800 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                <code>Set-ExecutionPolicy -Scope Process Bypass{'\n'}.\build.ps1</code>
              </pre>
            </div>
          </div>

          {/* Right: Code Viewer & Simulation Console */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            {/* Generated Script Code Box */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden flex flex-col shadow-xl">
              <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 text-xs">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono font-medium text-white">
                    {shellType === 'powershell' ? 'build.ps1' : 'build.sh'}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    ({activeScript.split('\n').length} lines · {(activeScript.length / 1024).toFixed(1)} KB)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadScript}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-neutral-950 overflow-auto max-h-[380px]">
                <pre className="font-mono text-xs text-neutral-300 leading-relaxed whitespace-pre selection:bg-blue-600/40">
                  <code>{activeScript}</code>
                </pre>
              </div>
            </div>

            {/* Simulated Execution Terminal */}
            {(isSimulating || simulatedLogs.length > 0) && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800 text-xs">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-mono text-white font-semibold">Simulated Execution Terminal Output</span>
                  </div>
                  {isSimulating && (
                    <span className="text-amber-400 text-[11px] font-mono animate-pulse">Running Stage {currentStep}/6...</span>
                  )}
                  {simulationComplete && (
                    <span className="text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Process Exited with Code 0
                    </span>
                  )}
                </div>
                <div className="p-3 font-mono text-[11px] space-y-1 max-h-48 overflow-y-auto leading-normal">
                  {simulatedLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={
                        log.includes('SUCCESS') || log.includes('SUCCESSFUL')
                          ? 'text-emerald-400'
                          : log.includes('CRITICAL') || log.includes('Error')
                          ? 'text-red-400'
                          : log.includes('WARNING')
                          ? 'text-amber-400'
                          : log.includes('SHA-256')
                          ? 'text-yellow-300 font-semibold'
                          : 'text-neutral-300'
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
