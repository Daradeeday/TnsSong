
import { NextResponse } from 'next/server';
import { requestSchema } from '@/lib/validators';
import { getTodayMood, getDayKey } from '@/lib/mood';
import { db } from '@/lib/firebase';

function parseCookie(header: string| null){
  const out: Record<string,string> = {};
  if(!header) return out;
  header.split(';').forEach(p=>{
    const i = p.indexOf('=');
    if(i>0){ const k = p.slice(0,i).trim(); const v = p.slice(i+1).trim(); out[k] = decodeURIComponent(v); }
  });
  return out;
}

export async function GET(){
  const dayKey = getDayKey();
  const snap = await db.collection('requests').where('dayKey','==',dayKey).get();
  return NextResponse.json({ count: snap.size });
}

export async function POST(req: Request){
  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if(!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const ip = (req.headers.get('x-forwarded-for')||'').split(',')[0] || 'unknown';
  const cookies = parseCookie(req.headers.get('cookie'));
  const dayKey = getDayKey();
  const today = getTodayMood();

  const cfgDoc = db.collection('config').doc('main');
  const cfgSnap = await cfgDoc.get();
  let cfg = cfgSnap.exists ? cfgSnap.data()! : { closeHour: 20, maxPerUser: 1 };
  if (!cfgSnap.exists) await cfgDoc.set(cfg);

  const now = new Date();
  if (now.getHours() >= (cfg.closeHour||20)) return NextResponse.json({ error: 'closed' }, { status: 403 });
  if (cookies[`submitted_${dayKey}`] === '1') return NextResponse.json({ error: 'duplicate' }, { status: 429 });

  const dupSnap = await db.collection('requests').where('dayKey','==',dayKey).where('ipHash','==',ip).get();
  if (!dupSnap.empty) return NextResponse.json({ error: 'limit' }, { status: 429 });

  const { songTitle, artist, link, message } = parsed.data;
  const createdRef = await db.collection('requests').add({
    songTitle, artist, link: link||null, message: message||null,
    dayKey, mood: today.code, status: 'PENDING',
    ipHash: ip, createdAt: new Date()
  });

  const res = NextResponse.json({ ok:true, id: createdRef.id }, { status: 201 });
  res.headers.append('Set-Cookie', `submitted_${dayKey}=1; Path=/; Max-Age=86400; SameSite=Lax`);
  return res;
}
