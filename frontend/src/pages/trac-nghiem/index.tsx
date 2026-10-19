import { useState } from 'react';
import { HOLLAND_QUESTIONS, HOLLAND_LABELS, type HollandType } from './data/questions';
import { getCompatibleCareers } from './data/careers';
import { HollandRadarChart } from './HollandRadarChart';
import { CareerResults } from './CareerResults';
import { MIQuiz } from './MIQuiz';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, Brain, Lightbulb } from 'lucide-react';

type Answers = Record<number, number>; // questionId → 1..5
type ActiveTab = 'holland' | 'mi';

export function TracNghiemPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('holland');

  // Holland state
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const total = HOLLAND_QUESTIONS.length;
  const question = HOLLAND_QUESTIONS[currentQ];
  const progress = Math.round((currentQ / total) * 100);

  function calcScores(): Record<HollandType, number> {
    const scores: Record<HollandType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    HOLLAND_QUESTIONS.forEach((q) => {
      scores[q.type] += answers[q.id] ?? 3;
    });
    return scores;
  }

  function getTopCodes(scores: Record<HollandType, number>): HollandType[] {
    return (Object.entries(scores) as [HollandType, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => k);
  }

  function handleAnswer(val: number) {
    setAnswers((prev) => ({ ...prev, [question.id]: val }));
    if (currentQ < total - 1) {
      setTimeout(() => setCurrentQ((q) => q + 1), 200);
    } else {
      setStep('result');
    }
  }

  function handleReset() {
    setAnswers({});
    setCurrentQ(0);
    setStep('intro');
  }

  // ── TAB SWITCHER ────────────────────────────────────────────────────────────
  const TabBar = () => (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-1 py-2">
          <button
            onClick={() => setActiveTab('holland')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === 'holland'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Brain className="h-4 w-4" />
            Mật mã Holland RIASEC
          </button>
          <button
            onClick={() => setActiveTab('mi')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === 'mi'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Lightbulb className="h-4 w-4" />
            Đa trí tuệ (MI)
          </button>
        </div>
      </div>
    </div>
  );

  // ── MI TAB ──────────────────────────────────────────────────────────────────
  if (activeTab === 'mi') {
    return (
      <div className="min-h-screen bg-gray-50">
        <TabBar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <MIQuiz />
        </div>
      </div>
    );
  }

  // ── HOLLAND: INTRO ─────────────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gray-50">
        <TabBar />
        <div className="px-4 py-10">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header card */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center space-y-4 shadow-sm">
              <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-200 rounded-full px-4 py-2 text-blue-700 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Trắc nghiệm Holland RIASEC
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Khám phá<br />
                <span className="text-blue-600">Mã nghề nghiệp của bạn</span>
              </h1>

              <p className="text-gray-600 leading-relaxed">
                <strong className="text-gray-800">24 câu hỏi</strong> ngắn, thang điểm Likert 5 mức độ (4 câu mỗi nhóm).<br />
                Kết quả: <strong className="text-gray-800">Mã Holland 3 chữ cái</strong> + Biểu đồ mạng nhện + Danh sách nghề nghiệp tương thích.
              </p>
            </div>

            {/* 6 nhóm Holland */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.entries(HOLLAND_LABELS) as [HollandType, typeof HOLLAND_LABELS.R][]).map(
                ([code, info]) => (
                  <div
                    key={code}
                    className="bg-white border border-gray-200 rounded-xl p-3 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-2xl">{info.emoji}</span>
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">
                        {code} – {info.name}
                      </p>
                      <p className="text-gray-500 text-xs leading-snug mt-0.5">{info.desc}</p>
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="text-center space-y-2">
              <Button
                size="lg"
                onClick={() => setStep('quiz')}
                className="rounded-full h-12 px-10 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Bắt đầu Trắc nghiệm <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-gray-400 text-sm">⏱ Khoảng 3–5 phút · Không cần đăng nhập</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── HOLLAND: QUIZ ──────────────────────────────────────────────────────────
  if (step === 'quiz') {
    const label = HOLLAND_LABELS[question.type];
    const LIKERT = [
      { val: 1, label: 'Rất\nkhông thích' },
      { val: 2, label: 'Không\nthích' },
      { val: 3, label: 'Bình\nthường' },
      { val: 4, label: 'Thích' },
      { val: 5, label: 'Rất\nthích' },
    ];
    const selected = answers[question.id];

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <TabBar />
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
          <div className="max-w-xl w-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between text-gray-500 text-sm">
              <span>Câu {currentQ + 1} / {total}</span>
              <Badge
                style={{ backgroundColor: label.color + '20', color: label.color, borderColor: label.color + '50' }}
                className="border text-xs"
              >
                {label.emoji} {label.name}
              </Badge>
            </div>

            {/* Question card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <p className="text-gray-900 text-xl md:text-2xl font-medium leading-relaxed text-center">
                {question.text}
              </p>
            </div>

            {/* Likert scale */}
            <div className="grid grid-cols-5 gap-2">
              {LIKERT.map(({ val, label: lbl }) => (
                <button
                  key={val}
                  onClick={() => handleAnswer(val)}
                  className={`
                    flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-150
                    ${
                      selected === val
                        ? 'bg-blue-600 border-blue-600 text-white scale-105 shadow-md'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
                    }
                  `}
                >
                  <span className="text-2xl font-bold">{val}</span>
                  <span className="text-xs text-center whitespace-pre-line leading-tight">{lbl}</span>
                </button>
              ))}
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                className="text-gray-500 hover:text-gray-900"
                onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
                disabled={currentQ === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
              </Button>
              <Button
                variant="ghost"
                className="text-gray-500 hover:text-gray-900"
                onClick={() => {
                  if (!answers[question.id]) setAnswers((p) => ({ ...p, [question.id]: 3 }));
                  if (currentQ < total - 1) setCurrentQ((q) => q + 1);
                  else setStep('result');
                }}
              >
                Bỏ qua <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── HOLLAND: RESULT ────────────────────────────────────────────────────────
  const scores = calcScores();
  const topCodes = getTopCodes(scores);
  const careers = getCompatibleCareers(topCodes);
  const hollandCode = topCodes.join('');

  return (
    <div className="min-h-screen bg-gray-50">
      <TabBar />
      {/* Result Hero */}
      <div className="bg-blue-700 py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-5 py-2 text-white text-sm">
            <Brain className="h-4 w-4" /> Kết quả Trắc nghiệm Holland
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Mã của bạn:{' '}
            <span className="bg-white text-blue-700 px-3 py-1 rounded-xl">
              {hollandCode}
            </span>
          </h2>
          <div className="flex justify-center gap-3 flex-wrap">
            {topCodes.map((code) => {
              const info = HOLLAND_LABELS[code];
              return (
                <span
                  key={code}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-white/20 text-white border border-white/30"
                >
                  {info.emoji} {code} – {info.name}
                </span>
              );
            })}
          </div>
          {/* Gợi ý chuyển sang MI */}
          <p className="text-white/70 text-sm">
            💡 Thử <button onClick={() => setActiveTab('mi')} className="underline text-white font-medium">Trắc nghiệm Đa trí tuệ</button> để hiểu thêm loại trí thông minh phù hợp với bạn
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <HollandRadarChart scores={scores} />
        <CareerResults careers={careers} topCodes={topCodes} />

        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleReset}
            className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Làm lại Trắc nghiệm
          </Button>
        </div>
      </div>
    </div>
  );
}
