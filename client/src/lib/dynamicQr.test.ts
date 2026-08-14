import { describe, expect, it, vi } from 'vitest';
import { resolveDynamicQr, type DynamicQrRepository } from './dynamicQr';

describe('Dynamic QR redirect contract',()=>{
  it('redirects an active link and records a scan',async()=>{const record={id:'abc',qrCodeId:'qr-1',destination:'https://example.com/campaign',active:true,createdAt:'',updatedAt:''};const repository:DynamicQrRepository={getById:vi.fn().mockResolvedValue(record),recordScan:vi.fn().mockResolvedValue(undefined)};const result=await resolveDynamicQr('abc',repository,{country:'US'});expect(result.status).toBe(302);expect(result.location).toBe(record.destination);expect(repository.recordScan).toHaveBeenCalledWith(expect.objectContaining({qrCodeId:'qr-1',country:'US'}));});
  it('returns 404 without recording a scan for missing or inactive links',async()=>{const repository:DynamicQrRepository={getById:vi.fn().mockResolvedValue(null),recordScan:vi.fn()};const result=await resolveDynamicQr('missing',repository);expect(result).toEqual({status:404,location:null,record:null});expect(repository.recordScan).not.toHaveBeenCalled();});
});
