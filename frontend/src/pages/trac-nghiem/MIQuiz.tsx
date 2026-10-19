import { useState } from 'react';
import { MI_QUESTIONS, MI_LABELS, type MIType, MI_QUESTIONS_PER_TYPE, MI_MAX_SCORE } from './data/mi-questions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';

type Answers = Record<number, number>;

function MIRadarBar({ type, score, max }: { type: MIType; score: number; max: number }) {
  const info = MI_LABELS[type];
  const pct = Math.round((score / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-800">
          {info.emoji} {info.name}
        </span>
        <span className="text-gray-500">{score}/{max}</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: info.color }}
        />
      </div>
    </div>
  );
}

export function MIQuiz() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const total = MI_QUESTIONS.length;
  const question = MI_QUESTIONS[currentQ];
  const progress = Math.round((currentQ / total) * 100);

  function calcScores(): Record<MIType, number> {
    const scores: Record<MIType, number> = {
      linguistic: 0, logical: 0, spatial: 0, musical: 0,
      bodily: 0, interpersonal: 0, intrapersonal: 0, naturalist: 0,
    };
    MI_QUESTIONS.forEach((q) => {
      scores[q.type] += answers[q.id] ?? 3;
    });
    return scores;
  }

  function getTopTypes(scores: Record<MIType, number>): MIType[] {
    return (Object.entries(scores) as [MIType, number][])
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

  const LIKERT = [
    { val: 1, label: 'Rất\nkhông đúng' },
    { val: 2, label: 'Không\nđúng' },
    { val: 3, label: 'Phân\nvân' },
    { val: 4, label: 'Đúng' },
    { val: 5, label: 'Rất\nđúng' },
  ];

  // ── INTRO ─────────────────────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div className="space-y-6">
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-200 rounded-full px-4 py-2 text-purple-700 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Trắc nghiệm Đa trí tuệ – Howard Gardner
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Khám phá <span className="text-purple-600">Loại trí tuệ nổi bật</span> của bạn
          </h2>
          <p className="text-gray-600 leading-relaxed">
            <strong className="text-gray-800">40 câu hỏi</strong> ngắn, thang điểm 5 mức độ (5 câu mỗi loại).<br />
            Kết quả: <strong className="text-gray-800">Top 3 trí tuệ mạnh nhất</strong> + Gợi ý ngành STEM phù hợp.
          </p>
        </div>

        {/* 8 loại trí tuệ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.entries(MI_LABELS) as [MIType, typeof MI_LABELS.logical][]).map(([type, info]) => (
            <div
              key={type}
              className="bg-white border border-gray-200 rounded-xl p-3 flex items-start gap-2 shadow-sm"
            >
              <span className="text-xl">{info.emoji}</span>
              <div>
                <p className="text-gray-900 font-semibold text-sm">{info.name}</p>
                <p className="text-gray-500 text-xs leading-snug mt-0.5">{info.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center space-y-2">
          <Button
            size="lg"
            onClick={() => setStep('quiz')}
            className="rounded-full h-12 px-10 text-base font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
          >
            Bắt đầu Trắc nghiệm <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-gray-400 text-sm">⏱ Khoảng 5–8 phút · Không cần đăng nhập</p>
        </div>
      </div>
    );
  }

  // ── QUIZ ──────────────────────────────────────────────────────────────────
  if (step === 'quiz') {
    const label = MI_LABELS[question.type];
    const selected = answers[question.id];

    return (
      <div className="space-y-6">
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: '#9333ea' }}
          />
        </div>

        <div className="max-w-xl mx-auto space-y-6">
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
                  ${selected === val
                    ? 'bg-purple-600 border-purple-600 text-white scale-105 shadow-md'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50'
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
    );
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  const scores = calcScores();
  const topTypes = getTopTypes(scores);
  const sortedEntries = (Object.entries(scores) as [MIType, number][]).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8">
      {/* Hero result */}
      <div className="bg-purple-700 rounded-2xl py-10 px-6 text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-5 py-2 text-white text-sm">
          <Sparkles className="h-4 w-4" /> Kết quả Trắc nghiệm Đa trí tuệ
        </div>
        <h2 className="text-3xl font-bold text-white">Top 3 trí tuệ nổi bật</h2>
        <div className="flex justify-center gap-3 flex-wrap">
          {topTypes.map((type) => {
            const info = MI_LABELS[type];
            return (
              <span
                key={type}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-white/20 text-white border border-white/30"
              >
                {info.emoji} {info.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Bars */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-gray-900 font-semibold text-lg mb-4">Điểm từng loại trí tuệ</h3>
        {sortedEntries.map(([type, score]) => (
          <MIRadarBar key={type} type={type} score={score} max={MI_MAX_SCORE} />
        ))}
      </div>

      {/* Top 3 analysis cards */}
      <div className="space-y-4">
        <h3 className="text-gray-900 font-semibold text-lg">Phân tích chi tiết</h3>
        {topTypes.map((type, idx) => {
          const info = MI_LABELS[type];
          return (
            <div
              key={type}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
              style={{ borderLeftColor: info.color, borderLeftWidth: 4 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: info.color }}
                >
                  #{idx + 1}
                </span>
                <h4 className="text-gray-900 font-semibold">
                  {info.emoji} {info.name}
                </h4>
              </div>
              <p className="text-gray-600 text-sm mb-3">{info.desc}</p>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold text-gray-900">🎯 Ngành STEM gợi ý:</span><br />
                  {info.stemMatch}
                </p>
              </div>
            </div>
          );
        })}
      </div>

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
  );
}
