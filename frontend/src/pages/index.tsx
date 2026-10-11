import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { Button } from '@/components/ui/button';
import {
  Brain, Search, Newspaper, Map,
  ArrowRight, Sparkles, GraduationCap, Star,
  ChevronDown,
} from 'lucide-react';

const FEATURES = [
  {
    id: 'trac-nghiem',
    icon: <Brain className="h-7 w-7" />,
    color: 'from-[#7c3aed] to-[#a855f7]',
    glow: 'group-hover:shadow-purple-500/25',
    title: 'Trắc nghiệm Nghề nghiệp',
    subtitle: 'Holland RIASEC',
    desc: '48 câu hỏi · Biểu đồ mạng nhện 6 nhóm · Gợi ý nghề STEM từ O*NET',
    cta: 'Làm Trắc nghiệm',
    to: ROUTES.TRAC_NGHIEM,
  },
  {
    id: 'xet-tuyen',
    icon: <Search className="h-7 w-7" />,
    color: 'from-[#0ea5e9] to-[#00e5ff]',
    glow: 'group-hover:shadow-cyan-500/25',
    title: 'Tra cứu Xét tuyển',
    subtitle: 'PT1 · PT2 · PT3 · PT4',
    desc: 'Nhập điểm → Dự báo điểm chuẩn 3 năm → Phân loại cơ hội 🔴🟡🟢',
    cta: 'Tra cứu ngay',
    to: ROUTES.XET_TUYEN,
  },
  {
    id: 'ban-tin',
    icon: <Newspaper className="h-7 w-7" />,
    color: 'from-[#059669] to-[#10b981]',
    glow: 'group-hover:shadow-emerald-500/25',
    title: 'Bản tin Hướng nghiệp',
    subtitle: 'Cập nhật liên tục',
    desc: 'Video Fanpage · Bài viết tuyển sinh · Thông tin học bổng & nghề nghiệp',
    cta: 'Đọc Bản tin',
    to: ROUTES.BAN_TIN,
  },
  {
    id: 'ky-nang',
    icon: <Map className="h-7 w-7" />,
    color: 'from-[#d97706] to-[#f59e0b]',
    glow: 'group-hover:shadow-amber-500/25',
    title: 'Bản đồ Kỹ năng',
    subtitle: 'Lộ trình STEM',
    desc: 'Kỹ năng theo ngành · Khóa học Coursera/edX · Cổng thông tin chính thức',
    cta: 'Khám phá',
    to: ROUTES.KY_NANG,
  },
];

const STATS = [
  { value: '48', label: 'Câu hỏi Holland', icon: '🧠' },
  { value: '60+', label: 'Nghề nghiệp STEM', icon: '💼' },
  { value: '50+', label: 'Ngành xét tuyển', icon: '🎓' },
  { value: '4', label: 'Phương thức PT', icon: '📊' },
];

export function LandingPage() {
  return (
    <div className="bg-gradient-to-br from-[#001a3a] via-[#002d6b] to-[#001a3a] min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-36 md:pb-28 flex items-center justify-center text-center px-4">
        {/* Animated blobs */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00e5ff]/8 blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/8 blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-4xl mx-auto space-y-7">
          {/* School badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 text-[#00e5ff] text-sm font-medium">
            <GraduationCap className="h-4 w-4" />
            THPT Chuyên Biên Hòa – Đồng Nai
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            Bản đồ{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] via-[#7c3aed] to-[#a855f7]">
              Hướng Nghiệp
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/60 leading-relaxed max-w-2xl mx-auto">
            Hiểu mình trước, chọn ngành sau.
            <br />
            <span className="text-white/40 text-lg">Làm trắc nghiệm Holland để bắt nhịp ngành nghề tương lai.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="rounded-full h-14 px-10 text-base font-semibold bg-gradient-to-r from-[#00e5ff] to-[#7c3aed] text-white border-0 hover:opacity-90 shadow-xl shadow-cyan-500/20 transition-all"
            >
              <Link to={ROUTES.TRAC_NGHIEM}>
                <Sparkles className="mr-2 h-5 w-5" />
                Làm Trắc nghiệm
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full h-14 px-10 text-base border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all"
            >
              <Link to={ROUTES.XET_TUYEN}>
                Tra cứu Xét tuyển <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Scroll cue */}
          <div className="pt-8 flex justify-center">
            <ChevronDown className="h-6 w-6 text-white/30 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────────── */}
      <section className="border-y border-white/10 bg-white/[0.03] backdrop-blur-sm py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon }) => (
            <div key={label} className="text-center space-y-1">
              <span className="text-3xl">{icon}</span>
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="text-white/50 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature cards ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">4 Công cụ Hướng nghiệp</h2>
            <p className="text-white/50 text-lg">Được thiết kế riêng cho học sinh THPT Chuyên Biên Hòa</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature) => (
              <Link
                key={feature.id}
                to={feature.to}
                className={`group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 rounded-2xl p-7 transition-all duration-300 hover:shadow-2xl ${feature.glow} overflow-hidden`}
              >
                {/* Gradient glow bg */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />

                <div className="relative z-10 space-y-4">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                    <span className="text-white">{feature.icon}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold text-xl">{feature.title}</h3>
                    </div>
                    <span className="inline-block text-xs font-medium text-white/40 bg-white/10 px-2 py-0.5 rounded-full mb-3">
                      {feature.subtitle}
                    </span>
                    <p className="text-white/60 leading-relaxed">{feature.desc}</p>
                  </div>

                  <div className="flex items-center gap-2 text-[#00e5ff] font-medium text-sm group-hover:gap-3 transition-all">
                    {feature.cta} <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA bottom ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <h2 className="text-3xl font-bold text-white">
            Bắt đầu hành trình của bạn ngay hôm nay
          </h2>
          <p className="text-white/50">
            Trắc nghiệm miễn phí · Không cần đăng nhập · Kết quả ngay lập tức
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-full h-14 px-10 text-base font-semibold bg-gradient-to-r from-[#00e5ff] to-[#7c3aed] text-white border-0 hover:opacity-90 shadow-xl"
          >
            <Link to={ROUTES.TRAC_NGHIEM}>
              <Sparkles className="mr-2 h-5 w-5" />
              Khám phá Mã Holland của bạn
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
