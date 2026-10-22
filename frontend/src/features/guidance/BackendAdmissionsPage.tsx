import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BookOpen, Calculator, ChevronDown, Compass, Heart, Info, Leaf, ListFilter, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { guidance, activeResult, errorMessage, subjectLabels, type QuizResult, type RankingMode, type RecommendationItem, type RecommendationResponse } from '@/services/guidance';
import { useBookmarks } from '@/hooks/useBookmarks';
import { AdmissionMethodPreview, admissionMethods, type AdmissionMethod } from './AdmissionMethodPreview';
import { defaultPriority, PriorityFields } from './PriorityFields';
import { WorkbookPoints } from '../schools/SchoolDirectory';

const entryGroups: Record<string,string[]> = { A00:['toan','ly','hoa'], A01:['toan','ly','anh'], B00:['toan','hoa','sinh'], D01:['toan','van','anh'], C00:['van','su','dia'], D07:['toan','hoa','anh'] };

function ProgramCard({ item }: { item: RecommendationItem }) {
  const { toggle, isBookmarked } = useBookmarks();
  const p = item.program;
  const bookmarkId = `program-${p.id}`;
  const saved = isBookmarked(bookmarkId);
  return <article className="program-card page-enter">
    <div className="program-card-top"><span className="school-label"><BookOpen size={14} strokeWidth={1.5} />{p.shortName} · {p.majorCode}</span><button className={`icon-button ${saved ? 'is-saved' : ''}`} aria-label={saved ? `Bỏ lưu ${p.major} tại ${p.shortName}` : `Lưu ${p.major} tại ${p.shortName}`} aria-pressed={saved} onClick={() => toggle({ id: bookmarkId, type: 'school', name: p.major, subtitle: p.school, tag: p.shortName })}><Heart size={16} fill={saved ? 'currentColor' : 'none'} strokeWidth={1.5} /></button></div>
    <h3>{p.major}</h3><p className="program-school">{p.school}</p>
    {p.admissionDetails?.workbook&&<details className="school-program-detail"><summary>Điểm chuẩn & công thức trong file</summary><WorkbookPoints data={p.admissionDetails.workbook} compact/></details>}
    {p.admissionDetails?.programCode&&<p className="school-label">Mã xét tuyển {p.admissionDetails.programCode} · {p.admissionDetails.method} · thang {p.admissionDetails.scale}</p>}
    {p.verified&&p.admissionDetails?.benchmarkVerified!==false&&p.benchmark!==null&&p.benchmarkYear===p.admissionYear&&<div className="published-cutoff"><span>Điểm chuẩn đã công bố {p.benchmarkYear}</span><strong>{p.benchmark.toFixed(2)}<small>/30</small></strong><a href={p.admissionDetails?.benchmarkSourceUrl??p.sourceUrl??undefined} target="_blank" rel="noopener noreferrer">Thông báo chính thức ↗</a>{p.admissionDetails?.secondaryCriteria&&<p>Tiêu chí phụ khi bằng điểm: {p.admissionDetails.secondaryCriteria}</p>}</div>}
    {item.admissionScore !== null && <div className="admission-total"><span>Điểm theo công thức THPT phổ thông</span><strong>{item.admissionScore.toFixed(2)}<small>/30</small></strong><p>Tổng ba môn {item.rawScore?.toFixed(2)} + ưu tiên {item.priorityScore?.toFixed(2)}. Chưa tính hệ số, điểm thưởng và điều kiện riêng.</p></div>}
    <div className={`history-estimate band-${item.estimate.band.toLowerCase()}`}><strong>{({ BELOW: 'Thấp hơn mốc xu hướng', NEAR: 'Gần mốc xu hướng', ABOVE: 'Cao hơn mốc xu hướng', NO_SCORE: 'Chưa đủ điểm môn học', INSUFFICIENT_DATA: 'Chưa đủ lịch sử để ước lượng' })[item.estimate.band]}</strong>{item.estimate.reference !== null ? <p>Mốc 3 năm: {item.estimate.reference.toFixed(2)} /30{item.estimate.difference !== null && ` · Chênh ${item.estimate.difference > 0 ? '+' : ''}${item.estimate.difference.toFixed(2)}`}</p> : <p>Thiếu dữ liệu đã kiểm tra: {item.estimate.missingYears.join(', ')}.</p>}<details><summary>Xem cơ sở đối chiếu</summary><p>{item.estimate.note}</p><ul>{item.estimate.points.map(point => <li key={point.year}><a href={point.sourceUrl} target="_blank" rel="noopener noreferrer">{point.year}: {point.score.toFixed(2)} · {point.group} ↗</a></li>)}</ul></details></div>
    <div className="program-metrics"><div className="program-metric"><span>TỔNG ĐIỂM BA MÔN {item.bestGroup ? `· ${item.bestGroup}` : ''}</span>{item.rawScore === null ? <strong className="no-score">Chưa đủ điểm</strong> : <strong>{item.rawScore.toFixed(2)}<small>/30</small></strong>}</div><div className="program-metric"><span>TƯƠNG ĐỒNG HOLLAND</span>{item.compatibility === null ? <strong className="no-score">Chưa đánh giá</strong> : <strong>{Math.round(item.compatibility)}<small>/100</small></strong>}</div></div>
    <div className="program-detail"><span>{p.benchmark === null ? 'Chưa có mốc tham khảo' : `Mốc ${p.benchmarkYear}: ${p.benchmark.toFixed(2)}`}</span><span className={p.verified ? '' : 'unverified'}>{p.verified ? 'Đã kiểm tra nguồn' : 'Dữ liệu tham khảo'}</span></div>
    {item.rawScore !== null && <div className="score-comparison"><div className="score-comparison-label"><span>Điểm của bạn <strong>{item.rawScore.toFixed(2)}</strong></span><span>Thang 30</span></div><div className="score-comparison-track" role="img" aria-label={`Tổng điểm ${item.rawScore.toFixed(2)} trên 30${p.benchmark !== null ? `; mốc tham khảo ${p.benchmark.toFixed(2)}` : ''}`}><span style={{ width:`${Math.min(100,Math.max(0,item.rawScore / 30 * 100))}%` }} />{p.benchmark !== null && <i style={{ left:`${Math.min(100,Math.max(0,p.benchmark / 30 * 100))}%` }} />}</div><p>{p.benchmark === null ? 'Chưa có mốc để đối chiếu.' : `Vạch đánh dấu: mốc tham khảo ${p.benchmarkYear}. Không phải xác suất trúng tuyển.`}</p></div>}
    <details className="program-explanation"><summary>Hiểu thêm về gợi ý này<ChevronDown size={12} /></summary><ul>{item.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>{p.sourceUrl && <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">Xem nguồn thông tin<ArrowUpRight className="inline ml-1" size={11} /></a>}</details>
  </article>;
}
export function BackendAdmissionsPage() {
  const auth = useAuth();
  const [params]=useSearchParams();
  const [majorFilter,setMajorFilter]=useState(params.get('nganh')??'');
  const [verifiedOnly,setVerifiedOnly]=useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [method, setMethod] = useState<AdmissionMethod>('THPT');
  const [entryGroup, setEntryGroup] = useState('');
  const [priority, setPriority] = useState(defaultPriority);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [mode, setMode] = useState<RankingMode>('COMBINED');
  const [quizId, setQuizId] = useState<string | null>(activeResult);
  const [useQuiz, setUseQuiz] = useState(() => Boolean(activeResult()));
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [response, setResponse] = useState<RecommendationResponse | null>(null);
  const [submitted, setSubmitted] = useState<Parameters<typeof guidance.recommend> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestNumber = useRef(0);
  const nextOffset = useRef(0);
  const scrollToResults = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [profileStatus, setProfileStatus] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const editedScores = useRef(false);
  const editedYear = useRef(false);
  const resultAnchor = useRef<HTMLElement>(null);
  const usingQuiz = useQuiz && quizId !== null;
  const selectedProgram=params.get('chuongtrinh');
  const visibleItems=response?.items??[];
  function resetSearch() {
    requestNumber.current++;
    setSubmitted(null); setResponse(null); setLoadingMore(false); setBusy(false);
  }
  useEffect(() => {
    if (!submitted) return;
    const generation=++requestNumber.current;
    const controller=new AbortController();
    setBusy(true); setError(''); setLoadingMore(false);
    // Wait briefly while typing a major; all filtering happens before server pagination.
    const timer=window.setTimeout(() => {
      guidance.recommend(submitted[0],submitted[1],submitted[2],submitted[3],submitted[4],
        {offset:0,limit:15,major:majorFilter,verifiedOnly,programId:selectedProgram},controller.signal)
        .then(data=>{if(generation===requestNumber.current){nextOffset.current=data.offset+data.items.length;setResponse(data);}})
        .catch(e=>{if(generation===requestNumber.current&&!controller.signal.aborted)setError(errorMessage(e));})
        .finally(()=>{if(generation===requestNumber.current)setBusy(false);});
    },majorFilter?250:0);
    return ()=>{window.clearTimeout(timer);controller.abort();requestNumber.current++;};
  },[submitted,majorFilter,verifiedOnly,selectedProgram]);
  async function loadMore() {
    if(!submitted||!response||busy||loadingMore)return;
    const generation=requestNumber.current;
    setLoadingMore(true);setError('');
    try {
      const next=await guidance.recommend(submitted[0],submitted[1],submitted[2],submitted[3],submitted[4],
        {offset:nextOffset.current,limit:15,major:majorFilter,verifiedOnly,programId:selectedProgram});
      if(generation!==requestNumber.current)return;
      nextOffset.current=next.offset+next.items.length;
      setResponse(old=>old?{...next,id:old.id,offset:old.offset,items:[...old.items,...next.items.filter(item=>!old.items.some(existing=>existing.program.id===item.program.id))]}:old);
    } catch(e){if(generation===requestNumber.current)setError(errorMessage(e));}
    finally{if(generation===requestNumber.current)setLoadingMore(false);}
  }
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
    if (response && scrollToResults.current) { scrollToResults.current=false; resultAnchor.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
  }, [response]);
  async function search(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setResponse(null);scrollToResults.current=true;
    const selectedScores = entryGroup ? Object.fromEntries(Object.entries(scores).filter(([key]) => entryGroups[entryGroup].includes(key))) : scores;
    setSubmitted([year,usingQuiz?mode:'POINTS',selectedScores,usingQuiz?quizId:null,year===2026?priority:undefined]);
  }

  return <main className="page-width admissions-page page-enter">
    <header className="page-intro"><div className="intro-topline"><p className="eyebrow"><span className="status-dot" />TỪ ĐIỂM SỐ ĐẾN HƯỚNG ĐI</p><Link className="subtle-link" to="/yeu-thich"><Heart size={13} />Những ngành đã lưu<ArrowUpRight size={12} /></Link></div><h1>Hiểu điểm của mình.<br /><em>Nhìn rõ lựa chọn.</em></h1><p className="intro-description">Chọn phương thức, kết nối điểm số với sở thích.<br className="desktop-break" /> Từng bước tìm ngành và trường bạn muốn tìm hiểu.</p></header>
    <div className="admission-methods" role="group" aria-label="Phương thức tuyển sinh">{admissionMethods.map(item => <button disabled={busy} key={item.id} aria-pressed={method === item.id} className={method === item.id ? 'selected' : ''} onClick={() => { setMethod(item.id); resetSearch(); setError(''); }}><span className="method-number">{item.number}</span><span><strong>{item.title}</strong><small>{item.subtitle}</small></span><span className={`method-status ${item.ready ? 'ready' : ''}`}>{item.ready ? 'Đang hoạt động' : 'Giao diện xem trước'}</span></button>)}</div>
    {method !== 'THPT' ? <AdmissionMethodPreview key={method} method={method} /> : <>
    {profileStatus && <p className="text-sm text-muted-foreground mb-5" role="status">{profileStatus}</p>}
    <div className="admissions-layout">
      <form onSubmit={search} className="soft-panel score-form">
        <div className="panel-heading"><span className="panel-icon"><Calculator size={18} strokeWidth={1.5} /></span><div><h2>Bắt đầu từ điểm của bạn</h2><p>Thang điểm 10 · Môn chưa có điểm có thể để trống</p></div><span className="form-step">01 / 02</span></div>
        <label className="form-field entry-group-select">Nhập điểm theo tổ hợp<select disabled={busy} value={entryGroup} onChange={e => { setEntryGroup(e.target.value); resetSearch(); }}><option value="">Tất cả môn — tự chọn tổ hợp tốt nhất</option>{Object.entries(entryGroups).map(([key,subjects]) => <option key={key} value={key}>{key} · {subjects.map(subject => subjectLabels[subject]).join(' – ')}</option>)}</select></label>
        <div className="score-grid">{Object.entries(subjectLabels).filter(([key]) => !entryGroup || entryGroups[entryGroup].includes(key)).map(([key, label]) => <label className="form-field" key={key}>{label}<input disabled={busy} type="number" inputMode="decimal" min={0} max={10} step="0.01" placeholder="Chưa nhập" value={scores[key] ?? ''} onChange={e => {
          const value = e.target.value; editedScores.current = true; resetSearch(); setScores(old => { const next = { ...old }; if (value === '') delete next[key]; else next[key] = Number(value); return next; });
        }} /></label>)}</div>
        {year === 2026 ? <PriorityFields value={priority} disabled={busy} onChange={p => { setPriority(p); resetSearch(); }} /> : <p className="text-sm text-muted-foreground">Năm này chỉ tính tổng ba môn; quy tắc ưu tiên hiện được đối chiếu cho năm 2026.</p>}
        <div className="score-bottom"><label className="form-field">Năm tuyển sinh<input disabled={busy} type="number" required min={2000} max={2100} value={year} onChange={e => { editedYear.current = true; setYear(Number(e.target.value)); resetSearch(); }} /></label><button className="action-primary" disabled={busy || profileLoading}>{busy ? 'Đang tìm hướng đi…' : 'Khám phá gợi ý'}<ArrowRight size={17} /></button></div>
      </form>
      <aside className="admissions-sidebar"><section className="personalize-panel" aria-labelledby="personalize-title"><div className="personalize-top"><span className="panel-icon"><FingerprintIcon /></span><label className="switch-control"><input type="checkbox" disabled={busy} checked={useQuiz} aria-label="Dùng kết quả trắc nghiệm Holland" aria-describedby="quiz-choice-help" onChange={e => { setUseQuiz(e.target.checked); resetSearch(); setError(''); }} /><span className="switch-track" /></label></div><h2 id="personalize-title">Thêm một chút<br />cá tính của bạn.</h2><p id="quiz-choice-help">{!useQuiz ? 'Đang tra cứu theo điểm. Bật lên nếu bạn muốn kết hợp thêm kết quả Holland.' : !quizId ? 'Chọn kết quả đã lưu hoặc làm bài Holland nhé. Khi chưa có kết quả, mình vẫn tìm theo điểm.' : 'Sở thích giúp sắp xếp gợi ý gần với bạn hơn. Điểm môn học vẫn được giữ nguyên.'}</p>
        <label className="form-field">Kết quả khám phá<select disabled={!useQuiz || busy} value={quizId ?? ''} onChange={e => { setQuizId(e.target.value || null); resetSearch(); }}><option value="">Chưa chọn kết quả</option>{quizId && !history.some(h => h.id === quizId) && <option value={quizId}>Kết quả vừa khám phá</option>}{history.map(h => <option key={h.id} value={h.id}>{h.topCodes.join('')} · {new Date(h.createdAt).toLocaleDateString('vi-VN')}</option>)}</select></label>
        <label className="form-field">Ưu tiên gợi ý<select disabled={busy} value={usingQuiz ? mode : 'POINTS'} onChange={e => { setMode(e.target.value as RankingMode); resetSearch(); }}><option value="COMBINED" disabled={!usingQuiz}>Kết hợp điểm & sở thích</option><option value="POINTS">Theo tổng điểm</option><option value="INTEREST" disabled={!usingQuiz}>Theo sở thích Holland</option></select></label>
        <div className="personalize-footnote"><Leaf size={12} />Bạn luôn có thể thay đổi lựa chọn.</div>
      </section><section className="search-help"><h3><Sparkles size={15} strokeWidth={1.5} />Chưa rõ mình thích gì?</h3><p>Không sao cả. Vài phút khám phá bản thân có thể giúp bạn nhìn thấy những điều thú vị.</p><Link to="/trac-nghiem">Mình thử khám phá nhé<ArrowUpRight size={13} /></Link></section></aside>
    </div>
    <div className="prediction-roadmap"><Info size={19} /><div><strong>Mốc xu hướng để bạn cân nhắc</strong><p>Chỉ ước lượng khi có đủ ba năm tương thích và có nguồn. Mốc 50%–30%–20% là tham khảo xu hướng, không phải tỷ lệ trúng tuyển. Chương trình có hệ số hoặc công thức riêng cần đối chiếu trực tiếp với trường.</p></div></div>
    {error && <div role="alert" className="notice notice-error mt-6"><Info size={15} /><div>{error} {quizId && <button className="underline" onClick={() => { setUseQuiz(false); setQuizId(null); setError(''); }}>Thử chỉ dùng điểm môn học</button>}</div></div>}
    {response ? <section className="search-results" ref={resultAnchor} aria-labelledby="results-title"><div className="section-heading"><div><p className="eyebrow"><ListFilter size={12} />THÊM VÀI KHẢ NĂNG DÀNH CHO BẠN</p><h2 id="results-title">Những hướng đi để tìm hiểu.</h2></div><span className="result-count">Đang hiển thị {visibleItems.length}/{response.total} chương trình</span></div><div className="admission-data-filters"><label className="flex gap-2"><input type="checkbox" checked={verifiedOnly} onChange={e=>setVerifiedOnly(e.target.checked)}/>Chỉ dữ liệu đã kiểm tra nguồn</label><label className="form-field">Lọc ngành<input value={majorFilter} onChange={e=>setMajorFilter(e.target.value)} placeholder="Tên ngành cần tìm" /></label></div><div className="notice notice-info"><Info size={15} /><p>{response.calculationNote}</p></div>{busy ? <p role="status" className="mt-5">Đang cập nhật kết quả…</p> : !visibleItems.length ? <div className="empty-panel mt-5"><Compass size={28} className="mx-auto" /><p>Chưa có chương trình khớp năm và bộ lọc. Bạn có thể bỏ lọc ngành hoặc xem thêm dữ liệu chưa xác minh.</p></div> : <><div id="admission-program-results" className="program-grid">{visibleItems.map(item => <ProgramCard key={item.program.id} item={item} />)}</div>{response.hasMore&&<div className="flex justify-center mt-6"><button type="button" className="action-secondary" aria-controls="admission-program-results" disabled={busy||loadingMore} onClick={loadMore}>{loadingMore?'Đang tải thêm…':`Xem thêm ${Math.min(15,response.total-visibleItems.length)} kết quả · còn ${response.total-visibleItems.length}`}</button></div>}</>}</section> : <p className="idle-results" role="status">{busy ? <span className="spinner" /> : <Compass size={18} strokeWidth={1.4} />}{busy ? 'Đang kết nối điểm số với những lựa chọn của bạn…' : 'Mọi hành trình đều bắt đầu từ một bước nhỏ. Điền điểm khi bạn sẵn sàng nhé.'}</p>}
    </>}
  </main>;
}
function FingerprintIcon() { return <Compass size={20} strokeWidth={1.4} />; }
