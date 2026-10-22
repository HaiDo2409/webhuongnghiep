import { Link } from 'react-router-dom';
import { ChangePasswordForm } from './ChangePasswordForm';

export function PasswordSettingsPage() {
  return <main className="page-width page-enter account-settings-page">
    <Link className="text-link" to="/dashboard">← Trang cá nhân</Link>
    <header className="space-y-2"><p className="eyebrow">TÀI KHOẢN CỦA BẠN</p><h1 className="text-3xl font-semibold">Bảo mật tài khoản</h1><p>Quản lý mật khẩu đăng nhập của bạn.</p></header>
    <ChangePasswordForm />
  </main>;
}
