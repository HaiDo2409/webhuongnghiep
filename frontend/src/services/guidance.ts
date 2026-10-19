import { api } from '@/lib/api';

export type QuizType = 'HOLLAND' | 'MI';
export interface Question { id: number; text: string; type: string }
export interface QuizVersion { id: string; type: QuizType; version: number; title: string; status: string; revision: number; questions: Question[] }
export interface QuizResult { id: string; quizVersionId: string; type: QuizType; version: number; title: string; scores: Record<string, number>; normalizedScores: Record<string, number>; topCodes: string[]; createdAt: string }
export interface SubjectGroup { code: string; subjects: string[] }
export interface Program { id: string; school: string; shortName: string; major: string; majorCode: string; admissionYear: number; subjectGroups: SubjectGroup[]; hollandProfile: Record<string, number>; benchmark: number | null; benchmarkYear: number | null; sourceUrl: string | null; verified: boolean; published: boolean; revision: number }
export interface RecommendationItem { program: Program; compatibility: number | null; rawScore: number | null; bestGroup: string | null; rawDifference: number | null; reasons: string[] }
export interface RecommendationResponse { id: string; items: RecommendationItem[]; calculationNote: string }
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
  recommend: (year: number, mode: RankingMode, scores: Record<string, number>, quizResultId: string | null) => api.post<RecommendationResponse>('/api/recommendations', { year, mode, scores, quizResultId }).then(r => r.data),
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
