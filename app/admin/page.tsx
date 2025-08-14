
'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

type Req = { id:string; songTitle:string; artist:string; link?:string|null; message?:string|null; createdAt?: any };
type Group = { dayKey: string; items: Req[] };

export default function Admin(){
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(()=>{ (async()=>{ const r = await fetch('/api/admin/me'); if(!r.ok){ router.replace('/admin/login'); } else { setReady(true); } })(); }, [router]);

  const { data } = useQuery<{ groups: Group[] }>({
    enabled: ready,
    queryKey: ['requests-groups'],
    queryFn: async()=> (await fetch('/api/requests/all?days=30',{cache:'no-store'})).json()
  });

  async function logout(){ await fetch('/api/admin/logout', { method:'POST' }); router.replace('/admin/login'); }

  if(!ready) return null;

  return (
    <div className="container p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin — ลำดับคำขอตามวัน (มาก่อนได้ก่อน)</h1>
        <button onClick={logout} className="rounded-xl border px-4 py-2">ออกจากระบบ</button>
      </div>

      {(data?.groups||[]).map((g)=> (
        <section key={g.dayKey} className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">{g.dayKey}</h2>
          <div className="grid gap-2">
            {g.items.length === 0 && <p className="text-sm text-gray-500">— ไม่มีคำขอในวันนี้ —</p>}
            {g.items.map((x, idx)=> (
              <div key={x.id} className="flex items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm">{idx+1}</span>
                  <div>
                    <p className="font-medium">{x.songTitle} — {x.artist}</p>
                    {x.message && <p className="text-xs text-gray-500">ฝากบอก: {x.message}</p>}
                  </div>
                </div>
                {x.link && <a href={x.link} target="_blank" className="text-sm underline">ฟัง</a>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
