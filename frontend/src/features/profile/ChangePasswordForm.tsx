import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { errorMessage } from '@/services/guidance';

export function ChangePasswordForm() {
  const [available,setAvailable]=useState<boolean|null>(null);
  const [currentPassword,setCurrentPassword]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [confirmPassword,setConfirmPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{
    let live=true;
    api.get<{canChangePassword:boolean}>('/api/me/password').then(r=>{if(live)setAvailable(r.data.canChangePassword);})
      .catch(e=>{if(live)setError(errorMessage(e));});
    return ()=>{live=false;};
  },[]);
  async function submit(event:React.FormEvent) {
    event.preventDefault();setError('');
    if(newPassword!==confirmPassword){setError('Mật khẩu xác nhận chưa khớp.');return;}
    if(newPassword===currentPassword){setError('Mật khẩu mới cần khác mật khẩu hiện tại.');return;}
    if(new TextEncoder().encode(newPassword).length>72){setError('Mật khẩu mới tối đa 72 byte UTF-8.');return;}
    setBusy(true);
    try {
      await api.post('/api/me/password',{currentPassword,newPassword,confirmPassword});
      setCurrentPassword('');setNewPassword('');setConfirmPassword('');
      sessionStorage.removeItem('hn_active_holland_result');
      window.location.assign('/login?passwordChanged=1');
    } catch(e){setError(errorMessage(e));setBusy(false);}
  }
  return <section className="bg-white border rounded-2xl p-6 space-y-4" aria-labelledby="change-password-title">
    <h2 id="change-password-title" className="text-xl font-semibold">Đổi mật khẩu</h2>
    {error&&<p role="alert" className="text-red-700 bg-red-50 rounded-xl p-4">{error}</p>}
    {available===null?<p role="status" className="text-sm text-muted-foreground">{error?'Chưa tải được cài đặt tài khoản. Hãy tải lại trang để thử lại.':'Đang tải cài đặt tài khoản…'}</p>:!available?
      <p className="text-sm text-muted-foreground">Tài khoản này chưa có mật khẩu đăng nhập.</p>:
      <form onSubmit={submit} className="space-y-4 max-w-lg">
        <p className="text-sm text-muted-foreground">Mật khẩu mới có ít nhất 8 ký tự, tối đa 72 byte UTF-8. Sau khi đổi, các thiết bị sẽ đăng xuất để bảo vệ tài khoản của bạn.</p>
        <label className="form-field">Mật khẩu hiện tại<input type="password" required maxLength={72} autoComplete="current-password" disabled={busy} value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)}/></label>
        <label className="form-field">Mật khẩu mới<input type="password" required minLength={8} maxLength={72} autoComplete="new-password" disabled={busy} value={newPassword} onChange={e=>setNewPassword(e.target.value)}/></label>
        <label className="form-field">Xác nhận mật khẩu mới<input type="password" required minLength={8} maxLength={72} autoComplete="new-password" disabled={busy} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/></label>
        <Button disabled={busy}>{busy?'Đang đổi mật khẩu…':'Đổi mật khẩu'}</Button>
      </form>}
  </section>;
}
