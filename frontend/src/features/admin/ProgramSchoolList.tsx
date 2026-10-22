import { useState } from 'react';
import type { Program } from '@/services/guidance';
import type { ManagedSchool } from './SchoolManager';
export function ProgramSchoolList({programs,schools,selectedId,onSelect,onNew}:{programs:Program[];schools:ManagedSchool[];selectedId:string;onSelect:(p:Program)=>void;onNew:()=>void}){
 const [school,setSchool]=useState(''),[q,setQ]=useState(''),[showHidden,setShowHidden]=useState(false);
 const grouped=new Map<string,{name:string;programs:Program[]}>();
 for(const s of schools)if(showHidden||s.active)grouped.set(s.code,{name:s.name+(s.active?'':' (đang ẩn)'),programs:[]});
 for(const p of programs){const s=schools.find(s=>s.id===p.schoolId);if(!showHidden&&(!p.published||s?.active===false))continue;const code=s?.code??p.admissionDetails?.schoolCode??p.shortName;const g=grouped.get(code)??{name:p.school,programs:[]};g.programs.push(p);grouped.set(code,g);}
 const active=grouped.get(school);const match=(s:string)=>s.toLocaleLowerCase('vi').includes(q.toLocaleLowerCase('vi').trim());
 return <section className="space-y-3"><button className="action-secondary" onClick={onNew}>Thêm chương trình</button><label className="form-field">{school?'Tìm ngành của trường':'Tìm trường'}<input value={q} onChange={e=>setQ(e.target.value)}/></label><label className="flex gap-2 text-sm"><input type="checkbox" checked={showHidden} onChange={e=>setShowHidden(e.target.checked)}/>Hiện cả chương trình đang ẩn</label>{school&&<button className="action-secondary" onClick={()=>{setSchool('');setQ('');}}>← Danh sách trường</button>}
 <div className="admin-program-list" tabIndex={0} role="region" aria-label="Danh sách trường và chương trình">{!school?<><p>{grouped.size} trường/cơ sở</p>{[...grouped].filter(([code,g])=>match(`${code} ${g.name}`)).sort(([a],[b])=>a.localeCompare(b)).map(([code,g])=><button className="admin-school-card" key={code} onClick={()=>{setSchool(code);setQ('');}}><strong>{code}</strong><span>{g.name}</span><small>{g.programs.length} chương trình · Xem ngành →</small></button>)}</>:<><h2 className="font-semibold">{active?.name??school}</h2><p>{active?.programs.length??0} chương trình</p>{active?.programs.filter(p=>match(`${p.major} ${p.admissionYear}`)).map(p=><button className={`admin-school-card ${p.id===selectedId?'is-selected':''}`} key={p.id} onClick={()=>onSelect(p)}><strong>{p.major}</strong><span>{p.admissionYear} · {p.published?'Công khai':'Đang ẩn'}</span>{p.admissionDetails?.workbook&&<small>File: dòng {p.admissionDetails.workbook.sourceRow}</small>}</button>)}</>}
 </div></section>;
}
