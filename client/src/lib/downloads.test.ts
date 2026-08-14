import { describe, expect, it } from 'vitest';
import { exportFilename, svgToBlob } from './downloads';

describe('download exports',()=>{
  it('creates safe PNG and SVG filenames',()=>{
    expect(exportFilename('ISBN Barcode / Demo','png')).toBe('isbn-barcode-demo.png');
    expect(exportFilename('','svg')).toBe('qrkit-code.svg');
  });
  it('creates a valid SVG Blob with the correct MIME type',async()=>{
    const blob=svgToBlob('<svg xmlns="http://www.w3.org/2000/svg"><rect width="4" height="4"/></svg>');
    expect(blob.type).toBe('image/svg+xml');
    expect(await blob.text()).toContain('<rect');
  });
});
