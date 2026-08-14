import { describe, expect, it, vi } from 'vitest';
import { handleDynamicRedirect, type WorkerDynamicLink, type WorkerLinkRepository } from './redirect';

function repo(link:WorkerDynamicLink|null){return {get:vi.fn().mockResolvedValue(link),recordScan:vi.fn().mockResolvedValue(undefined)} satisfies WorkerLinkRepository}

describe('Worker Dynamic QR redirect',()=>{
  it('returns 302 for an active link and records the scan',async()=>{const repository=repo({id:'spring',qrCodeId:'qr-1',destination:'https://example.com/campaign',active:true});const response=await handleDynamicRedirect(new Request('https://qrkit.test/r/spring',{headers:{'user-agent':'Playwright','referer':'https://example.com'}}),'spring',repository);expect(response.status).toBe(302);expect(response.headers.get('location')).toBe('https://example.com/campaign');expect(repository.recordScan).toHaveBeenCalledWith(expect.objectContaining({qrCodeId:'qr-1',userAgent:'Playwright'}));});
  it('returns 404 and does not record inactive or missing links',async()=>{for(const link of [null,{id:'paused',qrCodeId:'qr-2',destination:'https://example.com/paused',active:false}]){const repository=repo(link);const response=await handleDynamicRedirect(new Request('https://qrkit.test/r/test'),'test',repository);expect(response.status).toBe(404);expect(repository.recordScan).not.toHaveBeenCalled();}});
});
