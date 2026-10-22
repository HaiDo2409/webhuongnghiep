import { useEffect, useState } from 'react';
import { ArrowRight, FileCheck2, Info } from 'lucide-react';
import { guidance, errorMessage, subjectLabels, type AdmissionPolicy, type SchoolScoreResult } from '@/services/guidance';
import { defaultPriority, PriorityFields } from './PriorityFields';

export type AdmissionMethod = 'THPT' | 'APTITUDE' | 'COMBINED';
export const admissionMethods = [
  { id: 'THPT' as const, number: '01', title: 'Điểm thi THPT', subtitle: 'Tổ hợp môn & điểm ưu tiên', ready: true },
  { id: 'APTITUDE' as const, number: '02', title: 'Đánh giá năng lực', subtitle: 'Quy đổi theo trường / năm', ready: true },
  { id: 'COMBINED' as const, number: '03', title: 'Xét tuyển kết hợp', subtitle: 'Học bạ & IELTS Academic', ready: true },
];

export function AdmissionMethodPreview({ method }: { method: Exclude<AdmissionMethod, 'THPT'> }) {
  const aptitude = method === 'APTITUDE';
  const [policies, setPolicies] = useState<AdmissionPolicy[]>([]);
  const [policyId, setPolicyId] = useState('');
  const [priority, setPriority] = useState(defaultPriority);
  const [result, setResult] = useState<SchoolScoreResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [second, setSecond] = useState('ly');
  const [transcript, setTranscript] = useState<Record<string, string[]>>({});
  const policy = policies.find(p => p.id === policyId);
  useEffect(() => {
    let live = true;
    guidance.policies().then(data => { if (live) { const available = data.filter(p => p.method === method); setPolicies(available); setPolicyId(available[0]?.id ?? ''); } })
      .catch(e => { if (live) setError(errorMessage(e)); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [method]);
  async function calculate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(''); setResult(null);
    const data = new FormData(e.currentTarget);
    const numeric = (key: string) => data.get(key) === null || data.get(key) === '' ? null : Number(data.get(key));
    try {
      setResult(await guidance.calculate({ policyId, year: 2026, priority,
        examScore: aptitude ? numeric('examScore') : null, examYear: aptitude ? numeric('examYear') : null, hsaSection: data.get('hsaSection'),
        transcript: aptitude ? null : Object.fromEntries(['toan', second].map(s => [s, (transcript[s] ?? []).map(Number)])), secondSubject: second,
        ielts: aptitude ? null : numeric('ielts'), certificateDate: data.get('certificateDate'), thptMath: numeric('thptMath'), thptSecond: numeric('thptSecond'),
        applicantGroup: data.get('applicantGroup'), academicRequirement: data.get('academicRequirement') === 'on', conductRequirement: data.get('conductRequirement') === 'on',
      }));
    } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  return <section className="method-preview" aria-labelledby="method-preview-title">
    <form className="soft-panel preview-form" onChange={() => setResult(null)} onSubmit={calculate}>
      <div className="panel-heading"><span className="panel-icon"><FileCheck2 size={22} /></span><div><h2 id="method-preview-title">{aptitude ? 'Quy đổi điểm kỳ thi của bạn' : 'Kết hợp học bạ & IELTS'}</h2><p>Quy tắc Ngoại thương · Tuyển sinh 2026</p></div></div>
      <fieldset disabled={busy || loading} className="space-y-5">
        <label className="form-field">Trường & nhóm chương trình<select required value={policyId} onChange={e => setPolicyId(e.target.value)}>{loading && <option value="">Đang tải quy tắc…</option>}{policies.map(p => <option key={p.id} value={p.id}>{p.school} · {p.title}</option>)}</select></label>
        {policy && <p className="notice notice-info">{policy.formula}<br />Thang {policy.scale} · Không có điểm thưởng giải thưởng</p>}
        {aptitude ? <div className="preview-fields"><label className="form-field">Điểm {policy?.exam}<input name="examScore" required type="number" min={0} max={policy?.exam === 'HSA' ? 150 : policy?.exam === 'VACT' ? 1200 : 100} step="0.01" placeholder="Điểm trên phiếu kết quả" /></label><label className="form-field">Năm dự thi<input name="examYear" required type="number" min={2026} max={2026} defaultValue={2026} /></label>{policy?.exam === 'HSA' && <label className="form-field">HSA · Phần 3<select name="hsaSection" required defaultValue=""><option value="" disabled>Chọn phần đã thi</option><option value="ENGLISH">Tiếng Anh</option><option value="PHYSICS_CHEMISTRY">Khoa học có Vật lý và Hóa học</option><option value="OTHER">Khoa học không đủ hai lĩnh vực trên</option></select></label>}</div> : <>
          <label className="form-field">Môn thứ hai<select value={second} onChange={e => setSecond(e.target.value)}><option value="ly">Vật lý</option><option value="hoa">Hóa học</option><option value="van">Ngữ văn</option></select></label>
          <p className="text-sm text-muted-foreground">Nhập điểm trung bình cả năm của từng môn, không phải trung bình chung toàn học bạ.</p>
          {['toan', second].map(subject => <fieldset key={subject}><legend>{subjectLabels[subject]} · Học bạ</legend><div className="transcript-grid">{[10, 11, 12].map((grade, i) => <label className="form-field" key={grade}>Lớp {grade}<input required type="number" min={0} max={10} step="0.01" value={transcript[subject]?.[i] ?? ''} onChange={e => setTranscript(old => { const values = [...(old[subject] ?? ['', '', ''])]; values[i] = e.target.value; return { ...old, [subject]: values }; })} /></label>)}</div></fieldset>)}
          <div className="preview-fields"><label className="form-field">IELTS Academic<input required name="ielts" type="number" min={0} max={9} step="0.5" placeholder="Ví dụ: 7.0" /></label><label className="form-field">Ngày cấp IELTS<input required name="certificateDate" type="date" max="2026-06-23" /></label><label className="form-field">Điểm thi THPT môn Toán<input required name="thptMath" type="number" min={0} max={10} step="0.01" /></label><label className="form-field">Điểm thi THPT môn {subjectLabels[second]}<input required name="thptSecond" type="number" min={0} max={10} step="0.01" /></label></div>
          <label className="form-field">Nhóm đối tượng xét học bạ<select name="applicantGroup" defaultValue="NONE"><option value="NONE">Không thuộc hai nhóm dưới đây</option><option value="SPECIALIZED">Hệ chuyên đúng môn / trường theo quy định</option><option value="PROVINCIAL_PRIZE">Không chuyên, giải Nhất/Nhì/Ba HSG tỉnh/thành lớp 11/12 đúng môn</option></select></label>
        </>}
        <PriorityFields value={priority} onChange={setPriority} />
        <div className="eligibility-fields"><label><input name="academicRequirement" type="checkbox" /> Học tập cả ba năm đạt {aptitude ? 'Khá trở lên (chương trình cũ: TB mỗi năm ≥ 7)' : 'Tốt'} theo quy định.</label><label><input name="conductRequirement" type="checkbox" /> Rèn luyện / hạnh kiểm cả ba năm đạt Khá trở lên.</label></div>
        <button className="action-primary" disabled={!policy || busy || loading}>{busy ? 'Đang tính…' : 'Tính điểm & kiểm tra điều kiện'}<ArrowRight size={16} /></button>
      </fieldset>
      {error && <p role="alert" className="notice notice-error">{error}</p>}
    </form>
    <aside className="preview-explanation"><span className="preview-badge">CÔNG THỨC CÓ NGUỒN · 2026</span><h2>Mỗi kết quả.<br />Có cách tính rõ ràng.</h2><p>Đang hỗ trợ một số nhóm chương trình Ngoại thương. Công thức của Bách khoa, ĐH Công nghệ và Kinh tế Quốc dân sẽ được bổ sung riêng sau khi đối chiếu đủ quy định.</p>
      {result ? <div className="school-score-result" role="status"><p>Điểm theo công thức đã chọn</p><strong className="school-score-total">{result.totalScore.toFixed(2)}<small>/{result.policy.scale}</small></strong><p>{result.declaredRequirementsMet ? 'Đạt các điều kiện đã kiểm tra theo thông tin tự khai.' : 'Có điều kiện chưa đạt. Điểm cao không thay thế điều kiện nộp hồ sơ.'}</p><h3>Cách tính của bạn</h3><ol>{result.steps.map(step => <li key={step}>{step}</li>)}</ol><h3>Kiểm tra điều kiện</h3><ul>{result.checks.map(check => <li key={check.label}><span aria-label={check.passed ? 'Đạt' : 'Chưa đạt'}>{check.passed ? '✓' : '○'}</span> {check.label}</li>)}</ul>{result.notes.map(note => <p className="text-sm" key={note}>{note}</p>)}<p className="text-sm">Phiên bản {result.policy.version}</p></div> : <div className="preview-info"><Info size={18} /><p>Hãy nhập điểm để xem từng bước quy đổi và điều kiện. Chưa có lịch sử tương thích cho từng mã ngành ở hai phương thức này nên chưa đánh giá cơ hội.</p></div>}
      {policy && <a className="subtle-link" href={policy.sourceUrl} target="_blank" rel="noopener noreferrer">Đọc quy định tuyển sinh của trường ↗</a>}
    </aside>
  </section>;
}
