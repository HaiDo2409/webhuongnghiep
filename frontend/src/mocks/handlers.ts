import { http, HttpResponse } from 'msw';
import { courseHandlers } from './handlers/courses';
import { moduleHandlers } from './handlers/modules';
import { questionHandlers } from './handlers/questions';
import { fileHandlers } from './handlers/files';

/**
 * Auth mock — trả về unauthenticated khi backend offline
 * Đảm bảo không có toast lỗi 502 khi dev mode
 */
const authHandlers = [
  http.get('/api/users/me', () => {
    return HttpResponse.json({ authenticated: false }, { status: 200 });
  }),
  http.post('/api/logout', () => {
    return HttpResponse.json({}, { status: 200 });
  }),
];

/**
 * Tất cả mock handlers — import vào browser.ts
 */
export const handlers = [
  ...authHandlers,
  ...courseHandlers,
  ...moduleHandlers,
  ...questionHandlers,
  ...fileHandlers,
];

