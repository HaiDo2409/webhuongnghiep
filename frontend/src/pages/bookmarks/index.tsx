import { useBookmarks } from '@/hooks/useBookmarks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Trash2, GraduationCap, Briefcase, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';

export function BookmarksPage() {
  const { bookmarks, remove, clearAll } = useBookmarks();

  const careers = bookmarks.filter((b) => b.type === 'career');
  const schools = bookmarks.filter((b) => b.type === 'school');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-blue-700 py-10 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-2 text-white text-sm">
            <Bookmark className="h-4 w-4" /> Yêu thích của tôi
          </div>
          <h1 className="text-3xl font-bold text-white">Danh sách đã lưu</h1>
          <p className="text-white/70 text-sm">
            Nghề nghiệp và trường Đại học bạn đã đánh dấu yêu thích
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {bookmarks.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-gray-700 font-semibold text-lg mb-2">Chưa có mục yêu thích nào</h2>
            <p className="text-gray-400 text-sm mb-6">
              Nhấn icon ❤️ trên thẻ nghề nghiệp hoặc trường Đại học để lưu lại
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to={ROUTES.TRAC_NGHIEM}>
                <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                  Làm trắc nghiệm Holland
                </Button>
              </Link>
              <Link to={ROUTES.XET_TUYEN}>
                <Button variant="outline" className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-50">
                  Tra cứu xét tuyển
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Clear all */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm"
                onClick={clearAll}
              >
                <Trash2 className="h-4 w-4 mr-1.5" /> Xóa tất cả
              </Button>
            </div>

            {/* Careers */}
            {careers.length > 0 && (
              <section>
                <h2 className="text-gray-900 font-semibold text-lg mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Nghề nghiệp yêu thích ({careers.length})
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {careers.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start justify-between gap-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1 min-w-0">
                        {item.tag && (
                          <Badge
                            className="mb-2 text-xs"
                            style={{
                              backgroundColor: (item.color ?? '#3b82f6') + '20',
                              color: item.color ?? '#3b82f6',
                              borderColor: (item.color ?? '#3b82f6') + '40',
                            }}
                          >
                            {item.tag}
                          </Badge>
                        )}
                        <h3 className="text-gray-900 font-semibold">{item.name}</h3>
                        {item.subtitle && <p className="text-gray-400 text-xs mt-0.5">{item.subtitle}</p>}
                        <p className="text-gray-400 text-xs mt-1">
                          Lưu lúc {new Date(item.savedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors shrink-0 mt-0.5"
                        title="Xóa khỏi yêu thích"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Schools */}
            {schools.length > 0 && (
              <section>
                <h2 className="text-gray-900 font-semibold text-lg mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Trường Đại học theo dõi ({schools.length})
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {schools.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start justify-between gap-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1 min-w-0">
                        {item.tag && (
                          <Badge className="mb-2 bg-blue-100 text-blue-700 border-blue-200 text-xs">
                            {item.tag}
                          </Badge>
                        )}
                        <h3 className="text-gray-900 font-semibold">{item.name}</h3>
                        {item.subtitle && <p className="text-gray-500 text-sm mt-0.5">{item.subtitle}</p>}
                        <p className="text-gray-400 text-xs mt-1">
                          Lưu lúc {new Date(item.savedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center shrink-0 mt-0.5">
                        <button
                          onClick={() => remove(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          title="Xóa khỏi yêu thích"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
