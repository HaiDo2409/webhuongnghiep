import { SCHOOLS, PRIORITY_ZONES, SUBJECT_GROUPS, type SchoolProgram } from './schools';

export interface StudentScores {
  // Điểm học tập / THPT (thang 10)
  toan: number;
  ly: number;
  hoa: number;
  sinh: number;
  tin: number;
  van: number;
  anh: number;
  su: number;
  dia: number;

  // Điểm bài thi độc lập (optional)
  hsa?: number;   // ĐHQGHN, max 150
  tsa?: number;   // HUST, max 100
  bca?: number;   // ĐH Bách Khoa HCM, max 100

  // Chứng chỉ
  ielts?: number;           // 0–9.0
  hsg?: 'none' | 'tinh' | 'quocgia';  // Giải HSG
  khkt?: 'none' | 'tinh' | 'quocgia'; // Giải KHKT
  sat?: number;             // 400–1600

  // Khu vực ưu tiên
  zone: 'KV1' | 'KV2-NT' | 'KV2' | 'KV3';
}

export interface AdmissionResult {
  program: SchoolProgram;
  method: 'PT1' | 'PT2_HSA' | 'PT2_TSA' | 'PT2_BCA' | 'PT3' | 'PT4';
  methodLabel: string;
  studentScore: number;
  predictedBenchmark: number;
  diff: number;              // studentScore - predictedBenchmark
  chance: 'high' | 'medium' | 'low';
  chancePercent: number;
  bestGroup: string;         // tổ hợp tốt nhất (A00, A01...)
  actionTip: string;
}

// ── Tính điểm tổ hợp PT1 ────────────────────────────────────────────────────
function calcGroupScore(scores: StudentScores, subjects: string[]): number {
  const map: Record<string, number> = {
    'Toán': scores.toan,
    'Lý': scores.ly,
    'Hóa': scores.hoa,
    'Sinh': scores.sinh,
    'Tin': scores.tin,
    'Văn': scores.van,
    'Anh': scores.anh,
    'Sử': scores.su,
    'Địa': scores.dia,
  };
  return subjects.reduce((sum, s) => sum + (map[s] ?? 0), 0);
}

// ── Dự báo điểm chuẩn (bình quân gia quyền 3 năm) ──────────────────────────
function predictBenchmark(benchmarks: { year: number; score: number }[]): number {
  const y2023 = benchmarks.find((b) => b.year === 2023)?.score ?? 0;
  const y2024 = benchmarks.find((b) => b.year === 2024)?.score ?? 0;
  const y2026 = benchmarks.find((b) => b.year === 2026)?.score ?? 0;
  // Công thức: 0.5×2026 + 0.3×2024 + 0.2×2023
  return Math.round((0.5 * y2026 + 0.3 * y2024 + 0.2 * y2023) * 100) / 100;
}

// ── Xác định mức cơ hội ──────────────────────────────────────────────────────
function getChance(diff: number): { chance: 'high' | 'medium' | 'low'; percent: number } {
  if (diff >= 1.0) return { chance: 'high', percent: Math.min(95, 75 + diff * 8) };
  if (diff >= -0.5) return { chance: 'medium', percent: Math.max(40, 57 + diff * 20) };
  return { chance: 'low', percent: Math.max(5, 40 + diff * 15) };
}

// ── Gợi ý hành động ─────────────────────────────────────────────────────────
function getActionTip(
  diff: number,
  method: string,
  bestGroup: string,
  program: SchoolProgram,
): string {
  if (diff >= 1.0) return `🎯 Bạn đang trong vùng an toàn với ${method}. Hãy duy trì và cân nhắc ngành tương tự làm backup.`;
  if (diff >= 0) return `⚡ Rất gần! Cần cải thiện thêm ${Math.abs(diff).toFixed(2)} điểm để chắc chắn đỗ qua ${method}.`;
  if (diff >= -1.0) {
    const weakSubjects = ['Toán', 'Lý', 'Hóa', 'Anh'];
    return `📈 Bạn cần nâng thêm ${Math.abs(diff).toFixed(2)} điểm tổ hợp ${bestGroup}. Tập trung ôn ${weakSubjects.join(', ')}.`;
  }
  return `🔄 Điểm hiện tại thấp hơn ${Math.abs(diff).toFixed(2)} điểm. Hãy cân nhắc ngành/trường phù hợp hơn hoặc tận dụng phương thức khác.`;
}

// ── Xử lý IELTS → điểm Anh quy đổi ─────────────────────────────────────────
function ieltsToEnglishScore(ielts: number, school: string): number {
  // Bảng quy đổi phổ biến (HUST, UET, v.v.)
  if (ielts >= 8.0) return 10;
  if (ielts >= 7.0) return 10;  // nhiều trường IELTS 7.0 = 10 điểm Anh
  if (ielts >= 6.5) return 9.5;
  if (ielts >= 6.0) return 9.0;
  if (ielts >= 5.5) return 8.5;
  if (ielts >= 5.0) return 8.0;
  if (ielts >= 4.5) return 7.0;
  return 6.0;
}

// ── Thuật toán chính ─────────────────────────────────────────────────────────
export function calculateAdmission(scores: StudentScores): AdmissionResult[] {
  const results: AdmissionResult[] = [];
  const zoneBonus = PRIORITY_ZONES[scores.zone] ?? 0;

  // Điểm Anh thực tế (lấy max giữa điểm học tập và quy đổi IELTS)
  const engScore = scores.ielts
    ? Math.max(scores.anh, ieltsToEnglishScore(scores.ielts, ''))
    : scores.anh;

  const scoresWithIELTS: StudentScores = { ...scores, anh: engScore };

  for (const program of SCHOOLS) {
    // ── PT1: Điểm thi TN THPT ────────────────────────────────────────────────
    if (program.methods.includes('PT1')) {
      let bestScore = 0;
      let bestGroup = '';

      for (const group of program.subjectGroups) {
        const raw = calcGroupScore(scoresWithIELTS, group.subjects);
        const withZone = raw + zoneBonus;
        if (withZone > bestScore) {
          bestScore = withZone;
          bestGroup = group.code;
        }
      }

      const predicted = predictBenchmark(program.benchmarks);
      const diff = Math.round((bestScore - predicted) * 100) / 100;
      const { chance, percent } = getChance(diff);

      results.push({
        program,
        method: 'PT1',
        methodLabel: 'Điểm thi TN THPT',
        studentScore: bestScore,
        predictedBenchmark: predicted,
        diff,
        chance,
        chancePercent: Math.round(percent),
        bestGroup,
        actionTip: getActionTip(diff, 'PT1', bestGroup, program),
      });
    }

    // ── PT2: HSA (ĐHQGHN) ────────────────────────────────────────────────────
    if (program.methods.includes('PT2_HSA') && scores.hsa !== undefined) {
      const pt2b = program.pt2Benchmarks?.filter((b) => b.type === 'HSA') ?? [];
      if (pt2b.length > 0) {
        const predicted = Math.round((0.5 * (pt2b[pt2b.length - 1]?.score ?? 0) +
          0.3 * (pt2b[pt2b.length - 2]?.score ?? pt2b[0].score) +
          0.2 * (pt2b[0]?.score ?? 0)) * 100) / 100;
        const diff = Math.round((scores.hsa - predicted) * 100) / 100;
        const { chance, percent } = getChance(diff);
        results.push({
          program,
          method: 'PT2_HSA',
          methodLabel: 'ĐGNL ĐHQGHN (HSA)',
          studentScore: scores.hsa,
          predictedBenchmark: predicted,
          diff,
          chance,
          chancePercent: Math.round(percent),
          bestGroup: 'HSA',
          actionTip: diff >= 0
            ? `✅ Điểm HSA ${scores.hsa} đủ điều kiện xét tuyển. Đây là phương thức an toàn!`
            : `📚 Cần ${Math.abs(diff).toFixed(0)} điểm nữa để đạt ngưỡng HSA. Luyện thêm phần Toán - Tư duy.`,
        });
      }
    }

    // ── PT2: TSA (HUST) ───────────────────────────────────────────────────────
    if (program.methods.includes('PT2_TSA') && scores.tsa !== undefined) {
      const pt2b = program.pt2Benchmarks?.filter((b) => b.type === 'TSA') ?? [];
      if (pt2b.length > 0) {
        const predicted = pt2b[pt2b.length - 1]?.score ?? 0;
        const diff = Math.round((scores.tsa - predicted) * 100) / 100;
        const { chance, percent } = getChance(diff);
        results.push({
          program,
          method: 'PT2_TSA',
          methodLabel: 'ĐGTD Bách Khoa HN (TSA)',
          studentScore: scores.tsa,
          predictedBenchmark: predicted,
          diff,
          chance,
          chancePercent: Math.round(percent),
          bestGroup: 'TSA',
          actionTip: diff >= 0
            ? `✅ Điểm TSA ${scores.tsa} vượt ngưỡng! Phương thức TSA đang rất thuận lợi.`
            : `📚 Cần ${Math.abs(diff).toFixed(0)} điểm nữa với TSA. Ôn kỹ phần Toán logic và Đọc hiểu.`,
        });
      }
    }

    // ── PT4: HSG ─────────────────────────────────────────────────────────────
    if (program.methods.includes('PT4') && scores.hsg && scores.hsg !== 'none') {
      const predicted = predictBenchmark(program.benchmarks) - 1.5; // điểm sàn học bạ
      const rawScore = calcGroupScore(scoresWithIELTS, program.subjectGroups[0]?.subjects ?? []);
      const diff = Math.round((rawScore - predicted) * 100) / 100;
      const { chance } = getChance(diff + 2); // HSG bonus
      results.push({
        program,
        method: 'PT4',
        methodLabel: 'Tài năng / HSG',
        studentScore: rawScore,
        predictedBenchmark: predicted,
        diff: diff + 2,
        chance,
        chancePercent: scores.hsg === 'quocgia' ? 90 : 70,
        bestGroup: program.subjectGroups[0]?.code ?? '',
        actionTip: `🏆 Giải HSG ${scores.hsg === 'quocgia' ? 'Quốc gia' : 'Tỉnh'} là lợi thế lớn! Kiểm tra điều kiện học bạ của trường.`,
      });
    }
  }

  // Sắp xếp: high > medium > low, cùng mức thì theo diff giảm dần
  const order = { high: 0, medium: 1, low: 2 };
  return results.sort((a, b) => order[a.chance] - order[b.chance] || b.diff - a.diff);
}
