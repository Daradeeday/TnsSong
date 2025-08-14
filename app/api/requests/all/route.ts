
import { NextResponse } from 'next/server';
import { isAdminCookieValid } from '@/lib/admin';
import { db } from '@/lib/firebase';

function getLastNDays(n: number){
  const out: string[] = [];
  const d = new Date();
  for(let i=0;i<n;i++){
    const dt = new Date(d.getTime() - i*24*60*60*1000);
    out.push(dt.toISOString().slice(0,10));
  }
  return out;
}

export async function GET(req: Request){
  if(!isAdminCookieValid()) return NextResponse.json({ error:'unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const daysParam = Math.max(1, Math.min(60, Number(searchParams.get('days')||'14'))); // 1..60
  const dayKeys = getLastNDays(daysParam);

  const groups: Array<{ dayKey: string; items: any[] }> = [];
  for (const dayKey of dayKeys) {
    const snap = await db.collection('requests').where('dayKey','==',dayKey).get();
    const items = snap.docs.map(d=> ({ id: d.id, ...d.data() }));
    // sort by createdAt ascending (first submission first)
    items.sort((a:any,b:any)=> (a.createdAt?.seconds||0) - (b.createdAt?.seconds||0));
    if (items.length > 0) { groups.push({ dayKey, items }); }
  }
  // Keep newest day first in response for convenience
  groups.sort((a,b)=> a.dayKey < b.dayKey ? 1 : -1);
  return NextResponse.json({ groups });
}
