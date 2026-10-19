import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BookOpen, Calculator, ChevronDown, Compass, Heart, Info, Leaf, ListFilter, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { guidance, activeResult, errorMessage, subjectLabels, type QuizResult, type RankingMode, type RecommendationItem, type RecommendationResponse } from '@/services/guidance';
import { useBookmarks } from '@/hooks/useBookmarks';

function ProgramCard({ item }: { item: RecommendationItem }) {
  const { toggle, isBookmarked } = useBookmarks();
  const p = item.program;
  const bookmarkId = `program-${p.id}`;
  const saved = isBookmarked(bookmarkId);
  return <article className="program-card page-enter">
    <div className="program-card-top"><span className="school-label"><BookOpen size={14} strokeWidth={1.5} />{p.shortName} · {p.majorCode}</span><button className={`icon-button ${saved ? 'is-saved' : ''}`} aria-label={saved ? `Bỏ lưu ${p.major} tại ${p.shortName}` : `Lưu ${p.major} tại ${p.shortName}`} aria-pressed={saved} onClick={() => toggle({ id: bookmarkId, type: 'school', name: p.major, subtitle: p.school, tag: p.shortName })}><Heart size={16} fill={saved ? 'currentColor' : 'none'} strokeWidth={1.5} /></button></div>
    <h3>{p.major}</h3><p className="program-school">{p.school}</p>
    <div className="program-metrics"><div className="program-metric"><span>TỔNG ĐIỂM BA MÔN {item.bestGroup ? `· ${item.bestGroup}` : ''}</span>{item.rawScore === null ? <strong className="no-score">Chưa đủ điểm</strong> : <strong>{item.rawScore.toFixed(2)}<small>/30</small></strong>}</div><div className="program-metric"><span>TƯƠNG ĐỒNG HOLLAND</span>{item.compatibility === null ? <strong className="no-score">Chưa đánh giá</strong> : <strong>{Math.round(item.compatibility)}<small>/100</small></strong>}</div></div>
    <div className="program-detail"><span>{p.benchmark === null ? 'Chưa có mốc tham khảo' : `Mốc ${p.benchmarkYear}: ${p.benchmark.toFixed(2)}`}</span><span className={p.verified ? '' : 'unverified'}>{p.verified ? 'Đã kiểm tra nguồn' : 'Dữ liệu tham khảo'}</span></div>
    <details className="program-explanation"><summary>Hiểu thêm về gợi ý này<ChevronDown size={12} /></summary><ul>{item.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>{p.sourceUrl && <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">Xem nguồn thông tin<ArrowUpRight className="inline ml-1" size={11} /></a>}</details>
  </article>;
}
export function BackendAdmissionsPage() {
  const auth = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [scores, setScores] = useState<Record<string, number>>({});
  const [mode, setMode] = useState<RankingMode>('COMBINED');
  const [quizId, setQuizId] = useState<string | null>(activeResult);
  const [useQuiz, setUseQuiz] = useState(() => Boolean(activeResult()));
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [response, setResponse] = useState<RecommendationResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [profileStatus, setProfileStatus] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const editedScores = useRef(false);
  const editedYear = useRef(false);
  const resultAnchor = useRef<HTMLElement>(null);
  const usingQuiz = useQuiz && quizId !== null;
  useEffect(() => {
    let live = true;
    if (auth?.isAuthenticated) {
      setProfileLoading(true);
      setProfileStatus('Đang lấy điểm học tập đã lưu…');
      guidance.profile().then(({ data }) => {
        if (!live) return;
        const hasScores = data.scores && Object.keys(data.scores).length > 0;
        if (hasScores && !editedScores.current) setScores({ ...data.scores });
        if (data.targetYear && !editedYear.current) setYear(data.targetYear);
        setProfileStatus(hasScores ? 'Đã lấy điểm và năm dự tuyển từ hồ sơ. Bạn có thể điều chỉnh cho lần tra cứu này.' : 'Bạn có thể lưu điểm tại hồ sơ để lần sau tự điền.');
      }).catch(() => { if (live) setProfileStatus('Chưa tải được điểm trong hồ sơ. Bạn vẫn có thể nhập điểm bên dưới.'); })
        .finally(() => { if (live) setProfileLoading(false); });
    }
    return () => { live = false; };
  }, [auth?.isAuthenticated]);
  useEffect(() => {
    let live = true;
    if (auth?.isAuthenticated) guidance.history().then(data => { if (live) setHistory(data.filter(r => r.type === 'HOLLAND')); }).catch(() => {});
    return () => { live = false; };
  }, [auth?.isAuthenticated]);
  useEffect(() => {
    if (response) resultAnchor.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }, [response]);
  async function search(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setResponse(null);
    try { setResponse(await guidance.recommend(year, usingQuiz ? mode : 'POINTS', scores, usingQuiz ? quizId : null)); }
    catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  }
  return <main className="page-width admissions-page page-enter">
    <header className="page-intro"><div className="intro-topline"><p className="eyebrow"><span className="status-dot" />TỪ SỞ THÍCH ĐẾN LỰA CHỌN</p><Link className="subtle-link" to="/yeu-thich"><Heart size={13} />Những ngành đã lưu<ArrowUpRight size={12} /></Link></div><h1>Ngành bạn thích.<br /><em>Trường bạn muốn đến.</em></h1><p className="intro-description">Thêm điểm số, kết nối sở thích. Mình cùng tìm những lựa chọn<br className="desktop-break" /> để bạn hiểu hơn và tự tin bước tiếp.</p></header>
    {profileStatus && <p className="text-sm text-muted-foreground mb-5" role="status">{profileStatus}</p>}
    <div className="admissions-layout">
      <form onSubmit={search} className="soft-panel score-form">
        <div className="panel-heading"><span className="panel-icon"><Calculator size={18} strokeWidth={1.5} /></span><div><h2>Bắt đầu từ điểm của bạn</h2><p>Thang điểm 10 · Môn chưa có điểm có thể để trống</p></div><span className="form-step">01 / 02</span></div>
        <div className="score-grid">{Object.entries(subjectLabels).map(([key, label]) => <label className="form-field" key={key}>{label}<input disabled={busy} type="number" inputMode="decimal" min={0} max={10} step="0.01" placeholder="Chưa nhập" value={scores[key] ?? ''} onChange={e => {
          const value = e.target.value; editedScores.current = true; setResponse(null); setScores(old => { const next = { ...old }; if (value === '') delete next[key]; else next[key] = Number(value); return next; });
        }} /></label>)}</div>
        <div className="score-bottom"><label className="form-field">Năm tuyển sinh<input disabled={busy} type="number" required min={2000} max={2100} value={year} onChange={e => { editedYear.current = true; setYear(Number(e.target.value)); setResponse(null); }} /></label><button className="action-primary" disabled={busy || profileLoading}>{busy ? 'Đang tìm hướng đi…' : 'Khám phá gợi ý'}<ArrowRight size={17} /></button></div>
      </form>
      <aside className="admissions-sidebar"><section className="personalize-panel" aria-labelledby="personalize-title"><div className="personalize-top"><span className="panel-icon"><FingerprintIcon /></span><label className="switch-control"><input type="checkbox" disabled={busy} checked={useQuiz} aria-label="Dùng kết quả trắc nghiệm Holland" aria-describedby="quiz-choice-help" onChange={e => { setUseQuiz(e.target.checked); setResponse(null); setError(''); }} /><span className="switch-track" /></label></div><h2 id="personalize-title">Thêm một chút<br />cá tính của bạn.</h2><p id="quiz-choice-help">{!useQuiz ? 'Đang tra cứu theo điểm. Bật lên nếu bạn muốn kết hợp thêm kết quả Holland.' : !quizId ? 'Chọn kết quả đã lưu hoặc làm bài Holland nhé. Khi chưa có kết quả, mình vẫn tìm theo điểm.' : 'Sở thích giúp sắp xếp gợi ý gần với bạn hơn. Điểm môn học vẫn được giữ nguyên.'}</p>
        <label className="form-field">Kết quả khám phá<select disabled={!useQuiz || busy} value={quizId ?? ''} onChange={e => { setQuizId(e.target.value || null); setResponse(null); }}><option value="">Chưa chọn kết quả</option>{quizId && !history.some(h => h.id === quizId) && <option value={quizId}>Kết quả vừa khám phá</option>}{history.map(h => <option key={h.id} value={h.id}>{h.topCodes.join('')} · {new Date(h.createdAt).toLocaleDateString('vi-VN')}</option>)}</select></label>
        <label className="form-field">Ưu tiên gợi ý<select disabled={busy} value={usingQuiz ? mode : 'POINTS'} onChange={e => { setMode(e.target.value as RankingMode); setResponse(null); }}><option value="COMBINED" disabled={!usingQuiz}>Kết hợp điểm & sở thích</option><option value="POINTS">Theo tổng điểm</option><option value="INTEREST" disabled={!usingQuiz}>Theo sở thích Holland</option></select></label>
        <div className="personalize-footnote"><Leaf size={12} />Bạn luôn có thể thay đổi lựa chọn.</div>
      </section><section className="search-help"><h3><Sparkles size={15} strokeWidth={1.5} />Chưa rõ mình thích gì?</h3><p>Không sao cả. Vài phút khám phá bản thân có thể giúp bạn nhìn thấy những điều thú vị.</p><Link to="/trac-nghiem">Mình thử khám phá nhé<ArrowUpRight size={13} /></Link></section></aside>
    </div>
    {error && <div role="alert" className="notice notice-error mt-6"><Info size={15} /><div>{error} {quizId && <button className="underline" onClick={() => { setUseQuiz(false); setQuizId(null); setError(''); }}>Thử chỉ dùng điểm môn học</button>}</div></div>}
    {response ? <section className="search-results" ref={resultAnchor} aria-labelledby="results-title"><div className="section-heading"><div><p className="eyebrow"><ListFilter size={12} />THÊM VÀI KHẢ NĂNG DÀNH CHO BẠN</p><h2 id="results-title">Những hướng đi để tìm hiểu.</h2></div><span className="result-count">{response.items.length} chương trình</span></div><div className="notice notice-info"><Info size={15} /><p>{response.calculationNote}</p></div>{!response.items.length ? <div className="empty-panel mt-5"><Compass size={28} className="mx-auto" /><p>Chưa có chương trình cho năm này. Bạn thử chọn năm khác nhé.</p></div> : <div className="program-grid">{response.items.map(item => <ProgramCard key={item.program.id} item={item} />)}</div>}</section> : <p className="idle-results" role="status">{busy ? <span className="spinner" /> : <Compass size={18} strokeWidth={1.4} />}{busy ? 'Đang kết nối điểm số với những lựa chọn của bạn…' : 'Mọi hành trình đều bắt đầu từ một bước nhỏ. Điền điểm khi bạn sẵn sàng nhé.'}</p>}
  </main>;
}
function FingerprintIcon() { return <Compass size={20} strokeWidth={1.4} />; }
