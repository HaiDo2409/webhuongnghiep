import type { Priority } from '@/services/guidance';

export const defaultPriority = (): Priority => ({ region: 'KV3', category: 'NONE', graduationYear: 2026 });
export function PriorityFields({ value, onChange, disabled = false }: { value: Priority; onChange: (p: Priority) => void; disabled?: boolean }) {
  return <fieldset className="priority-fields"><legend>Thông tin ưu tiên · quy tắc 2026</legend><div className="preview-fields">
    <label className="form-field">Khu vực<select disabled={disabled} value={value.region} onChange={e => onChange({ ...value, region: e.target.value as Priority['region'] })}><option value="KV3">KV3 · Không cộng</option><option value="KV2">KV2 · Mức gốc 0,25</option><option value="KV2NT">KV2 nông thôn · Mức gốc 0,50</option><option value="KV1">KV1 · Mức gốc 0,75</option></select></label>
    <label className="form-field">Nhóm đối tượng<select disabled={disabled} value={value.category} onChange={e => onChange({ ...value, category: e.target.value as Priority['category'] })}><option value="NONE">Không thuộc diện ưu tiên</option><option value="UT1">ƯT1 · Mức gốc 2,00</option><option value="UT2">ƯT2 · Mức gốc 1,00</option></select></label>
    <label className="form-field">Năm tốt nghiệp THPT<input disabled={disabled} required type="number" min={2000} max={2026} value={value.graduationYear} onChange={e => onChange({ ...value, graduationYear: Number(e.target.value) })} /></label>
  </div><p className="text-sm text-muted-foreground">Chọn đúng diện được hưởng theo hồ sơ. Chỉ lấy một nhóm đối tượng cao nhất. Ưu tiên khu vực áp dụng trong năm tốt nghiệp và năm kế tiếp; giảm dần từ 22,5/30.</p></fieldset>;
}
