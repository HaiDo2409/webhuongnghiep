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
import { ThemeToggle } from '@/components/ThemeToggle';
import { ROUTES } from '@/lib/routes';
import { GraduationCap, Brain, Search, Newspaper, Map, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
  { to: ROUTES.TRAC_NGHIEM, label: 'Trắc nghiệm', icon: <Brain className="h-4 w-4" /> },
  { to: ROUTES.XET_TUYEN, label: 'Tra cứu XTS', icon: <Search className="h-4 w-4" /> },
  { to: ROUTES.BAN_TIN, label: 'Bản tin', icon: <Newspaper className="h-4 w-4" /> },
  { to: ROUTES.KY_NANG, label: 'Bản đồ Kỹ năng', icon: <Map className="h-4 w-4" /> },
];

const UserButtonDropdown = ({
  user,
  logout,
}: {
  user: CurrentUser;
  logout: () => Promise<void>;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="px-2 py-5 text-white/80 hover:text-white hover:bg-white/10">
          {user.displayName || user.username}
          <Avatar>
            <AvatarImage
              src={user.avatarUrl || undefined}
              alt={user.displayName || user.username}
            />
            <AvatarFallback>
              {(user.displayName || user.username || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#001a3a] border-white/10 text-white">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-white/50">@{user.username}</DropdownMenuLabel>
          <DropdownMenuItem className="hover:bg-white/10">
            <Link to={ROUTES.DASHBOARD}>Trang cá nhân</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onSelect={logout}>
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function MainLayout() {
  const auth = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#001a3a] text-foreground font-sans">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#001a3a]/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00e5ff] to-[#7c3aed] flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-tight">Bản đồ Hướng Nghiệp</p>
              <p className="text-white/40 text-xs leading-tight">THPT Chuyên Biên Hòa</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {icon} {label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {auth && auth.isAuthenticated ? (
              <UserButtonDropdown user={auth.user} logout={auth.logout} />
            ) : (
              <Button
                asChild
                className="rounded-full px-5 h-9 text-sm bg-gradient-to-r from-[#00e5ff] to-[#7c3aed] text-white border-0 hover:opacity-90 hidden sm:inline-flex"
              >
                <Link to={ROUTES.LOGIN}>Đăng nhập</Link>
              </Button>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-white/60 hover:text-white transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#001a3a]/95 backdrop-blur-md px-4 pb-4 pt-3 space-y-1">
            {NAV_LINKS.map(({ to, label, icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#00e5ff]/15 text-[#00e5ff]'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {icon} {label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-[#000d1f] py-10 px-4">
        <div className="container mx-auto text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00e5ff] to-[#7c3aed] flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Bản đồ Hướng Nghiệp</p>
              <p className="text-white/40 text-xs">THPT Chuyên Biên Hòa – Đồng Nai</p>
            </div>
          </div>
          <nav className="flex gap-5 flex-wrap justify-center">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className="text-white/40 hover:text-white/70 text-sm transition-colors">
                {label}
              </Link>
            ))}
          </nav>
          <p className="text-white/25 text-xs">
            © 2026 THPT Chuyên Biên Hòa. Hệ thống hướng nghiệp.
          </p>
        </div>
      </footer>
    </div>
  );
}
