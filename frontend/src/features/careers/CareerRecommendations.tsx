import { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { careersApi,type CareerRecord } from '@/services/careers';
export function CareerRecommendations({quizId}:{quizId:string}){
  const [items,setItems]=useState<CareerRecord[]>([]),[error,setError]=useState(false),[busy,setBusy]=useState(true);
  useEffect(()=>{let live=true;careersApi.search({quizResultId:quizId,size:3,page:0}).then(data=>{if(live)setItems(data.items);}).catch(()=>{if(live)setError(true);}).finally(()=>{if(live)setBusy(false);});return()=>{live=false;};},[quizId]);
  return <section className="bento-card career-recommendations"><p className="eyebrow">TỪ SỞ THÍCH ĐẾN THẾ GIỚI NGHỀ</p><h2>Nghề bạn có thể tìm hiểu</h2>{busy&&<p role="status">Đang đối chiếu danh mục nghề…</p>}{error&&<p>Chưa tải được gợi ý nghề. Kết quả quiz vẫn được giữ.</p>}{items.map(c=><Link className="career-recommendation-row" to="/nganh-nghe" key={c.id}><div className="career-recommendation-content"><h3>{c.nameVi}</h3><p>{c.majorNames.slice(0,2).join(', ')}</p></div><span className="career-recommendation-fit"><strong>{c.fit.score?.toFixed(1)??'—'}<small>/100</small></strong><small>Tương đồng sở thích</small></span></Link>)}<Link className="text-link" to="/nganh-nghe">Xem danh mục và cách tính độ phù hợp ↗</Link><p className="profile-caption">Dùng hồ sơ sở thích O*NET; không phải xác suất thành công nghề nghiệp.</p></section>;
}
