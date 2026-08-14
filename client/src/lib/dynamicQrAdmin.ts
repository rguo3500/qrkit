/* QRKit Signal Paper: management forms are explicit contracts; drafts stay local until authenticated D1 persistence is connected. */
export type DynamicQrDraft={id:string;label:string;destination:string;active:boolean};
export function validateDynamicQrDraft(draft:DynamicQrDraft){if(!draft.label.trim())return 'Add a label so the link is easy to manage.';if(!/^https?:\/\//i.test(draft.destination.trim()))return 'Destination must start with http:// or https://.';return ''}
export function dynamicRedirectUrl(id:string){return `/r/${encodeURIComponent(id)}`}
