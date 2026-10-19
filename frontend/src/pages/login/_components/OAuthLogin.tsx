import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useBackend } from '@/lib/runtime';
import { useAuth } from '@/contexts/AuthContext';
import { errorMessage } from '@/services/guidance';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function OAuthLogin() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    let live = true;
    if (useBackend) api.get<{ googleEnabled: boolean }>('/api/auth/config').then(r => { if (live) setGoogleEnabled(r.data.googleEnabled); }).catch(() => {});
    return () => { live = false; };
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(''); setMessage('');
    if (registering && password !== confirmPassword) { setError('Mật khẩu xác nhận chưa khớp.'); return; }
    setBusy(true);
    try {
      if (registering) {
        await api.post('/api/auth/register', { username, displayName, password });
        setRegistering(false); setPassword(''); setConfirmPassword(''); setMessage('Đăng ký thành công. Hãy đăng nhập bằng tài khoản vừa tạo.');
      } else {
        await api.post('/api/auth/login', { username, password });
        await auth?.refresh();
        const requested = params.get('redirect');
        const target = requested?.startsWith('/') && !requested.startsWith('//') && !requested.includes('\\') && !requested.startsWith('/login') ? requested : '/dashboard';
        navigate(target, { replace: true });
      }
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  return <section className="auth-card page-enter">
    <p className="eyebrow"><span className="status-dot" />HÀNH TRÌNH CỦA RIÊNG BẠN</p>
    <h1 className="mt-4">{registering ? 'Chào bạn mới.' : 'Mừng bạn trở lại.'}</h1>
    <p className="auth-description">{registering ? 'Một tài khoản nhỏ, để giữ lại những điều bạn khám phá về mình.' : 'Tiếp tục từ nơi bạn đã bắt đầu. Những điều hay vẫn đang chờ phía trước.'}</p>
    <div className="auth-tabs" role="group" aria-label="Chọn đăng nhập hoặc đăng ký"><button type="button" className={!registering ? 'selected' : ''} aria-pressed={!registering} disabled={busy} onClick={() => { setRegistering(false); setError(''); setMessage(''); }}>Đăng nhập</button><button type="button" className={registering ? 'selected' : ''} aria-pressed={registering} disabled={busy} onClick={() => { setRegistering(true); setError(''); setMessage(''); }}>Tạo tài khoản</button></div>
    {params.has('error') && <p role="alert" className="notice notice-error">Mình chưa kết nối được với Google. Bạn có thể dùng tài khoản và mật khẩu nhé.</p>}
    {error && <p role="alert" className="notice notice-error">{error}</p>}
    {message && <p role="status" className="notice notice-success">{message}</p>}
    {!useBackend && <p className="notice notice-info">Bạn đang xem bản demo. Tài khoản sẽ hoạt động khi kết nối máy chủ.</p>}
    <form onSubmit={submit}>
      {registering && <label className="form-field">Tên của bạn<input required disabled={busy} maxLength={100} autoComplete="name" placeholder="Mình gọi bạn là gì?" value={displayName} onChange={e => setDisplayName(e.target.value)} /></label>}
      <label className="form-field">Tài khoản<input required disabled={busy} minLength={3} maxLength={40} pattern="[a-zA-Z0-9][a-zA-Z0-9_.\-]{2,39}" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="Tên tài khoản của bạn" value={username} onChange={e => setUsername(e.target.value)} /></label>
      {registering && <p className="auth-hint">3–40 ký tự: chữ không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.</p>}
      <label className="form-field">Mật khẩu<input type="password" required disabled={busy} minLength={registering ? 8 : undefined} maxLength={72} placeholder={registering ? 'Tạo mật khẩu của bạn' : 'Nhập mật khẩu'} autoComplete={registering ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} /></label>
      {registering && <><p className="auth-hint">Ít nhất 8 ký tự, tối đa 72 byte UTF-8.</p><label className="form-field">Xác nhận mật khẩu<input type="password" required disabled={busy} minLength={8} maxLength={72} autoComplete="new-password" placeholder="Nhập lại mật khẩu một lần nữa" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></label></>}
      <button className="action-primary" disabled={busy || !useBackend}>{busy ? 'Chờ mình một chút…' : registering ? 'Bắt đầu hành trình' : 'Đăng nhập'}<ArrowRight size={17} /></button>
    </form>
    {googleEnabled && <><div className="google-divider">HOẶC</div><button className="action-secondary google-button" disabled={busy} onClick={() => { window.location.href = '/oauth2/authorization/google'; }}>Tiếp tục với Google</button></>}
    <Link to="/" className="auth-back"><ArrowLeft size={12} />Trở về khám phá</Link>
  </section>;
}
