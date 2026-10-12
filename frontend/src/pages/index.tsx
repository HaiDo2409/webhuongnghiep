import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { Button } from '@/components/ui/button';
import heroImg from '@/assets/hero.png';
import {
  Brain, Search, Newspaper, Map,
  ArrowRight, Sparkles, CheckCircle2,
} from 'lucide-react';

const FEATURES = [
  {
    id: 'trac-nghiem',
    icon: <Brain className="h-6 w-6" />,
    iconBg: 'bg-purple-100 text-purple-600',
    accentBorder: 'border-l-purple-500',
    title: 'Trắc nghiệm Nghề nghiệp',
    subtitle: 'Holland RIASEC',
    desc: '24 câu hỏi · Biểu đồ mạng nhện 6 nhóm · Gợi ý nghề STEM từ O*NET',
    cta: 'Làm Trắc nghiệm',
    to: ROUTES.TRAC_NGHIEM,
  },
  {
    id: 'xet-tuyen',
    icon: <Search className="h-6 w-6" />,
    iconBg: 'bg-blue-100 text-blue-600',
    accentBorder: 'border-l-blue-500',
    title: 'Tra cứu Xét tuyển',
    subtitle: 'PT1 · PT2 · PT3 · PT4',
    desc: 'Nhập điểm → Dự báo điểm chuẩn 3 năm → Phân loại cơ hội 🔴🟡🟢',
    cta: 'Tra cứu ngay',
    to: ROUTES.XET_TUYEN,
  },
  {
    id: 'ban-tin',
    icon: <Newspaper className="h-6 w-6" />,
    iconBg: 'bg-green-100 text-green-600',
    accentBorder: 'border-l-green-500',
    title: 'Bản tin Hướng nghiệp',
    subtitle: 'Cập nhật liên tục',
    desc: 'Video Fanpage · Bài viết tuyển sinh · Thông tin học bổng & nghề nghiệp',
    cta: 'Đọc Bản tin',
    to: ROUTES.BAN_TIN,
  },
  {
    id: 'ky-nang',
    icon: <Map className="h-6 w-6" />,
    iconBg: 'bg-orange-100 text-orange-600',
    accentBorder: 'border-l-orange-500',
    title: 'Bản đồ Kỹ năng',
    subtitle: 'Lộ trình STEM',
    desc: 'Kỹ năng theo ngành · Khóa học Coursera/edX · Cổng thông tin chính thức',
    cta: 'Khám phá',
    to: ROUTES.KY_NANG,
  },
];

const STATS = [
  { value: '24', label: 'Câu hỏi Holland', icon: '🧠' },
  { value: '60+', label: 'Nghề nghiệp STEM', icon: '💼' },
  { value: '50+', label: 'Ngành xét tuyển', icon: '🎓' },
  { value: '4', label: 'Phương thức PT', icon: '📊' },
];

const BENEFITS = [
  'Hiểu rõ bản thân: Nhận ra điểm mạnh, điểm yếu và sở thích tự nhiên.',
  'Định hướng nghề nghiệp: Chọn ngành học và công việc phù hợp năng lực.',
  'Tra cứu chính xác: Dự báo điểm chuẩn 3 năm để chọn trường phù hợp.',
  'Khám phá lộ trình: Kỹ năng theo ngành từ các khóa học uy tín toàn cầu.',
];

const STEPS = [
  { step: '01', title: 'Làm trắc nghiệm Holland', desc: 'Trả lời 24 câu hỏi ngắn để xác định nhóm tính cách RIASEC của bạn.' },
  { step: '02', title: 'Xem kết quả & nghề phù hợp', desc: 'Biểu đồ mạng nhện 6 nhóm và gợi ý nghề nghiệp STEM từ O*NET.' },
  { step: '03', title: 'Tra cứu & lên kế hoạch', desc: 'Kiểm tra điểm chuẩn, khám phá lộ trình kỹ năng và đọc bản tin hướng nghiệp.' },
];

export function LandingPage() {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero card ─────────────────────────────────────────────────────── */}
      <section className="px-4 pt-6 pb-6">
        <div className="container mx-auto">
          <div className="rounded-2xl bg-blue-50 border border-blue-100 overflow-hidden shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-6 px-8 md:px-12 py-10 md:py-14">

              {/* Left: text + CTA */}
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
                  Bản đồ Hướng Nghiệp<br />
                  <span className="text-blue-600">từ A đến Z</span>
                </h1>
                <p className="text-blue-600 font-semibold text-sm">
                  Hiểu mình trước, chọn ngành sau.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto md:mx-0">
                  Làm trắc nghiệm Holland để bắt nhịp ngành nghề tương lai. Tra cứu điểm chuẩn và khám phá lộ trình kỹ năng phù hợp nhất với bạn.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-1">
                  <Button
                    asChild
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white h-11 px-7 font-semibold shadow-sm"
                  >
                    <Link to={ROUTES.TRAC_NGHIEM}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Làm Trắc nghiệm
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 h-11 px-7 font-semibold"
                  >
                    <Link to={ROUTES.XET_TUYEN}>Tra cứu Xét tuyển</Link>
                  </Button>
                </div>
              </div>

              {/* Right: illustration */}
              <div className="flex-shrink-0 w-full max-w-[280px] md:max-w-[340px]">
                <img
                  src={heroImg}
                  alt="Hướng nghiệp minh họa"
                  className="w-full h-auto object-contain drop-shadow-md"
                />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <section className="px-4 pb-6">
        <div className="container mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-5 px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
              {STATS.map(({ value, label, icon }) => (
                <div key={label} className="text-center px-4 space-y-1">
                  <span className="text-2xl">{icon}</span>
                  <p className="text-2xl font-bold text-blue-700">{value}</p>
                  <p className="text-gray-500 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Holland intro + Feature cards + Benefits ───────────────────────── */}
      <section className="px-4 pb-10">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Left: intro + 4 feature cards */}
            <div className="lg:w-1/2 space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Trắc nghiệm Holland<br />
                <span className="text-blue-600">RIASEC là gì?</span>
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Bộ câu hỏi gồm <strong>24 câu</strong> giúp xác định nhóm tính cách nghề nghiệp theo lý thuyết Holland (RIASEC),
                từ đó đưa ra những định hướng nghề nghiệp phù hợp nhất với bản thân bạn.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {FEATURES.map((feature) => (
                  <Link
                    key={feature.id}
                    to={feature.to}
                    className={`group bg-white border border-gray-200 border-l-4 ${feature.accentBorder} rounded-xl p-4 hover:shadow-md transition-all duration-200`}
                  >
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${feature.iconBg} mb-3`}>
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-0.5">{feature.title}</h3>
                    <span className="text-[11px] text-gray-400 block mb-2">{feature.subtitle}</span>
                    <p className="text-gray-500 text-xs leading-relaxed">{feature.desc}</p>
                    <div className="flex items-center gap-1 text-blue-600 text-xs font-medium mt-3 group-hover:gap-2 transition-all">
                      {feature.cta} <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: benefits box */}
            <div className="lg:w-1/2">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:p-8">
                <h3 className="font-bold text-gray-900 text-lg mb-5">
                  Hệ thống hướng nghiệp giúp bạn
                </h3>
                <ul className="space-y-3.5">
                  {BENEFITS.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <p className="text-gray-600 text-sm mb-4">
                    Bắt đầu hành trình của bạn ngay hôm nay —{' '}
                    <strong className="text-gray-800">miễn phí, không cần đăng nhập</strong>, kết quả ngay lập tức.
                  </p>
                  <Button
                    asChild
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 font-semibold shadow-sm"
                  >
                    <Link to={ROUTES.TRAC_NGHIEM}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Khám phá Mã Holland của bạn
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3 bước bắt đầu ─────────────────────────────────────────────────── */}
      <section className="px-4 pb-12 border-t border-gray-200 pt-10">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">3 bước để bắt đầu ngay</h2>
            <p className="text-gray-500 text-sm mt-2">
              Đơn giản, nhanh chóng và hoàn toàn miễn phí
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
