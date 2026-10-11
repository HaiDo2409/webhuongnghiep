import { useState } from 'react';
import { HOLLAND_QUESTIONS, HOLLAND_LABELS, type HollandType } from './data/questions';
import { getCompatibleCareers } from './data/careers';
import { HollandRadarChart } from './HollandRadarChart';
import { CareerResults } from './CareerResults';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';

type Answers = Record<number, number>; // questionId → 1..5

export function TracNghiemPage() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const total = HOLLAND_QUESTIONS.length;
  const question = HOLLAND_QUESTIONS[currentQ];
  const progress = Math.round((currentQ / total) * 100);

  // ── Tính điểm ─────────────────────────────────────────────────────────────
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

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#001a3a] via-[#002d6b] to-[#003d8f] flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 text-[#00e5ff] text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Trắc nghiệm Holland RIASEC
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Khám phá<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-[#7c3aed]">
              Mã nghề nghiệp của bạn
            </span>
          </h1>

          <p className="text-white/70 text-lg leading-relaxed">
            <strong className="text-white">24 câu hỏi</strong> ngắn, thang điểm Likert 5 mức độ (4 câu mỗi nhóm).<br />
            Kết quả: <strong className="text-white">Mã Holland 3 chữ cái</strong> + Biểu đồ mạng nhện + Danh sách nghề nghiệp tương thích.
          </p>

          <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-left text-xs text-amber-200/70 leading-relaxed">
            ⚠️ Bộ câu hỏi rút gọn do Tổ HĐTNHN – THPT Chuyên Biên Hòa biên soạn dựa trên mô hình RIASEC.
            Kết quả <strong>chỉ mang tính tham khảo</strong>, không thay thế công cụ trắc nghiệm chuyên sâu đã chuẩn hóa.
          </div>

          {/* 6 nhóm Holland */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-left">
            {(Object.entries(HOLLAND_LABELS) as [HollandType, typeof HOLLAND_LABELS.R][]).map(
              ([code, info]) => (
                <div
                  key={code}
                  className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex items-start gap-3"
                >
                  <span className="text-2xl">{info.emoji}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {code} – {info.name}
                    </p>
                    <p className="text-white/50 text-xs leading-snug mt-0.5">{info.desc}</p>
                  </div>
                </div>
              ),
            )}
          </div>

          <Button
            size="lg"
            onClick={() => setStep('quiz')}
            className="rounded-full h-14 px-10 text-base font-semibold bg-gradient-to-r from-[#00e5ff] to-[#7c3aed] text-white border-0 hover:opacity-90 shadow-lg shadow-cyan-500/25"
          >
            Bắt đầu Trắc nghiệm <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-white/40 text-sm">⏱ Khoảng 3–5 phút · Không cần đăng nhập</p>
        </div>
      </div>
    );
  }

  // ── QUIZ ───────────────────────────────────────────────────────────────────
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
      <div className="min-h-screen bg-gradient-to-br from-[#001a3a] via-[#002d6b] to-[#003d8f] flex flex-col">
        {/* Progress bar */}
        <div className="h-1.5 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#00e5ff] to-[#7c3aed] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-xl w-full space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between text-white/60 text-sm">
              <span>
                Câu {currentQ + 1} / {total}
              </span>
              <Badge
                style={{ backgroundColor: label.color + '30', color: label.color, borderColor: label.color + '50' }}
                className="border text-xs"
              >
                {label.emoji} {label.name}
              </Badge>
            </div>

            {/* Question card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-8 shadow-2xl">
              <p className="text-white text-xl md:text-2xl font-medium leading-relaxed text-center">
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
                        ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] scale-105'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/30 hover:text-white'
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
                className="text-white/50 hover:text-white"
                onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
                disabled={currentQ === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
              </Button>
              <Button
                variant="ghost"
                className="text-white/50 hover:text-white"
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

  // ── RESULT ─────────────────────────────────────────────────────────────────
  const scores = calcScores();
  const topCodes = getTopCodes(scores);
  const careers = getCompatibleCareers(topCodes);
  const hollandCode = topCodes.join('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001a3a] via-[#002d6b] to-[#001a3a]">
      {/* Result Hero */}
      <div className="bg-gradient-to-br from-[#001a3a] to-[#002d6b] py-16 px-4 text-center border-b border-white/10">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#00e5ff]/15 border border-[#00e5ff]/30 rounded-full px-5 py-2 text-[#00e5ff] text-sm">
            <Sparkles className="h-4 w-4" /> Kết quả Trắc nghiệm Holland
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Mã của bạn:{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-[#7c3aed]">
              {hollandCode}
            </span>
          </h2>
          <div className="flex justify-center gap-3 flex-wrap">
            {topCodes.map((code) => {
              const info = HOLLAND_LABELS[code];
              return (
                <span
                  key={code}
                  className="px-4 py-2 rounded-full text-sm font-semibold border"
                  style={{ backgroundColor: info.color + '25', color: info.color, borderColor: info.color + '50' }}
                >
                  {info.emoji} {code} – {info.name}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        <HollandRadarChart scores={scores} />
        <CareerResults careers={careers} topCodes={topCodes} />

        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleReset}
            className="rounded-full border-white/20 text-white hover:bg-white/10"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Làm lại Trắc nghiệm
          </Button>
        </div>
      </div>
    </div>
  );
}
