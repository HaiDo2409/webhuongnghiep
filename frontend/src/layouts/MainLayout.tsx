import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import type { CurrentUser } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ROUTES } from '@/lib/routes';
import {
  GraduationCap, Brain, Search, Newspaper, Map,
  Menu, X, ChevronDown, Heart,
} from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
  { to: ROUTES.TRAC_NGHIEM, label: 'Trắc nghiệm',    icon: <Brain className="h-4 w-4" /> },
  { to: ROUTES.XET_TUYEN,   label: 'Tra cứu XTS',    icon: <Search className="h-4 w-4" /> },
  { to: ROUTES.BAN_TIN,     label: 'Bản tin',         icon: <Newspaper className="h-4 w-4" /> },
  { to: ROUTES.KY_NANG,     label: 'Bản đồ Kỹ năng', icon: <Map className="h-4 w-4" /> },
  { to: ROUTES.BOOKMARKS,   label: 'Yêu thích',       icon: <Heart className="h-4 w-4" /> },
];

const UserButtonDropdown = ({
  user,
  logout,
}: {
  user: CurrentUser;
  logout: () => Promise<void>;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="px-2 py-5 text-white/80 hover:text-white hover:bg-white/10">
        {user.displayName || user.username}
        <Avatar className="ml-2 h-7 w-7">
          <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName || user.username} />
          <AvatarFallback className="bg-white/20 text-white text-xs">
            {(user.displayName || user.username || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="bg-white border-gray-200 text-gray-900 shadow-lg">
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-gray-400 font-normal">@{user.username}</DropdownMenuLabel>
        <DropdownMenuItem className="hover:bg-blue-50 cursor-pointer">
          <Link to={ROUTES.DASHBOARD}>Trang cá nhân</Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator className="bg-gray-100" />
      <DropdownMenuGroup>
        <DropdownMenuItem variant="destructive" onSelect={logout} className="cursor-pointer">
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);

export function MainLayout() {
  const auth = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 font-sans">

      {/* ── White top bar: Logo + Login ──────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 py-2.5 px-4">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-blue-500 text-[11px] font-medium leading-tight">Hướng nghiệp</p>
              <p className="text-gray-900 font-bold text-sm leading-tight">THPT Chuyên Biên Hòa – Hà Nam</p>
            </div>
          </Link>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {auth && auth.isAuthenticated ? (
              /* User dropdown dùng màu tối vì nằm trên header trắng */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-2 py-5 text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                    {auth.user.displayName || auth.user.username}
                    <Avatar className="ml-2 h-7 w-7">
                      <AvatarImage src={auth.user.avatarUrl || undefined} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                        {(auth.user.displayName || auth.user.username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border-gray-200 text-gray-900 shadow-lg">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-gray-400 font-normal">@{auth.user.username}</DropdownMenuLabel>
                    <DropdownMenuItem className="hover:bg-blue-50 cursor-pointer">
                      <Link to={ROUTES.DASHBOARD}>Trang cá nhân</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem variant="destructive" onSelect={auth.logout} className="cursor-pointer">
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                size="sm"
                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white hidden sm:inline-flex"
              >
                <Link to={ROUTES.LOGIN}>Đăng nhập</Link>
              </Button>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-gray-600 hover:text-gray-900 transition-colors p-1"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Blue sticky nav bar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-blue-700 shadow-md">
        <div className="container mx-auto px-4">
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center h-11">
            <Link
              to="/"
              className={`px-4 h-full flex items-center text-sm font-medium text-white/90 transition-colors ${
                location.pathname === '/' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              Trang chủ
            </Link>
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 h-full flex items-center gap-1 text-sm font-medium text-white/90 transition-colors ${
                  location.pathname === to ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                {label}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-blue-700 px-4 pb-3 pt-2 space-y-0.5">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm text-white hover:bg-white/10 rounded"
            >
              Trang chủ
            </Link>
            {NAV_LINKS.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded"
              >
                {icon} {label}
              </Link>
            ))}
            {!auth?.isAuthenticated && (
              <Link
                to={ROUTES.LOGIN}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-white font-semibold hover:bg-white/10 rounded border-t border-white/10 mt-1 pt-3"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        )}
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-blue-800 text-white py-10 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Bản đồ Hướng Nghiệp</p>
              <p className="text-white/50 text-xs">THPT Chuyên Biên Hòa – Hà Nam</p>
            </div>
          </div>
          <nav className="flex gap-5 flex-wrap justify-center">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className="text-white/50 hover:text-white text-sm transition-colors">
                {label}
              </Link>
            ))}
          </nav>
          <p className="text-white/35 text-xs">
            © 2026 THPT Chuyên Biên Hòa – Hà Nam. Hệ thống hướng nghiệp.
          </p>
        </div>
      </footer>
    </div>
  );
}
