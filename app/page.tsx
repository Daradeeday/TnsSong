
'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getTodayMood } from '@/lib/mood';
function Input(props:any){ return <input {...props} className={`input ${props.className||''}`} />; }
function Textarea(props:any){ return <textarea {...props} className={`input ${props.className||''}`} />; }
export default function Home(){
  const mood = getTodayMood();
  const [form, setForm] = useState({ songTitle:'', artist:'', link:'', message:'' });
  const [submitted, setSubmitted] = useState(false);
  const create = useMutation({
    mutationFn: async()=> {
      const res = await fetch('/api/requests',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form)});
      if(!res.ok){
        const j = await res.json().catch(()=>({}));
        if (j?.error === 'duplicate' || j?.error === 'limit') throw new Error('วันนี้คุณส่งไปแล้ว');
        if (j?.error === 'closed') throw new Error('ปิดรับคำขอประจำวันแล้ว');
        throw new Error('ส่งไม่สำเร็จ');
      }
      return res.json();
    },
    onSuccess(){ setSubmitted(true); setForm({ songTitle:'', artist:'', link:'', message:''}); }
  });
  const isFriday = mood.code === 'FRI_FREE';
  return (
    <div className="min-h-screen">
      <header className="container py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="logo" className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Tns Song</h1>
          </div>
          <span className="rounded-full px-4 py-1 text-sm" style={{background:mood.color}}>{mood.emoji} {mood.label}</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">Developed by <b>Ddech production</b></p>
      </header>
      <main className="container pb-24">
        <section className="card max-w-2xl mx-auto">
          <h2 className="mb-4 text-xl font-semibold">ขอเพลงสำหรับวันนี้</h2>
          {!submitted ? (
            <div className="grid gap-3">
              <Input placeholder="ชื่อเพลง" value={form.songTitle} onChange={e=>setForm(f=>({...f, songTitle:e.target.value}))} />
              <Input placeholder="ศิลปิน" value={form.artist} onChange={e=>setForm(f=>({...f, artist:e.target.value}))} />
              <Input placeholder="ลิงก์ (YouTube/Spotify) — ไม่บังคับ" value={form.link} onChange={e=>setForm(f=>({...f, link:e.target.value}))} />
              {isFriday && <Textarea rows={3} placeholder="ฝากบอก (เฉพาะวันศุกร์)" value={form.message} onChange={e=>setForm(f=>({...f, message:e.target.value}))} />}
              <button onClick={()=>create.mutate()} disabled={create.isPending} className="btn btn-primary mt-2">ส่งคำขอ</button>
              <p className="text-muted">* ไม่ต้องกรอกข้อมูลส่วนตัว • จำกัด 1 รายการ/วัน/คน • รายการที่ส่งจะไม่ถูกแสดง</p>
              {create.isError && <p className="text-sm text-red-600">{(create.error as Error).message}</p>}
            </div>
          ) : (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">✅ ส่งคำขอเรียบร้อยแล้ว ขอบคุณมาก! — วันนี้ไม่สามารถส่งซ้ำได้</div>
          )}
        </section>
      </main>
    </div>
  );
}
