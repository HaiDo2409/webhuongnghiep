import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { errorMessage } from '@/services/guidance';
import { majorLabel } from '@/lib/catalog-labels';
interface Tag {id:string;code:string;name:string;active:boolean;origin:string;revision:number}
interface Assignment {revision:number;tagIds:string[]}
const search=(text:string,q:string)=>text.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replaceAll('đ','d').includes(q.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replaceAll('đ','d').trim());
export function CatalogTagManager(){
 const [tags,setTags]=useState<Tag[]>([]),[q,setQ]=useState(''),[showRetired,setShowRetired]=useState(false),[form,setForm]=useState<Partial<Tag>>({code:'',name:'',active:true}),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 async function load(){setTags((await api.get<Tag[]>('/api/admin/tags')).data);}
 useEffect(()=>{let live=true;api.get<Tag[]>('/api/admin/tags').then(r=>{if(live)setTags(r.data);}).catch(e=>{if(live)setError(errorMessage(e));});return()=>{live=false;};},[]);
 async function save(){setBusy(true);setError('');setMessage('');try{await api.post('/api/admin/tags',form);await load();setForm({code:'',name:'',active:true});setMessage('Đã lưu tag dùng chung. Bấm Tải lại tag ở phần gắn tag nếu danh sách đang mở.');}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}
 const visible=tags.filter(t=>(showRetired||t.active)&&search(`${t.name} ${t.code}`,q));
 return <details className="soft-panel p-5"><summary className="font-semibold cursor-pointer">Quản lý tag dùng chung · {tags.filter(t=>t.active).length} tag đang dùng</summary><div className="space-y-4 pt-4"><p>Gắn cùng tag cho nghề và chương trình để tự gợi ý liên kết. Bộ khởi đầu có 45 tag định hướng; bạn có thể bổ sung. Tag tên ngành cũ đã lưu trữ và không tham gia khớp.</p><label className="flex gap-2"><input type="checkbox" checked={showRetired} onChange={e=>setShowRetired(e.target.checked)}/>Hiện tag đã ngừng sử dụng</label>
 {error&&<p role="alert" className="notice notice-error">{error}</p>}{message&&<p role="status" className="notice notice-info">{message}</p>}
 <div className="grid md:grid-cols-2 gap-3"><label className="form-field">Mã tag<input readOnly={!!form.id} maxLength={60} value={form.code??''} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} placeholder="Ví dụ: LAP_TRINH"/></label><label className="form-field">Tên tag<input maxLength={160} value={form.name??''} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ví dụ: Lập trình"/></label></div>
 <label className="flex gap-2"><input type="checkbox" checked={!!form.active} onChange={e=>setForm({...form,active:e.target.checked})}/>Đang sử dụng (tắt để ngừng khớp bằng tag này)</label><div className="flex flex-wrap gap-3"><button type="button" disabled={busy||!form.code?.trim()||!form.name?.trim()} className="action-primary" onClick={()=>void save()}>{busy?'Đang lưu…':form.id?'Lưu thay đổi tag':'Tạo tag'}</button><button type="button" className="action-secondary" onClick={()=>setForm({code:'',name:'',active:true})}>Tag mới</button></div>
 <label className="form-field">Tìm tag trong danh mục<input value={q} onChange={e=>setQ(e.target.value)}/></label><div className="career-admin-options">{visible.map(t=><div className="tag-management-row" key={t.id}><span><strong>{t.name}</strong><small>{t.code} · {t.active?'Đang dùng':'Ngừng dùng'} · {t.origin==='MIGRATED_MAJOR'?'Từ danh mục ngành':'Admin tạo'}</small></span><button type="button" className="action-secondary" onClick={()=>{setForm({...t});setError('');setMessage('');}}>Sửa tag</button></div>)}</div></div></details>;
}
export function TagPicker({type,targetId,onSaved}:{type:'CAREER'|'PROGRAM';targetId:string;onSaved?:()=>void}){
 const [tags,setTags]=useState<Tag[]>([]),[assignment,setAssignment]=useState<Assignment|null>(null),[selected,setSelected]=useState<string[]>([]),[q,setQ]=useState(''),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[reload,setReload]=useState(0);
 useEffect(()=>{let live=true;setAssignment(null);setError('');setMessage('');Promise.all([api.get<Tag[]>('/api/admin/tags'),api.get<Assignment>('/api/admin/tag-assignments',{params:{type,targetId}})]).then(([t,a])=>{if(live){setTags(t.data);setAssignment(a.data);setSelected(a.data.tagIds);}}).catch(e=>{if(live)setError(errorMessage(e));});return()=>{live=false;};},[type,targetId,reload]);
 function toggle(id:string){setSelected(old=>old.includes(id)?old.filter(v=>v!==id):[...old,id]);setMessage('');}
 async function save(){if(!assignment)return;setBusy(true);setError('');try{const r=await api.post<Assignment>('/api/admin/tag-assignments',{type,targetId,revision:assignment.revision,tagIds:selected});setAssignment(r.data);setSelected(r.data.tagIds);setMessage('Đã lưu tag. Gợi ý liên kết cập nhật theo tag đang dùng.');onSaved?.();}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}
 return <section className="tag-picker space-y-3"><h3 className="text-lg font-semibold">Tag {type==='CAREER'?'của nghề':'của chương trình'}</h3><p>Chọn từ danh mục chung. Tag giống nhau tạo gợi ý liên kết, không phải điểm Holland hay xác suất trúng tuyển. Phần tag được lưu riêng bằng nút bên dưới.</p>
 {error&&<p role="alert" className="notice notice-error">{error}</p>}{message&&<p role="status" className="notice notice-info">{message}</p>}
 <div className="flex flex-wrap gap-2">{tags.filter(t=>selected.includes(t.id)).map(t=><button type="button" className="action-secondary" key={t.id} disabled={busy} onClick={()=>toggle(t.id)}>{t.name}{t.active?'':' (ngừng dùng)'} ×</button>)}</div>
 <label className="form-field">Tìm tag để gắn<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Lập trình, AI, Công nghệ thông tin…"/></label><div className="career-admin-options">{tags.filter(t=>(t.active||selected.includes(t.id))&&search(`${t.name} ${t.code}`,q)).map(t=><label key={t.id}><input type="checkbox" disabled={busy||(!t.active&&!selected.includes(t.id))} checked={selected.includes(t.id)} onChange={()=>toggle(t.id)}/><span>{t.name}<small>{t.active?t.code:'Ngừng sử dụng — bỏ chọn trước khi lưu'}</small></span></label>)}</div>
 <div className="flex flex-wrap gap-3 items-center"><span>{selected.length} tag đã chọn</span><button type="button" disabled={busy||!assignment} className="action-primary" onClick={()=>void save()}>{busy?'Đang lưu…':`Lưu tag ${type==='CAREER'?'nghề':'chương trình'}`}</button><button type="button" disabled={busy} className="action-secondary" onClick={()=>setReload(v=>v+1)}>Tải lại tag</button></div></section>;
}
interface Match {id:string;school:string;short_name:string;major:string;admission_year:number;published:boolean;school_active?:boolean;matched_count:number;matched_tags:string;career_tag_count:number;tag_coverage:number|null;decision:'EXCLUDE'|null;included:boolean}
export function CareerTagLinks({careerId}:{careerId:string}){
 const [query,setQuery]=useState('');
 const [epoch,setEpoch]=useState(0),[data,setData]=useState<{revision:number;items:Match[]}|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{let live=true;setData(null);api.get<{revision:number;items:Match[]}>(`/api/admin/careers/${encodeURIComponent(careerId)}/tag-matches`).then(r=>{if(live)setData(r.data);}).catch(e=>{if(live)setError(errorMessage(e));});return()=>{live=false;};},[careerId,epoch]);
 async function decide(p:Match,decision:string){if(!data)return;setBusy(true);setError('');try{await api.post(`/api/admin/careers/${encodeURIComponent(careerId)}/program-decisions`,{programId:p.id,decision,revision:data.revision});setEpoch(v=>v+1);}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}
 const visible=data?.items.filter(p=>search(`${p.major} ${p.school} ${p.short_name} ${p.admission_year}`,query))??[];
 return <div className="space-y-4"><TagPicker type="CAREER" targetId={careerId} onSaved={()=>setEpoch(v=>v+1)}/>
 <section className="tag-picker space-y-3"><div className="flex flex-wrap gap-3 justify-between"><h3 className="text-lg font-semibold">Chương trình tự khớp theo tag</h3><button type="button" className="action-secondary" disabled={busy} onClick={()=>{setError('');setEpoch(v=>v+1);}}>Làm mới gợi ý</button></div>
 <p>Chương trình có ít nhất một tag chung sẽ tự xuất hiện trong gợi ý. Mức khớp = số tag chung / số tag đang dùng của nghề. Bạn chỉ cần loại trừ gợi ý chưa phù hợp; không phải xác nhận từng chương trình.</p>
 {error&&<p role="alert" className="notice notice-error">{error}</p>}
 <label className="form-field">Tìm chương trình trong gợi ý<input value={query} onChange={e=>setQuery(e.target.value)}/></label>
 {data===null?<p role="status">Đang tải gợi ý…</p>:!visible.length?<p>{data.items.length?'Không có chương trình khớp từ khóa.':'Chưa có chương trình khớp tag. Hãy gắn tag cho nghề và chương trình ở tab Ngành và trường.'}</p>:
 <div className="tag-match-list">{visible.map(p=><article className="tag-match-card space-y-2" key={p.id}>
 <strong>{majorLabel(p.major)}</strong><p>{p.short_name} · {p.school} · {p.admission_year}{p.school_active===false?' · Trường đang ẩn':p.published?'':' · Chương trình đang ẩn'}</p>
 <p>{p.tag_coverage===null?'Chưa có tag nghề để đối chiếu':`${Number(p.tag_coverage).toFixed(1)}% tag nghề khớp · ${p.matched_count}/${p.career_tag_count} tag`}</p>
 {p.matched_tags&&<p className="text-sm">Tag chung: {p.matched_tags}</p>}
 <p className="tag-link-status">{p.decision==='EXCLUDE'?'Đã loại trừ':p.school_active===false?'Trường đang ẩn':!p.published?'Chương trình đang ẩn':p.included?'Đang tự gợi ý theo tag':'Chưa có tag chung'}</p>
 <button type="button" className="action-secondary" disabled={busy} onClick={()=>void decide(p,p.decision==='EXCLUDE'?'RESET':'EXCLUDE')}>{p.decision==='EXCLUDE'?'Bỏ loại trừ':'Loại trừ gợi ý'}</button>
 </article>)}</div>}</section></div>;
}
