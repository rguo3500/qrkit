import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Share2, UserPlus, Users } from 'lucide-react';
import { Link } from 'wouter';
import RouteSeo from '../components/RouteSeo';
import { startLogin } from '../const';
import { isUnauthorizedError } from '../lib/authErrors';
import { trpc } from '../lib/trpc';

type EditableRole = 'owner' | 'editor' | 'viewer';

export default function TeamPage() {
  const utils = trpc.useUtils();
  const teams = trpc.team.list.useQuery();
  const links = trpc.dynamicQr.list.useQuery();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const activeTeamId = selectedTeamId ?? teams.data?.[0]?.id ?? null;
  const members = trpc.team.members.useQuery({ teamId: activeTeamId! }, { enabled: Boolean(activeTeamId) });
  const sharedLinks = trpc.team.sharedLinks.useQuery({ teamId: activeTeamId! }, { enabled: Boolean(activeTeamId) });
  const [teamName, setTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [shareLinkId, setShareLinkId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');
  const selectedTeam = useMemo(() => teams.data?.find(team => team.id === activeTeamId), [teams.data, activeTeamId]);
  const showError = (error: { message?: string }) => { setErrorNotice(error.message || 'The request could not be completed.'); setNotice(''); };
  const clearMessages = () => { setNotice(''); setErrorNotice(''); };

  const createTeam = trpc.team.create.useMutation({
    onSuccess: () => { setTeamName(''); setNotice('Team created.'); setErrorNotice(''); void utils.team.list.invalidate(); },
    onError: showError,
  });
  const invite = trpc.team.invite.useMutation({
    onSuccess: result => { setInviteEmail(''); setNotice(`Invitation queued for ${result.email}.`); setErrorNotice(''); void utils.team.members.invalidate(); },
    onError: showError,
  });
  const updateRole = trpc.team.updateRole.useMutation({
    onSuccess: () => { setNotice('Member role updated.'); setErrorNotice(''); void utils.team.members.invalidate(); },
    onError: showError,
  });
  const share = trpc.team.shareLink.useMutation({
    onSuccess: () => { setNotice('Dynamic QR shared with this team.'); setErrorNotice(''); void utils.team.sharedLinks.invalidate(); },
    onError: showError,
  });
  const unshare = trpc.team.unshareLink.useMutation({
    onSuccess: () => { setNotice('Dynamic QR removed from this team.'); setErrorNotice(''); void utils.team.sharedLinks.invalidate(); },
    onError: showError,
  });
  const isOwner = selectedTeam?.role === 'owner';
  const queryError = teams.error || members.error || sharedLinks.error;

  useEffect(() => {
    if (isUnauthorizedError(teams.error) || isUnauthorizedError(members.error) || isUnauthorizedError(sharedLinks.error)) {
      startLogin();
    }
  }, [teams.error, members.error, sharedLinks.error]);

  return (
    <main className="container py-12 md:py-16">
      <RouteSeo title="Team QR Workspace | QRKit" description="Invite teammates, assign roles, and share Dynamic QR links with a controlled workspace." path="/teams" />
      <div className="max-w-3xl"><p className="eyebrow">11 / Team workspace</p><h1 className="mt-4 font-display text-5xl font-extrabold tracking-[-.07em] md:text-7xl">Share the destination, not the password.</h1><p className="mt-6 text-lg leading-8 text-[#6f746d]">Create a small QR workspace with explicit owner, editor, and viewer boundaries. Invitations remain pending until the recipient signs in with the matching email.</p></div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
        <section className="paper-panel rounded-3xl border p-6 md:p-8">
          <div className="flex items-center gap-3"><Users className="text-[#0e5b5d]" size={20} /><h2 className="font-display text-2xl font-bold">Your teams</h2></div>
          <div className="mt-6 grid gap-3">
            {teams.isLoading ? <p className="text-sm text-[#6f746d]">Loading teams…</p> : teams.error ? <p className="rounded-xl bg-[#fff0eb] p-3 text-sm text-[#9d321b]">Unable to load teams. Please sign in again.</p> : teams.data?.length ? teams.data.map(team => <button key={team.id} onClick={() => { clearMessages(); setSelectedTeamId(String(team.id)); }} className={`rounded-2xl border p-4 text-left transition ${team.id === activeTeamId ? 'border-[#0e5b5d] bg-[#dce9e5]' : 'border-[#d7d0c4] bg-[#fffdf8]'}`}><span className="font-display text-lg font-bold">{team.name}</span><span className="mt-1 block font-mono text-xs uppercase tracking-wider text-[#6f746d]">{team.role} · {team.status}</span></button>) : <p className="rounded-2xl border border-dashed border-[#b7b0a3] p-4 text-sm text-[#6f746d]">No team yet. Create one to start sharing.</p>}
          </div>
          <div className="mt-8 border-t border-[#d7d0c4] pt-6"><label className="block"><span className="mb-2 block font-mono text-[.68rem] uppercase tracking-wider text-[#6f746d]">New team name</span><input className="field" value={teamName} onChange={event => setTeamName(event.target.value)} placeholder="Studio North" /></label><button className="btn-primary mt-3" disabled={!teamName.trim() || createTeam.isPending} onClick={() => { clearMessages(); createTeam.mutate({ name: teamName.trim() }); }}>{createTeam.isPending ? 'Creating…' : 'Create team'} <ArrowUpRight size={15} /></button></div>
        </section>
        <section className="paper-panel rounded-3xl border p-6 md:p-8">
          <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><UserPlus className="text-[#ff5b2e]" size={20} /><h2 className="font-display text-2xl font-bold">Members</h2></div>{selectedTeam && <span className="font-mono text-xs uppercase tracking-wider text-[#6f746d]">{selectedTeam.role}</span>}</div>
          {queryError && activeTeamId && <p className="mt-4 rounded-xl bg-[#fff0eb] p-3 text-sm text-[#9d321b]">Unable to load the selected team data. Check your membership and try again.</p>}
          {activeTeamId ? <>
            <div className="mt-6 grid gap-3">{members.isLoading ? <p className="text-sm text-[#6f746d]">Loading members…</p> : members.data?.length ? members.data.map(member => <div key={member.id} className="flex flex-col gap-3 rounded-xl border border-[#d7d0c4] bg-[#fffdf8] p-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span>{member.email}</span><div className="flex items-center gap-3"><span className="font-mono text-xs uppercase text-[#6f746d]">{member.status}</span>{isOwner && member.role !== 'owner' ? <select className="field max-w-[8rem] py-2" value={member.role} aria-label={`Role for ${member.email}`} disabled={updateRole.isPending} onChange={event => { clearMessages(); updateRole.mutate({ teamId: activeTeamId!, memberId: String(member.id), role: event.target.value as EditableRole }); }}><option value="viewer">Viewer</option><option value="editor">Editor</option></select> : <span className="font-mono text-xs uppercase text-[#6f746d]">{member.role}</span>}</div></div>) : <p className="text-sm text-[#6f746d]">No members found for this team.</p>}</div>
            <div className="mt-6 grid gap-3 border-t border-[#d7d0c4] pt-6"><input className="field" value={inviteEmail} onChange={event => setInviteEmail(event.target.value)} placeholder="teammate@example.com" type="email" aria-label="Invite email" /><div className="flex flex-wrap gap-3"><select className="field max-w-[12rem]" value={inviteRole} onChange={event => setInviteRole(event.target.value as 'editor' | 'viewer')} aria-label="Invite role"><option value="viewer">Viewer</option><option value="editor">Editor</option></select><button className="btn-secondary" disabled={!inviteEmail || invite.isPending || !isOwner} onClick={() => { clearMessages(); invite.mutate({ teamId: activeTeamId!, email: inviteEmail, role: inviteRole }); }}>{invite.isPending ? 'Inviting…' : 'Invite member'}</button></div>{!isOwner && <p className="text-xs text-[#6f746d]">Only team owners can invite members or change roles.</p>}</div>
            <div className="mt-8 border-t border-[#d7d0c4] pt-6"><div className="flex items-center gap-3"><Share2 className="text-[#0e5b5d]" size={18} /><h3 className="font-display text-xl font-bold">Share a Dynamic QR</h3></div><div className="mt-4 flex flex-wrap gap-3"><select className="field min-w-[14rem]" aria-label="Dynamic QR to share" value={shareLinkId ?? ''} onChange={event => setShareLinkId(event.target.value || null)}><option value="">Choose a link</option>{links.data?.map(link => <option key={link.id} value={link.id}>{link.label} · /r/{link.slug}</option>)}</select><button className="btn-secondary" disabled={!shareLinkId || share.isPending || (!isOwner && selectedTeam?.role !== 'editor')} onClick={() => shareLinkId && share.mutate({ teamId: activeTeamId!, dynamicLinkId: shareLinkId })}>{share.isPending ? 'Sharing…' : 'Share link'}</button></div><div className="mt-4 grid gap-2">{sharedLinks.isLoading ? <p className="text-sm text-[#6f746d]">Loading shared links…</p> : sharedLinks.data?.length ? sharedLinks.data.map(link => <div key={link.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#dce9e5] p-3 text-sm"><span><strong>{link.label}</strong><span className="ml-2 text-[#0e5b5d]">/r/{link.slug}</span></span>{(isOwner || selectedTeam?.role === 'editor') && <button className="font-mono text-[.68rem] uppercase tracking-wider text-[#9d321b] underline" disabled={unshare.isPending} onClick={() => { clearMessages(); unshare.mutate({ teamId: activeTeamId!, dynamicLinkId: String(link.id) }); }}>{unshare.isPending ? 'Removing…' : 'Remove share'}</button>}</div>) : <p className="text-sm text-[#6f746d]">No shared links yet.</p>}</div></div>
          </> : <p className="mt-8 rounded-2xl border border-dashed border-[#b7b0a3] p-5 text-sm text-[#6f746d]">Select or create a team to manage members and shared links.</p>}
          {notice && <p className="mt-6 rounded-xl bg-[#dce9e5] p-3 text-sm text-[#0e5b5d]">{notice}</p>}{errorNotice && <p className="mt-6 rounded-xl bg-[#fff0eb] p-3 text-sm text-[#9d321b]">{errorNotice}</p>}
        </section>
      </div>
      <p className="mt-8 text-sm text-[#6f746d]">Need to manage Dynamic QR destinations? <Link href="/dynamic-qr" className="text-[#0e5b5d] underline">Open your Dynamic QR workspace</Link>.</p>
    </main>
  );
}
