import { describe, expect, it } from 'vitest';
import { summarizeReferrer, summarizeUserAgent } from '../components/DynamicQrAnalyticsPanel';

describe('Dynamic QR analytics field summaries', () => {
  it('handles missing and recognizable user agents without exposing raw payloads', () => {
    expect(summarizeUserAgent(null)).toBe('Unknown device');
    expect(summarizeUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile')).toBe('Mobile device');
    expect(summarizeUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe('Desktop device');
  });

  it('normalizes referrer hosts and provides safe empty states', () => {
    expect(summarizeReferrer(null)).toBe('Direct / unknown source');
    expect(summarizeReferrer('https://newsletter.example/path')).toBe('newsletter.example');
    expect(summarizeReferrer('not-a-url')).toBe('Unparsed source');
  });
});
