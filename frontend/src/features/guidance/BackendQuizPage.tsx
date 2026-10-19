import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock3, Fingerprint, Frown, Heart, Keyboard, Laugh, Lightbulb, LockKeyhole, Meh, Smile } from 'lucide-react';
import { guidance, errorMessage, setActiveResult, type QuizVersion, type QuizResult } from '@/services/guidance';
import { QuizResults } from './QuizResults';

const choices = [
  { value: 1, label: 'Rất không đúng', Icon: Frown },
  { value: 2, label: 'Không đúng lắm', Icon: Meh },
  { value: 3, label: 'Mình còn phân vân', Icon: Smile },
  { value: 4, label: 'Khá đúng với mình', Icon: Laugh },
  { value: 5, label: 'Rất đúng với mình', Icon: Heart },
];
export function BackendQuizPage() {
  const [quizzes, setQuizzes] = useState<QuizVersion[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    let live = true;
    guidance.quizzes().then(data => { if (live) { setQuizzes(data); setSelectedId(data.find(q => q.type === 'HOLLAND')?.id ?? data[0]?.id ?? ''); } })
      .catch(e => { if (live) setError(errorMessage(e)); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [reload]);
  const quiz = quizzes.find(q => q.id === selectedId);
  const question = quiz?.questions[questionIndex];
  useEffect(() => { if (started && !result) heading.current?.focus({ preventScroll: true }); }, [questionIndex, started, result]);
  useEffect(() => {
    if (!started || result || !question || busy) return;
    const id = question.id;
    function keyAnswer(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey || !/^[1-5]$/.test(event.key)) return;
      if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
      event.preventDefault(); setAnswers(old => ({ ...old, [id]: Number(event.key) }));
    }
    document.addEventListener('keydown', keyAnswer);
    return () => document.removeEventListener('keydown', keyAnswer);
  }, [started, result, question, busy]);
  function reset() { setAnswers({}); setQuestionIndex(0); setStarted(false); setResult(null); setError(''); }
  function retry() { setError(''); setLoading(true); setReload(v => v + 1); }
  async function submit() {
    if (!quiz || busy) return;
    setBusy(true); setError('');
    try { const data = await guidance.submit(quiz.id, answers); setResult(data); if (data.type === 'HOLLAND') setActiveResult(data.id); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  if (result) return <QuizResults result={result} onReset={reset} />;
  return <main className="quiz-page page-enter">
    {error && <div role="alert" className="notice notice-error mt-6"><span>{error}</span>{!quizzes.length && <button className="underline shrink-0" onClick={retry}>Thử lại</button>}</div>}
    {!started ? <>
      <header className="quiz-intro"><p className="eyebrow"><span className="status-dot" />MỘT CHÚT THỜI GIAN CHO CHÍNH MÌNH</p><h1>Bạn có nhiều điều hay.<br /><span>Mình cùng khám phá nhé.</span></h1><p>Không có đáp án đúng hay sai. Chỉ có những điều giống bạn, và những điều chưa giống lắm.</p></header>
      {loading && <div className="loading-panel" role="status"><span className="spinner" /><p>Đang chuẩn bị hành trình của bạn…</p></div>}
      {!loading && !error && !quizzes.length && <div className="empty-panel">Bộ câu hỏi đang được chuẩn bị. Bạn quay lại sau một chút nhé.</div>}
      <div className="quiz-type-grid" role="group" aria-label="Chọn bài khám phá">{quizzes.map(q => <button key={q.id} className={`quiz-type-card ${q.id === selectedId ? 'selected' : ''}`} aria-pressed={q.id === selectedId} onClick={() => { if (q.id !== selectedId) { reset(); setSelectedId(q.id); } }}>
        <span className="quiz-type-icon">{q.type === 'HOLLAND' ? <Fingerprint size={25} strokeWidth={1.4} /> : <Lightbulb size={25} strokeWidth={1.4} />}</span><span className="selection-check"><Check size={12} /></span>
        <h2>{q.title}</h2><p>{q.type === 'HOLLAND' ? 'Điều gì khiến bạn hứng thú? Tìm hiểu sáu nhóm sở thích và những ngành học có thể phù hợp.' : 'Bạn học và cảm nhận thế giới theo cách nào? Khám phá những khả năng khác nhau của mình.'}</p>
        <div className="quiz-meta"><span>{q.questions.length} câu hỏi</span><span><Clock3 size={12} />Khoảng {Math.max(3, Math.ceil(q.questions.length / 8))} phút</span></div>
      </button>)}</div>
      {quiz && <div className="quiz-start"><button className="action-primary" onClick={() => setStarted(true)}>{Object.keys(answers).length ? 'Tiếp tục khám phá' : 'Bắt đầu khám phá'}<ArrowRight size={17} /></button><p className="micro-copy"><LockKeyhole size={12} />Bạn có thể khám phá trước, đăng nhập để lưu sau.</p></div>}
    </> : question && quiz && <section className="quiz-workspace">
      <div className="quiz-progress-top"><button className="subtle-link" onClick={() => setStarted(false)} disabled={busy}><ArrowLeft size={13} />{quiz.title}</button><span><strong>{questionIndex + 1}</strong> / {quiz.questions.length}</span></div>
      <div className="quiz-progress" role="progressbar" aria-label="Tiến độ làm bài" aria-valuemin={0} aria-valuemax={quiz.questions.length} aria-valuenow={Object.keys(answers).length}><div style={{ width: `${Object.keys(answers).length / quiz.questions.length * 100}%` }} /></div>
      <div className="question-stage question-enter" key={question.id}><p className="eyebrow">{questionIndex < quiz.questions.length / 3 ? 'CỨ LÀ CHÍNH MÌNH NHÉ' : questionIndex < quiz.questions.length * 2 / 3 ? 'BẠN ĐANG HIỂU MÌNH HƠN MỘT CHÚT' : 'CHỈ CÒN MỘT VÀI BƯỚC NỮA THÔI'}</p>
        <h1 ref={heading} tabIndex={-1} className="question-heading">{question.text}</h1><p>Điều này giống bạn đến mức nào?</p>
        <div className="choice-grid" role="group" aria-label="Chọn mức độ phù hợp">{choices.map(({ value, label, Icon }) => <button key={value} className={`choice-card ${answers[question.id] === value ? 'selected' : ''}`} aria-pressed={answers[question.id] === value} aria-keyshortcuts={String(value)} disabled={busy} onClick={() => setAnswers(old => ({ ...old, [question.id]: value }))}>
          <span className="choice-shortcut" aria-hidden="true">0{value}</span><span className="choice-icon"><Icon size={31} strokeWidth={1.4} aria-hidden="true" /></span><span>{label}</span>{answers[question.id] === value && <i className="choice-selected-check" aria-hidden="true"><Check size={10} /></i>}
        </button>)}</div>
      </div>
      <div className="quiz-controls"><button className="action-secondary" disabled={busy || questionIndex === 0} onClick={() => setQuestionIndex(i => i - 1)}><ArrowLeft size={15} />Quay lại</button><p className="micro-copy"><Keyboard size={13} />Bạn cũng có thể dùng phím 1–5 để chọn</p>
        {questionIndex < quiz.questions.length - 1 ? <button className="action-primary" disabled={busy || answers[question.id] === undefined} onClick={() => setQuestionIndex(i => i + 1)}>Câu tiếp theo<ArrowRight size={16} /></button> : <button className="action-primary" disabled={busy || Object.keys(answers).length !== quiz.questions.length} onClick={submit}>{busy ? 'Đang ghép bức tranh…' : 'Khám phá kết quả'}<ArrowRight size={16} /></button>}
      </div><p className="quiz-reassurance"><Heart size={11} />Không cần nghĩ quá lâu. Cảm nhận đầu tiên của bạn cũng rất đáng tin.</p>
    </section>}
  </main>;
}
