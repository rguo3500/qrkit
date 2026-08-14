import { describe, expect, it } from 'vitest';
import { buildDailyScanSeries } from './dynamicQr';

describe('buildDailyScanSeries', () => {
  it('fills missing days with zero and normalizes scan counts', () => {
    const result = buildDailyScanSeries([{ date: new Date().toISOString().slice(0, 10), scans: '3' }], 3);
    expect(result).toHaveLength(3);
    expect(result.at(-1)?.scans).toBe(3);
    expect(result.slice(0, 2).every(day => day.scans === 0)).toBe(true);
  });

  it('returns a stable empty series for no events', () => {
    const result = buildDailyScanSeries([], 14);
    expect(result).toHaveLength(14);
    expect(result.every(day => day.scans === 0)).toBe(true);
  });
});
