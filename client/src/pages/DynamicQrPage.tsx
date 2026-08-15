import { useMemo, useState } from 'react';
import { ArrowUpRight, Check, ClipboardCheck, ExternalLink, LockKeyhole, LogIn, Pause, Play, Save } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '../_core/hooks/useAuth';
import { startLogin } from '../const';
import RouteSeo from '../components/RouteSeo';
import { DynamicQrAnalyticsPanel } from '../components/DynamicQrAnalyticsPanel';
import { trpc } from '../lib/trpc';
import { dynamicRedirectUrl, type DynamicQrDraft, validateDynamicQrDraft } from '../lib/dynamicQrAdmin';

const acceptanceSteps = [
  { id: 'create', label: 'Create a link with a valid HTTPS destination.' },
  { id: 'edit', label: 'Edit the destination and confirm the preview updates.' },
  { id: 'pause', label: 'Pause the link and confirm the redirect boundary returns 404.' },
  { id: 'scan', label: 'Open the public redirect and confirm the target loads.' },
  { id: 'stats', label: 'Refresh statistics and confirm a scan event appears.' },
];


export default function DynamicQrPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const links = trpc.dynamicQr.list.useQuery(undefined, { enabled: isAuthenticated });
  const [selectedLinkId, setSelectedLinkId] = useState<string>();
  const statsInput = useMemo(() => (selectedLinkId ? { id: selectedLinkId } : undefined), [selectedLinkId]);
  const stats = trpc.dynamicQr.stats.useQuery(statsInput as { id: string }, { enabled: Boolean(statsInput) });
  const create = trpc.dynamicQr.create.useMutation({
    onSuccess: (record) => {
      utils.dynamicQr.list.invalidate();
      setSelectedLinkId(record.id);
      setNotice('Dynamic QR link saved to your account.');
    },
  });
  const update = trpc.dynamicQr.update.useMutation({
    onSuccess: () => {
      utils.dynamicQr.list.invalidate();
      stats.refetch();
      setNotice('Dynamic QR link updated.');
    },
  });
  const [draft, setDraft] = useState<DynamicQrDraft>({ id: 'spring-campaign', label: 'Spring campaign', destination: 'https://qrkit.example/campaign', active: true });
  const [notice, setNotice] = useState('');
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const error = validateDynamicQrDraft(draft);
  const selected = links.data?.find(link => link.id === selectedLinkId);
  const updateDraft = (key: keyof DynamicQrDraft, value: string | boolean) => setDraft(current => ({ ...current, [key]: value }));
  const loadLink = (link: NonNullable<typeof links.data>[number]) => {
    setSelectedLinkId(link.id);
    setDraft({ id: link.slug, label: link.label, destination: link.destination, active: link.active });
    setNotice('Loaded saved link.');
  };
  const save = () => {
    if (!isAuthenticated) {
      startLogin();
      return;
    }
    if (selectedLinkId) {
      update.mutate({ id: selectedLinkId, label: draft.label, destination: draft.destination, active: draft.active });
    } else {
      create.mutate({ slug: draft.id, label: draft.label, destination: draft.destination, active: draft.active });
    }
  };
  const toggleActive = () => {
    if (!selectedLinkId) return;
    update.mutate({ id: selectedLinkId, active: !draft.active });
    setDraft(current => ({ ...current, active: !current.active }));
  };

  return (
    <main className="container py-12 md:py-16">
      <RouteSeo title="Dynamic QR Workspace | QRKit" description="Create, manage, test, and measure redirect-based QR links with QRKit's authenticated workspace." path="/dynamic-qr" />
      <div className="max-w-4xl">
        <p className="eyebrow">09 / Dynamic workspace</p>
        <h1 className="mt-4 font-display text-5xl font-extrabold tracking-[-.07em] md:text-7xl">Manage a destination without reprinting the code.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6f746d]">Create a redirect-based QR link, test its real-world states, pause it when needed, and measure scans from one authenticated workspace.</p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
        <section className="paper-panel rounded-3xl border p-6 md:p-8">
          <div className="flex items-center gap-3 rounded-xl bg-[#dce9e5] p-4 text-sm text-[#0e5b5d]"><LockKeyhole size={18} /><span>{loading ? 'Checking authentication…' : isAuthenticated ? `Signed in as ${user?.name || user?.email || 'QRKit member'}.` : 'Draft mode / sign in to persist this link.'}</span></div>
          <div className="mt-8 grid gap-5">
            <label><span className="mb-2 block font-mono text-[.68rem] uppercase tracking-wider text-[#6f746d]">Slug</span><input className="field" value={draft.id} onChange={event => updateDraft('id', event.target.value)} pattern="[a-z0-9-]+" disabled={Boolean(selectedLinkId)} /></label>
            <label><span className="mb-2 block font-mono text-[.68rem] uppercase tracking-wider text-[#6f746d]">Label</span><input className="field" value={draft.label} onChange={event => updateDraft('label', event.target.value)} /></label>
            <label><span className="mb-2 block font-mono text-[.68rem] uppercase tracking-wider text-[#6f746d]">Destination URL</span><input className="field" value={draft.destination} onChange={event => updateDraft('destination', event.target.value)} type="url" /></label>
            <label className="flex items-center justify-between rounded-xl border border-[#d7d0c4] p-4"><span><span className="block font-display font-bold">Link active</span><span className="mt-1 block text-sm text-[#6f746d]">Inactive links return 404 from the redirect boundary.</span></span><input type="checkbox" checked={draft.active} onChange={event => updateDraft('active', event.target.checked)} /></label>
          </div>
          {error && <p className="mt-5 text-sm font-medium text-red-700">{error}</p>}
          <div className="mt-7 flex flex-wrap gap-3">
            {!isAuthenticated ? <button className="btn-primary" disabled={Boolean(error) || loading} onClick={save}><LogIn size={16} /> Sign in to save</button> : <button className="btn-primary" disabled={Boolean(error) || create.isPending || update.isPending} onClick={save}><Save size={16} /> {create.isPending || update.isPending ? 'Saving…' : selectedLinkId ? 'Update Dynamic QR' : 'Save Dynamic QR'}</button>}
            {selectedLinkId && <button className="btn-secondary" onClick={toggleActive}>{draft.active ? <Pause size={16} /> : <Play size={16} />} {draft.active ? 'Pause link' : 'Resume link'}</button>}
          </div>
          {create.error && <p className="mt-4 text-sm text-red-700">{create.error.message}</p>}
          {update.error && <p className="mt-4 text-sm text-red-700">{update.error.message}</p>}
          {notice && <p className="mt-4 text-sm text-[#0e5b5d]">{notice}</p>}
        </section>

        <section className="rounded-3xl border-2 border-[#0e5b5d] bg-[#dce9e5] p-6 md:p-8">
          <p className="eyebrow !text-[#0e5b5d]">Redirect preview</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-.05em]">{draft.label || 'Untitled link'}</h2>
          <div className="mt-8 rounded-2xl bg-[#fffdf8] p-5"><p className="font-mono text-xs uppercase tracking-wider text-[#6f746d]">Public path</p><code className="mt-3 block break-all text-sm text-[#0e5b5d]">{dynamicRedirectUrl(draft.id)}</code><p className="mt-5 font-mono text-xs uppercase tracking-wider text-[#6f746d]">Current target</p><p className="mt-2 break-all text-sm">{draft.destination}</p></div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#0e5b5d]/20 pt-5"><span className="font-mono text-xs uppercase tracking-wider">{draft.active ? 'ACTIVE' : 'PAUSED'}</span><a href={dynamicRedirectUrl(draft.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#0e5b5d]"><ExternalLink size={14} /> Open redirect</a></div>
          {isAuthenticated && <div className="mt-8 border-t border-[#0e5b5d]/20 pt-5"><p className="eyebrow !text-[#0e5b5d]">Your saved links</p>{links.isLoading ? <p className="mt-3 text-sm">Loading…</p> : links.data?.length ? <div className="mt-3 grid gap-2">{links.data.map(link => <button key={link.id} className={`flex items-center justify-between rounded-lg bg-[#fffdf8] p-3 text-left text-sm ${selectedLinkId === link.id ? 'ring-2 ring-[#ff5a36]' : ''}`} onClick={() => loadLink(link)}><span className="font-medium">{link.label}</span><span className="font-mono text-xs text-[#0e5b5d]">{link.active ? 'ACTIVE' : 'PAUSED'}</span></button>)}</div> : <p className="mt-3 text-sm text-[#5f655e]">No saved links yet.</p>}</div>}
        </section>
      </div>

      {isAuthenticated && selected && <section className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
        <DynamicQrAnalyticsPanel label={selected.label} stats={stats.data} isLoading={stats.isLoading} hasError={Boolean(stats.error)} />
        <div className="paper-panel rounded-3xl border p-6 md:p-8"><p className="eyebrow">Acceptance flow</p><h2 className="mt-2 font-display text-3xl font-extrabold tracking-[-.05em]">Verify before you print.</h2><div className="mt-6 grid gap-3">{acceptanceSteps.map(step => <label key={step.id} className="flex gap-3 rounded-xl border border-[#d7d0c4] bg-[#fffdf8] p-3 text-sm"><input type="checkbox" checked={Boolean(checks[step.id])} onChange={event => setChecks(current => ({ ...current, [step.id]: event.target.checked }))} /><span className={checks[step.id] ? 'text-[#0e5b5d] line-through' : ''}>{checks[step.id] && <Check size={14} className="mr-1 inline" />}{step.label}</span></label>)}</div><div className="mt-6 rounded-xl bg-[#f4eee4] p-4 text-sm text-[#6f746d]"><ClipboardCheck size={16} className="mr-2 inline text-[#ff5a36]" />{Object.values(checks).filter(Boolean).length}/{acceptanceSteps.length} checks complete. This checklist is local to this browser and does not replace a production scan test.</div></div>
      </section>}

      <div className="mt-10 flex flex-wrap gap-4 text-sm"><Link href="/pricing" className="inline-flex items-center gap-2 font-mono uppercase tracking-wider text-[#0e5b5d]">D1 / Pro setup <ArrowUpRight size={14} /></Link></div>
    </main>
  );
}
