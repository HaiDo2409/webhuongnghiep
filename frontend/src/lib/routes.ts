/**
 * Route constants — đường dẫn tập trung, không hardcode path.
 *
 * Dùng:
 *   import { ROUTES } from '@/lib/routes';
 *   <Link to={ROUTES.COURSE_DETAIL(course.id)}>...</Link>
 *   navigate(ROUTES.COURSES);
 */
export const ROUTES = {
  // ── Public ─────────────────────────────────────
  HOME: '/',
  LOGIN: '/login',
  COURSES: '/courses',
  COURSE_DETAIL: (id: string) => `/courses/${id}`,

  // ── Bản đồ Hướng Nghiệp ────────────────────────
  TRAC_NGHIEM: '/trac-nghiem',
  XET_TUYEN: '/xet-tuyen',
  BAN_TIN: '/ban-tin',
  KY_NANG: '/ky-nang',

  // ── Classroom (Enrolled student) ───────────────
  CLASSROOM: (courseId: string) => `/courses/${courseId}/classroom`,
  LESSON: (courseId: string, lessonId: string) => `/courses/${courseId}/lessons/${lessonId}`,
  TEST_TAKE: (testId: string) => `/tests/${testId}/take`,
  TEST_RESULT: (sessionId: string) => `/tests/sessions/${sessionId}/result`,

  // ── Student ────────────────────────────────────
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',

  // ── Instructor ─────────────────────────────────
  INSTRUCTOR_DASHBOARD: '/instructor',
  INSTRUCTOR_COURSE_EDITOR: (id: string) => `/instructor/courses/${id}`,
  INSTRUCTOR_LESSON_EDITOR: (lessonId: string) => `/instructor/lessons/${lessonId}/edit`,
  INSTRUCTOR_TEST_BUILDER: (lessonId: string) => `/instructor/lessons/${lessonId}/test`,
  QUESTION_BANK: '/instructor/questions',

  // ── Admin ──────────────────────────────────────
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',

  // ── Comments ───────────────────────────────────
  COMMENT_THREAD: (commentId: string) => `/comments/thread/${commentId}`,
} as const;
