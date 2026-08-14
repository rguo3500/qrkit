import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./db', () => ({ getDb: vi.fn() }));

import { getDb } from './db';
import { inviteMember, listMembers, listSharedLinks, shareDynamicLink, unshareDynamicLink, updateMemberRole } from './team';

const mockedGetDb = vi.mocked(getDb);

function membershipDb(membership: unknown, linkOwned = true) {
  let selectCount = 0;
  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: vi.fn(async () => { selectCount += 1; if (selectCount > 1) return linkOwned ? [{ id: 88 }] : []; return membership ? [membership] : []; }) })),
      })),
    })),
  };
}

describe('team repository integration boundaries', () => {
  beforeEach(() => vi.resetAllMocks());

  it('rejects viewer sharing and editor invitation before writes', async () => {
    mockedGetDb.mockResolvedValue(membershipDb({ teamId: 7, userId: 2, role: 'viewer', status: 'active' }) as never);
    await expect(shareDynamicLink(2, 7, 88)).rejects.toThrow('FORBIDDEN');

    mockedGetDb.mockResolvedValue(membershipDb({ teamId: 7, userId: 2, role: 'editor', status: 'active' }) as never);
    await expect(inviteMember(2, 7, 'person@example.com', 'viewer')).rejects.toThrow('FORBIDDEN');
    mockedGetDb.mockResolvedValue(membershipDb({ teamId: 7, userId: 2, role: 'editor', status: 'active' }) as never);
    await expect(updateMemberRole(2, 7, 91, 'viewer')).rejects.toThrow('FORBIDDEN');
    mockedGetDb.mockResolvedValue(membershipDb({ teamId: 7, userId: 2, role: 'viewer', status: 'active' }) as never);
    await expect(unshareDynamicLink(2, 7, 88)).rejects.toThrow('FORBIDDEN');
  });

  it('rejects members and shared links queries when the user is not active in the requested team', async () => {
    mockedGetDb.mockResolvedValue(membershipDb(null) as never);
    await expect(listMembers(2, 8)).rejects.toThrow('FORBIDDEN');
    mockedGetDb.mockResolvedValue(membershipDb(null) as never);
    await expect(listSharedLinks(2, 8)).rejects.toThrow('FORBIDDEN');
    mockedGetDb.mockResolvedValue(membershipDb(null) as never);
    await expect(shareDynamicLink(2, 8, 88)).rejects.toThrow('FORBIDDEN');
    mockedGetDb.mockResolvedValue(membershipDb(null) as never);
    await expect(unshareDynamicLink(2, 8, 88)).rejects.toThrow('FORBIDDEN');
  });

  it('shares and unshares a link for an active owner and rejects an unowned link', async () => {
    const insert = vi.fn(() => ({ values: vi.fn(() => ({ onDuplicateKeyUpdate: vi.fn(async () => undefined) })) }));
    const remove = vi.fn(() => ({ where: vi.fn(async () => [{ affectedRows: 1 }]) }));
    const ownerDb = () => {
      const db = membershipDb({ teamId: 7, userId: 2, role: 'owner', status: 'active' }, true) as ReturnType<typeof membershipDb> & { insert: typeof insert; delete: typeof remove };
      db.insert = insert;
      db.delete = remove;
      return db;
    };
    mockedGetDb.mockResolvedValue(ownerDb() as never);
    await expect(shareDynamicLink(2, 7, 88)).resolves.toEqual({ teamId: 7, dynamicLinkId: 88, shared: true });
    mockedGetDb.mockResolvedValue(ownerDb() as never);
    await expect(unshareDynamicLink(2, 7, 88)).resolves.toEqual({ teamId: 7, dynamicLinkId: 88, removed: true });

    const noOwned = () => {
      const db = membershipDb({ teamId: 7, userId: 2, role: 'owner', status: 'active' }, false) as ReturnType<typeof membershipDb> & { insert: typeof insert };
      db.insert = insert;
      return db;
    };
    mockedGetDb.mockResolvedValue(noOwned() as never);
    await expect(shareDynamicLink(2, 7, 999)).rejects.toThrow('NOT_FOUND');
  });
});
