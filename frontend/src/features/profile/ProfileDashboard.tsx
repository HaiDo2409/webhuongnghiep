import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { guidance, errorMessage, setActiveResult, subjectLabels, type QuizResult } from '@/services/guidance';

interface Profile { schoolName: string; grade: string; targetYear: number; scores: Record<string, number> }
interface ProfileResponse { data: Partial<Profile>; revision: number }
export function ProfileDashboard() {
  const auth = useAuth();
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [profile, setProfile] = useState<Profile>({ schoolName: '', grade: '', targetYear: 2026, scores: {} });
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    let live = true;
    async function load() {
      await api.post('/api/me/quiz-results/claim');
      const [h, p] = await Promise.all([guidance.history(), api.get<ProfileResponse>('/api/me/profile')]);
      if (live) { setHistory(h); setProfile(old => ({ ...old, ...p.data.data })); setRevision(p.data.revision); }
    }
    load().catch(e => { if (live) setError(errorMessage(e)); });
    return () => { live = false; };
  }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { const r = await api.put<ProfileResponse>('/api/me/profile', { ...profile, revision }); setRevision(r.data.revision); setMessage('Đã lưu hồ sơ.'); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  return <main className="max-w-5xl mx-auto px-4 py-10 space-y-6">
    <h1 className="text-3xl font-bold">Hồ sơ của {auth?.isAuthenticated ? auth.user.displayName : 'bạn'}</h1>
    {auth?.isAuthenticated && (auth.user.permissions & 1n) === 1n && <Button asChild><Link to="/admin">Quản trị nội dung</Link></Button>}
    {error && <p role="alert" className="text-red-700 bg-red-50 rounded-xl p-4">{error}</p>}
    {message && <p role="status">{message}</p>}
    <form className="bg-white border rounded-2xl p-6 space-y-4" onSubmit={save}>
      <h2 className="text-xl font-semibold">Thông tin học tập</h2>
      <div className="grid sm:grid-cols-3 gap-3"><label>Trường đang học<input className="border rounded-lg p-2 w-full" maxLength={255} value={profile.schoolName} onChange={e => setProfile(p => ({ ...p, schoolName: e.target.value }))} /></label><label>Lớp<input className="border rounded-lg p-2 w-full" maxLength={50} value={profile.grade} onChange={e => setProfile(p => ({ ...p, grade: e.target.value }))} /></label><label>Năm dự tuyển<input className="border rounded-lg p-2 w-full" type="number" required min={2000} max={2100} value={profile.targetYear} onChange={e => setProfile(p => ({ ...p, targetYear: Number(e.target.value) }))} /></label></div>
      <div className="grid grid-cols-3 gap-3">{Object.entries(subjectLabels).map(([key, label]) => <label key={key}>{label}<input className="border rounded-lg p-2 w-full" type="number" min={0} max={10} step="0.01" value={profile.scores[key] ?? ''} onChange={e => { const value = e.target.value; setProfile(p => { const scores = { ...p.scores }; if (value === '') delete scores[key]; else scores[key] = Number(value); return { ...p, scores }; }); }} /></label>)}</div>
      <Button disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu hồ sơ'}</Button>
    </form>
    <section className="space-y-3"><h2 className="text-2xl font-semibold">Lịch sử trắc nghiệm</h2>
      {!history.length && <p>Chưa có kết quả. <Link className="text-blue-600 underline" to="/trac-nghiem">Bắt đầu làm bài</Link></p>}
      {history.map(h => <article key={h.id} className="bg-white border rounded-xl p-4 space-y-2"><h3 className="font-semibold">{h.title} · Phiên bản {h.version}</h3><p>{new Date(h.createdAt).toLocaleString('vi-VN')} · {h.topCodes.join(' – ')}</p>
        <p className="text-sm text-gray-500">{Object.entries(h.normalizedScores).map(([key, value]) => `${key}: ${value.toFixed(1)}`).join(' · ')}</p>
        {h.type === 'HOLLAND' && <Button asChild variant="outline"><Link to="/xet-tuyen" onClick={() => setActiveResult(h.id)}>Dùng kết quả này để tra cứu</Link></Button>}
      </article>)}
    </section>
  </main>;
}
