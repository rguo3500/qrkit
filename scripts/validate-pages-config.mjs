import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
const config=await readFile('wrangler.toml','utf8');
const match=config.match(/^pages_build_output_dir\s*=\s*"([^"]+)"/m);
if(!match)throw new Error('wrangler.toml is missing pages_build_output_dir');
const output=match[1];
await access(path.resolve(output));
console.log(`[Pages] wrangler.toml recognized pages_build_output_dir=${output}`);
console.log('[Pages] Static output directory exists; no Worker main entry is configured in this Pages file.');
