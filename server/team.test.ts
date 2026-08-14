import { describe, expect, it } from 'vitest';
import { canInvite, canManageTeam, canShare, canUnshare, isSameTeam } from './team';

describe('team permission boundaries', () => {
  it('allows only owners to invite or change member roles', () => {
    expect(canInvite('owner')).toBe(true);
    expect(canInvite('editor')).toBe(false);
    expect(canInvite('viewer')).toBe(false);
  });

  it('allows owners and editors to share or unshare links, but not viewers', () => {
    expect(canShare('owner')).toBe(true);
    expect(canShare('editor')).toBe(true);
    expect(canShare('viewer')).toBe(false);
    expect(canUnshare('owner')).toBe(true);
    expect(canUnshare('editor')).toBe(true);
    expect(canUnshare('viewer')).toBe(false);
  });

  it('keeps team administration owner-only and rejects cross-team scope', () => {
    expect(canManageTeam('owner')).toBe(true);
    expect(canManageTeam('editor')).toBe(false);
    expect(isSameTeam(7, 7)).toBe(true);
    expect(isSameTeam(7, 8)).toBe(false);
  });
});
