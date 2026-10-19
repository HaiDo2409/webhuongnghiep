import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Compass, Heart, Menu, X, UserRound, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBackend } from '@/lib/runtime';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import './design.css';

const links = [
  { to: '/trac-nghiem', label: 'Khám phá bản thân' },
  { to: '/xet-tuyen', label: 'Tìm ngành & trường' },
  { to: '/ky-nang', label: 'Lộ trình kỹ năng' },
  { to: '/ban-tin', label: 'Góc cảm hứng' },
];
export function MainLayout() {
  const auth = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isQuiz = location.pathname === '/trac-nghiem';
  return <div className="site-shell">
    <a className="skip-link" href="#main-content">Đến nội dung chính</a>
    <header className="site-header">
      <div className="site-nav">
        <Link to="/" className="brand" aria-label="Hướng nghiệp — Trang chủ" onClick={() => setMobileOpen(false)}><span className="brand-symbol"><Compass size={25} strokeWidth={1.6} /></span><span>hướng nghiệp<span className="brand-dot">.</span><small>CHUYÊN BIÊN HÒA</small></span></Link>
        <nav className="desktop-nav" aria-label="Điều hướng chính">{links.map(link => <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? 'nav-link is-active' : 'nav-link'}>{link.label}</NavLink>)}</nav>
        <div className="nav-actions">
          <Link className="icon-button saved-link" to="/yeu-thich" aria-label="Danh sách đã lưu"><Heart size={19} strokeWidth={1.6} /></Link>
          {auth?.isAuthenticated ? <DropdownMenu><DropdownMenuTrigger asChild><button className="account-button" aria-label="Mở menu tài khoản"><UserRound size={17} /><span>{auth.user.displayName || 'Tài khoản'}</span></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="account-menu">
            <DropdownMenuItem asChild><Link to="/dashboard"><LayoutDashboard size={16} />Trang cá nhân</Link></DropdownMenuItem>
            {(auth.user.permissions & 1n) === 1n && <DropdownMenuItem asChild><Link to="/admin"><ShieldCheck size={16} />Quản trị nội dung</Link></DropdownMenuItem>}
            <DropdownMenuSeparator /><DropdownMenuItem onSelect={() => { void auth.logout(); }}><LogOut size={16} />Đăng xuất</DropdownMenuItem>
          </DropdownMenuContent></DropdownMenu> : <Link className="nav-login" to="/login">Đăng nhập<ArrowUpRight size={15} /></Link>}
          <button className="icon-button mobile-menu-button" aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen(v => !v)}>{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      {mobileOpen && <nav className="mobile-navigation" id="mobile-navigation" aria-label="Điều hướng trên điện thoại">{links.map(link => <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>{link.label}<ArrowUpRight size={16} /></NavLink>)}<Link to="/yeu-thich" onClick={() => setMobileOpen(false)}>Danh sách đã lưu<Heart size={16} /></Link></nav>}
    </header>
    {!useBackend && <div className="demo-notice">Bạn đang khám phá bản demo với dữ liệu tham khảo.</div>}
    <div id="main-content" className="site-content"><Outlet /></div>
    {!isQuiz && <footer className="site-footer"><div className="footer-inner"><div><Link className="footer-brand" to="/">Một chút hiểu mình.<br /><span>Nhiều hơn một hướng đi.</span></Link><p>Đồng hành cùng học sinh THPT Chuyên Biên Hòa.</p></div><nav aria-label="Liên kết cuối trang"><Link to="/trac-nghiem">Khám phá bản thân<ArrowUpRight size={15} /></Link><Link to="/xet-tuyen">Tìm ngành & trường<ArrowUpRight size={15} /></Link><Link to="/yeu-thich">Những điều đã lưu<ArrowUpRight size={15} /></Link></nav></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Hướng nghiệp · Chuyên Biên Hòa</span><span>Từng bước nhỏ, đến tương lai của bạn.</span></div></footer>}
  </div>;
}
