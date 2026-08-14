import { describe, expect, it } from 'vitest';
import { checksum, normalizeRetail, qrPayload, sanitizeFilename } from './tools';

describe('QR payload builders', () => {
  it('builds a URL payload without changing unicode text', () => {
    expect(qrPayload('url-to-qr-code', 'https://example.com/你好')).toBe('https://example.com/你好');
  });
  it('builds a standards-compatible WiFi payload', () => {
    expect(qrPayload('wifi-qr-code', '', { ssid: 'Studio WiFi', password: 'p@ss;word', security: 'WPA', hidden: 'false' })).toBe('WIFI:T:WPA;S:Studio WiFi;P:p@ss;word;H:false;;');
  });
  it('builds a vCard payload with contact fields', () => {
    const result = qrPayload('vcard-qr-code', '', { first: 'Ada', last: 'Lovelace', email: 'ada@example.com' });
    expect(result).toContain('BEGIN:VCARD');
    expect(result).toContain('N:Lovelace;Ada');
    expect(result).toContain('EMAIL:ada@example.com');
  });
  it('builds mailto and phone payloads', () => {
    expect(qrPayload('email-qr-code', 'hello@example.com', { subject: 'Hi' })).toContain('mailto:hello@example.com?subject=Hi');
    expect(qrPayload('phone-qr-code', '+1 (555) 010-2048')).toBe('tel:+15550102048');
  });
});

describe('barcode validation', () => {
  it('calculates the EAN-13 check digit', () => {
    expect(checksum('590123412345')).toBe('7');
    expect(normalizeRetail('590123412345', 'EAN13')).toEqual({ value: '5901234123457', error: '' });
  });
  it('rejects an incorrect UPC-A checksum', () => {
    expect(normalizeRetail('036000291452', 'UPC').error).toBe('Invalid UPC checksum.');
  });
  it('accepts a valid full EAN-13 value', () => {
    expect(normalizeRetail('5901234123457', 'EAN13').error).toBe('');
  });
  it('sanitizes download names', () => {
    expect(sanitizeFilename('EAN-13 Barcode / Test')).toBe('ean-13-barcode-test');
  });
});
