import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Play, Clock, BookOpen, Newspaper, Video } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  category: string;
  date: string;
  summary: string;
  isVideo?: boolean;
  thumbnail?: string;
}

const NEWS_ITEMS: NewsItem[] = [
  {
    id: '1',
    title: 'Thông báo tuyển sinh Đại học năm 2026: Những thay đổi quan trọng cần biết',
    source: 'Bộ GD&ĐT',
    url: 'https://tuyensinh.moet.gov.vn',
    category: 'Tuyển sinh',
    date: '2026-09-15',
    summary: 'Bộ GD&ĐT công bố quy chế tuyển sinh đại học năm 2026 với nhiều điểm mới về phương thức xét tuyển, thời gian đăng ký và hình thức công bố kết quả...',
  },
  {
    id: '2',
    title: '10 ngành nghề hot nhất 2026: AI, Data Science và Kỹ thuật số dẫn đầu',
    source: 'VnExpress',
    url: 'https://vnexpress.net',
    category: 'Nghề nghiệp',
    date: '2026-10-01',
    summary: 'Theo báo cáo thị trường lao động 2026, các ngành liên quan đến trí tuệ nhân tạo, khoa học dữ liệu và kỹ thuật phần mềm tiếp tục dẫn đầu về nhu cầu tuyển dụng...',
  },
  {
    id: '3',
    title: 'ĐHBK Hà Nội mở rộng phương thức xét TSA 2026 – Cơ hội cho thí sinh giỏi Toán',
    source: 'HUST',
    url: 'https://ts.hust.edu.vn',
    category: 'Tuyển sinh',
    date: '2026-08-20',
    summary: 'Năm 2026, Bách Khoa Hà Nội tăng chỉ tiêu xét tuyển bằng bài thi ĐGTD (TSA) lên 40%, đây là cơ hội tốt cho học sinh chuyên Toán...',
  },
  {
    id: '4',
    title: 'Hướng dẫn chọn ngành phù hợp với thế mạnh cá nhân – Từ chuyên gia tư vấn',
    source: 'Báo Thanh Niên',
    url: 'https://thanhnien.vn',
    category: 'Hướng nghiệp',
    date: '2026-09-28',
    summary: 'Chuyên gia tư vấn hướng nghiệp cho rằng học sinh không nên chỉ nhìn vào điểm số mà cần xác định rõ đam mê, kỹ năng và cơ hội nghề nghiệp trước khi chọn ngành...',
  },
  {
    id: '5',
    title: 'Học bổng Vingroup 2026: 500 suất cho sinh viên STEM xuất sắc',
    source: 'VinIF',
    url: 'https://vinif.org',
    category: 'Học bổng',
    date: '2026-10-05',
    summary: 'Quỹ VinIF tiếp tục triển khai chương trình học bổng 2026 dành cho sinh viên các ngành STEM với mức hỗ trợ lên đến 60 triệu đồng/năm...',
  },
  {
    id: '6',
    title: 'Review thực tế ngành Kỹ thuật AI tại ĐHQGHN: 4 năm học gì?',
    source: 'Fanpage Chuyên Biên Hòa',
    url: '#',
    category: 'Video',
    date: '2026-10-10',
    summary: 'Cựu học sinh Chuyên Biên Hòa chia sẻ trải nghiệm 4 năm học ngành Trí tuệ Nhân tạo tại ĐH Công nghệ ĐHQGHN – môn học, kỹ năng và cơ hội việc làm...',
    isVideo: true,
  },
  {
    id: '7',
    title: 'Từ học sinh Chuyên đến Kỹ sư Google – Hành trình của một cựu học sinh Biên Hòa',
    source: 'Fanpage Chuyên Biên Hòa',
    url: '#',
    category: 'Video',
    date: '2026-09-22',
    summary: 'Câu chuyện truyền cảm hứng về hành trình từ lớp Toán Chuyên Biên Hòa đến kỹ sư phần mềm tại Google Singapore – bài học và lời khuyên cho thế hệ tiếp theo...',
    isVideo: true,
  },
  {
    id: '8',
    title: 'Điểm mới Kỳ thi ĐGNL ĐHQGHN 2026: Thêm bài thi Khoa học và Tiếng Anh',
    source: 'VNU',
    url: 'https://hsa.vnu.edu.vn',
    category: 'Tuyển sinh',
    date: '2026-10-08',
    summary: 'Từ năm 2026, kỳ thi ĐGNL ĐHQGHN (HSA) có thêm bài thi riêng về Khoa học tự nhiên và Tiếng Anh, thí sinh cần chuẩn bị kỹ các môn này...',
  },
];

const CATEGORIES = ['Tất cả', 'Tuyển sinh', 'Nghề nghiệp', 'Hướng nghiệp', 'Học bổng', 'Video'];

const categoryColors: Record<string, string> = {
  'Tuyển sinh':  'bg-secondary text-primary border-border',
  'Nghề nghiệp': 'bg-purple-100 text-purple-700 border-purple-200',
  'Hướng nghiệp':'bg-green-100 text-green-700 border-green-200',
  'Học bổng':    'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Video':       'bg-red-100 text-red-700 border-red-200',
};

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white hover:shadow-md border border-gray-200 hover:border-blue-300 rounded-xl p-5 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          item.isVideo ? 'bg-red-100' : 'bg-secondary'
        }`}>
          {item.isVideo
            ? <Video className="h-5 w-5 text-red-600" />
            : <Newspaper className="h-5 w-5 text-primary" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className={`border text-xs ${categoryColors[item.category] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {item.isVideo && <Play className="h-2.5 w-2.5 mr-1 fill-current" />}
              {item.category}
            </Badge>
            <span className="text-gray-400 text-xs">{item.source}</span>
            <span className="text-gray-300 text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(item.date).toLocaleDateString('vi-VN')}
            </span>
          </div>

          <h4 className="text-gray-900 font-semibold group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {item.title}
          </h4>

          <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">
            {item.summary}
          </p>
        </div>

        <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0 mt-1" />
      </div>
    </a>
  );
}

function VideoCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white hover:shadow-md border border-gray-200 hover:border-red-300 rounded-xl overflow-hidden transition-all duration-200"
    >
      {/* Thumbnail placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
          <Play className="h-6 w-6 text-white fill-white ml-1" />
        </div>
        <div className="absolute bottom-2 right-2">
          <Badge className="bg-white/90 text-red-600 border-0 text-xs shadow-sm">
            <Video className="h-3 w-3 mr-1" /> Video
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <span className="text-gray-400 text-xs">{item.source}</span>
        <h4 className="text-gray-900 font-semibold mt-1 group-hover:text-red-600 transition-colors line-clamp-2 text-sm leading-snug">
          {item.title}
        </h4>
        <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(item.date).toLocaleDateString('vi-VN')}
        </p>
      </div>
    </a>
  );
}

export function BanTinPage() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const filtered = NEWS_ITEMS.filter(
    (item) => activeCategory === 'Tất cả' || item.category === activeCategory,
  );

  const videos = NEWS_ITEMS.filter((i) => i.isVideo);
  const articles = filtered.filter((i) => !i.isVideo);
  const filteredVideos = filtered.filter((i) => i.isVideo);

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="legacy-page-header">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-2 text-white text-sm">
            <BookOpen className="h-4 w-4" /> Bản tin Hướng nghiệp
          </div>
          <h1 className="text-3xl font-bold text-white">Cập nhật mới nhất</h1>
          <p className="text-white/70 text-sm">
            Tổng hợp thông tin tuyển sinh, nghề nghiệp và video từ Fanpage THPT Chuyên Biên Hòa – Hà Nam
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Video section */}
        {(activeCategory === 'Tất cả' || activeCategory === 'Video') && (
          <div>
            <h2 className="text-gray-900 font-bold text-xl mb-4 flex items-center gap-2">
              <Video className="h-5 w-5 text-red-500" /> Video từ Fanpage
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {(activeCategory === 'Tất cả' ? videos : filteredVideos).map((item) => (
                <VideoCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Category filter + articles */}
        <div>
          <h2 className="text-gray-900 font-bold text-xl mb-4 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" /> Bài viết & Thông tin
          </h2>

          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap mb-5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                  activeCategory === cat
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {articles.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200">
                Không có bài viết trong mục này
              </div>
            ) : (
              articles.map((item) => <NewsCard key={item.id} item={item} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
