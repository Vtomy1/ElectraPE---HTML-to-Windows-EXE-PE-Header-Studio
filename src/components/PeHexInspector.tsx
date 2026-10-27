import React, { useState } from 'react';
import { PeHeaderConfig } from '../types/pe-types';
import { dissectPeHeader, PE_STANDARD_SECTIONS } from '../utils/pe-generator';
import { Cpu, Binary, Search, Layers, ShieldCheck } from 'lucide-react';

interface PeHexInspectorProps {
  config: PeHeaderConfig;
}

export const PeHexInspector: React.FC<PeHexInspectorProps> = ({ config }) => {
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const dissectedFields = dissectPeHeader(config);

  const filteredFields = dissectedFields.filter((item) => {
    const matchesFilter =
      selectedSectionFilter === 'ALL' || item.section.includes(selectedSectionFilter);
    const matchesSearch =
      searchTerm === '' ||
      item.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.valueHex.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-neutral-950 text-neutral-200">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Binary className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-semibold text-white">Portable Executable (PE) Binary Dissector</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live byte-level inspection of the compiled MS-DOS stub, COFF header, 64-bit Optional Header, and section alignment tables.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search header fields..."
                className="pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500 w-48"
              />
            </div>
          </div>
        </div>

        {/* Section Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-900 rounded-lg border border-neutral-800 text-xs">
          {['ALL', 'DOS_HEADER', 'COFF', 'OPTIONAL_HEADER', 'RESOURCE'].map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSectionFilter(sec)}
              className={`px-3 py-1 rounded-md transition-colors font-mono text-[11px] ${
                selectedSectionFilter === sec
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Interactive Binary Structure Table */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 font-mono text-[11px]">
                  <th className="py-2.5 px-4 w-28">Byte Offset</th>
                  <th className="py-2.5 px-4 w-48">Field / Structure</th>
                  <th className="py-2.5 px-4 w-44">Raw Hex Stream</th>
                  <th className="py-2.5 px-4 w-72">Parsed Representation</th>
                  <th className="py-2.5 px-4">Technical Explanation & Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 font-mono text-[11px]">
                {filteredFields.map((field, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-neutral-850/80 transition-colors ${
                      field.isModifiedByUser ? 'bg-amber-950/15' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-amber-400/90 font-mono font-medium">
                      {field.offset}
                    </td>
                    <td className="py-3 px-4 font-sans text-white font-medium">
                      <div>{field.field}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">{field.section}</div>
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-mono tracking-wider">
                      {field.valueHex}
                    </td>
                    <td className="py-3 px-4 text-neutral-300 font-mono text-[10px] break-all">
                      {field.valueParsed}
                    </td>
                    <td className="py-3 px-4 font-sans text-neutral-400 text-xs leading-normal">
                      {field.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section Headers (COFF Section Table) */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Windows Executable Section Headers (.text, .rsrc, .reloc)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PE_STANDARD_SECTIONS.map((sec) => (
              <div
                key={sec.name}
                className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400">{sec.name}</span>
                  <span className="text-[10px] font-mono text-neutral-500">{sec.virtualSize}</span>
                </div>
                <div className="text-[11px] text-neutral-300 font-sans leading-normal">
                  {sec.description}
                </div>
                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                  <span>RVA: {sec.virtualAddress}</span>
                  <span>{sec.characteristics.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
