import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { guidance, errorMessage, setActiveResult, clearActiveResult, subjectLabels, type QuizResult, type StudentProfile, type ProfileResponse } from '@/services/guidance';
import { HOLLAND_LABELS, type HollandType } from '@/pages/trac-nghiem/data/questions';
import { MI_LABELS, type MIType } from '@/pages/trac-nghiem/data/mi-questions';

function groupName(code: string) { return HOLLAND_LABELS[code as HollandType]?.name ?? MI_LABELS[code as MIType]?.name ?? code; }
export function ProfileDashboard() {
  const auth = useAuth();
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [profile, setProfile] = useState<StudentProfile>({ schoolName: '', grade: '', targetYear: new Date().getFullYear(), scores: {} });
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [historyBusy, setHistoryBusy] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<QuizResult[]>([]);
  useEffect(() => {
    let live = true;
    async function load() {
      await api.post('/api/me/quiz-results/claim');
      const [h, p] = await Promise.all([guidance.history(), api.get<ProfileResponse>('/api/me/profile')]);
      if (live) { setHistory(h); setProfile(old => ({ ...old, ...p.data.data })); setRevision(p.data.revision); }
    }
    load().catch(e => { if (live) setError(errorMessage(e)); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);
  async function remove(result: QuizResult) {
    setHistoryBusy(result.id); setError('');
    try {
      await guidance.deleteResult(result.id);
      clearActiveResult(result.id);
      setHistory(old => old.filter(item => item.id !== result.id));
      setDeleted(old => [...old, result]);
    } catch (e) { setError(errorMessage(e)); } finally { setHistoryBusy(null); }
  }
  async function undo(result: QuizResult) {
    setHistoryBusy(result.id); setError('');
    try {
      const restored = await guidance.restoreResult(result.id);
      setHistory(old => [...old, restored].sort((a,b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
      setDeleted(old => old.filter(item => item.id !== result.id));
    } catch (e) { setError(errorMessage(e)); } finally { setHistoryBusy(null); }
  }
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
      <div className="flex flex-wrap gap-3 items-center"><Button disabled={busy || loading}>{busy ? 'Đang lưu…' : 'Lưu hồ sơ'}</Button><Link className="text-primary underline" to="/xet-tuyen">Tra cứu với điểm đã lưu</Link></div>
      <p className="text-sm text-muted-foreground">Sau khi lưu hồ sơ, điểm và năm dự tuyển sẽ tự điền khi bạn mở trang tra cứu.</p>
    </form>
    <section className="space-y-3"><h2 className="text-2xl font-semibold">Lịch sử trắc nghiệm</h2>
      {loading && <p role="status">Đang tải hồ sơ và lịch sử…</p>}
      {!loading && !history.length && <p>Chưa có kết quả. <Link className="text-primary underline" to="/trac-nghiem">Bắt đầu làm bài</Link></p>}
      {deleted.map(item => <div key={item.id} className="bg-secondary rounded-xl p-4 flex flex-wrap gap-3 items-center" role="status"><span>Đã xóa {item.title} khỏi lịch sử.</span><Button variant="outline" disabled={historyBusy !== null} onClick={() => void undo(item)}>Hoàn tác</Button></div>)}
      {history.map(h => <article key={h.id} className="bg-white border rounded-xl p-4 space-y-3"><Link className="block rounded-lg hover:text-primary focus-visible:outline" to={`/dashboard/results/${h.id}`}><h3 className="font-semibold">{h.title} · Phiên bản {h.version}</h3><p>{new Date(h.createdAt).toLocaleString('vi-VN')} · {h.topCodes.map(groupName).join(' – ')}</p></Link>
        <p className="text-sm text-muted-foreground">{Object.entries(h.normalizedScores).map(([key, value]) => `${groupName(key)}: ${value.toFixed(1)}`).join(' · ')}</p>
        <div className="flex flex-wrap gap-3"><Button asChild variant="outline"><Link to={`/dashboard/results/${h.id}`}>Xem kết quả</Link></Button>
        {h.type === 'HOLLAND' && <Button asChild variant="outline"><Link to="/xet-tuyen" onClick={() => setActiveResult(h.id)}>Dùng kết quả này để tra cứu</Link></Button>}
        <Button variant="outline" className="text-destructive" disabled={historyBusy !== null} onClick={() => void remove(h)}>{historyBusy === h.id ? 'Đang xử lý…' : 'Xóa kết quả'}</Button></div>
      </article>)}
    </section>
  </main>;
}
