import type { HollandType } from './questions';

export interface Career {
  id: string;
  nameVi: string;
  nameEn: string;
  codes: HollandType[];          // top 3 Holland codes
  description: string;
  skills: string[];
  outlook: string;               // triển vọng tương lai
  salaryRange: string;           // mức lương tham khảo VN (triệu/tháng)
  category: 'STEM' | 'Arts' | 'Business' | 'Social' | 'Health';
}

export const CAREERS: Career[] = [
  // ── R – Kỹ thuật ────────────────────────────────────────────────────────────
  {
    id: 'mechanical-engineer',
    nameVi: 'Kỹ sư Cơ khí',
    nameEn: 'Mechanical Engineer',
    codes: ['R', 'I', 'C'],
    description: 'Thiết kế, phát triển và kiểm tra thiết bị cơ học, động cơ và máy móc công nghiệp.',
    skills: ['Vẽ CAD/CAM', 'Cơ học vật liệu', 'Nhiệt động lực học', 'Lập trình CNC'],
    outlook: '⭐⭐⭐⭐ Rất cao — tự động hóa công nghiệp bùng nổ tại Việt Nam',
    salaryRange: '15 – 40 triệu',
    category: 'STEM',
  },
  {
    id: 'civil-engineer',
    nameVi: 'Kỹ sư Xây dựng',
    nameEn: 'Civil Engineer',
    codes: ['R', 'I', 'E'],
    description: 'Thiết kế và giám sát xây dựng công trình hạ tầng: cầu, đường, tòa nhà, hệ thống cấp thoát nước.',
    skills: ['AutoCAD', 'Revit', 'Kết cấu công trình', 'Quản lý dự án'],
    outlook: '⭐⭐⭐⭐ Cao — hạ tầng Việt Nam đang phát triển mạnh',
    salaryRange: '12 – 35 triệu',
    category: 'STEM',
  },
  {
    id: 'electrician-engineer',
    nameVi: 'Kỹ sư Điện – Điện tử',
    nameEn: 'Electrical Engineer',
    codes: ['R', 'I', 'C'],
    description: 'Thiết kế hệ thống điện, mạch điện tử, năng lượng tái tạo và tự động hóa.',
    skills: ['Mạch điện tử', 'PLC', 'MATLAB', 'Năng lượng mặt trời'],
    outlook: '⭐⭐⭐⭐⭐ Rất cao — chuyển đổi xanh & IoT',
    salaryRange: '15 – 45 triệu',
    category: 'STEM',
  },
  {
    id: 'mechatronics',
    nameVi: 'Kỹ sư Cơ điện tử',
    nameEn: 'Mechatronics Engineer',
    codes: ['R', 'I', 'C'],
    description: 'Tích hợp cơ khí, điện tử và lập trình để tạo robot, dây chuyền tự động.',
    skills: ['Arduino/Raspberry Pi', 'Lập trình nhúng', 'Robotics', 'PLC Siemens'],
    outlook: '⭐⭐⭐⭐⭐ Tương lai tự động hóa — nhu cầu rất lớn',
    salaryRange: '18 – 50 triệu',
    category: 'STEM',
  },

  // ── I – Nghiên cứu ────────────────────────────────────────────────────────
  {
    id: 'software-engineer',
    nameVi: 'Kỹ sư Phần mềm',
    nameEn: 'Software Engineer',
    codes: ['I', 'R', 'C'],
    description: 'Thiết kế, xây dựng và bảo trì phần mềm ứng dụng, hệ thống và dịch vụ web.',
    skills: ['Python / Java / JavaScript', 'Git', 'Cloud (AWS/GCP)', 'Agile'],
    outlook: '⭐⭐⭐⭐⭐ Nhu cầu cao nhất hiện tại — IT bùng nổ toàn cầu',
    salaryRange: '20 – 80 triệu',
    category: 'STEM',
  },
  {
    id: 'data-scientist',
    nameVi: 'Nhà khoa học Dữ liệu',
    nameEn: 'Data Scientist',
    codes: ['I', 'R', 'C'],
    description: 'Khai thác, phân tích dữ liệu lớn để ra quyết định kinh doanh và xây dựng mô hình AI.',
    skills: ['Python', 'Machine Learning', 'SQL', 'Power BI / Tableau'],
    outlook: '⭐⭐⭐⭐⭐ Xu hướng AI — lương top đầu thị trường',
    salaryRange: '25 – 100 triệu',
    category: 'STEM',
  },
  {
    id: 'ai-engineer',
    nameVi: 'Kỹ sư AI / Machine Learning',
    nameEn: 'AI / ML Engineer',
    codes: ['I', 'R', 'C'],
    description: 'Nghiên cứu và triển khai các mô hình học máy, học sâu vào sản phẩm thực tế.',
    skills: ['TensorFlow / PyTorch', 'Deep Learning', 'LLM Fine-tuning', 'MLOps'],
    outlook: '⭐⭐⭐⭐⭐ Ngành hot nhất 2024–2030',
    salaryRange: '30 – 120 triệu',
    category: 'STEM',
  },
  {
    id: 'biomedical-researcher',
    nameVi: 'Nghiên cứu viên Y sinh',
    nameEn: 'Biomedical Researcher',
    codes: ['I', 'S', 'R'],
    description: 'Nghiên cứu bệnh tật, phát triển thuốc và thiết bị y tế bằng phương pháp khoa học.',
    skills: ['Sinh học phân tử', 'Thống kê y học', 'SPSS', 'Nghiên cứu lâm sàng'],
    outlook: '⭐⭐⭐⭐ Cao — đặc biệt sau đại dịch COVID-19',
    salaryRange: '12 – 30 triệu',
    category: 'Health',
  },
  {
    id: 'environmental-scientist',
    nameVi: 'Nhà khoa học Môi trường',
    nameEn: 'Environmental Scientist',
    codes: ['I', 'R', 'S'],
    description: 'Nghiên cứu tác động môi trường, biến đổi khí hậu và đề xuất giải pháp bền vững.',
    skills: ['GIS / Remote Sensing', 'Đánh giá tác động môi trường (EIA)', 'Hóa phân tích', 'R / Python'],
    outlook: '⭐⭐⭐⭐ Tăng trưởng — kinh tế xanh và ESG',
    salaryRange: '10 – 25 triệu',
    category: 'STEM',
  },
  {
    id: 'cybersecurity',
    nameVi: 'Chuyên gia An ninh mạng',
    nameEn: 'Cybersecurity Specialist',
    codes: ['I', 'R', 'C'],
    description: 'Bảo vệ hệ thống mạng, dữ liệu và ứng dụng khỏi các cuộc tấn công mạng.',
    skills: ['Penetration Testing', 'Network Security', 'SIEM', 'CEH / CISSP'],
    outlook: '⭐⭐⭐⭐⭐ Cực kỳ cấp bách — tội phạm mạng gia tăng',
    salaryRange: '20 – 70 triệu',
    category: 'STEM',
  },

  // ── A – Nghệ thuật ────────────────────────────────────────────────────────
  {
    id: 'ux-designer',
    nameVi: 'Nhà thiết kế UX/UI',
    nameEn: 'UX/UI Designer',
    codes: ['A', 'I', 'C'],
    description: 'Thiết kế trải nghiệm người dùng và giao diện thị giác cho ứng dụng và website.',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design System'],
    outlook: '⭐⭐⭐⭐⭐ Digital economy — mọi sản phẩm cần UX',
    salaryRange: '15 – 50 triệu',
    category: 'Arts',
  },
  {
    id: 'game-designer',
    nameVi: 'Nhà thiết kế Game',
    nameEn: 'Game Designer',
    codes: ['A', 'I', 'R'],
    description: 'Xây dựng cơ chế, cốt truyện và trải nghiệm chơi game cho nhiều nền tảng.',
    skills: ['Unity / Unreal Engine', 'C# / C++', 'Game Mechanics', '3D Modeling'],
    outlook: '⭐⭐⭐⭐ Ngành game Việt Nam đang bùng nổ',
    salaryRange: '15 – 60 triệu',
    category: 'Arts',
  },
  {
    id: 'architect',
    nameVi: 'Kiến trúc sư',
    nameEn: 'Architect',
    codes: ['A', 'R', 'I'],
    description: 'Thiết kế không gian kiến trúc, công trình dân dụng kết hợp thẩm mỹ và công năng.',
    skills: ['AutoCAD', 'SketchUp', 'Revit', 'Thiết kế nội thất'],
    outlook: '⭐⭐⭐ Ổn định — bất động sản hồi phục',
    salaryRange: '12 – 40 triệu',
    category: 'Arts',
  },

  // ── S – Xã hội ────────────────────────────────────────────────────────────
  {
    id: 'teacher',
    nameVi: 'Giáo viên / Giảng viên',
    nameEn: 'Teacher / Lecturer',
    codes: ['S', 'A', 'I'],
    description: 'Giảng dạy kiến thức, kỹ năng và định hướng phát triển cho học sinh, sinh viên.',
    skills: ['Thiết kế bài giảng', 'Quản lý lớp học', 'EdTech', 'Sư phạm'],
    outlook: '⭐⭐⭐⭐ Luôn cần — đặc biệt STEM và ngoại ngữ',
    salaryRange: '8 – 25 triệu',
    category: 'Social',
  },
  {
    id: 'psychologist',
    nameVi: 'Nhà Tâm lý học',
    nameEn: 'Psychologist',
    codes: ['S', 'I', 'A'],
    description: 'Đánh giá, tư vấn và trị liệu tâm lý cho cá nhân, gia đình và tổ chức.',
    skills: ['Tư vấn tâm lý', 'Trắc nghiệm tâm lý', 'CBT', 'Nghiên cứu hành vi'],
    outlook: '⭐⭐⭐⭐ Tăng trưởng — nhận thức sức khỏe tâm thần tăng cao',
    salaryRange: '10 – 30 triệu',
    category: 'Social',
  },
  {
    id: 'social-worker',
    nameVi: 'Nhân viên Công tác Xã hội',
    nameEn: 'Social Worker',
    codes: ['S', 'E', 'C'],
    description: 'Hỗ trợ, bảo vệ và cải thiện chất lượng sống cho nhóm yếu thế trong xã hội.',
    skills: ['Quản lý ca', 'Pháp luật bảo trợ xã hội', 'Truyền thông cộng đồng', 'Tư vấn'],
    outlook: '⭐⭐⭐ Ổn định — nhu cầu xã hội ngày càng tăng',
    salaryRange: '7 – 18 triệu',
    category: 'Social',
  },
  {
    id: 'nurse',
    nameVi: 'Điều dưỡng viên',
    nameEn: 'Nurse',
    codes: ['S', 'R', 'I'],
    description: 'Chăm sóc trực tiếp bệnh nhân, thực hiện y lệnh và hỗ trợ bác sĩ trong điều trị.',
    skills: ['Kỹ thuật điều dưỡng', 'Chăm sóc lâm sàng', 'Giao tiếp y tế', 'Hồi sức cấp cứu'],
    outlook: '⭐⭐⭐⭐ Thiếu hụt toàn cầu — lương tốt khi đi xuất khẩu lao động',
    salaryRange: '8 – 20 triệu (VN) | 50–100 triệu (nước ngoài)',
    category: 'Health',
  },

  // ── E – Quản lý ───────────────────────────────────────────────────────────
  {
    id: 'product-manager',
    nameVi: 'Quản lý Sản phẩm (Product Manager)',
    nameEn: 'Product Manager',
    codes: ['E', 'I', 'S'],
    description: 'Định hướng phát triển sản phẩm số từ ý tưởng đến thị trường, phối hợp các bộ phận.',
    skills: ['Product Roadmap', 'Agile/Scrum', 'Data Analysis', 'User Story'],
    outlook: '⭐⭐⭐⭐⭐ Startup và tech company — vị trí chiến lược',
    salaryRange: '25 – 80 triệu',
    category: 'Business',
  },
  {
    id: 'entrepreneur',
    nameVi: 'Khởi nghiệp / Doanh nhân',
    nameEn: 'Entrepreneur',
    codes: ['E', 'I', 'S'],
    description: 'Xây dựng và phát triển doanh nghiệp, đổi mới sáng tạo và tạo ra giá trị xã hội.',
    skills: ['Business Model Canvas', 'Tài chính startup', 'Marketing', 'Leadership'],
    outlook: '⭐⭐⭐⭐⭐ Hệ sinh thái startup VN phát triển mạnh',
    salaryRange: 'Không giới hạn',
    category: 'Business',
  },
  {
    id: 'marketing-manager',
    nameVi: 'Giám đốc Marketing (CMO)',
    nameEn: 'Marketing Manager',
    codes: ['E', 'A', 'S'],
    description: 'Lập chiến lược thương hiệu, marketing kỹ thuật số và phát triển thị phần.',
    skills: ['Digital Marketing', 'SEO/SEM', 'Content Strategy', 'Analytics'],
    outlook: '⭐⭐⭐⭐ Cốt lõi doanh nghiệp — mọi quy mô đều cần',
    salaryRange: '20 – 60 triệu',
    category: 'Business',
  },

  // ── C – Nghiệp vụ ─────────────────────────────────────────────────────────
  {
    id: 'accountant',
    nameVi: 'Kế toán / Kiểm toán',
    nameEn: 'Accountant / Auditor',
    codes: ['C', 'E', 'I'],
    description: 'Quản lý sổ sách, lập báo cáo tài chính và kiểm tra tính tuân thủ quy định kế toán.',
    skills: ['MISA / SAP', 'Thuế TNCN/TNDN', 'IFRS', 'Excel nâng cao'],
    outlook: '⭐⭐⭐ Ổn định — mọi doanh nghiệp đều cần',
    salaryRange: '10 – 30 triệu',
    category: 'Business',
  },
  {
    id: 'data-analyst',
    nameVi: 'Chuyên viên Phân tích Dữ liệu',
    nameEn: 'Data Analyst',
    codes: ['C', 'I', 'E'],
    description: 'Thu thập, làm sạch và phân tích dữ liệu để hỗ trợ ra quyết định kinh doanh.',
    skills: ['SQL', 'Python / R', 'Power BI', 'Excel / Google Sheets'],
    outlook: '⭐⭐⭐⭐⭐ Thời đại dữ liệu — cầu vượt cung',
    salaryRange: '15 – 45 triệu',
    category: 'STEM',
  },
  {
    id: 'logistics',
    nameVi: 'Chuyên viên Logistics & SCM',
    nameEn: 'Logistics & Supply Chain Manager',
    codes: ['C', 'E', 'R'],
    description: 'Quản lý chuỗi cung ứng, kho bãi, vận chuyển hàng hóa trong và ngoài nước.',
    skills: ['SAP SCM', 'Incoterms', 'Warehouse Management', 'ERP'],
    outlook: '⭐⭐⭐⭐ Thương mại điện tử bùng nổ — logistics lên ngôi',
    salaryRange: '12 – 35 triệu',
    category: 'Business',
  },
];

/**
 * Tìm nghề nghiệp tương thích với mã Holland 3 chữ cái
 * Trả về tối đa 8 nghề, sắp xếp theo độ tương thích giảm dần
 */
export function getCompatibleCareers(topCodes: HollandType[]): Career[] {
  const scored = CAREERS.map((career) => {
    let score = 0;
    topCodes.forEach((code, idx) => {
      const pos = career.codes.indexOf(code);
      if (pos !== -1) {
        // Code ở vị trí 0 (chính) = điểm cao nhất, vị trí 2 = điểm thấp hơn
        score += (3 - pos) * (3 - idx);
      }
    });
    return { career, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((s) => s.career);
}
