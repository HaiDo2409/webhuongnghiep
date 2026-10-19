import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { guidance, errorMessage, type QuizResult } from '@/services/guidance';
import { QuizResults } from '@/features/guidance/QuizResults';

export function QuizHistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    setResult(null); setError('');
    if (id) guidance.result(id).then(data => { if (live) setResult(data); }).catch(e => { if (live) setError(errorMessage(e)); });
    return () => { live = false; };
  }, [id]);
  if (error) return <main className="page-width py-12"><p role="alert">{error}</p><Link className="action-secondary mt-5" to="/dashboard">Về lịch sử trắc nghiệm</Link></main>;
  if (!result) return <main className="page-width py-12" role="status">Đang mở kết quả của bạn…</main>;
  return <QuizResults result={result} onReset={() => navigate('/dashboard')} resetLabel="Về lịch sử" />;
}
