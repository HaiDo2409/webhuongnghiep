import { SchoolDirectory } from '@/features/schools/SchoolDirectory';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { LandingPage } from '@/pages';
import { LoginPage } from '@/pages/login';
import { Dashboard } from '@/pages/dashboard';
import { GuestRoute } from '@/components/GuestRoute';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { lazy, Suspense } from 'react';
import { ROUTES } from '@/lib/routes';
import { PERMISSION } from '@/lib/permissions';

// ── Bản đồ Hướng Nghiệp – 4 trang chính ─────────────────────────────────────
import { TracNghiemPage } from '@/pages/trac-nghiem';
import { XetTuyenPage } from '@/pages/xet-tuyen';
import { BanTinPage } from '@/pages/ban-tin';
import { KyNangPage } from '@/pages/ky-nang';
import { BookmarksPage } from '@/pages/bookmarks';
import { useBackend } from '@/lib/runtime';
import { BackendQuizPage } from '@/features/guidance/BackendQuizPage';
import { BackendAdmissionsPage } from '@/features/guidance/BackendAdmissionsPage';
import { ProfileDashboard } from '@/features/profile/ProfileDashboard';
import { PasswordSettingsPage } from '@/features/profile/PasswordSettingsPage';
import { QuizHistoryDetail } from '@/features/profile/QuizHistoryDetail';
import { AdminPage } from '@/features/admin/AdminPage';
import { CareerDirectory } from '@/features/careers/CareerDirectory';

const EditorTestPage = lazy(() =>
  import('@/pages/editor-test').then((m) => ({ default: m.EditorTestPage })),
);

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false} disableTransitionOnChange>
        <TooltipProvider>
          <AuthProvider>
            <Routes>
              {/* ── Public (với MainLayout) ────────────────── */}
              <Route element={<MainLayout />}>
                <Route path={ROUTES.HOME} element={<LandingPage />} />
                <Route path="/nganh-nghe" element={<CareerDirectory />} /><Route path="/truong" element={<SchoolDirectory />} />

                {/* ── Bản đồ Hướng Nghiệp ─────────────────── */}
                <Route path={ROUTES.TRAC_NGHIEM} element={useBackend ? <BackendQuizPage /> : <TracNghiemPage />} />
                <Route path={ROUTES.XET_TUYEN} element={useBackend ? <BackendAdmissionsPage /> : <XetTuyenPage />} />
                <Route path={ROUTES.BAN_TIN} element={<BanTinPage />} />
                <Route path={ROUTES.KY_NANG} element={<KyNangPage />} />
                <Route path={ROUTES.BOOKMARKS} element={<BookmarksPage />} />

                <Route
                  path={ROUTES.COURSE_DETAIL(':id')}
                  element={
                    <div className="p-8 text-center text-muted-foreground">
                      <h2 className="text-2xl font-bold mb-4">Course Detail (Đang thi công)</h2>
                      <p>
                        Bạn vừa click vào xem chi tiết khóa học. Component này sẽ do team Frontend
                        phát triển.
                      </p>
                    </div>
                  }
                />
              </Route>

              {/* ── Guest Only (redirect nếu đã đăng nhập) ── */}
              <Route element={<GuestRoute />}>
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              </Route>

              {/* ── Protected (cần đăng nhập) ─────────────── */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path={ROUTES.DASHBOARD} element={useBackend ? <ProfileDashboard /> : <Dashboard />} />
                  <Route path="/dashboard/results/:id" element={<QuizHistoryDetail />} />
                  <Route path="/tai-khoan/doi-mat-khau" element={<PasswordSettingsPage />} />
                </Route>
              </Route>

              {/* ── Instructor (cần quyền quản lý khóa học) ────────── */}
              <Route
                element={<ProtectedRoute requiredPermission={PERMISSION.MANAGE_OWN_COURSES} />}
              >
                <Route element={<MainLayout />}>
                  {/* Thêm các trang instructor ở đây */}
                </Route>
              </Route>

              {/* ── Admin (cần quyền admin) ────────────────── */}
              <Route element={<ProtectedRoute requiredPermission={PERMISSION.ADMIN} />}>
                <Route element={<MainLayout />}>
                  <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminPage />} />
                </Route>
              </Route>

              {/* ── Dev Tools ─────────────────────────────── */}
              <Route
                path="/editor-test"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <EditorTestPage />
                  </Suspense>
                }
              />
            </Routes>

            <Toaster position="bottom-right" richColors closeButton />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
