import { useState } from 'react';
import { SKILL_MAP, OFFICIAL_LINKS, type SkillNode, type OfficialLink } from './data/skills';
import { Badge } from '@/components/ui/badge';
import {
  ExternalLink, ChevronDown, ChevronRight, BookOpen, Map,
  Link2, GraduationCap, Award, Play,
} from 'lucide-react';

// ── Skill Tree node ─────────────────────────────────────────────────────────────
function SkillNodeCard({ node, depth = 0 }: { node: SkillNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const hasResources = node.resources && node.resources.length > 0;

  const depthStyles: Record<number, string> = {
    0: 'bg-blue-50 border-blue-200 text-blue-800',
    1: 'bg-white border-gray-200 text-gray-900',
    2: 'bg-gray-50 border-gray-100 text-gray-800',
    3: 'bg-transparent border-gray-100 text-gray-700',
  };

  const platformBadge: Record<string, string> = {
    Coursera:     'bg-blue-100 text-blue-700 border-blue-200',
    edX:          'bg-red-100 text-red-700 border-red-200',
    YouTube:      'bg-red-100 text-red-600 border-red-200',
    Udemy:        'bg-purple-100 text-purple-700 border-purple-200',
    FreeCodeCamp: 'bg-green-100 text-green-700 border-green-200',
    Viblo:        'bg-cyan-100 text-cyan-700 border-cyan-200',
    TopDev:       'bg-orange-100 text-orange-700 border-orange-200',
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${depthStyles[depth] ?? depthStyles[3]}`}>
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/5 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        {hasChildren ? (
          open
            ? <ChevronDown className="h-4 w-4 opacity-60 shrink-0" />
            : <ChevronRight className="h-4 w-4 opacity-60 shrink-0" />
        ) : (
          <div className="w-4 h-4 shrink-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
          </div>
        )}

        <span className={`font-${depth === 0 ? 'bold text-base' : depth === 1 ? 'semibold' : 'medium text-sm'}`}>
          {node.name}
        </span>

        {node.description && depth <= 1 && (
          <span className="text-gray-400 text-xs ml-auto hidden md:block truncate max-w-xs">
            {node.description}
          </span>
        )}
      </button>

      {open && (
        <div className="px-4 pb-3 space-y-2">
          {/* Resources */}
          {hasResources && (
            <div className="mb-3 space-y-2">
              {node.resources!.map((res, i) => (
                <a
                  key={i}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors group"
                >
                  <Play className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-600 shrink-0" />
                  <span className="text-gray-700 group-hover:text-blue-700 text-sm flex-1">{res.title}</span>
                  <Badge className={`text-xs border ${platformBadge[res.platform] ?? 'bg-gray-100 text-gray-600'}`}>
                    {res.platform}
                  </Badge>
                  {res.free && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs border">Free</Badge>
                  )}
                  <ExternalLink className="h-3 w-3 text-gray-300 group-hover:text-blue-500" />
                </a>
              ))}
            </div>
          )}

          {/* Children */}
          {hasChildren && (
            <div className="space-y-2 pl-2">
              {node.children!.map((child) => (
                <SkillNodeCard key={child.id} node={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Link Card ───────────────────────────────────────────────────────────────────
function LinkCard({ link }: { link: OfficialLink }) {
  const categoryIcon: Record<string, React.ReactNode> = {
    'tuyen-sinh':         <GraduationCap className="h-5 w-5 text-blue-600" />,
    'truong-dai-hoc':     <BookOpen className="h-5 w-5 text-purple-600" />,
    'hoc-bong':           <Award className="h-5 w-5 text-yellow-500" />,
    'khoa-hoc-truc-tuyen':<Play className="h-5 w-5 text-green-600" />,
  };

  const categoryLabel: Record<string, string> = {
    'tuyen-sinh':          'Tuyển sinh',
    'truong-dai-hoc':      'Trường ĐH',
    'hoc-bong':            'Học bổng',
    'khoa-hoc-truc-tuyen': 'Học trực tuyến',
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 bg-white hover:shadow-md border border-gray-200 hover:border-blue-300 rounded-xl p-4 transition-all duration-200"
    >
      <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
        {categoryIcon[link.category]}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-gray-900 font-semibold text-sm group-hover:text-blue-600 transition-colors">
          {link.name}
        </h4>
        <p className="text-gray-500 text-xs leading-relaxed mt-1">{link.description}</p>
        <span className="inline-block mt-2 text-xs text-gray-400">{categoryLabel[link.category]}</span>
      </div>
      <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-blue-500 shrink-0 mt-0.5 transition-colors" />
    </a>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────────
export function KyNangPage() {
  const [activeTab, setActiveTab] = useState<'skillmap' | 'links'>('skillmap');

  const linkCategories = [
    { id: 'tuyen-sinh',          label: '🎓 Tuyển sinh' },
    { id: 'truong-dai-hoc',      label: '🏛️ Trường Đại học' },
    { id: 'hoc-bong',            label: '🏆 Học bổng' },
    { id: 'khoa-hoc-truc-tuyen', label: '💻 Học trực tuyến' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-blue-700 py-10 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-2 text-white text-sm">
            <Map className="h-4 w-4" /> Bản đồ Kỹ năng
          </div>
          <h1 className="text-3xl font-bold text-white">Lộ trình phát triển STEM</h1>
          <p className="text-white/70 text-sm">
            Kỹ năng cần học theo từng ngành + liên kết cổng thông tin chính thức
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Tab switcher */}
        <div className="flex gap-2 justify-center">
          {[
            { id: 'skillmap', icon: <Map className="h-4 w-4" />,   label: 'Bản đồ Kỹ năng' },
            { id: 'links',    icon: <Link2 className="h-4 w-4" />, label: 'Cổng Thông tin' },
          ].map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium border transition-all ${
                activeTab === id
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-600 hover:text-blue-600 hover:border-blue-400'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Skill Map */}
        {activeTab === 'skillmap' && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm text-center">
              Click vào từng mục để mở rộng. 📚 = tài nguyên học tập kèm theo.
            </p>
            {SKILL_MAP.map((field) => (
              <SkillNodeCard key={field.id} node={field} depth={0} />
            ))}
          </div>
        )}

        {/* Links */}
        {activeTab === 'links' && (
          <div className="space-y-8">
            {linkCategories.map(({ id, label }) => {
              const items = OFFICIAL_LINKS.filter((l) => l.category === id);
              return (
                <div key={id}>
                  <h3 className="text-gray-900 font-bold text-lg mb-3">{label}</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {items.map((link) => (
                      <LinkCard key={link.id} link={link} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
