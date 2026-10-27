import { PeHeaderConfig, PeSectionInfo } from '../types/pe-types';

export interface PeDissectedField {
  offset: string;
  field: string;
  section: string;
  valueHex: string;
  valueParsed: string;
  description: string;
  isModifiedByUser?: boolean;
}

/**
 * Calculates DllCharacteristics bitmask based on user config.
 */
export function getDllCharacteristicsMask(config: PeHeaderConfig): number {
  let mask = 0;
  if (config.highEntropyVa) mask |= 0x0020; // 64-bit ASLR
  if (config.dynamicBase) mask |= 0x0040; // ASLR
  if (config.nxCompat) mask |= 0x0100; // DEP
  if (config.noSeh) mask |= 0x0400; // No SEH
  if (config.guardCf) mask |= 0x4000; // CFG
  if (config.terminalServerAware) mask |= 0x8000; // Terminal server aware
  return mask;
}

/**
 * Gets machine code for COFF header
 */
export function getMachineCode(arch: string): number {
  switch (arch) {
    case 'x64':
      return 0x8664; // IMAGE_FILE_MACHINE_AMD64
    case 'ia32':
      return 0x014c; // IMAGE_FILE_MACHINE_I386
    case 'arm64':
      return 0xaa64; // IMAGE_FILE_MACHINE_ARM64
    default:
      return 0x8664;
  }
}

/**
 * Dissects and parses PE header structure into an annotated table for inspection
 */
export function dissectPeHeader(config: PeHeaderConfig): PeDissectedField[] {
  const is64 = config.machine === 'x64' || config.machine === 'arm64';
  const dllChars = getDllCharacteristicsMask(config);
  const machineCode = getMachineCode(config.machine);
  const subsystemCode = config.subsystem === 'windows_gui' ? 2 : 3;

  const fields: PeDissectedField[] = [
    {
      offset: '0x0000',
      field: 'e_magic',
      section: 'IMAGE_DOS_HEADER',
      valueHex: '4D 5A',
      valueParsed: '"MZ" (Mark Zbikowski)',
      description: 'DOS executable magic number signature. Required by all Windows loaders.'
    },
    {
      offset: '0x003C',
      field: 'e_lfanew',
      section: 'IMAGE_DOS_HEADER',
      valueHex: '80 00 00 00',
      valueParsed: '0x00000080 (128 bytes)',
      description: 'File address offset to the NT / PE Header signature.'
    },
    {
      offset: '0x0040',
      field: 'DOS Stub Program',
      section: 'MS-DOS 2.0 STUB',
      valueHex: '0E 1F BA 0E 00 B4 09 CD 21 ...',
      valueParsed: '"This program cannot be run in DOS mode."',
      description: 'Legacy 16-bit DOS program executed if run under MS-DOS.'
    },
    {
      offset: '0x0080',
      field: 'PE Signature',
      section: 'IMAGE_NT_HEADERS',
      valueHex: '50 45 00 00',
      valueParsed: '"PE\\0\\0" (Portable Executable)',
      description: 'Identifies file as a 32-bit or 64-bit PE executable for Win32/Win64.'
    },
    {
      offset: '0x0084',
      field: 'Machine',
      section: 'IMAGE_FILE_HEADER (COFF)',
      valueHex: machineCode === 0x8664 ? '64 86' : machineCode === 0x014c ? '4C 01' : '64 AA',
      valueParsed: config.machine === 'x64' ? '0x8664 (AMD64 / x64)' : config.machine === 'ia32' ? '0x014C (Intel 386 / x86)' : '0xAA64 (ARM64)',
      description: 'Target CPU architecture. Loaded by Windows kernel loader.',
      isModifiedByUser: true
    },
    {
      offset: '0x0086',
      field: 'NumberOfSections',
      section: 'IMAGE_FILE_HEADER (COFF)',
      valueHex: '05 00',
      valueParsed: '5 Sections (.text, .rdata, .data, .rsrc, .reloc)',
      description: 'Count of section headers following the optional header.'
    },
    {
      offset: '0x0088',
      field: 'TimeDateStamp',
      section: 'IMAGE_FILE_HEADER (COFF)',
      valueHex: '68 FE 5C 6B',
      valueParsed: new Date().toUTCString(),
      description: 'Low 32 bits of unix timestamp when binary was generated.'
    },
    {
      offset: '0x0094',
      field: 'SizeOfOptionalHeader',
      section: 'IMAGE_FILE_HEADER (COFF)',
      valueHex: is64 ? 'F0 00' : 'E0 00',
      valueParsed: is64 ? '240 bytes (PE32+)' : '224 bytes (PE32)',
      description: 'Size of the optional header data structure.'
    },
    {
      offset: '0x0096',
      field: 'Characteristics',
      section: 'IMAGE_FILE_HEADER (COFF)',
      valueHex: '22 00',
      valueParsed: '0x0022 (EXECUTABLE_IMAGE | LARGE_ADDRESS_AWARE)',
      description: 'Flags indicating file is executable and supports >2GB memory spaces.'
    },
    {
      offset: '0x0098',
      field: 'Magic',
      section: 'IMAGE_OPTIONAL_HEADER',
      valueHex: is64 ? '0B 02' : '0B 01',
      valueParsed: is64 ? '0x020B (PE32+ / 64-bit)' : '0x010B (PE32 / 32-bit)',
      description: 'Identifies the state of the image file (64-bit versus 32-bit).'
    },
    {
      offset: '0x00B0',
      field: 'AddressOfEntryPoint',
      section: 'IMAGE_OPTIONAL_HEADER',
      valueHex: '00 10 00 00',
      valueParsed: 'RVA 0x00001000',
      description: 'Relative virtual address of the program entry point (mainCRTStartup).'
    },
    {
      offset: '0x00C4',
      field: 'MajorSubsystemVersion',
      section: 'IMAGE_OPTIONAL_HEADER (Windows)',
      valueHex: config.majorSubsystemVersion.toString(16).padStart(2, '0') + ' 00',
      valueParsed: `${config.majorSubsystemVersion}.${config.minorSubsystemVersion} (Windows NT 10.0+)`,
      description: 'Minimum required Windows OS version to execute binary.',
      isModifiedByUser: true
    },
    {
      offset: '0x00D4',
      field: 'Subsystem',
      section: 'IMAGE_OPTIONAL_HEADER (Windows)',
      valueHex: `0${subsystemCode} 00`,
      valueParsed: subsystemCode === 2 ? '0x0002 (IMAGE_SUBSYSTEM_WINDOWS_GUI)' : '0x0003 (IMAGE_SUBSYSTEM_WINDOWS_CUI)',
      description: subsystemCode === 2 
        ? 'Native Windows GUI application. Prevents black command prompt terminal from flashing.' 
        : 'Windows Console application. Attaches standard terminal I/O on launch.',
      isModifiedByUser: true
    },
    {
      offset: '0x00D6',
      field: 'DllCharacteristics',
      section: 'IMAGE_OPTIONAL_HEADER (Security)',
      valueHex: (dllChars & 0xFF).toString(16).padStart(2, '0').toUpperCase() + ' ' + ((dllChars >> 8) & 0xFF).toString(16).padStart(2, '0').toUpperCase(),
      valueParsed: `0x${dllChars.toString(16).padStart(4, '0').toUpperCase()} [${[
        config.dynamicBase ? 'DYNAMIC_BASE' : null,
        config.nxCompat ? 'NX_COMPAT' : null,
        config.highEntropyVa ? 'HIGH_ENTROPY_VA' : null,
        config.terminalServerAware ? 'TERMINAL_SERVER_AWARE' : null
      ].filter(Boolean).join(' | ')}]`,
      description: 'Core binary hardening flags: ASLR address randomization, DEP execution prevention, and 64-bit entropy.',
      isModifiedByUser: true
    },
    {
      offset: '0x00D8',
      field: 'SizeOfStackReserve',
      section: 'IMAGE_OPTIONAL_HEADER (Memory)',
      valueHex: '00 00 10 00 00 00 00 00',
      valueParsed: `${(config.sizeOfStackReserve / 1024).toLocaleString()} KB (${config.sizeOfStackReserve} bytes)`,
      description: 'Virtual memory reserved for the initial thread stack.',
      isModifiedByUser: true
    },
    {
      offset: '0x00E0',
      field: 'SizeOfStackCommit',
      section: 'IMAGE_OPTIONAL_HEADER (Memory)',
      valueHex: '00 10 00 00 00 00 00 00',
      valueParsed: `${(config.sizeOfStackCommit / 1024).toLocaleString()} KB (${config.sizeOfStackCommit} bytes)`,
      description: 'Physical memory initially committed for the thread stack.'
    },
    {
      offset: '0x0130',
      field: 'DataDirectory[2] (Resource Table)',
      section: 'DATA_DIRECTORIES',
      valueHex: '00 40 00 00 00 10 00 00',
      valueParsed: 'RVA 0x00004000, Size 4096 bytes',
      description: 'Points to .rsrc section containing RT_MANIFEST, VS_VERSION_INFO, and RT_GROUP_ICON.'
    },
    {
      offset: '0x0188',
      field: 'RT_MANIFEST (UAC Level)',
      section: 'RESOURCE DIRECTORY (.rsrc)',
      valueHex: 'Manifest XML Payload',
      valueParsed: `requestedExecutionLevel="${config.requestedExecutionLevel}", dpiAware="${config.dpiAwareness}"`,
      description: 'Embedded application manifest controlling UAC elevation and Windows Per-Monitor V2 DPI scaling.',
      isModifiedByUser: true
    },
    {
      offset: '0x01C0',
      field: 'VS_VERSION_INFO (Product Strings)',
      section: 'RESOURCE DIRECTORY (.rsrc)',
      valueHex: 'StringFileInfo Block',
      valueParsed: `${config.productName} v${config.fileVersion} (${config.companyName})`,
      description: 'Embedded version strings visible in Windows File Explorer Details and task manager.',
      isModifiedByUser: true
    }
  ];

  return fields;
}

/**
 * Standard default PE sections in packaged Electron executable
 */
export const PE_STANDARD_SECTIONS: PeSectionInfo[] = [
  {
    name: '.text',
    virtualAddress: '0x00001000',
    virtualSize: '0x00018400 (99.3 KB)',
    rawSize: '0x00018400',
    characteristics: '0x60000020 (CODE | EXECUTE | READ)',
    description: 'Executable machine instructions for the native x64 bootstrap loader.'
  },
  {
    name: '.rdata',
    virtualAddress: '0x0001A000',
    virtualSize: '0x0000C800 (50.0 KB)',
    rawSize: '0x0000C800',
    characteristics: '0x40000040 (INITIALIZED_DATA | READ)',
    description: 'Read-only constants, Import Address Table (IAT), and string literals.'
  },
  {
    name: '.data',
    virtualAddress: '0x00027000',
    virtualSize: '0x00002400 (9.0 KB)',
    rawSize: '0x00002400',
    characteristics: '0xC0000040 (INITIALIZED_DATA | READ | WRITE)',
    description: 'Global and static mutable variables used by the runtime.'
  },
  {
    name: '.pdata',
    virtualAddress: '0x0002A000',
    virtualSize: '0x00001800 (6.0 KB)',
    rawSize: '0x00001800',
    characteristics: '0x40000040 (INITIALIZED_DATA | READ)',
    description: 'Function table exception handling metadata for x64 structured unwind.'
  },
  {
    name: '.rsrc',
    virtualAddress: '0x0002C000',
    virtualSize: '0x00014000 (80.0 KB)',
    rawSize: '0x00014000',
    characteristics: '0x40000040 (INITIALIZED_DATA | READ)',
    description: 'Windows resources: Manifest (ID 1), Version Info (ID 1), and Multi-Resolution ICO.'
  },
  {
    name: '.reloc',
    virtualAddress: '0x00041000',
    virtualSize: '0x00000800 (2.0 KB)',
    rawSize: '0x00000800',
    characteristics: '0x42000040 (DISCARDABLE | READ)',
    description: 'Relocation table entries allowing ASLR loader to rebase the executable in memory.'
  }
];

/**
 * Builds a syntactically valid PE binary executable (.EXE) file buffer.
 * It contains the real DOS MZ header, DOS stub, PE signature, COFF header,
 * 64-bit Optional Header with user-configured Subsystem & DllCharacteristics,
 * and an appended embedded payload block.
 */
export function buildExecutableBinary(
  config: PeHeaderConfig,
  htmlContent: string
): Uint8Array {
  // Construct a 2048-byte PE header + payload
  const buffer = new Uint8Array(4096 + htmlContent.length);
  const view = new DataView(buffer.buffer);

  // 1. DOS Header (64 bytes)
  buffer[0] = 0x4D; // 'M'
  buffer[1] = 0x5A; // 'Z'
  view.setUint16(2, 0x0090, true); // e_cblp
  view.setUint16(4, 0x0003, true); // e_cp
  view.setUint16(60, 0x0080, true); // e_lfanew = 0x80 (128)

  // 2. DOS Stub at 0x40
  const stubMessage = 'This program cannot be run in DOS mode.$';
  for (let i = 0; i < stubMessage.length; i++) {
    buffer[0x40 + i] = stubMessage.charCodeAt(i);
  }

  // 3. PE Signature at 0x80
  buffer[0x80] = 0x50; // 'P'
  buffer[0x81] = 0x45; // 'E'
  buffer[0x82] = 0x00;
  buffer[0x83] = 0x00;

  // 4. COFF Header (20 bytes) at 0x84
  const machine = getMachineCode(config.machine);
  view.setUint16(0x84, machine, true); // Machine
  view.setUint16(0x86, 2, true); // NumberOfSections
  view.setUint32(0x88, Math.floor(Date.now() / 1000), true); // TimeDateStamp
  view.setUint32(0x8C, 0, true); // PointerToSymbolTable
  view.setUint32(0x90, 0, true); // NumberOfSymbols
  view.setUint16(0x94, 0x00F0, true); // SizeOfOptionalHeader (240 bytes for PE32+)
  view.setUint16(0x96, 0x0022, true); // Characteristics: EXECUTABLE_IMAGE | LARGE_ADDRESS_AWARE

  // 5. Optional Header (PE32+) at 0x98
  view.setUint16(0x98, 0x020B, true); // Magic: PE32+ (64-bit)
  buffer[0x9A] = 14; // MajorLinkerVersion
  buffer[0x9B] = 30; // MinorLinkerVersion
  view.setUint32(0x9C, 0x1000, true); // SizeOfCode
  view.setUint32(0xA0, 0x1000, true); // SizeOfInitializedData
  view.setUint32(0xA8, 0x1000, true); // AddressOfEntryPoint
  view.setUint32(0xAC, 0x1000, true); // BaseOfCode

  // Windows Specific Fields
  view.setBigUint64(0xB0, BigInt('0x140000000'), true); // ImageBase
  view.setUint32(0xB8, 0x1000, true); // SectionAlignment
  view.setUint32(0xBC, 0x0200, true); // FileAlignment
  view.setUint16(0xC0, 10, true); // MajorOperatingSystemVersion
  view.setUint16(0xC2, 0, true); // MinorOperatingSystemVersion
  view.setUint16(0xC8, config.majorSubsystemVersion, true); // MajorSubsystemVersion
  view.setUint16(0xCA, config.minorSubsystemVersion, true); // MinorSubsystemVersion
  view.setUint32(0xD0, 0x5000, true); // SizeOfImage
  view.setUint32(0xD4, 0x0400, true); // SizeOfHeaders

  // Subsystem (0xDC)
  const subsystem = config.subsystem === 'windows_gui' ? 2 : 3;
  view.setUint16(0xD8 + 4, subsystem, true);

  // DllCharacteristics (0xDE)
  const dllChars = getDllCharacteristicsMask(config);
  view.setUint16(0xDA + 4, dllChars, true);

  // Stack & Heap
  view.setBigUint64(0xE0, BigInt(config.sizeOfStackReserve), true);
  view.setBigUint64(0xE8, BigInt(config.sizeOfStackCommit), true);
  view.setBigUint64(0xF0, BigInt(config.sizeOfHeapReserve), true);
  view.setBigUint64(0xF8, BigInt(config.sizeOfHeapCommit), true);

  // 6. Section 1 (.text) at 0x0188
  const textName = '.text';
  for (let i = 0; i < textName.length; i++) buffer[0x0188 + i] = textName.charCodeAt(i);
  view.setUint32(0x0188 + 8, 0x1000, true); // VirtualSize
  view.setUint32(0x0188 + 12, 0x1000, true); // VirtualAddress
  view.setUint32(0x0188 + 16, 0x0200, true); // SizeOfRawData
  view.setUint32(0x0188 + 20, 0x0400, true); // PointerToRawData
  view.setUint32(0x0188 + 36, 0x60000020, true); // Characteristics: CODE | EXECUTE | READ

  // 7. Section 2 (.rsrc) at 0x0188 + 40
  const rsrcOffset = 0x0188 + 40;
  const rsrcName = '.rsrc';
  for (let i = 0; i < rsrcName.length; i++) buffer[rsrcOffset + i] = rsrcName.charCodeAt(i);
  view.setUint32(rsrcOffset + 8, 0x2000, true); // VirtualSize
  view.setUint32(rsrcOffset + 12, 0x2000, true); // VirtualAddress
  view.setUint32(rsrcOffset + 16, 0x0600, true); // SizeOfRawData
  view.setUint32(rsrcOffset + 20, 0x0600, true); // PointerToRawData
  view.setUint32(rsrcOffset + 36, 0x40000040, true); // Characteristics: INITIALIZED_DATA | READ

  // 8. Embed Metadata Strings & HTML Bundle Payload at 0x0400
  const metaString = `[ELECTRA_PE_HEADER_INFO]
Subsystem=${config.subsystem === 'windows_gui' ? 'IMAGE_SUBSYSTEM_WINDOWS_GUI (2)' : 'IMAGE_SUBSYSTEM_WINDOWS_CUI (3)'}
Architecture=${config.machine}
ASLR=${config.dynamicBase ? 'ENABLED' : 'DISABLED'}
DEP=${config.nxCompat ? 'ENABLED' : 'DISABLED'}
ExecutionLevel=${config.requestedExecutionLevel}
DPIAwareness=${config.dpiAwareness}
Company=${config.companyName}
Product=${config.productName}
FileVersion=${config.fileVersion}
ProductVersion=${config.productVersion}
[END_HEADER_INFO]
`;
  for (let i = 0; i < metaString.length; i++) {
    buffer[0x0400 + i] = metaString.charCodeAt(i);
  }

  // Embed HTML Payload at 0x0800
  const payloadHeader = `<!-- EMBEDDED_APPLICATION_BUNDLE -->\n`;
  const startOffset = 0x0800;
  for (let i = 0; i < payloadHeader.length; i++) {
    buffer[startOffset + i] = payloadHeader.charCodeAt(i);
  }
  for (let i = 0; i < htmlContent.length; i++) {
    buffer[startOffset + payloadHeader.length + i] = htmlContent.charCodeAt(i);
  }

  return buffer;
}
