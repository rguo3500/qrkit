/* QRKit Signal Paper: exports are small pure helpers so browser downloads can be verified without coupling tests to a specific canvas implementation. */
export function exportFilename(label:string,extension:'png'|'svg'){const safe=label.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50)||'qrkit-code';return `${safe}.${extension}`}
export function svgToBlob(svg:string){return new Blob([svg],{type:'image/svg+xml'})}
export function canvasToPngBlob(canvas:HTMLCanvasElement){return new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Canvas export failed')),'image/png'))}
