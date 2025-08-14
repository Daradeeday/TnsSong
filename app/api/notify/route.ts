
import { NextResponse } from 'next/server';
import { getDayKey, getTodayMood } from '@/lib/mood';
import { db } from '@/lib/firebase';
import { isAdminCookieValid } from '@/lib/admin';
import { lineNotify } from '@/lib/line';

export async function POST(){
  if(!isAdminCookieValid()) return NextResponse.json({ error:'unauthorized' }, { status: 401 });

  const cfgDoc = await db.collection('config').doc('main').get();
  const cfg = cfgDoc.exists ? cfgDoc.data()! : {};
  if(!cfg.lineToken && !process.env.LINE_NOTIFY_TOKEN) return NextResponse.json({ error: 'no token' }, { status: 400 });
  const token = cfg.lineToken || process.env.LINE_NOTIFY_TOKEN!;

  const dayKey = getDayKey();
  const mood = getTodayMood();
  const snap = await db.collection('requests').where('dayKey','==',dayKey).where('status','==','APPROVED').get();
  const items = snap.docs.map(d=> d.data() as any);
  const lines = [
    `ประกาศขอเพลง ${mood.emoji} ${mood.label} — ${dayKey}`,
    ...items.map((x:any,i:number)=> `${i+1}. ${x.songTitle} — ${x.artist}${x.message?` (ฝากบอก: ${x.message})`:''}`)
  ];
  await lineNotify(token, lines.join('\n'));
  await db.collection('digests').doc(dayKey).set({ dayKey, mood: mood.code, sentAt: new Date(), items }, { merge: true });
  return NextResponse.json({ ok: true, count: items.length });
}
