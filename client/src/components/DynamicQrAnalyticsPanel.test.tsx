// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DynamicQrAnalyticsPanel, type ScanStatsView } from './DynamicQrAnalyticsPanel';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;

const withScan: ScanStatsView = {
  totalScans: 2,
  lastScanAt: '2026-08-14T08:00:00.000Z',
  daily: [{ date: '2026-08-13', scans: 1 }, { date: '2026-08-14', scans: 1 }],
  recent: [{ createdAt: '2026-08-14T08:00:00.000Z', country: 'CN', referrer: 'https://newsletter.example/path', userAgent: 'Mozilla/5.0 (iPhone; Mobile)' }],
};

const emptyStats: ScanStatsView = { totalScans: 0, lastScanAt: null, daily: [{ date: '2026-08-14', scans: 0 }], recent: [] };

describe('DynamicQrAnalyticsPanel rendering', () => {
  it('renders trend container, recent visit raw fields, and summaries with data', () => {
    render(<DynamicQrAnalyticsPanel label="Campaign" stats={withScan} />);
    expect(screen.getByTestId('scan-trend-chart')).toBeInTheDocument();
    expect(screen.getByTestId('recent-visits')).toBeInTheDocument();
    expect(screen.getByText(/newsletter\.example/)).toBeInTheDocument();
    expect(screen.getByText(/Mozilla\/5\.0/)).toBeInTheDocument();
  });

  it('renders both empty states with no scan events', () => {
    render(<DynamicQrAnalyticsPanel label="Empty campaign" stats={emptyStats} />);
    expect(screen.getByTestId('scan-empty-state')).toBeInTheDocument();
    expect(screen.getByTestId('recent-empty-state')).toBeInTheDocument();
  });
});
