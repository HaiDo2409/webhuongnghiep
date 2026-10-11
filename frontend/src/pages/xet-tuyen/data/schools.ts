import type { HollandType } from './data/questions';

export interface SchoolProgram {
  school: string;
  shortName: string;
  major: string;
  majorCode: string;
  subjectGroups: {
    code: string;          // A00, A01, D01...
    subjects: string[];
  }[];
  benchmarks: {
    year: number;
    score: number;
  }[];
  methods: ('PT1' | 'PT2_HSA' | 'PT2_TSA' | 'PT2_BCA' | 'PT3' | 'PT4')[];
  // PT2 benchmarks
  pt2Benchmarks?: {
    type: 'HSA' | 'TSA' | 'BCA';
    year: number;
    score: number;
  }[];
  hollandCodes?: HollandType[];  // gợi ý Holland tương thích
}

export const SCHOOLS: SchoolProgram[] = [
  // ── ĐHBK Hà Nội (HUST) ────────────────────────────────────────────────────
  {
    school: 'Đại học Bách khoa Hà Nội',
    shortName: 'HUST',
    major: 'Công nghệ Thông tin',
    majorCode: '7480201',
    subjectGroups: [
      { code: 'A00', subjects: ['Toán', 'Lý', 'Hóa'] },
      { code: 'A01', subjects: ['Toán', 'Lý', 'Anh'] },
    ],
    benchmarks: [
      { year: 2023, score: 28.04 },
      { year: 2024, score: 28.54 },
      { year: 2026, score: 28.8 },
    ],
    methods: ['PT1', 'PT2_TSA', 'PT3'],
    pt2Benchmarks: [
      { type: 'TSA', year: 2023, score: 74 },
      { type: 'TSA', year: 2024, score: 76 },
    ],
    hollandCodes: ['I', 'R', 'C'],
  },
  {
    school: 'Đại học Bách khoa Hà Nội',
    shortName: 'HUST',
    major: 'Kỹ thuật Điện – Điện tử',
    majorCode: '7520201',
    subjectGroups: [
      { code: 'A00', subjects: ['Toán', 'Lý', 'Hóa'] },
      { code: 'A01', subjects: ['Toán', 'Lý', 'Anh'] },
    ],
    benchmarks: [
      { year: 2023, score: 26.5 },
      { year: 2024, score: 27.0 },
      { year: 2026, score: 27.25 },
    ],
    methods: ['PT1', 'PT2_TSA'],
    pt2Benchmarks: [
      { type: 'TSA', year: 2024, score: 68 },
    ],
    hollandCodes: ['R', 'I', 'C'],
  },
  {
    school: 'Đại học Bách khoa Hà Nội',
    shortName: 'HUST',
    major: 'Cơ điện tử',
    majorCode: '7520114',
    subjectGroups: [
      { code: 'A00', subjects: ['Toán', 'Lý', 'Hóa'] },
    ],
    benchmarks: [
      { year: 2023, score: 26.0 },
      { year: 2024, score: 26.5 },
      { year: 2026, score: 26.75 },
    ],
    methods: ['PT1', 'PT2_TSA'],
    hollandCodes: ['R', 'I', 'C'],
  },
  {
    school: 'Đại học Bách khoa Hà Nội',
    shortName: 'HUST',
    major: 'Kỹ thuật Hóa học',
    majorCode: '7520301',
    subjectGroups: [
      { code: 'A00', subjects: ['Toán', 'Lý', 'Hóa'] },
      { code: 'B00', subjects: ['Toán', 'Hóa', 'Sinh'] },
    ],
    benchmarks: [
      { year: 2023, score: 25.0 },
      { year: 2024, score: 25.5 },
      { year: 2026, score: 25.7 },
    ],
    methods: ['PT1', 'PT2_TSA'],
    hollandCodes: ['I', 'R', 'C'],
  },

  // ── ĐH Công nghệ – ĐHQGHN ──────────────────────────────────────────────────
  {
    school: 'ĐH Công nghệ – ĐHQGHN',
    shortName: 'UET',
    major: 'Khoa học Máy tính',
    majorCode: '7480101',
    subjectGroups: [
      { code: 'A00', subjects: ['Toán', 'Lý', 'Hóa'] },
      { code: 'A01', subjects: ['Toán', 'Lý', 'Anh'] },
    ],
    benchmarks: [
      { year: 2023, score: 27.5 },
      { year: 2024, score: 28.0 },
      { year: 2026, score: 28.25 },
    ],
    methods: ['PT1', 'PT2_HSA', 'PT3'],
    pt2Benchmarks: [
      { type: 'HSA', year: 2023, score: 105 },
      { type: 'HSA', year: 2024, score: 108 },
    ],
    hollandCodes: ['I', 'R', 'C'],
  },
  {
    school: 'ĐH Công nghệ – ĐHQGHN',
    shortName: 'UET',
    major: 'Kỹ thuật Phần mềm',
    majorCode: '7480103',
    subjectGroups: [
      { code: 'A00', subjects: ['Toán', 'Lý', 'Hóa'] },
      { code: 'A01', subjects: ['Toán', 'Lý', 'Anh'] },
    ],
    benchmarks: [
      { year: 2023, score: 27.0 },
      { year: 2024, score: 27.6 },
      { year: 2026, score: 27.85 },
    ],
    methods: ['PT1', 'PT2_HSA'],
    hollandCodes: ['I', 'R', 'C'],
  },
  {
    school: 'ĐH Công nghệ – ĐHQGHN',
    shortName: 'UET',
    major: 'Điện tử Viễn thông',
    majorCode: '7520207',
    subjectGroups: [
      { code: 'A00', subjects: ['Toán', 'Lý', 'Hóa'] },
      { code: 'A01', subjects: ['Toán', 'Lý', 'Anh'] },
    ],
    benchmarks: [
      { year: 2023, score: 25.5 },
      { year: 2024, score: 26.0 },
      { year: 2026, score: 26.2 },
    ],
    methods: ['PT1', 'PT2_HSA'],
    hollandCodes: ['R', 'I', 'C'],
  },

  // ── ĐH Sư phạm Hà Nội ─────────────────────────────────────────────────────
  {
    school: 'ĐH Sư phạm Hà Nội',
    shortName: 'HNUE',
    major: 'Sư phạm Toán học',
    majorCode: '7140209',
    subjectGroups: [
      { code: 'A00', subjects: ['Toán', 'Lý', 'Hóa'] },
      { code: 'A01', subjects: ['Toán', 'Lý', 'Anh'] },
    ],
    benchmarks: [
      { year: 2023, score: 27.3 },
      { year: 2024, score: 27.8 },
      { year: 2026, score: 28.0 },
    ],
    methods: ['PT1', 'PT4'],
    hollandCodes: ['I', 'S', 'C'],
  },
  {
    school: 'ĐH Sư phạm Hà Nội',
    shortName: 'HNUE',
    major: 'Sư phạm Vật lý',
    majorCode: '7140211',
    subjectGroups: [
      { code: 'A00', subjects: ['Toán', 'Lý', 'Hóa'] },
      { code: 'A01', subjects: ['Toán', 'Lý', 'Anh'] },
    ],
    benchmarks: [
      { year: 2023, score: 25.5 },
      { year: 2024, score: 26.0 },
      { year: 2026, score: 26.2 },
    ],
    methods: ['PT1', 'PT4'],
    hollandCodes: ['I', 'S', 'R'],
  },

  // ── ĐH Sư phạm Kỹ thuật TP.HCM ────────────────────────────────────────────
  {
    school: 'ĐH Sư phạm Kỹ thuật TP.HCM',
    shortName: 'HCMUTE',
    major: 'Công nghệ Thông tin',
    majorCode: '7480201',
    subjectGroups: [
      { code: 'A00', subjects: ['Toán', 'Lý', 'Hóa'] },
      { code: 'A01', subjects: ['Toán', 'Lý', 'Anh'] },
      { code: 'D07', subjects: ['Toán', 'Hóa', 'Anh'] },
    ],
    benchmarks: [
      { year: 2023, score: 24.5 },
      { year: 2024, score: 25.0 },
      { year: 2026, score: 25.25 },
    ],
    methods: ['PT1', 'PT2_BCA'],
    hollandCodes: ['I', 'R', 'C'],
  },
  {
    school: 'ĐH Sư phạm Kỹ thuật TP.HCM',
    shortName: 'HCMUTE',
    major: 'Kỹ thuật Cơ khí',
    majorCode: '7520103',
    subjectGroups: [
      { code: 'A00', subjects: ['Toán', 'Lý', 'Hóa'] },
    ],
    benchmarks: [
      { year: 2023, score: 22.0 },
      { year: 2024, score: 22.5 },
      { year: 2026, score: 22.7 },
    ],
    methods: ['PT1'],
    hollandCodes: ['R', 'I', 'C'],
  },

  // ── ĐH Y Hà Nội ───────────────────────────────────────────────────────────
  {
    school: 'ĐH Y Hà Nội',
    shortName: 'HMU',
    major: 'Y khoa',
    majorCode: '7720101',
    subjectGroups: [
      { code: 'B00', subjects: ['Toán', 'Hóa', 'Sinh'] },
    ],
    benchmarks: [
      { year: 2023, score: 28.0 },
      { year: 2024, score: 28.4 },
      { year: 2026, score: 28.6 },
    ],
    methods: ['PT1'],
    hollandCodes: ['I', 'S', 'R'],
  },
  {
    school: 'ĐH Y Hà Nội',
    shortName: 'HMU',
    major: 'Điều dưỡng',
    majorCode: '7720301',
    subjectGroups: [
      { code: 'B00', subjects: ['Toán', 'Hóa', 'Sinh'] },
    ],
    benchmarks: [
      { year: 2023, score: 22.5 },
      { year: 2024, score: 23.0 },
      { year: 2026, score: 23.2 },
    ],
    methods: ['PT1'],
    hollandCodes: ['S', 'R', 'I'],
  },

  // ── Học viện Tài chính ──────────────────────────────────────────────────────
  {
    school: 'Học viện Tài chính',
    shortName: 'AOF',
    major: 'Kế toán',
    majorCode: '7340301',
    subjectGroups: [
      { code: 'A00', subjects: ['Toán', 'Lý', 'Hóa'] },
      { code: 'A01', subjects: ['Toán', 'Lý', 'Anh'] },
      { code: 'D01', subjects: ['Toán', 'Văn', 'Anh'] },
    ],
    benchmarks: [
      { year: 2023, score: 24.0 },
      { year: 2024, score: 24.5 },
      { year: 2026, score: 24.7 },
    ],
    methods: ['PT1'],
    hollandCodes: ['C', 'E', 'I'],
  },
];

// ── Ưu tiên khu vực ────────────────────────────────────────────────────────────
export const PRIORITY_ZONES: Record<string, number> = {
  KV1: 0.75,
  'KV2-NT': 0.5,
  KV2: 0.25,
  KV3: 0,
};

// ── Tổ hợp môn học ─────────────────────────────────────────────────────────────
export const SUBJECT_GROUPS: Record<string, string[]> = {
  A00: ['Toán', 'Lý', 'Hóa'],
  A01: ['Toán', 'Lý', 'Anh'],
  A02: ['Toán', 'Lý', 'Sinh'],
  B00: ['Toán', 'Hóa', 'Sinh'],
  C00: ['Văn', 'Sử', 'Địa'],
  D01: ['Toán', 'Văn', 'Anh'],
  D07: ['Toán', 'Hóa', 'Anh'],
  D08: ['Toán', 'Sinh', 'Anh'],
  D09: ['Toán', 'Sử', 'Anh'],
};
