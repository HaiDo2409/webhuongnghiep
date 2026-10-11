import { useState, useMemo } from 'react';
import { calculateAdmission, type StudentScores, type AdmissionResult } from './data/scoring';
import { SCHOOLS, PRIORITY_ZONES } from './data/schools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, TrendingDown, Minus, Info, ChevronDown, ChevronUp } from 'lucide-react';

const DEFAULT_SCORES: StudentScores = {
  toan: 0, ly: 0, hoa: 0, sinh: 0, tin: 0, van: 0, anh: 0, su: 0, dia: 0,
  zone: 'KV3',
};

const SCHOOL_FILTER_OPTIONS = ['Tất cả', ...Array.from(new Set(SCHOOLS.map((s) => s.shortName)))];

function ScoreField({
  label, name, value, onChange,
}: {
  label: string; name: keyof StudentScores; value: number; onChange: (k: keyof StudentScores, v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/70 text-sm">{label}</Label>
      <Input
        type="number"
        min={0}
        max={10}
        step={0.1}
        value={value || ''}
        placeholder="0.0"
        onChange={(e) => onChange(name, parseFloat(e.target.value) || 0)}
        className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-[#00e5ff] focus:ring-[#00e5ff]/20"
      />
    </div>
  );
}

function ResultCard({ result }: { result: AdmissionResult }) {
  const [open, setOpen] = useState(false);

  const chanceConfig = {
    high: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      badge: 'bg-green-500/20 text-green-300 border-green-500/30',
      icon: <TrendingUp className="h-4 w-4 text-green-400" />,
      label: '🟢 Tỷ lệ đỗ cao',
      barColor: '#22c55e',
    },
    medium: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      icon: <Minus className="h-4 w-4 text-yellow-400" />,
      label: '🟡 Cơ hội tốt',
      barColor: '#f59e0b',
    },
    low: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      badge: 'bg-red-500/20 text-red-300 border-red-500/30',
      icon: <TrendingDown className="h-4 w-4 text-red-400" />,
      label: '🔴 An toàn thấp',
      barColor: '#ef4444',
    },
  };

  const cfg = chanceConfig[result.chance];

  return (
    <div className={`${cfg.bg} border ${cfg.border} rounded-2xl overflow-hidden transition-all duration-300`}>
      {/* Header */}
      <button
        className="w-full p-4 flex items-start gap-4 text-left hover:bg-white/5 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge className={`${cfg.badge} border text-xs`}>{cfg.label}</Badge>
            <Badge className="bg-white/10 text-white/60 border-white/10 text-xs">
              {result.program.shortName}
            </Badge>
            <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/20 text-xs">
              {result.methodLabel}
            </Badge>
          </div>
          <h4 className="text-white font-semibold">{result.program.major}</h4>
          <p className="text-white/50 text-sm">{result.program.school}</p>
        </div>

        {/* Score comparison */}
        <div className="text-right shrink-0">
          <p className="text-white text-lg font-bold">{result.studentScore.toFixed(2)}</p>
          <p className="text-white/40 text-xs">/ Chuẩn: {result.predictedBenchmark}</p>
          <p className={`text-xs font-semibold ${result.diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {result.diff >= 0 ? '+' : ''}{result.diff.toFixed(2)}
          </p>
        </div>

        {open ? <ChevronUp className="h-4 w-4 text-white/40 mt-1 shrink-0" /> : <ChevronDown className="h-4 w-4 text-white/40 mt-1 shrink-0" />}
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-1">
        <div className="flex items-center justify-between text-xs text-white/40 mb-1">
          <span>Tỷ lệ đỗ ước tính</span>
          <span className="font-semibold text-white">{result.chancePercent}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${result.chancePercent}%`, backgroundColor: cfg.barColor }}
          />
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-white/10 space-y-3 mt-1">
          {/* Tổ hợp + điểm chuẩn 3 năm */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/40 text-xs mb-1">Tổ hợp tốt nhất</p>
              <Badge className="bg-white/10 text-white border-white/10">{result.bestGroup}</Badge>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-2">Điểm chuẩn 3 năm</p>
              <div className="space-y-1">
                {result.program.benchmarks.map((b) => (
                  <div key={b.year} className="flex justify-between text-xs">
                    <span className="text-white/50">Năm {b.year}</span>
                    <span className="text-white font-medium">{b.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action tip */}
          <div className="bg-white/5 rounded-xl p-3 flex gap-2">
            <Info className="h-4 w-4 text-[#00e5ff] mt-0.5 shrink-0" />
            <p className="text-white/70 text-sm leading-relaxed">{result.actionTip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function XetTuyenPage() {
  const [scores, setScores] = useState<StudentScores>(DEFAULT_SCORES);
  const [results, setResults] = useState<AdmissionResult[] | null>(null);
  const [filterSchool, setFilterSchool] = useState('Tất cả');
  const [filterChance, setFilterChance] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);

  function setField<K extends keyof StudentScores>(key: K, value: StudentScores[K]) {
    setScores((p) => ({ ...p, [key]: value }));
  }

  function handleCalculate() {
    const r = calculateAdmission(scores);
    setResults(r);
    setTimeout(() => {
      document.getElementById('xet-tuyen-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  const filteredResults = useMemo(() => {
    if (!results) return null;
    return results.filter((r) => {
      if (filterSchool !== 'Tất cả' && r.program.shortName !== filterSchool) return false;
      if (filterChance !== 'all' && r.chance !== filterChance) return false;
      return true;
    });
  }, [results, filterSchool, filterChance]);

  const highCount = results?.filter((r) => r.chance === 'high').length ?? 0;
  const mediumCount = results?.filter((r) => r.chance === 'medium').length ?? 0;
  const lowCount = results?.filter((r) => r.chance === 'low').length ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001a3a] via-[#002d6b] to-[#001a3a]">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#00e5ff]/15 border border-[#00e5ff]/30 rounded-full px-5 py-2 text-[#00e5ff] text-sm">
            <Search className="h-4 w-4" /> Tra cứu Xét tuyển
          </div>
          <h1 className="text-4xl font-bold text-white">Nhập điểm & Phân loại cơ hội</h1>
          <p className="text-white/60">
            Thuật toán dự báo điểm chuẩn bình quân gia quyền 3 năm + 4 phương thức xét tuyển
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-6">
          {/* Điểm TN THPT */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              📝 Điểm học tập / Thi TN THPT
              <span className="text-white/40 text-sm font-normal">(thang điểm 10)</span>
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {([
                ['Toán', 'toan'], ['Lý', 'ly'], ['Hóa', 'hoa'], ['Sinh', 'sinh'],
                ['Tin học', 'tin'], ['Văn', 'van'], ['Anh', 'anh'], ['Sử', 'su'], ['Địa', 'dia'],
              ] as [string, keyof StudentScores][]).map(([label, key]) => (
                <ScoreField
                  key={key}
                  label={label}
                  name={key}
                  value={scores[key] as number}
                  onChange={setField}
                />
              ))}
            </div>
          </div>

          {/* Khu vực ưu tiên */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-3">🗺️ Khu vực ưu tiên</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.entries(PRIORITY_ZONES) as [string, number][]).map(([zone, bonus]) => (
                <button
                  key={zone}
                  onClick={() => setField('zone', zone as StudentScores['zone'])}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    scores.zone === zone
                      ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff]'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <p className="font-bold text-base">{zone}</p>
                  <p className="text-xs mt-0.5">
                    {bonus > 0 ? `+${bonus} điểm` : 'Không ưu tiên'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Điểm thi độc lập (Advanced) */}
          <div>
            <button
              className="flex items-center gap-2 text-[#00e5ff] text-sm hover:underline"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showAdvanced ? 'Ẩn' : 'Thêm'} điểm bài thi độc lập & chứng chỉ (tùy chọn)
            </button>

            {showAdvanced && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* HSA */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">HSA – ĐHQGHN (max 150)</Label>
                  <Input
                    type="number" min={0} max={150}
                    value={scores.hsa || ''}
                    placeholder="0"
                    onChange={(e) => setField('hsa', parseFloat(e.target.value) || undefined)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-[#00e5ff]"
                  />
                </div>
                {/* TSA */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">TSA – HUST (max 100)</Label>
                  <Input
                    type="number" min={0} max={100}
                    value={scores.tsa || ''}
                    placeholder="0"
                    onChange={(e) => setField('tsa', parseFloat(e.target.value) || undefined)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-[#00e5ff]"
                  />
                </div>
                {/* BCA */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">BCA – Bách Khoa HCM (max 100)</Label>
                  <Input
                    type="number" min={0} max={100}
                    value={scores.bca || ''}
                    placeholder="0"
                    onChange={(e) => setField('bca', parseFloat(e.target.value) || undefined)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-[#00e5ff]"
                  />
                </div>
                {/* IELTS */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">IELTS (0 – 9.0)</Label>
                  <Input
                    type="number" min={0} max={9} step={0.5}
                    value={scores.ielts || ''}
                    placeholder="0.0"
                    onChange={(e) => setField('ielts', parseFloat(e.target.value) || undefined)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-[#00e5ff]"
                  />
                </div>
                {/* HSG */}
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Giải HSG</Label>
                  <Select
                    value={scores.hsg ?? 'none'}
                    onValueChange={(v) => setField('hsg', v as StudentScores['hsg'])}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không có</SelectItem>
                      <SelectItem value="tinh">Giải HSG Tỉnh</SelectItem>
                      <SelectItem value="quocgia">Giải HSG Quốc gia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <Button
            size="lg"
            onClick={handleCalculate}
            className="w-full rounded-full h-14 text-base font-semibold bg-gradient-to-r from-[#00e5ff] to-[#7c3aed] text-white border-0 hover:opacity-90 shadow-lg"
          >
            Phân tích cơ hội trúng tuyển
          </Button>
        </div>

        {/* Results */}
        {filteredResults && (
          <div id="xet-tuyen-results" className="space-y-6 scroll-mt-8">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: '🟢 Tỷ lệ đỗ cao', count: highCount, color: 'border-green-500/30 bg-green-500/10' },
                { label: '🟡 Cơ hội tốt', count: mediumCount, color: 'border-yellow-500/30 bg-yellow-500/10' },
                { label: '🔴 An toàn thấp', count: lowCount, color: 'border-red-500/30 bg-red-500/10' },
              ].map(({ label, count, color }) => (
                <div key={label} className={`border ${color} rounded-xl p-4 text-center`}>
                  <p className="text-3xl font-bold text-white">{count}</p>
                  <p className="text-white/60 text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={filterSchool} onValueChange={setFilterSchool}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Lọc theo trường" />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOL_FILTER_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                {(['all', 'high', 'medium', 'low'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilterChance(c)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      filterChance === c
                        ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff]'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    {c === 'all' ? 'Tất cả' : c === 'high' ? '🟢 Cao' : c === 'medium' ? '🟡 Trung' : '🔴 Thấp'}
                  </button>
                ))}
              </div>
            </div>

            {/* Result cards */}
            <div className="space-y-3">
              {filteredResults.length === 0 ? (
                <div className="text-center py-12 text-white/40">Không có kết quả phù hợp với bộ lọc</div>
              ) : (
                filteredResults.map((r, i) => <ResultCard key={i} result={r} />)
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
