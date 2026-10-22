import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { errorMessage, type Program, type BenchmarkPoint } from '@/services/guidance';

interface Data { programId: string; revision: number; points: BenchmarkPoint[] }
export function BenchmarkHistoryEditor({ program, onSaved }: { program: Program; onSaved: (revision: number) => void }) {
  const [data, setData] = useState<Data | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    let live = true;
    api.get<Data>(`/api/admin/programs/${program.id}/benchmarks`).then(r => { if (live) setData(r.data); }).catch(e => { if (live) setError(errorMessage(e)); });
    return () => { live = false; };
  }, [program.id]);
  async function save() {
    if (!data) return;
    setBusy(true); setError(''); setMessage('');
    try { const response = await api.put<Data>(`/api/admin/programs/${program.id}/benchmarks`, { ...data, revision: program.revision }); setData(response.data); onSaved(response.data.revision); setMessage('Đã lưu lịch sử. Mốc xu hướng chỉ dùng dòng đã kiểm tra nguồn và xác nhận tương thích.'); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  function update(index: number, changes: Partial<BenchmarkPoint>) { setMessage(''); setData(old => old && ({ ...old, points: old.points.map((p, i) => i === index ? { ...p, ...changes } : p) })); }
  return <section className="bg-white border rounded-2xl p-6 space-y-4 lg:col-span-2">
    <h2 className="text-xl font-semibold">Lịch sử điểm chuẩn · {program.shortName} · {program.major}</h2>
    <p>Chỉ nhập điểm THPT thang 30, ba môn không hệ số. Mỗi tổ hợp cần đủ {program.admissionYear - 1}, {program.admissionYear - 2}, {program.admissionYear - 3}. Không dùng điểm ĐGNL, học bạ hoặc số liệu minh họa vào đây.</p>
    <p className="text-sm text-muted-foreground">Xác nhận tương thích khi mã ngành, cơ sở, chương trình, phương thức, hệ số và thang điểm có thể so sánh qua các năm. Đổi cách tuyển sinh thì giữ tắt xác nhận.</p>
    {error && <p role="alert" className="notice notice-error">{error} Hãy tải lại trang nếu có người khác vừa cập nhật.</p>}{message && <p role="status" className="notice notice-info">{message}</p>}
    {!data ? <p>Đang tải lịch sử…</p> : <fieldset disabled={busy} className="space-y-4">{data.points.map((point, index) => <div key={index} className="border rounded-xl p-4 space-y-3">
      <div className="grid sm:grid-cols-3 gap-3"><label className="form-field">Tổ hợp<select value={point.group} onChange={e => update(index, { group: e.target.value })}>{program.subjectGroups.map(g => <option key={g.code}>{g.code}</option>)}</select></label><label className="form-field">Năm điểm chuẩn<input type="number" min={2000} max={program.admissionYear - 1} value={point.year} onChange={e => update(index, { year: Number(e.target.value) })} /></label><label className="form-field">Điểm chuẩn /30<input type="number" min={0} max={30} step="0.01" value={point.score} onChange={e => update(index, { score: Number(e.target.value) })} /></label></div>
      <label className="form-field">Nguồn công bố chính thức<input type="url" maxLength={2000} value={point.sourceUrl} onChange={e => update(index, { sourceUrl: e.target.value })} placeholder="https://…" /></label>
      <label className="flex gap-2"><input type="checkbox" checked={point.verified} onChange={e => update(index, { verified: e.target.checked })} />Đã đối chiếu điểm với nguồn</label><label className="flex gap-2"><input type="checkbox" checked={point.comparable} onChange={e => update(index, { comparable: e.target.checked })} />Đã kiểm tra có thể so sánh với chương trình hiện tại</label>
      <button type="button" className="text-destructive underline" onClick={() => setData(old => old && ({ ...old, points: old.points.filter((_, i) => i !== index) }))}>Bỏ dòng lịch sử</button>
    </div>)}<div className="flex gap-3 flex-wrap"><button type="button" className="action-secondary" disabled={data.points.length >= 60} onClick={() => setData(old => old && ({ ...old, points: [...old.points, { group: program.subjectGroups[0].code, year: program.admissionYear - 1, score: 0, sourceUrl: '', verified: false, comparable: false }] }))}>Thêm dòng lịch sử</button><button type="button" className="action-primary" onClick={() => void save()}>{busy ? 'Đang lưu…' : 'Lưu lịch sử điểm chuẩn'}</button></div></fieldset>}
  </section>;
}
