import type { Career } from './data/careers';
import type { HollandType } from './data/questions';
import { HOLLAND_LABELS } from './data/questions';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Wrench } from 'lucide-react';

interface Props {
  careers: Career[];
  topCodes: HollandType[];
}

export function CareerResults({ careers, topCodes }: Props) {
  const categoryColors: Record<string, string> = {
    STEM: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Arts: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    Business: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    Social: 'bg-green-500/20 text-green-300 border-green-500/30',
    Health: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white">
          Nghề nghiệp tương thích với mã{' '}
          <span className="text-[#00e5ff]">{topCodes.join('')}</span>
        </h3>
        <p className="text-white/50 mt-1">
          Dựa trên cơ sở dữ liệu O*NET và xu hướng thị trường Việt Nam
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {careers.map((career, idx) => (
          <div
            key={career.id}
            className="group bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/25 rounded-2xl p-5 transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {idx < 3 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#00e5ff] to-[#7c3aed] text-white">
                      #{idx + 1}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[career.category]}`}>
                    {career.category}
                  </span>
                </div>
                <h4 className="text-white font-semibold text-base group-hover:text-[#00e5ff] transition-colors">
                  {career.nameVi}
                </h4>
                <p className="text-white/40 text-xs">{career.nameEn}</p>
              </div>

              {/* Holland codes match */}
              <div className="flex gap-1 flex-wrap justify-end">
                {career.codes.map((code) => {
                  const isTop = topCodes.includes(code);
                  const info = HOLLAND_LABELS[code];
                  return (
                    <span
                      key={code}
                      className="text-xs px-1.5 py-0.5 rounded-md font-bold border"
                      style={{
                        backgroundColor: isTop ? info.color + '30' : 'rgba(255,255,255,0.05)',
                        color: isTop ? info.color : 'rgba(255,255,255,0.3)',
                        borderColor: isTop ? info.color + '50' : 'transparent',
                      }}
                    >
                      {code}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <p className="text-white/60 text-sm leading-relaxed mb-4">{career.description}</p>

            {/* Skills */}
            <div className="mb-3">
              <div className="flex items-center gap-1.5 text-white/40 text-xs mb-2">
                <Wrench className="h-3 w-3" /> Kỹ năng chính
              </div>
              <div className="flex flex-wrap gap-1.5">
                {career.skills.map((skill) => (
                  <Badge
                    key={skill}
                    className="bg-white/10 text-white/70 border-white/10 hover:bg-white/20 text-xs"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Outlook + Salary */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
              <div>
                <div className="flex items-center gap-1 text-white/40 text-xs mb-1">
                  <TrendingUp className="h-3 w-3" /> Triển vọng
                </div>
                <p className="text-white/70 text-xs">{career.outlook}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-white/40 text-xs mb-1">
                  <DollarSign className="h-3 w-3" /> Mức lương
                </div>
                <p className="text-[#00e5ff] text-xs font-semibold">{career.salaryRange}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
