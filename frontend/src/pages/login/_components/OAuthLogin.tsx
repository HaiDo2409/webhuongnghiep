import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useBackend } from '@/lib/runtime';
import { Button } from '@/components/ui/button';

export function OAuthLogin() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(useBackend);
  const [params] = useSearchParams();
  useEffect(() => {
    let live = true;
    if (useBackend) api.get<{ googleEnabled: boolean }>('/api/auth/config').then(r => { if (live) setEnabled(r.data.googleEnabled); }).catch(() => {}).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);
  return <section className="rounded-2xl border bg-white text-gray-900 p-8 space-y-5 shadow-lg">
    <h1 className="text-2xl font-bold">Lưu hành trình hướng nghiệp</h1>
    <p className="text-gray-600">Đăng nhập để lưu kết quả trắc nghiệm, hồ sơ điểm và danh sách yêu thích.</p>
    {params.has('error') && <p role="alert" className="text-red-700">Đăng nhập chưa thành công. Hãy thử lại.</p>}
    {!loading && !enabled && <p className="text-amber-800 bg-amber-50 p-3 rounded-xl">{useBackend ? 'Đăng nhập Google chưa sẵn sàng. Cần kết nối backend và cấu hình Google.' : 'Bạn đang xem bản demo. Đăng nhập sẽ hoạt động khi kết nối backend.'}</p>}
    <Button className="w-full" disabled={loading || !enabled} onClick={() => { window.location.href = '/oauth2/authorization/google'; }}>{loading ? 'Đang kiểm tra…' : 'Tiếp tục với Google'}</Button>
    <Link to="/" className="block text-center text-blue-600 underline">Về trang chủ</Link>
  </section>;
}
