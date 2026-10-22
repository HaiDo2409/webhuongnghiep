import { Link } from 'react-router-dom';
import { Compass, Heart } from 'lucide-react';
import { AccountLogin } from '@/pages/login/_components/AccountLogin';
import { SITE_NAME } from '@/lib/brand';
export function LoginPage() {
  return <main className="auth-page"><aside className="auth-story"><Link to="/" className="brand"><span className="brand-symbol"><Compass size={25} strokeWidth={1.6} /></span><span className="brand-name">{SITE_NAME}<small>CHUYÊN BIÊN HÒA</small></span></Link><div className="auth-story-copy"><div className="auth-decoration" aria-hidden="true">✳</div><h2>Cứ là chính mình.<br /><span>Rồi bạn sẽ tìm<br />thấy hướng đi.</span></h2><p>Lưu những điều bạn thích, những ngành bạn tò mò và những bước nhỏ trên hành trình của mình.</p></div><div className="micro-copy"><Heart size={13} />Không cần đi thật nhanh. Chỉ cần bắt đầu.</div></aside><div className="auth-form-wrap"><AccountLogin /></div></main>;
}
