import { api } from '@/lib/api';
import type { WorkbookData } from '@/features/schools/SchoolDirectory';

export type QuizType = 'HOLLAND' | 'MI';
export interface Question { id: number; text: string; type: string }
export interface QuizVersion { id: string; type: QuizType; version: number; title: string; status: string; revision: number; questions: Question[] }
export interface QuizResult { id: string; quizVersionId: string; type: QuizType; version: number; title: string; scores: Record<string, number>; normalizedScores: Record<string, number>; topCodes: string[]; createdAt: string }
export interface SubjectGroup { code: string; subjects: string[] }
export interface Program { id: string; school: string; shortName: string; major: string; majorCode: string; admissionYear: number; subjectGroups: SubjectGroup[]; hollandProfile: Record<string, number>; benchmark: number | null; benchmarkYear: number | null; sourceUrl: string | null; verified: boolean; published: boolean; revision: number; schoolId?:string|null; majorId?:string|null; admissionDetails?:{schoolCode?:string;workbook?:WorkbookData;calculationSupported?:boolean;programCode?:string;method?:string;formula?:string;scale?:number;sourceUrl?:string;benchmarkSourceUrl?:string;benchmarkVerified?:boolean;secondaryCriteria?:string;retrievedAt?:string} }
export interface BenchmarkPoint { group: string; year: number; score: number; sourceUrl: string; verified: boolean; comparable: boolean }
export interface HistoryEstimate { reference: number | null; difference: number | null; band: 'INSUFFICIENT_DATA' | 'NO_SCORE' | 'BELOW' | 'NEAR' | 'ABOVE'; points: BenchmarkPoint[]; missingYears: number[]; note: string }
export interface Priority { region: 'KV1' | 'KV2NT' | 'KV2' | 'KV3'; category: 'NONE' | 'UT1' | 'UT2'; graduationYear: number }
export interface RecommendationItem { program: Program; compatibility: number | null; rawScore: number | null; bestGroup: string | null; rawDifference: number | null; reasons: string[]; priorityScore: number | null; admissionScore: number | null; estimate: HistoryEstimate }
export interface AdmissionPolicy { id: string; year: number; school: string; method: 'APTITUDE' | 'COMBINED'; title: string; exam: string; scale: number; formula: string; sourceUrl: string; version: string }
export interface SchoolScoreResult { policy: AdmissionPolicy; baseScore: number; certificateScore: number | null; priorityScore: number; totalScore: number; declaredRequirementsMet: boolean; checks: { label: string; passed: boolean }[]; steps: string[]; notes: string[] }
export interface RecommendationPage { offset: number; limit: number; major?: string; verifiedOnly?: boolean; programId?: string | null }
export interface RecommendationResponse { id: string; items: RecommendationItem[]; calculationNote: string; total: number; offset: number; hasMore: boolean }
export type RankingMode = 'POINTS' | 'INTEREST' | 'COMBINED';
export interface StudentProfile { schoolName: string; grade: string; targetYear: number; scores: Record<string, number> }
export interface ProfileResponse { data: Partial<StudentProfile>; revision: number }
export const subjectLabels: Record<string, string> = { toan: 'Toán', ly: 'Vật lý', hoa: 'Hóa học', sinh: 'Sinh học', tin: 'Tin học', van: 'Ngữ văn', anh: 'Tiếng Anh', su: 'Lịch sử', dia: 'Địa lý' };
export const guidance = {
  quizzes: () => api.get<QuizVersion[]>('/api/quizzes').then(r => r.data),
  submit: (quizVersionId: string, answers: Record<number, number>) => api.post<QuizResult>('/api/quiz-results', { quizVersionId, answers }).then(r => r.data),
  history: () => api.get<QuizResult[]>('/api/me/quiz-results').then(r => r.data),
  result: (id: string) => api.get<QuizResult>(`/api/me/quiz-results/${id}`).then(r => r.data),
  deleteResult: (id: string) => api.delete(`/api/me/quiz-results/${id}`),
  restoreResult: (id: string) => api.post<QuizResult>(`/api/me/quiz-results/${id}/restore`).then(r => r.data),
  profile: () => api.get<ProfileResponse>('/api/me/profile').then(r => r.data),
  programs: () => api.get<Program[]>('/api/programs').then(r => r.data),
  recommend: (year: number, mode: RankingMode, scores: Record<string, number>, quizResultId: string | null, priority?: Priority, page: RecommendationPage = { offset: 0, limit: 15 }, signal?: AbortSignal) => api.post<RecommendationResponse>('/api/recommendations', { year, mode, scores, quizResultId, priority, page }, { signal }).then(r => r.data),
  policies: () => api.get<AdmissionPolicy[]>('/api/admissions/policies').then(r => r.data),
  calculate: (input: Record<string, unknown>) => api.post<SchoolScoreResult>('/api/admissions/calculate', input).then(r => r.data),
};
export function errorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return 'Chưa kết nối được máy chủ. Hãy kiểm tra backend và PostgreSQL, rồi thử lại.';
}
const ACTIVE_RESULT = 'hn_active_holland_result';
export function activeResult(): string | null { return sessionStorage.getItem(ACTIVE_RESULT); }
export function setActiveResult(id: string) { sessionStorage.setItem(ACTIVE_RESULT, id); }
export function clearActiveResult(id: string) { if (activeResult() === id) sessionStorage.removeItem(ACTIVE_RESULT); }
