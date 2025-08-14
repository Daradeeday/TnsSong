import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const day = searchParams.get('day');
  if (day) {
    const snap = await db.collection('requests').where('dayKey','==',day).where('status','==','APPROVED').orderBy('createdAt','asc').get();
    const items = snap.docs.map(d=> ({ id:d.id, ...d.data() }));
    return NextResponse.json({ day, items });
  } else {
    const days = await db.collection('digests').orderBy('dayKey','desc').limit(120).get();
    const list = days.docs.map(d=> d.data());
    return NextResponse.json({ days: list });
  }
}
