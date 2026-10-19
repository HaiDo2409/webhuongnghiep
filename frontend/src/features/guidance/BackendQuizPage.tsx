import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { guidance, errorMessage, setActiveResult, type QuizVersion, type QuizResult } from '@/services/guidance';
import { HOLLAND_LABELS, type HollandType } from '@/pages/trac-nghiem/data/questions';
import { MI_LABELS, type MIType } from '@/pages/trac-nghiem/data/mi-questions';
import { CareerResults } from '@/pages/trac-nghiem/CareerResults';
import type { Career } from '@/pages/trac-nghiem/data/careers';

function dimensionName(key: string) {
  return HOLLAND_LABELS[key as HollandType]?.name ?? MI_LABELS[key as MIType]?.name ?? key;
}

export function BackendQuizPage() {
  const [quizzes, setQuizzes] = useState<QuizVersion[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [careers, setCareers] = useState<Career[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    guidance.quizzes().then(data => {
      if (live) { setQuizzes(data); setSelectedId(data[0]?.id ?? ''); }
    }).catch(e => { if (live) setError(errorMessage(e)); }).finally(() => { if (live) setLoading(false); });
    api.get<Career[]>('/api/careers').then(r => { if (live) setCareers(r.data); }).catch(() => {});
    return () => { live = false; };
  }, []);

  const quiz = quizzes.find(q => q.id === selectedId);
  const question = quiz?.questions[questionIndex];
  function reset() { setAnswers({}); setQuestionIndex(0); setStarted(false); setResult(null); setError(''); }
  async function submit() {
    if (!quiz || busy) return;
    setBusy(true); setError('');
    try {
      const data = await guidance.submit(quiz.id, answers);
      setResult(data);
      if (data.type === 'HOLLAND') setActiveResult(data.id);
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }

  return <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
    <h1 className="text-3xl font-bold">Khám phá hướng nghiệp</h1>
    <p className="text-gray-600">Câu hỏi được quản lý theo phiên bản. Kết quả Holland có thể dùng để cá nhân hóa tra cứu ngành và trường.</p>
    {loading && <p role="status">Đang tải bộ câu hỏi…</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 text-red-700 p-4">{error}</p>}
    {!loading && !error && quizzes.length === 0 && <p>Chưa có bộ câu hỏi được xuất bản.</p>}
    <div className="flex flex-wrap gap-3">{quizzes.map(q => <Button key={q.id} variant={q.id === selectedId ? 'default' : 'outline'} disabled={busy} onClick={() => { reset(); setSelectedId(q.id); }}>{q.title}</Button>)}</div>
    {quiz && !started && !result && <section className="bg-white border rounded-2xl p-8 space-y-4">
      <h2 className="text-2xl font-semibold">{quiz.title}</h2>
      <p>{quiz.questions.length} câu hỏi · Phiên bản {quiz.version} · Thang trả lời 1–5.</p>
      <p className="text-gray-500">Hãy trả lời theo sở thích của bạn. Kết quả hỗ trợ khám phá, không quyết định bạn phải chọn một nghề duy nhất.</p>
      <Button onClick={() => setStarted(true)}>Bắt đầu</Button>
    </section>}
    {started && !result && question && quiz && <section className="bg-white border rounded-2xl p-6 space-y-6">
      <p>Câu {questionIndex + 1}/{quiz.questions.length} · Đã trả lời {Object.keys(answers).length} câu</p>
      <progress className="w-full" value={Object.keys(answers).length} max={quiz.questions.length} aria-label="Tiến độ làm bài" />
      <h2 className="text-xl font-semibold">{question.text}</h2>
      <div className="grid grid-cols-5 gap-2" role="group" aria-label="Chọn mức độ phù hợp">
        {[1, 2, 3, 4, 5].map(value => <button key={value} disabled={busy} aria-pressed={answers[question.id] === value} onClick={() => setAnswers(a => ({ ...a, [question.id]: value }))} className={`border rounded-xl py-4 ${answers[question.id] === value ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50'}`}>{value}</button>)}
      </div>
      <p className="text-sm text-gray-500">1: Hoàn toàn không đúng · 3: Phân vân · 5: Hoàn toàn đúng</p>
      <div className="flex justify-between gap-3">
        <Button variant="outline" disabled={busy || questionIndex === 0} onClick={() => setQuestionIndex(i => i - 1)}>Câu trước</Button>
        {questionIndex < quiz.questions.length - 1 ? <Button disabled={busy || answers[question.id] === undefined} onClick={() => setQuestionIndex(i => i + 1)}>Câu tiếp</Button> : <Button disabled={busy || Object.keys(answers).length !== quiz.questions.length} onClick={submit}>{busy ? 'Đang chấm…' : 'Xem kết quả'}</Button>}
      </div>
    </section>}
    {result && <section className="space-y-6">
      <div className="bg-blue-700 text-white p-8 rounded-2xl space-y-3">
        <h2 className="text-2xl font-bold">{result.type === 'HOLLAND' ? `Mã Holland: ${result.topCodes.join('')}` : 'Các nhóm nổi bật của bạn'}</h2>
        <p>{result.topCodes.map(dimensionName).join(' · ')}</p>
        <p className="text-sm">Phiên bản {result.version} · Điểm chuẩn hóa theo số câu thực tế mỗi nhóm.</p>
        {Math.max(...Object.values(result.normalizedScores)) - Math.min(...Object.values(result.normalizedScores)) < 5 && <p>Các nhóm có điểm gần nhau. Thứ tự nhóm chỉ có tính tham khảo; hãy khám phá nhiều hướng nghề nghiệp.</p>}
      </div>
      <div className="bg-white rounded-2xl border p-6 space-y-4">{Object.entries(result.normalizedScores).map(([key, score]) => <div key={key}>
        <div className="flex justify-between"><span>{dimensionName(key)}</span><span>{score.toFixed(1)}/100</span></div>
        <progress className="w-full" max={100} value={score} aria-label={dimensionName(key)} />
      </div>)}</div>
      {result.type === 'HOLLAND' && <>
        <Button asChild><Link to="/xet-tuyen">Tra cứu ngành và trường theo kết quả này</Link></Button>
        <CareerResults topCodes={result.topCodes as HollandType[]} careers={careers.filter(c => c.codes.some(code => result.topCodes.includes(code))).slice(0, 8)} />
      </>}
      <p className="text-sm text-gray-500">Nếu chưa đăng nhập, kết quả tạm gắn với phiên trình duyệt. Đăng nhập để lưu vào lịch sử.</p>
      <Button variant="outline" onClick={reset}>Làm lại</Button>
    </section>}
  </main>;
}
