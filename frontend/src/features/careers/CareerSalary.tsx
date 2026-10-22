import type { CareerRecord } from '@/services/careers';

function range(career: CareerRecord) {
  return `${((career.salaryMinVnd ?? 0) / 1e6).toLocaleString('vi-VN')}–${((career.salaryMaxVnd ?? 0) / 1e6).toLocaleString('vi-VN')} triệu/tháng`;
}

export function CareerSalary({ career }: { career: CareerRecord }) {
  if (!career.salaryMaxVnd) return <span className="career-salary"><span>Đang bổ sung lương tham khảo</span></span>;
  return <span className="career-salary"><span>{range(career)}</span><small>{career.salaryKind === 'ESTIMATE' ? 'Ước tính tham khảo' : 'Lương tham khảo'} · {career.salaryYear}<br/>{career.salaryRegion}{career.salaryKind === 'ESTIMATE' && <> · Xem kinh nghiệm trong chi tiết</>}</small></span>;
}

export function CareerSalaryDetail({ career }: { career: CareerRecord }) {
  if (!career.salaryMaxVnd) return <section className="salary-detail"><h3>Lương tham khảo</h3><p>Chưa có dữ liệu phù hợp cho nghề này.</p></section>;
  return <section className="salary-detail" aria-label="Thông tin lương tham khảo">
    <h3>{career.salaryKind === 'ESTIMATE' ? 'Ước tính lương tham khảo' : 'Lương tham khảo'}</h3>
    <strong>{range(career)}</strong>
    <p>{career.salaryRegion} · {career.salaryYear}{career.salaryBasis === 'GROSS' ? ' · Trước thuế (gross)' : career.salaryBasis === 'UNSPECIFIED' ? ' · Nguồn chưa nêu rõ trước/sau thuế' : ''}</p>
    {career.salaryExperience && <p>{career.salaryExperience}</p>}
    {career.salaryReferenceRole && <p>Vị trí đối chiếu: {career.salaryReferenceRole}</p>}
    {career.salaryMethod && <p className="text-sm">{career.salaryMethod}</p>}
    {career.salarySourceUrl && <a className="text-link" href={career.salarySourceUrl} target="_blank" rel="noopener noreferrer">{career.salarySourceName ?? 'Xem nguồn lương'} ↗</a>}
    {career.salaryRetrievedAt && <small>Đối chiếu nguồn: {career.salaryRetrievedAt}</small>}
  </section>;
}
