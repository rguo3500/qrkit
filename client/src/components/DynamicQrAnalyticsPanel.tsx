import React from 'react';
import { BarChart3 } from 'lucide-react';
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from './ui/chart';

export type ScanStatsView = {
  totalScans: number;
  lastScanAt: Date | string | null;
  daily: Array<{ date: string; scans: number }>;
  recent: Array<{ createdAt: Date | string; country: string | null; referrer: string | null; userAgent: string | null }>;
};

const chartConfig = { scans: { label: 'Scans', color: '#ff5a36' } };

export function summarizeUserAgent(value: string | null) {
  if (!value) return 'Unknown device';
  if (/iphone|ipad|android|mobile/i.test(value)) return 'Mobile device';
  if (/macintosh|windows|linux/i.test(value)) return 'Desktop device';
  return 'Other device';
}

export function summarizeReferrer(value: string | null) {
  if (!value) return 'Direct / unknown source';
  try { return new URL(value).hostname; } catch { return 'Unparsed source'; }
}

export function DynamicQrAnalyticsPanel({ label, stats, isLoading = false, hasError = false }: { label: string; stats?: ScanStatsView; isLoading?: boolean; hasError?: boolean }) {
  return <div className="paper-panel rounded-3xl border p-6 md:p-8"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Scan analytics</p><h2 className="mt-2 font-display text-3xl font-extrabold tracking-[-.05em]">{label}</h2></div><BarChart3 className="text-[#ff5a36]" /></div>{isLoading ? <p className="mt-8 text-sm text-[#6f746d]">Loading scan data…</p> : hasError ? <p className="mt-8 text-sm text-red-700">Unable to load scan data.</p> : stats ? <><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[#f4eee4] p-4"><p className="font-mono text-xs uppercase tracking-wider text-[#6f746d]">Total scans</p><p data-testid="total-scans" className="mt-2 font-display text-3xl font-extrabold">{stats.totalScans.toLocaleString()}</p></div><div className="rounded-2xl bg-[#f4eee4] p-4"><p className="font-mono text-xs uppercase tracking-wider text-[#6f746d]">Last scan</p><p className="mt-2 text-sm">{stats.lastScanAt ? new Date(stats.lastScanAt).toLocaleString() : 'No scans yet'}</p></div></div><div className="mt-6">{stats.totalScans ? <ChartContainer config={chartConfig} className="h-64 w-full" data-testid="scan-trend-chart"><LineChart data={stats.daily} margin={{ left: 0, right: 8, top: 12, bottom: 0 }}><CartesianGrid vertical={false} stroke="#d7d0c4" /><XAxis dataKey="date" tickLine={false} axisLine={false} tickFormatter={value => value.slice(5)} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} /><Tooltip /><Line type="monotone" dataKey="scans" stroke="var(--color-scans)" strokeWidth={3} dot={{ r: 3, fill: '#ff5a36' }} /></LineChart></ChartContainer> : <div data-testid="scan-empty-state" className="rounded-2xl border border-dashed border-[#b7b0a3] p-8 text-center text-sm text-[#6f746d]">No scan data yet. Open the public redirect to create the first real event.</div>}</div><div className="mt-8 border-t border-[#d7d0c4] pt-6"><div className="flex items-center justify-between gap-3"><h3 className="font-display text-xl font-bold">Recent visits</h3><span className="font-mono text-xs uppercase tracking-wider text-[#6f746d]">Privacy-limited</span></div>{stats.recent.length ? <div data-testid="recent-visits" className="mt-4 grid gap-3">{stats.recent.map((event, index) => <div key={`${event.createdAt}-${index}`} className="rounded-xl border border-[#d7d0c4] bg-[#fffdf8] p-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><span className="font-medium">{new Date(event.createdAt).toLocaleString()}</span><span className="font-mono text-xs text-[#6f746d]">{event.country || 'Country unavailable'}</span></div><div className="mt-2 grid gap-1 text-xs text-[#6f746d]"><span>Device: {summarizeUserAgent(event.userAgent)} · userAgent: {event.userAgent || 'Unavailable'}</span><span>Source: {summarizeReferrer(event.referrer)} · referrer: {event.referrer || 'Direct / unavailable'}</span></div></div>)}</div> : <p data-testid="recent-empty-state" className="mt-4 rounded-xl border border-dashed border-[#b7b0a3] p-5 text-sm text-[#6f746d]">No recent visits. Country, source, and device details will appear only when the redirect boundary records them.</p>}</div></> : <p className="mt-8 text-sm text-[#6f746d]">No scan data available.</p>}</div>;
}
