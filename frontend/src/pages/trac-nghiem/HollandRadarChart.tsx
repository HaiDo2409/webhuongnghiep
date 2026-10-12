import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { HOLLAND_LABELS, MAX_SCORE_PER_GROUP, type HollandType } from './data/questions';

interface Props {
  scores: Record<HollandType, number>;
}

export function HollandRadarChart({ scores }: Props) {
  const maxScore = MAX_SCORE_PER_GROUP;

  const data = (Object.keys(HOLLAND_LABELS) as HollandType[]).map((code) => ({
    subject: `${HOLLAND_LABELS[code].emoji} ${HOLLAND_LABELS[code].name}`,
    score: scores[code],
    fullMark: maxScore,
    percentage: Math.round((scores[code] / maxScore) * 100),
  }));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900">Biểu đồ 6 nhóm tính cách</h3>
        <p className="text-gray-500 mt-1">Tỷ trọng điểm trên thang {maxScore} điểm mỗi nhóm</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Radar Chart */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="rgba(0,0,0,0.08)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#374151', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  color: '#111827',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number) => [`${value} điểm (${Math.round((value / maxScore) * 100)}%)`, 'Điểm']}
              />
              <Radar
                name="Điểm"
                dataKey="score"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.2}
                strokeWidth={2}
                dot={{ fill: '#2563eb', r: 4 }}
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
                    <span className="text-gray-900 font-medium">
                      {info.emoji} {code} – {info.name}
                    </span>
                    <span className="text-gray-500">
                      {scores[code]}/{maxScore} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
