import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, RotateCcw, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { guidance, type QuizResult, type RecommendationItem } from '@/services/guidance';
import { HOLLAND_LABELS, type HollandType } from '@/pages/trac-nghiem/data/questions';
import { MI_LABELS, type MIType } from '@/pages/trac-nghiem/data/mi-questions';
import { SKILL_MAP } from '@/pages/ky-nang/data/skills';

const personality: Record<string, { name: string; description: string }> = {
  R: { name: 'Một người thích kiến tạo.', description: 'Bạn có xu hướng thích trải nghiệm, tự tay làm và nhìn thấy ý tưởng trở thành điều cụ thể.' },
  I: { name: 'Một người luôn tò mò.', description: 'Bạn có xu hướng thích đặt câu hỏi, tìm hiểu đến cùng và khám phá cách mọi thứ vận hành.' },
  A: { name: 'Một góc nhìn đầy sáng tạo.', description: 'Bạn có xu hướng thích những ý tưởng mới, cách thể hiện riêng và không gian để thử điều khác biệt.' },
  S: { name: 'Một người biết kết nối.', description: 'Bạn có xu hướng tìm thấy niềm vui khi lắng nghe, sẻ chia và giúp người khác tiến bộ.' },
  E: { name: 'Một người muốn tạo dấu ấn.', description: 'Bạn có xu hướng thích khởi xướng ý tưởng, kết nối mọi người và cùng nhau hướng tới mục tiêu.' },
  C: { name: 'Một người có sự tỉ mỉ.', description: 'Bạn có xu hướng thích sự rõ ràng, tổ chức mọi thứ và chăm chút để công việc diễn ra trọn vẹn.' },
};
function dimensionName(key: string) { return HOLLAND_LABELS[key as HollandType]?.name ?? MI_LABELS[key as MIType]?.name ?? key; }
const shortNames: Record<string, string> = { R: 'Thực tế', I: 'Nghiên cứu', A: 'Sáng tạo', S: 'Kết nối', E: 'Dẫn dắt', C: 'Tổ chức' };
const pathForDimension: Record<string, string> = { R: 'ky-thuat', I: 'lap-trinh-ai', A: 'ngoai-ngu', S: 'ngoai-ngu', E: 'ngoai-ngu', C: 'toan-khoa-hoc', logical: 'toan-khoa-hoc', spatial: 'ky-thuat', naturalist: 'toan-khoa-hoc', bodily: 'ky-thuat' };

export function QuizResults({ result, onReset }: { result: QuizResult; onReset: () => void }) {
  const auth = useAuth();
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(result.type === 'HOLLAND');
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    title.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [result.id]);
  useEffect(() => {
    if (result.type !== 'HOLLAND') return;
    let live = true;
    guidance.programs().then(programs => {
      const year = Math.max(0, ...programs.map(p => p.admissionYear));
      if (!year) return [];
      return guidance.recommend(year, 'INTEREST', {}, result.id).then(response => {
        const seen = new Set<string>();
        return response.items.filter(item => {
          const key = item.program.majorCode || item.program.major;
          if (seen.has(key)) return false;
          seen.add(key); return true;
        }).slice(0, 3);
      });
    }).then(data => { if (live) setItems(data); }).catch(() => { if (live) setFailed(true); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [result.id, result.type, retry]);
  const dimension = result.topCodes[0];
  const scores = Object.entries(result.normalizedScores).sort((a, b) => b[1] - a[1]);
  const nearTie = scores.length > 1 && scores[0][1] - scores[1][1] < 5;
  const profile = personality[dimension];
  const field = SKILL_MAP.find(path => path.id === (pathForDimension[dimension] ?? 'ngoai-ngu')) ?? SKILL_MAP[0];
  const roadmap = field.children?.slice(0, 3) ?? [];
  return <main className="page-width result-page page-enter">
    <header className="result-intro"><p className="eyebrow"><Check size={12} />BẠN VỪA HIỂU MÌNH THÊM MỘT CHÚT</p><h1 ref={title} tabIndex={-1} className="outline-none">Một bức tranh về bạn.<br />Và nhiều cánh cửa phía trước.</h1><p>Đây là điểm khởi đầu để khám phá, không phải một chiếc khuôn dành cho bạn.</p></header>
    <div className="result-toolbar"><span>{result.title} · {new Date(result.createdAt).toLocaleDateString('vi-VN')}</span><button className="subtle-link" onClick={onReset}><RotateCcw size={12} />Khám phá lại</button></div>
    <div className="bento-grid">
      <section className="bento-card personality-card"><p className="eyebrow">{result.type === 'HOLLAND' ? 'NHÓM SỞ THÍCH CỦA BẠN' : 'NHỮNG KHẢ NĂNG NỔI BẬT'}</p><h2>{result.type === 'HOLLAND' ? (nearTie ? 'Bạn có nhiều điều muốn khám phá.' : profile?.name) : 'Bạn có cách tỏa sáng của riêng mình.'}</h2><p>{result.type === 'HOLLAND' ? (nearTie ? 'Một vài nhóm sở thích đang khá gần nhau. Cứ cho mình cơ hội trải nghiệm nhiều hướng nhé.' : profile?.description) : 'Mỗi khả năng có thể phát triển bằng trải nghiệm và luyện tập. Hãy bắt đầu từ điều khiến bạn thấy hứng thú.'}</p>
        <div className="personality-decoration" aria-hidden="true">✳</div>
        {result.type === 'HOLLAND' ? <div className="holland-code" aria-label={`Mã Holland tham khảo ${result.topCodes.join('')}`}>{result.topCodes.map(code => <span key={code} title={dimensionName(code)}>{code}</span>)}</div> : <div className="result-tags">{result.topCodes.map(code => <span key={code}>{dimensionName(code)}</span>)}</div>}
      </section>
      <section className="bento-card profile-card"><p className="eyebrow">MỖI SẮC THÁI ĐỀU CÓ Ý NGHĨA</p><h2>Nhìn gần hơn một chút</h2><div className="profile-bars">{scores.map(([code, score]) => <div className="profile-bar-row" key={code} title={dimensionName(code)}><strong>{shortNames[code] ?? dimensionName(code)}</strong><div className="profile-bar-track" role="progressbar" aria-label={dimensionName(code)} aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${score}%` }} /></div><span>{Math.round(score)}</span></div>)}</div><p className="profile-caption">Điểm chuẩn hóa 0–100 trong bài khám phá này.<br />Không phải thước đo giá trị hay giới hạn của bạn.</p></section>
      <section className="bento-card majors-card"><div className="bento-heading"><div><p className="eyebrow">THÊM VÀI CÁNH CỬA ĐỂ THỬ</p><h2>{result.type === 'HOLLAND' ? '3 ngành bạn có thể tìm hiểu' : 'Những hướng học để khám phá'}</h2></div><Link className="icon-button" to={result.type === 'HOLLAND' ? '/xet-tuyen' : '/ky-nang'} aria-label="Khám phá thêm"><ArrowUpRight size={17} /></Link></div>
        {result.type === 'HOLLAND' ? <>
          {loading && <p className="profile-caption" role="status">Đang ghép sở thích của bạn với các ngành học…</p>}
          {failed && <div className="empty-panel"><p>Mình chưa tải được gợi ý ngành. Kết quả khám phá của bạn vẫn được giữ nhé.</p><button className="subtle-link" onClick={() => { setFailed(false); setLoading(true); setRetry(v => v + 1); }}>Tải lại gợi ý<RotateCcw size={12} /></button></div>}
          {!loading && !failed && !items.length && <p className="profile-caption">Danh mục ngành đang được chuẩn bị. Bạn vẫn có thể khám phá các lộ trình bên cạnh nhé.</p>}
          {items.map((item, index) => <Link className="major-row" key={item.program.id} to="/xet-tuyen"><span className="major-rank">0{index + 1}</span><div><h3>{item.program.major}</h3><p>{item.program.shortName} · {item.program.verified ? 'Tham khảo theo sở thích' : 'Dữ liệu tham khảo, chưa xác minh'}</p></div><span className="major-fit">{item.compatibility === null ? <ArrowUpRight size={17} /> : <><strong>{Math.round(item.compatibility)}<small>/100</small></strong><small>Tương đồng Holland</small></>}</span></Link>)}
          {!loading && items.length > 0 && <p className="profile-caption mb-4">Gợi ý theo sở thích, chưa đối chiếu điểm hoặc điều kiện xét tuyển.</p>}
        </> : result.topCodes.map((code, index) => <Link to="/ky-nang" className="major-row" key={code}><span className="major-rank">0{index + 1}</span><div><h3>{dimensionName(code)}</h3><p>{MI_LABELS[code as MIType]?.stemMatch.replace(/^Phù hợp( tốt nhất)?:\s*/, 'Bạn có thể tìm hiểu: ')}</p></div><ArrowUpRight size={17} /></Link>)}
      </section>
      <section className="bento-card roadmap-card"><p className="eyebrow"><Sparkles size={12} />BƯỚC NHỎ TIẾP THEO</p><h2>Thử một chút.<br />Hiểu mình thêm.</h2><ol className="roadmap-list">{roadmap.map((step, index) => <li key={step.id}><span>0{index + 1}</span><div><h3>{step.name}</h3><p>{step.description ?? step.resources?.[0]?.title ?? 'Khám phá kiến thức và thử một bài thực hành nhỏ.'}</p></div></li>)}</ol><Link className="card-link" to={`/ky-nang#${field.id}`}>Xem lộ trình và tài nguyên<ArrowUpRight size={15} /></Link></section>
      <section className="bento-card next-step-card"><div><p className="eyebrow">TỪ SỞ THÍCH ĐẾN LỰA CHỌN</p><h2>Thêm điểm số, rõ hướng đi.</h2><p>{result.type === 'HOLLAND' ? 'Kết hợp kết quả này với điểm môn học để tìm ngành và trường bạn muốn tìm hiểu.' : 'Tiếp tục tìm hiểu ngành học, hoặc khám phá Holland để kết nối sở thích với tra cứu.'}</p></div><Link className="action-primary" to={result.type === 'HOLLAND' ? '/xet-tuyen' : '/ky-nang'}>{result.type === 'HOLLAND' ? 'Tìm ngành & trường' : 'Khám phá lộ trình'}<ArrowRight size={17} /></Link></section>
    </div>
    <p className="result-footnote">{auth?.isAuthenticated ? 'Kết quả đã nằm trong lịch sử của bạn.' : <>Bạn có thể <Link className="underline" to="/login">đăng nhập để lưu kết quả</Link> và tiếp tục trên thiết bị khác.</>} Không có lựa chọn nào là mãi mãi. Cứ học, thử và điều chỉnh theo hành trình của mình nhé.</p>
  </main>;
}
