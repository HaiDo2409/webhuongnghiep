import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { errorMessage } from '@/services/guidance';
import { CareerTagLinks } from './CatalogTags';
interface Option {id:string;name:string;official_code?:string}
interface Career {id:string;revision:number;onetCode:string;hollandCode:string;nameEn:string;nameVi:string;description:string;groups:{name:string}[];stemGroups:string[];published:boolean;interestProfile?:Record<string,number>}
interface Options {groups:Option[]}
const blank=():Career=>({id:'',revision:-1,onetCode:'',hollandCode:'',nameEn:'',nameVi:'',description:'',groups:[],stemGroups:['OTHER'],published:false});
function toggle(values:string[],id:string){return values.includes(id)?values.filter(v=>v!==id):[...values,id];}
export function CareerEditor(){
 const [options,setOptions]=useState<Options>({groups:[]}),[items,setItems]=useState<Career[]>([]),[total,setTotal]=useState(0);
 const [q,setQ]=useState(''),[page,setPage]=useState(0),[form,setForm]=useState<Career|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const formRef=useRef<HTMLFormElement>(null);
 useEffect(()=>{if(formRef.current)formRef.current.scrollIntoView({behavior:'smooth',block:'start'});},[form?.id]);
 async function load(){const r=await api.get<{items:Career[];total:number}>('/api/admin/careers',{params:{q,page}});setItems(r.data.items);setTotal(r.data.total);}
 useEffect(()=>{let live=true;api.get<Options>('/api/admin/careers/options').then(r=>{if(live)setOptions(r.data);}).catch(e=>{if(live)setError(errorMessage(e));});return()=>{live=false;};},[]);
 useEffect(()=>{let live=true;const timer=setTimeout(()=>{api.get<{items:Career[];total:number}>('/api/admin/careers',{params:{q,page}}).then(r=>{if(live){setItems(r.data.items);setTotal(r.data.total);}}).catch(e=>{if(live)setError(errorMessage(e));});},200);return()=>{live=false;clearTimeout(timer);};},[q,page]);
 async function edit(id:string){setBusy(true);setError('');setMessage('');try{const r=await api.get<Career>(`/api/admin/careers/${encodeURIComponent(id)}`);setForm(r.data);}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}
 async function save(e:React.FormEvent){e.preventDefault();if(!form)return;setBusy(true);setError('');setMessage('');try{const r=await api.post<Career>('/api/admin/careers',{...form,groups:form.groups.map(g=>g.name)});setForm(r.data);await load();setMessage('Đã lưu nghề. Chương trình liên quan được tự khớp theo tag; bạn có thể gắn hoặc cập nhật tag ở bên dưới.');}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}
 return <section className="soft-panel p-6 space-y-5"><div className="flex flex-wrap gap-3 justify-between items-center"><div><h2 className="text-2xl font-semibold">Quản lý nghề và chương trình liên quan</h2><p>Thêm, sửa nghề và gắn tag để tự tìm chương trình đào tạo liên quan.</p></div><button className="action-primary" disabled={busy} onClick={()=>{setForm(blank());setError('');setMessage('');}}>Thêm nghề</button></div>
 {error&&<p role="alert" className="notice notice-error">{error}</p>}{message&&<p role="status" className="notice notice-info">{message}</p>}
 <label className="form-field">Tìm nghề để chỉnh sửa<input value={q} onChange={e=>{setQ(e.target.value);setPage(0);}} placeholder="Tên nghề hoặc mã O*NET"/></label>
 <div className="import-table-wrap"><table className="import-table"><thead><tr><th>Nghề</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{items.map(c=><tr key={c.id}><td><strong>{c.nameVi}</strong><p>{c.onetCode}</p></td><td>{c.published?'Công khai':'Đang ẩn'}</td><td><button disabled={busy} className="action-secondary" onClick={()=>void edit(c.id)}>Sửa nghề & tag</button></td></tr>)}</tbody></table></div>
 <div className="flex flex-wrap gap-3 items-center"><button className="action-secondary" disabled={!page} onClick={()=>setPage(p=>p-1)}>Trang trước</button><span>{total} nghề · Trang {page+1}/{Math.max(1,Math.ceil(total/20))}</span><button className="action-secondary" disabled={(page+1)*20>=total} onClick={()=>setPage(p=>p+1)}>Trang sau</button></div>
 {form&&<form ref={formRef} onSubmit={save} className="career-admin-form space-y-5"><h3 className="text-xl font-semibold">{form.id?`Chỉnh sửa: ${form.nameVi}`:'Nghề mới'}</h3><fieldset disabled={busy} className="space-y-5"><div className="grid md:grid-cols-2 gap-4">
 <label className="form-field">Mã O*NET<input required maxLength={10} readOnly={!!form.id} value={form.onetCode} onChange={e=>setForm({...form,onetCode:e.target.value})} placeholder="15-1252.00"/></label>
 <label className="form-field">Mã Holland<input required maxLength={6} value={form.hollandCode} onChange={e=>setForm({...form,hollandCode:e.target.value.toUpperCase()})}/></label>
 <label className="form-field">Tên nghề tiếng Việt<input required maxLength={255} value={form.nameVi} onChange={e=>setForm({...form,nameVi:e.target.value})}/></label>
 <label className="form-field">Tên nghề tiếng Anh<input required maxLength={255} value={form.nameEn} onChange={e=>setForm({...form,nameEn:e.target.value})}/></label></div>
 {form.interestProfile&&<p className="text-sm text-muted-foreground">Nghề đang dùng hồ sơ sở thích O*NET. Nếu đổi mã Holland, hệ thống chuyển sang tính độ phù hợp theo mã Holland bạn nhập.</p>}
 <label className="form-field">Mô tả nghề<textarea required rows={3} maxLength={2000} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
 <label className="form-field">Nhóm ngành (ngăn cách bằng dấu ;)<input required list="career-admin-groups" value={form.groups.map(g=>g.name).join('; ')} onChange={e=>setForm({...form,groups:e.target.value.split(';').map(name=>({name}))})}/><datalist id="career-admin-groups">{options.groups.map(g=><option key={g.id} value={g.name}/>)}</datalist></label>
 <fieldset><legend className="font-semibold mb-2">Lĩnh vực STEM</legend><div className="flex flex-wrap gap-4">{[['S','Khoa học'],['T','Công nghệ'],['E','Kỹ thuật'],['M','Toán học'],['OTHER','Khác']].map(([id,label])=><label key={id} className="flex gap-2"><input type="checkbox" checked={form.stemGroups.includes(id)} onChange={()=>setForm({...form,stemGroups:toggle(form.stemGroups,id)})}/>{label}</label>)}</div></fieldset>
 <section className="notice notice-info"><p>Chương trình đào tạo được tự gợi ý khi có tag chung với nghề. Bạn có thể loại trừ gợi ý chưa phù hợp; không cần chọn ngành hoặc chương trình thủ công.</p></section>
 {form.id?<CareerTagLinks key={form.id} careerId={form.id}/>:<p className="text-sm text-muted-foreground">Lưu nghề trước, sau đó gắn tag để xem các chương trình tự khớp.</p>}
 <label className="flex gap-2"><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/>Hiển thị nghề công khai</label>
 {error&&<p className="notice notice-error">{error}</p>}{message&&<p className="notice notice-info">{message}</p>}<div className="flex flex-wrap gap-3"><button type="submit" className="action-primary">{busy?'Đang lưu…':'Lưu thông tin nghề'}</button><button type="button" className="action-secondary" onClick={()=>setForm(null)}>Đóng chỉnh sửa</button></div></fieldset></form>}
 </section>;
}
