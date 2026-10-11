import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { HOLLAND_LABELS, type HollandType } from './data/questions';

interface Props {
  scores: Record<HollandType, number>;
}

export function HollandRadarChart({ scores }: Props) {
  const maxScore = 40; // 8 câu × 5 điểm

  const data = (Object.keys(HOLLAND_LABELS) as HollandType[]).map((code) => ({
    subject: `${HOLLAND_LABELS[code].emoji} ${HOLLAND_LABELS[code].name}`,
    score: scores[code],
    fullMark: maxScore,
    percentage: Math.round((scores[code] / maxScore) * 100),
  }));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white">Biểu đồ 6 nhóm tính cách</h3>
        <p className="text-white/50 mt-1">Tỷ trọng điểm trên thang 40 điểm mỗi nhóm</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Radar Chart */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#001a3a',
                  border: '1px solid rgba(0,229,255,0.3)',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                formatter={(value: number) => [`${value} điểm (${Math.round((value / maxScore) * 100)}%)`, 'Điểm']}
              />
              <Radar
                name="Điểm"
                dataKey="score"
                stroke="#00e5ff"
                fill="#00e5ff"
                fillOpacity={0.2}
                strokeWidth={2}
                dot={{ fill: '#00e5ff', r: 4 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score breakdown */}
        <div className="space-y-3">
          {(Object.entries(HOLLAND_LABELS) as [HollandType, typeof HOLLAND_LABELS.R][])
            .sort((a, b) => scores[b[0]] - scores[a[0]])
            .map(([code, info]) => {
              const pct = Math.round((scores[code] / maxScore) * 100);
              return (
                <div key={code} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white font-medium">
                      {info.emoji} {code} – {info.name}
                    </span>
                    <span className="text-white/60">
                      {scores[code]}/{maxScore} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: info.color }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
