import type { Career } from './data/careers';
import type { HollandType } from './data/questions';
import { HOLLAND_LABELS } from './data/questions';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TrendingUp, DollarSign, Wrench } from 'lucide-react';

interface Props {
  careers: Career[];
  topCodes: HollandType[];
}

export function CareerResults({ careers, topCodes }: Props) {
  const categoryColors: Record<string, string> = {
    STEM:     'bg-blue-100 text-blue-700 border-blue-200',
    Arts:     'bg-purple-100 text-purple-700 border-purple-200',
    Business: 'bg-orange-100 text-orange-700 border-orange-200',
    Social:   'bg-green-100 text-green-700 border-green-200',
    Health:   'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900">
          Nghề nghiệp tương thích với mã{' '}
          <span className="text-blue-600">{topCodes.join('')}</span>
        </h3>
        <p className="text-gray-500 mt-1">
          Dựa trên cơ sở dữ liệu O*NET và xu hướng thị trường Việt Nam
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {careers.map((career, idx) => (
          <div
            key={career.id}
            className="group bg-white hover:shadow-md border border-gray-200 hover:border-blue-300 rounded-2xl p-5 transition-all duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {idx < 3 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      #{idx + 1}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[career.category] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {career.category}
                  </span>
                </div>
                <h4 className="text-gray-900 font-semibold text-base group-hover:text-blue-600 transition-colors">
                  {career.nameVi}
                </h4>
                <p className="text-gray-400 text-xs">{career.nameEn}</p>
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
                        backgroundColor: isTop ? info.color + '20' : '#f3f4f6',
                        color: isTop ? info.color : '#9ca3af',
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
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{career.description}</p>

            {/* Skills */}
            <div className="mb-3">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
                <Wrench className="h-3 w-3" /> Kỹ năng chính
              </div>
              <div className="flex flex-wrap gap-1.5">
                {career.skills.map((skill) => (
                  <Badge
                    key={skill}
                    className="bg-gray-100 text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-700 text-xs"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Outlook + Salary */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
              <div>
                <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                  <TrendingUp className="h-3 w-3" /> Triển vọng
                </div>
                <p className="text-gray-700 text-xs">{career.outlook}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                  <DollarSign className="h-3 w-3" /> Mức lương
                </div>
                <p className="text-blue-600 text-xs font-semibold">{career.salaryRange}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
