// @vitest-environment jsdom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BrandExportButtons, BrandRiskNotice, getBrandRisk, logoCoverageRatio, parseRows, safeFilename } from './BrandBatchPage';

afterEach(cleanup);

describe('brand and batch QR helpers', () => {
  it('parses labeled CSV rows and ignores blank rows', () => {
    expect(parseRows('campaign,https://example.com/a\n\nhttps://example.com/b')).toEqual([
      { label: 'campaign', value: 'https://example.com/a' },
      { label: 'item-2', value: 'https://example.com/b' },
    ]);
  });

  it('creates safe deterministic filenames', () => {
    expect(safeFilename('Spring / Menu 2026')).toBe('spring-menu-2026');
    expect(safeFilename('')).toBe('qr-code');
  });

  it('blocks low contrast and oversized logo coverage, and warns on a small quiet zone', () => {
    expect(getBrandRisk('#777777', '#888888', 4, 'QK', 0.18, 'H').level).toBe('block');
    expect(getBrandRisk('#171916', '#fffdf8', 2, 'QK', 0.18, 'H').level).toBe('warning');
    expect(getBrandRisk('#171916', '#fffdf8', 4, 'QK', 0.26, 'H').level).toBe('block');
    expect(getBrandRisk('#171916', '#fffdf8', 4, 'QK', 0.26, 'L').level).toBe('block');
    expect(logoCoverageRatio('QK', 0.26)).toBeCloseTo(0.0676);
  });

  it('renders low-contrast block text and disables both exports', () => {
    const risk = getBrandRisk('#777777', '#888888', 4, 'QK', 0.18, 'H');
    render(<><BrandRiskNotice risk={risk} ratio={2.1} coverage={0.0324}/><BrandExportButtons disabled={risk.level === 'block'} onPng={() => undefined} onSvg={() => undefined}/></>);
    expect(screen.getByRole('status')).toHaveTextContent('Export blocked');
    expect(screen.getByRole('button', { name: /ZIP \/ PNG/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /ZIP \/ SVG/i })).toBeDisabled();
  });

  it('renders quiet-zone warning while keeping exports available', () => {
    const risk = getBrandRisk('#171916', '#fffdf8', 2, 'QK', 0.14, 'H');
    render(<><BrandRiskNotice risk={risk} ratio={13} coverage={0.0196}/><BrandExportButtons disabled={risk.level === 'block'} onPng={() => undefined} onSvg={() => undefined}/></>);
    expect(screen.getByRole('status')).toHaveTextContent('quiet zone');
    expect(screen.getByRole('button', { name: /ZIP \/ PNG/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /ZIP \/ SVG/i })).toBeEnabled();
  });

  it('renders high logo coverage warning text and keeps exports available', () => {
    const risk = getBrandRisk('#171916', '#fffdf8', 4, 'QK', 0.23, 'H');
    render(<><BrandRiskNotice risk={risk} ratio={13} coverage={logoCoverageRatio('QK', 0.23)}/><BrandExportButtons disabled={risk.level === 'block'} onPng={() => undefined} onSvg={() => undefined}/></>);
    expect(screen.getByRole('status')).toHaveTextContent('Logo coverage warning');
    expect(screen.getByRole('button', { name: /ZIP \/ PNG/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /ZIP \/ SVG/i })).toBeEnabled();
  });

  it('renders ECC-specific logo coverage block text and disables exports', () => {
    const risk = getBrandRisk('#171916', '#fffdf8', 4, 'QK', 0.26, 'L');
    render(<><BrandRiskNotice risk={risk} ratio={13} coverage={logoCoverageRatio('QK', 0.26)}/><BrandExportButtons disabled={risk.level === 'block'} onPng={() => undefined} onSvg={() => undefined}/></>);
    expect(screen.getByRole('status')).toHaveTextContent('ECC-L');
    expect(screen.getByRole('status')).toHaveTextContent('Export blocked');
    expect(screen.getByRole('button', { name: /ZIP \/ SVG/i })).toBeDisabled();
  });
});
