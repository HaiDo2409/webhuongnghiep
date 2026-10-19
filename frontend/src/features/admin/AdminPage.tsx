import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useBackend } from '@/lib/runtime';
import { Button } from '@/components/ui/button';
import { errorMessage, type Program, type QuizVersion, type QuizType, type Question } from '@/services/guidance';
import { HOLLAND_LABELS } from '@/pages/trac-nghiem/data/questions';
import { MI_LABELS } from '@/pages/trac-nghiem/data/mi-questions';

const groups: Record<string, string[]> = { A00: ['toan', 'ly', 'hoa'], A01: ['toan', 'ly', 'anh'], A02: ['toan', 'ly', 'sinh'], B00: ['toan', 'hoa', 'sinh'], C00: ['van', 'su', 'dia'], D01: ['toan', 'van', 'anh'], D07: ['toan', 'hoa', 'anh'], D08: ['toan', 'sinh', 'anh'], D09: ['toan', 'su', 'anh'] };
const blankProgram = (): Program => ({ id: '', school: '', shortName: '', major: '', majorCode: '', admissionYear: 2026, subjectGroups: [{ code: 'A00', subjects: groups.A00 }], hollandProfile: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }, benchmark: null, benchmarkYear: null, sourceUrl: '', verified: false, published: false, revision: 0 });

export function AdminPage() {
  const [tab, setTab] = useState<'programs' | 'quizzes'>('programs');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [quizzes, setQuizzes] = useState<QuizVersion[]>([]);
  const [program, setProgram] = useState<Program>(blankProgram);
  const [quizType, setQuizType] = useState<QuizType>('HOLLAND');
  const [title, setTitle] = useState('Holland RIASEC');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [removedQuizzes, setRemovedQuizzes] = useState<QuizVersion[]>([]);
  const quizForm = useRef<HTMLFormElement>(null);
  const quizTitle = useRef<HTMLInputElement>(null);
  async function load() {
    const [p, q] = await Promise.all([api.get<Program[]>('/api/admin/programs'), api.get<QuizVersion[]>('/api/admin/quizzes')]);
    setPrograms(p.data); setQuizzes(q.data);
  }
  useEffect(() => {
    let live = true;
    if (useBackend) Promise.all([api.get<Program[]>('/api/admin/programs'), api.get<QuizVersion[]>('/api/admin/quizzes')])
      .then(([p, q]) => { if (live) { setPrograms(p.data); setQuizzes(q.data); } })
      .catch(e => { if (live) setError(errorMessage(e)); });
    return () => { live = false; };
  }, []);
  async function action(work: () => Promise<unknown>, success: string) {
    setBusy(true); setError(''); setMessage('');
    try { await work(); await load(); setMessage(success); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  const inputClass = 'border rounded-lg px-3 py-2 w-full bg-white';
  const dimensions = quizType === 'HOLLAND' ? HOLLAND_LABELS : MI_LABELS;
  const missingGroups = Object.entries(dimensions).filter(([key]) => !questions.some(q => q.type === key));
  const blankQuestions = questions.filter(q => !q.text.trim()).length;
  const latestTemplate = quizzes.filter(q => q.type === quizType).sort((a,b) => b.version - a.version)[0];
  function useTemplate(q: QuizVersion) {
    setQuizType(q.type); setTitle(q.title); setQuestions(q.questions.map(question => ({ ...question })));
    setError(''); setMessage(`Đã sao chép phiên bản ${q.version} để chỉnh sửa. Bản gốc được giữ nguyên.`);
    quizForm.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    quizTitle.current?.focus({ preventScroll: true });
  }
  function deletionReason(q: QuizVersion) {
    if (quizzes.filter(item => item.type === q.type).length <= 1) return 'Cần giữ ít nhất một bộ cho loại này.';
    if (q.status === 'PUBLISHED') return 'Đang sử dụng: hãy chọn bộ cùng loại khác trước khi xóa.';
    return '';
  }
  async function removeQuiz(q: QuizVersion) {
    await action(async () => {
      await api.delete(`/api/admin/quizzes/${q.id}`, { params: { revision:q.revision } });
      setRemovedQuizzes(old => [...old,q]);
    }, 'Đã xóa bộ câu hỏi khỏi danh sách. Kết quả làm bài cũ vẫn được giữ nguyên.');
  }
  return <main className="max-w-6xl mx-auto px-4 py-10 space-y-6">
    <h1 className="text-3xl font-bold">Quản trị hướng nghiệp</h1>
    <p className="text-gray-600">Thay đổi nội dung, lưu bản nháp và xuất bản khi đã kiểm tra.</p>
    {!useBackend && <p>Trang quản trị cần bật kết nối backend sau khi cài PostgreSQL.</p>}
    {error && <p role="alert" className="bg-red-50 text-red-700 p-4 rounded-xl">{error}</p>}
    {message && <p role="status" className="bg-green-50 text-green-700 p-4 rounded-xl">{message}</p>}
    <div className="flex gap-3"><Button variant={tab === 'programs' ? 'default' : 'outline'} onClick={() => setTab('programs')}>Ngành và trường</Button><Button variant={tab === 'quizzes' ? 'default' : 'outline'} onClick={() => setTab('quizzes')}>Bộ trắc nghiệm</Button></div>
    {tab === 'programs' ? <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
      <section className="space-y-2"><Button variant="outline" onClick={() => setProgram(blankProgram())}>Thêm chương trình</Button>
        {programs.map(p => <button className={`block w-full text-left border rounded-xl p-3 ${p.id === program.id ? 'bg-secondary' : 'bg-white'}`} key={p.id} onClick={() => setProgram({ ...p, sourceUrl: p.sourceUrl ?? '' })}><strong>{p.major}</strong><p>{p.shortName} · {p.admissionYear} · {p.published ? 'Công khai' : 'Nháp'}</p></button>)}
      </section>
      <form className="bg-white border rounded-2xl p-6 space-y-4" onSubmit={e => {
        e.preventDefault(); void action(async () => {
          const response = program.id ? await api.put<Program>(`/api/admin/programs/${program.id}`, program) : await api.post<Program>('/api/admin/programs', program);
          setProgram(response.data);
        }, 'Đã lưu chương trình.');
      }}>
        <h2 className="text-xl font-semibold">{program.id ? 'Sửa chương trình' : 'Chương trình mới'}</h2>
        <div className="grid sm:grid-cols-2 gap-4">{([['school', 'Tên trường'], ['shortName', 'Tên viết tắt'], ['major', 'Tên ngành'], ['majorCode', 'Mã ngành']] as const).map(([key, label]) => <label key={key}>{label}<input className={inputClass} required maxLength={key === 'majorCode' ? 30 : key === 'shortName' ? 100 : 255} value={program[key]} onChange={e => setProgram(p => ({ ...p, [key]: e.target.value }))} /></label>)}</div>
        <label className="block">Năm tuyển sinh<input className={inputClass} type="number" required min={2000} max={2100} value={program.admissionYear} onChange={e => setProgram(p => ({ ...p, admissionYear: Number(e.target.value) }))} /></label>
        <fieldset><legend>Tổ hợp ba môn</legend><div className="flex flex-wrap gap-3">{Object.entries(groups).map(([code, subjects]) => <label key={code} className="flex gap-1"><input type="checkbox" checked={program.subjectGroups.some(g => g.code === code)} onChange={e => setProgram(p => ({ ...p, subjectGroups: e.target.checked ? [...p.subjectGroups, { code, subjects }] : p.subjectGroups.filter(g => g.code !== code) }))} />{code}</label>)}</div></fieldset>
        <fieldset><legend>Hồ sơ Holland của ngành (0–100, cần rà soát chuyên môn)</legend><div className="grid grid-cols-3 gap-3">{Object.entries(HOLLAND_LABELS).map(([key, info]) => <label key={key}>{key} · {info.name}<input className={inputClass} type="number" required min={0} max={100} value={program.hollandProfile[key] ?? 0} onChange={e => setProgram(p => ({ ...p, hollandProfile: { ...p.hollandProfile, [key]: Number(e.target.value) } }))} /></label>)}</div></fieldset>
        <div className="grid sm:grid-cols-2 gap-3"><label>Điểm tham khảo (thang 30)<input className={inputClass} type="number" min={0} max={30} step="0.01" value={program.benchmark ?? ''} onChange={e => setProgram(p => ({ ...p, benchmark: e.target.value === '' ? null : Number(e.target.value) }))} /></label><label>Năm của điểm tham khảo<input className={inputClass} type="number" min={2000} max={program.admissionYear} value={program.benchmarkYear ?? ''} onChange={e => setProgram(p => ({ ...p, benchmarkYear: e.target.value === '' ? null : Number(e.target.value) }))} /></label></div>
        <label className="block">Đường dẫn nguồn<input className={inputClass} type="url" value={program.sourceUrl ?? ''} onChange={e => setProgram(p => ({ ...p, sourceUrl: e.target.value }))} /></label>
        <label className="flex gap-2"><input type="checkbox" checked={program.verified} onChange={e => setProgram(p => ({ ...p, verified: e.target.checked }))} />Đã kiểm tra dữ liệu với nguồn</label>
        <label className="flex gap-2"><input type="checkbox" checked={program.published} onChange={e => setProgram(p => ({ ...p, published: e.target.checked }))} />Hiển thị công khai</label>
        <Button disabled={busy || !useBackend}>{busy ? 'Đang lưu…' : 'Lưu chương trình'}</Button>
      </form>
    </div> : <div className="space-y-5">
      <section className="bg-white border rounded-2xl p-5 space-y-3"><h2 className="text-xl font-semibold">Các phiên bản</h2>
        <p className="text-sm text-muted-foreground">Bấm Dùng bộ này để chọn phiên bản cho học sinh làm. Mỗi loại có một bộ đang sử dụng; bạn có thể chọn lại bộ cũ. Luôn giữ ít nhất một bộ Holland và một bộ Đa trí tuệ.</p>
        {removedQuizzes.map(q => <div key={q.id} className="bg-secondary rounded-xl p-3 flex flex-wrap gap-3 items-center" role="status"><span>Đã xóa {q.title} · v{q.version}.</span><Button variant="outline" disabled={busy} onClick={() => void action(async () => { await api.post(`/api/admin/quizzes/${q.id}/restore`); setRemovedQuizzes(old => old.filter(item => item.id !== q.id)); }, 'Đã khôi phục bộ câu hỏi.')}>Hoàn tác xóa bộ câu hỏi</Button></div>)}
        {quizzes.map(q => <div className="flex flex-wrap gap-3 items-center border-b py-3" key={q.id}><span className="flex-1 min-w-48">{q.title} · v{q.version} · {q.questions.length} câu · <strong className={q.status === 'PUBLISHED' ? 'text-primary' : 'font-normal'}>{q.status === 'PUBLISHED' ? 'Đang sử dụng' : q.status === 'DRAFT' ? 'Bản nháp' : 'Đã lưu trữ'}</strong></span>
          <Button variant="outline" disabled={busy} onClick={() => useTemplate(q)}>Dùng làm mẫu</Button>
          <Button disabled={busy || q.status === 'PUBLISHED'} aria-label={`${q.status === 'PUBLISHED' ? 'Đang dùng' : 'Dùng'} ${q.title} phiên bản ${q.version}`} onClick={() => void action(() => api.post(`/api/admin/quizzes/${q.id}/publish`, { revision: q.revision }), `Đã chọn ${q.title} phiên bản ${q.version} để sử dụng. Kết quả và lịch sử cũ được giữ nguyên.`)}>{q.status === 'PUBLISHED' ? 'Đang dùng' : 'Dùng bộ này'}</Button>
          <div className="flex flex-col gap-1 items-start"><Button variant="outline" className="text-destructive" disabled={busy || Boolean(deletionReason(q))} aria-label={`Xóa ${q.title} phiên bản ${q.version}`} onClick={() => void removeQuiz(q)}>Xóa bộ câu hỏi</Button>{deletionReason(q) && <span className="text-xs text-muted-foreground max-w-60">{deletionReason(q)}</span>}</div>
        </div>)}
      </section>
      <form ref={quizForm} className="bg-white border rounded-2xl p-6 space-y-4" onSubmit={e => {
        e.preventDefault();
        if (missingGroups.length || blankQuestions || !questions.length) { setError('Hãy nhập nội dung câu hỏi và bổ sung đủ các nhóm đánh giá được ghi bên dưới.'); return; }
        void action(() => api.post('/api/admin/quizzes', { type: quizType, title: title.trim(), questions: questions.map(q => ({ ...q, text: q.text.trim() })) }), 'Đã tạo bản nháp mới. Bản nháp nằm trong danh sách phiên bản phía trên; chọn Dùng bộ này để học sinh sử dụng.');
      }}>
        <h2 className="text-xl font-semibold">Tạo phiên bản mới</h2>
        <p className="text-sm text-gray-500">Mỗi lần lưu tạo một bản nháp mới. Phiên bản đã xuất bản giữ nguyên nội dung.</p>
        <label className="block">Loại quiz<select disabled={busy} className={inputClass} value={quizType} onChange={e => { setQuizType(e.target.value as QuizType); setTitle(e.target.value === 'MI' ? 'Đa trí tuệ' : 'Holland RIASEC'); setQuestions([]); setMessage(''); setError(''); }}><option value="HOLLAND">Holland</option><option value="MI">Đa trí tuệ</option></select></label>
        <div className="flex flex-wrap gap-3">{latestTemplate && <Button type="button" variant="outline" disabled={busy} onClick={() => useTemplate(latestTemplate)}>Sao chép phiên bản {latestTemplate.version}</Button>}<Button type="button" variant="outline" disabled={busy || questions.length > 0} onClick={() => setQuestions(Object.keys(dimensions).map((type,index) => ({ id:index + 1, type, text:'' })))}>Tạo khung đủ {Object.keys(dimensions).length} nhóm</Button></div>
        <p className="text-sm text-muted-foreground">Mỗi nhóm cần ít nhất một câu để tính điểm. Bạn có thể sao chép bộ cũ rồi chỉnh sửa, hoặc tạo khung và nhập câu hỏi cho từng nhóm.</p>
        <div className="bg-secondary rounded-xl p-4 text-sm" role="status"><p>{questions.length} câu hỏi · {Object.keys(dimensions).length - missingGroups.length}/{Object.keys(dimensions).length} nhóm đánh giá.</p>{missingGroups.length > 0 && <p>Còn thiếu: {missingGroups.map(([,info]) => info.name).join(', ')}.</p>}{blankQuestions > 0 && <p>Cần nhập nội dung cho {blankQuestions} câu hỏi.</p>}{questions.length > 0 && !missingGroups.length && !blankQuestions && <p>Đã đủ nội dung để lưu bản nháp.</p>}</div>
        <label className="block">Tên bộ câu hỏi<input ref={quizTitle} disabled={busy} className={inputClass} required pattern=".*\S.*" maxLength={255} value={title} onChange={e => setTitle(e.target.value)} /></label>
        {questions.map((q, index) => <fieldset className="border rounded-xl p-3 space-y-2" key={q.id}><legend>Câu {index + 1}</legend>
          <label className="block">Nội dung<textarea className={inputClass} required maxLength={2000} value={q.text} onChange={e => setQuestions(old => old.map(item => item.id === q.id ? { ...item, text: e.target.value } : item))} /></label>
          <label className="block">Nhóm đánh giá<select className={inputClass} value={q.type} onChange={e => setQuestions(old => old.map(item => item.id === q.id ? { ...item, type: e.target.value } : item))}>{Object.entries(dimensions).map(([key, info]) => <option key={key} value={key}>{info.name}</option>)}</select></label>
          <Button type="button" variant="outline" onClick={() => setQuestions(old => old.filter(item => item.id !== q.id))}>Xóa câu</Button>
        </fieldset>)}
        <div className="flex gap-3"><Button type="button" variant="outline" disabled={questions.length >= 200} onClick={() => setQuestions(old => [...old, { id: Math.max(0, ...old.map(q => q.id)) + 1, text: '', type: Object.keys(dimensions)[0] }])}>Thêm câu hỏi</Button><Button disabled={busy || !useBackend || !questions.length}>Lưu bản nháp</Button></div>
      </form>
    </div>}
  </main>;
}
