import { cookies } from 'next/headers';
export function isAdminCookieValid(){ const c=cookies().get('admin_session')?.value; const t=process.env.ADMIN_TOKEN; return !!c && !!t && c===t; }
