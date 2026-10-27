import JSZip from 'jszip';
import { ElectronConfig, PeHeaderConfig, ProjectFiles } from '../types/pe-types';
import {
  generatePackageJson,
  generateMainJs,
  generatePreloadJs,
  generateWindowsManifest,
  generateResourceScript,
  generateBuildBat,
  generateBuildPs1,
  generateReadme
} from './electron-config-generator';
import { generateBashScript } from './pipeline-generator';
import { buildExecutableBinary } from './pe-generator';

/**
 * Creates a minimal valid .ICO binary file buffer (32x32 pixel icon)
 */
function createMinimalIcoBuffer(): Uint8Array {
  // Simple 32x32 32-bit RGBA BMP inside an ICO container
  const icoHeader = new Uint8Array([
    0x00, 0x00, // Reserved
    0x01, 0x00, // Type: 1 = ICO
    0x01, 0x00, // 1 image
    // Directory entry
    32,         // Width 32
    32,         // Height 32
    0,          // Color count
    0,          // Reserved
    0x01, 0x00, // Color planes
    0x20, 0x00, // Bits per pixel (32)
    0x28, 0x04, 0x00, 0x00, // Size of image data: 1064 bytes (40 header + 1024 pixels)
    0x16, 0x00, 0x00, 0x00  // Offset to image data: 22 bytes
  ]);

  const bmpHeader = new Uint8Array([
    40, 0, 0, 0,    // biSize: 40
    32, 0, 0, 0,    // biWidth: 32
    64, 0, 0, 0,    // biHeight: 64 (double height for XOR + AND mask)
    1, 0,           // biPlanes: 1
    32, 0,          // biBitCount: 32
    0, 0, 0, 0,     // biCompression: BI_RGB (0)
    0, 4, 0, 0,     // biSizeImage: 1024
    0, 0, 0, 0,     // biXPelsPerMeter
    0, 0, 0, 0,     // biYPelsPerMeter
    0, 0, 0, 0,     // biClrUsed
    0, 0, 0, 0      // biClrImportant
  ]);

  const pixels = new Uint8Array(32 * 32 * 4);
  // Fill with a stylish Windows blue gradient with border
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const idx = (y * 32 + x) * 4;
      const isBorder = x === 0 || x === 31 || y === 0 || y === 31;
      if (isBorder) {
        pixels[idx] = 0x60;     // B
        pixels[idx + 1] = 0xa5; // G
        pixels[idx + 2] = 0xfa; // R
        pixels[idx + 3] = 0xff; // A
      } else {
        pixels[idx] = 0xeb;     // B
        pixels[idx + 1] = 0x63; // G
        pixels[idx + 2] = 0x25; // R
        pixels[idx + 3] = 0xff; // A
      }
    }
  }

  // AND mask (32x32 bits = 128 bytes)
  const andMask = new Uint8Array(128);

  const totalLength = icoHeader.length + bmpHeader.length + pixels.length + andMask.length;
  const icoBuffer = new Uint8Array(totalLength);
  let offset = 0;
  icoBuffer.set(icoHeader, offset); offset += icoHeader.length;
  icoBuffer.set(bmpHeader, offset); offset += bmpHeader.length;
  icoBuffer.set(pixels, offset); offset += pixels.length;
  icoBuffer.set(andMask, offset);

  return icoBuffer;
}

/**
 * Generates and downloads a complete Electron project zip file
 */
export async function downloadElectronProjectZip(
  electronConfig: ElectronConfig,
  peConfig: PeHeaderConfig,
  files: ProjectFiles
): Promise<void> {
  const zip = new JSZip();

  // Root files
  zip.file('package.json', generatePackageJson(electronConfig, peConfig));
  zip.file('main.js', generateMainJs(electronConfig, peConfig));
  zip.file('preload.js', generatePreloadJs());
  zip.file('app.manifest', generateWindowsManifest(peConfig, electronConfig));
  zip.file('resource.rc', generateResourceScript(peConfig));
  zip.file('build-windows-exe.bat', generateBuildBat(electronConfig, peConfig));
  zip.file('build-windows-exe.ps1', generateBuildPs1(electronConfig, peConfig));
  zip.file(
    'build.sh',
    generateBashScript(electronConfig, peConfig, {
      cleanDist: true,
      verboseLogging: false,
      calculateSha256: true,
      launchOnComplete: false,
      verifyPeHeaders: true,
      arch: peConfig.machine,
      subsystem: peConfig.subsystem
    })
  );
  zip.file('README.md', generateReadme(electronConfig, peConfig));

  // HTML Web app files
  zip.file('index.html', files['index.html']);
  zip.file('styles.css', files['styles.css']);
  zip.file('app.js', files['app.js']);

  // Assets folder
  const assetsFolder = zip.folder('assets');
  if (assetsFolder) {
    assetsFolder.file('icon.ico', createMinimalIcoBuffer());
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = `${electronConfig.appName.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-electron-win-package.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Generates and downloads a raw standalone Windows PE (.exe) binary
 */
export function downloadStandaloneExe(
  electronConfig: ElectronConfig,
  peConfig: PeHeaderConfig,
  files: ProjectFiles
): void {
  const combinedHtml = `<!-- Packaged Web Executable -->
<style>${files['styles.css']}</style>
${files['index.html']}
<script>${files['app.js']}</script>`;

  const exeBinary = buildExecutableBinary(peConfig, combinedHtml);
  const blob = new Blob([exeBinary.buffer as ArrayBuffer], { type: 'application/vnd.microsoft.portable-executable' });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = `${peConfig.originalFilename || 'app'}.exe`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);
}
