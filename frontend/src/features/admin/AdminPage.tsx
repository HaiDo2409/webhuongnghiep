import { useEffect, useState } from 'react';
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
        {quizzes.map(q => <div className="flex flex-wrap gap-3 items-center border-b py-3" key={q.id}><span className="flex-1">{q.title} · v{q.version} · {q.questions.length} câu · {q.status}</span>
          <Button variant="outline" disabled={busy} onClick={() => { setQuizType(q.type); setTitle(q.title); setQuestions(q.questions.map(question => ({ ...question }))); }}>Dùng làm mẫu</Button>
          {q.status === 'DRAFT' && <Button disabled={busy} onClick={() => void action(() => api.post(`/api/admin/quizzes/${q.id}/publish`, { revision: q.revision }), 'Đã xuất bản phiên bản mới; lịch sử cũ được giữ nguyên.')}>Xuất bản</Button>}
        </div>)}
      </section>
      <form className="bg-white border rounded-2xl p-6 space-y-4" onSubmit={e => { e.preventDefault(); void action(() => api.post('/api/admin/quizzes', { type: quizType, title, questions }), 'Đã tạo bản nháp mới. Kiểm tra trước khi xuất bản.'); }}>
        <h2 className="text-xl font-semibold">Tạo phiên bản mới</h2>
        <p className="text-sm text-gray-500">Mỗi lần lưu tạo một bản nháp mới. Phiên bản đã xuất bản giữ nguyên nội dung.</p>
        <label className="block">Loại quiz<select className={inputClass} value={quizType} onChange={e => { setQuizType(e.target.value as QuizType); setQuestions([]); }}><option value="HOLLAND">Holland</option><option value="MI">Đa trí tuệ</option></select></label>
        <label className="block">Tên bộ câu hỏi<input className={inputClass} required maxLength={255} value={title} onChange={e => setTitle(e.target.value)} /></label>
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
