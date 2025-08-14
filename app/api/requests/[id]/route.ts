
import { NextResponse } from 'next/server';
import { isAdminCookieValid } from '@/lib/admin';
import { db } from '@/lib/firebase';

export async function PATCH(_req: Request, { params }: { params: { id: string } }){
  if(!isAdminCookieValid()) return NextResponse.json({ error:'unauthorized' }, { status: 401 });
  const id = params.id;
  await db.collection('requests').doc(id).update({ status: 'APPROVED' });
  const updated = (await db.collection('requests').doc(id).get()).data();
  return NextResponse.json({ id, ...updated });
}
