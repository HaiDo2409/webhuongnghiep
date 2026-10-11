import { useState } from 'react';
import { SKILL_MAP, OFFICIAL_LINKS, type SkillNode, type OfficialLink } from './data/skills';
import { Badge } from '@/components/ui/badge';
import {
  ExternalLink, ChevronDown, ChevronRight, BookOpen, Map,
  Link2, GraduationCap, Award, Play,
} from 'lucide-react';

// ── Skill Tree node ────────────────────────────────────────────────────────────
function SkillNodeCard({ node, depth = 0 }: { node: SkillNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const hasResources = node.resources && node.resources.length > 0;

  const depthStyles: Record<number, string> = {
    0: 'bg-gradient-to-br from-[#001a3a] to-[#002d6b] border-[#00e5ff]/30 text-[#00e5ff]',
    1: 'bg-white/5 border-white/15 text-white',
    2: 'bg-white/[0.03] border-white/10 text-white/80',
    3: 'bg-transparent border-white/5 text-white/60',
  };

  const platformBadge: Record<string, string> = {
    Coursera: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
    edX: 'bg-red-700/20 text-red-300 border-red-700/30',
    YouTube: 'bg-red-500/20 text-red-300 border-red-500/30',
    Udemy: 'bg-purple-600/20 text-purple-300 border-purple-600/30',
    FreeCodeCamp: 'bg-green-600/20 text-green-300 border-green-600/30',
    Viblo: 'bg-cyan-600/20 text-cyan-300 border-cyan-600/30',
    TopDev: 'bg-orange-600/20 text-orange-300 border-orange-600/30',
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${depthStyles[depth] ?? depthStyles[3]}`}>
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
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
          <span className="text-white/30 text-xs ml-auto hidden md:block truncate max-w-xs">
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
                  className="flex items-center gap-3 p-2.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors group"
                >
                  <Play className="h-3.5 w-3.5 text-white/40 group-hover:text-[#00e5ff] shrink-0" />
                  <span className="text-white/70 group-hover:text-white text-sm flex-1">{res.title}</span>
                  <Badge className={`text-xs border ${platformBadge[res.platform] ?? 'bg-white/10 text-white/50'}`}>
                    {res.platform}
                  </Badge>
                  {res.free && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs border">Free</Badge>
                  )}
                  <ExternalLink className="h-3 w-3 text-white/20 group-hover:text-white/60" />
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

// ── Link Card ──────────────────────────────────────────────────────────────────
function LinkCard({ link }: { link: OfficialLink }) {
  const categoryIcon: Record<string, React.ReactNode> = {
    'tuyen-sinh': <GraduationCap className="h-5 w-5 text-[#00e5ff]" />,
    'truong-dai-hoc': <BookOpen className="h-5 w-5 text-purple-400" />,
    'hoc-bong': <Award className="h-5 w-5 text-yellow-400" />,
    'khoa-hoc-truc-tuyen': <Play className="h-5 w-5 text-green-400" />,
  };

  const categoryLabel: Record<string, string> = {
    'tuyen-sinh': 'Tuyển sinh',
    'truong-dai-hoc': 'Trường ĐH',
    'hoc-bong': 'Học bổng',
    'khoa-hoc-truc-tuyen': 'Học trực tuyến',
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00e5ff]/30 rounded-xl p-4 transition-all duration-300"
    >
      <div className="shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
        {categoryIcon[link.category]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-white font-semibold text-sm group-hover:text-[#00e5ff] transition-colors">
            {link.name}
          </h4>
        </div>
        <p className="text-white/50 text-xs leading-relaxed">{link.description}</p>
        <span className="inline-block mt-2 text-xs text-white/30">{categoryLabel[link.category]}</span>
      </div>
      <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-[#00e5ff] shrink-0 mt-0.5 transition-colors" />
    </a>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export function KyNangPage() {
  const [activeTab, setActiveTab] = useState<'skillmap' | 'links'>('skillmap');

  const linkCategories = [
    { id: 'tuyen-sinh', label: '🎓 Tuyển sinh' },
    { id: 'truong-dai-hoc', label: '🏛️ Trường Đại học' },
    { id: 'hoc-bong', label: '🏆 Học bổng' },
    { id: 'khoa-hoc-truc-tuyen', label: '💻 Học trực tuyến' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001a3a] via-[#002d6b] to-[#001a3a]">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#00e5ff]/15 border border-[#00e5ff]/30 rounded-full px-5 py-2 text-[#00e5ff] text-sm">
            <Map className="h-4 w-4" /> Bản đồ Kỹ năng
          </div>
          <h1 className="text-4xl font-bold text-white">Lộ trình phát triển STEM</h1>
          <p className="text-white/60">
            Kỹ năng cần học theo từng ngành + liên kết cổng thông tin chính thức
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 justify-center">
          {[
            { id: 'skillmap', icon: <Map className="h-4 w-4" />, label: 'Bản đồ Kỹ năng' },
            { id: 'links', icon: <Link2 className="h-4 w-4" />, label: 'Cổng Thông tin' },
          ].map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium border transition-all ${
                activeTab === id
                  ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff]'
                  : 'bg-white/5 border-white/15 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Skill Map */}
        {activeTab === 'skillmap' && (
          <div className="space-y-4">
            <p className="text-white/40 text-sm text-center">
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
                  <h3 className="text-white font-semibold text-lg mb-3">{label}</h3>
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
