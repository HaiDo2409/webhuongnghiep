import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { guidance, activeResult, errorMessage, subjectLabels, type QuizResult, type RankingMode, type RecommendationResponse } from '@/services/guidance';
import { useBookmarks } from '@/hooks/useBookmarks';

export function BackendAdmissionsPage() {
  const auth = useAuth();
  const { toggle, isBookmarked } = useBookmarks();
  const [year, setYear] = useState(2026);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [mode, setMode] = useState<RankingMode>('COMBINED');
  const [quizId, setQuizId] = useState<string | null>(activeResult);
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [response, setResponse] = useState<RecommendationResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    if (auth?.isAuthenticated) guidance.history().then(data => { if (live) setHistory(data.filter(r => r.type === 'HOLLAND')); }).catch(() => {});
    return () => { live = false; };
  }, [auth?.isAuthenticated]);
  async function search(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setResponse(null);
    try { setResponse(await guidance.recommend(year, mode, scores, quizId)); }
    catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  }
  return <main className="max-w-5xl mx-auto px-4 py-10 space-y-6">
    <h1 className="text-3xl font-bold">Ngành và trường phù hợp với bạn</h1>
    <p className="text-gray-600">Kết quả Holland thay đổi thứ tự gợi ý. Tổng điểm môn học được tính riêng.</p>
    <form onSubmit={search} className="bg-white rounded-2xl border p-6 space-y-5">
      <div className="grid sm:grid-cols-3 gap-4">
        <label className="space-y-1">Năm tuyển sinh<input className="border rounded-lg p-2 w-full" type="number" required min={2000} max={2100} value={year} onChange={e => setYear(Number(e.target.value))} /></label>
        <label className="space-y-1">Sắp xếp<select className="border rounded-lg p-2 w-full" value={mode} onChange={e => setMode(e.target.value as RankingMode)}>
          <option value="COMBINED">Kết hợp</option><option value="POINTS">Theo tổng điểm</option><option value="INTEREST">Theo hướng nghiệp</option>
        </select></label>
        <label className="space-y-1">Kết quả Holland<select className="border rounded-lg p-2 w-full" value={quizId ?? ''} onChange={e => setQuizId(e.target.value || null)}>
          <option value="">Không áp dụng quiz</option>
          {quizId && !history.some(h => h.id === quizId) && <option value={quizId}>Kết quả vừa làm trong phiên này</option>}
          {history.map(h => <option key={h.id} value={h.id}>{h.topCodes.join('')} · {new Date(h.createdAt).toLocaleDateString('vi-VN')}</option>)}
        </select></label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{Object.entries(subjectLabels).map(([key, label]) => <label key={key}>{label}<input className="border rounded-lg p-2 w-full" type="number" min={0} max={10} step="0.01" placeholder="Chưa nhập" value={scores[key] ?? ''} onChange={e => {
        const value = e.target.value; setScores(old => { const next = { ...old }; if (value === '') delete next[key]; else next[key] = Number(value); return next; });
      }} /></label>)}</div>
      <div className="flex flex-wrap gap-3 items-center"><Button disabled={busy}>{busy ? 'Đang tra cứu…' : 'Xem đề xuất'}</Button><Link className="text-blue-600 underline" to="/trac-nghiem">Làm trắc nghiệm Holland</Link></div>
    </form>
    {error && <p role="alert" className="bg-red-50 p-4 rounded-xl text-red-700">{error} {quizId && <button className="underline" onClick={() => setQuizId(null)}>Bỏ kết quả quiz và thử lại</button>}</p>}
    {response && <>
      <p className="bg-amber-50 border border-amber-200 p-4 rounded-xl">{response.calculationNote}</p>
      {!response.items.length && <p>Chưa có chương trình được xuất bản cho năm này.</p>}
      <div className="grid md:grid-cols-2 gap-4">{response.items.map(item => <article key={item.program.id} className="bg-white border rounded-2xl p-5 space-y-3">
        <div className="flex justify-between gap-2"><h2 className="text-xl font-semibold">{item.program.major}</h2><button aria-label="Lưu ngành" aria-pressed={isBookmarked(`program-${item.program.id}`)} onClick={() => toggle({ id: `program-${item.program.id}`, type: 'school', name: item.program.major, subtitle: item.program.school, tag: item.program.shortName })}>{isBookmarked(`program-${item.program.id}`) ? '♥' : '♡'}</button></div>
        <p>{item.program.school} · {item.program.majorCode}</p>
        <p>Phù hợp Holland: <strong>{item.compatibility === null ? 'Chưa đánh giá' : `${item.compatibility.toFixed(1)}/100`}</strong></p>
        <p>Tổng ba môn: <strong>{item.rawScore === null ? 'Chưa đủ điểm' : `${item.rawScore.toFixed(2)}/30 (${item.bestGroup})`}</strong></p>
        {item.program.benchmark !== null && <p>Mốc tham khảo {item.program.benchmarkYear}: {item.program.benchmark}</p>}
        <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">{item.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
        {item.program.sourceUrl && <a className="text-blue-600 underline" href={item.program.sourceUrl} target="_blank" rel="noopener noreferrer">Nguồn dữ liệu</a>}
      </article>)}</div>
    </>}
  </main>;
}
