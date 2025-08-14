
export type MoodInfo = { code: string; label: string; emoji: string; color: string };
export function getTodayMood(date = new Date()): MoodInfo {
  const wd = (date.getDay() + 6) % 7; // Mon=0..Sun=6
  switch (wd) {
    case 0: return { code: 'MON_LOVE', label: 'เพลงรัก (ไทย/สากล)', emoji: '💛', color: '#FFD54F' };
    case 1: return { code: 'TUE_SAD', label: 'เพลงเศร้า (ไทย/สากล)', emoji: '🩷', color: '#F8BBD0' };
    case 2: return { code: 'WED_KT', label: 'K‑pop / T‑pop', emoji: '💚', color: '#A5D6A7' };
    case 3: return { code: 'THU_LUK', label: 'ลูกทุ่ง‑ลูกกรุง', emoji: '🧡', color: '#FFCC80' };
    case 4: return { code: 'FRI_FREE', label: 'ฟรีสไตล์ & ฝากบอก', emoji: '🩵', color: '#81D4FA' };
    default: return { code: 'MON_LOVE', label: 'เพลงรัก (ไทย/สากล)', emoji: '💛', color: '#FFD54F' };
  }
}
export function getDayKey(d = new Date()){ return d.toISOString().slice(0,10); }
