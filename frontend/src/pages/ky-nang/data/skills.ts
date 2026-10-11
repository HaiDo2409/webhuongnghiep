export interface SkillNode {
  id: string;
  name: string;
  level: 'field' | 'track' | 'skill' | 'tool';
  description?: string;
  resources?: {
    title: string;
    url: string;
    platform: 'Coursera' | 'edX' | 'YouTube' | 'Udemy' | 'FreeCodeCamp' | 'Viblo' | 'TopDev';
    free: boolean;
  }[];
  children?: SkillNode[];
}

export interface OfficialLink {
  id: string;
  name: string;
  url: string;
  description: string;
  category: 'tuyen-sinh' | 'truong-dai-hoc' | 'hoc-bong' | 'khoa-hoc-truc-tuyen';
  logo?: string;
}

export const SKILL_MAP: SkillNode[] = [
  {
    id: 'lap-trinh-ai',
    name: '💻 Lập trình & AI',
    level: 'field',
    description: 'Con đường từ lập trình cơ bản đến kỹ sư AI',
    children: [
      {
        id: 'python-track',
        name: 'Python cơ bản → nâng cao',
        level: 'track',
        resources: [
          { title: 'Python for Everybody', url: 'https://www.coursera.org/specializations/python', platform: 'Coursera', free: true },
          { title: 'CS50P – Harvard', url: 'https://cs50.harvard.edu/python/', platform: 'edX', free: true },
        ],
        children: [
          { id: 'py-basics', name: 'Python cơ bản', level: 'skill', description: 'Biến, vòng lặp, hàm, OOP' },
          { id: 'py-ds', name: 'Data Science với Python', level: 'skill', description: 'NumPy, Pandas, Matplotlib' },
          { id: 'py-ml', name: 'Machine Learning', level: 'skill', description: 'scikit-learn, Keras, PyTorch' },
        ],
      },
      {
        id: 'web-track',
        name: 'Lập trình Web',
        level: 'track',
        resources: [
          { title: 'The Odin Project', url: 'https://www.theodinproject.com/', platform: 'FreeCodeCamp', free: true },
          { title: 'CS50W – Harvard Web', url: 'https://cs50.harvard.edu/web/', platform: 'edX', free: true },
        ],
        children: [
          { id: 'html-css', name: 'HTML & CSS', level: 'skill' },
          { id: 'js-ts', name: 'JavaScript / TypeScript', level: 'skill' },
          { id: 'react', name: 'React / Next.js', level: 'skill' },
          { id: 'backend', name: 'Backend (Node.js / Java)', level: 'skill' },
        ],
      },
      {
        id: 'ai-track',
        name: 'AI & Deep Learning',
        level: 'track',
        resources: [
          { title: 'Deep Learning Specialization – Andrew Ng', url: 'https://www.coursera.org/specializations/deep-learning', platform: 'Coursera', free: false },
          { title: 'CS50AI – Harvard', url: 'https://cs50.harvard.edu/ai/', platform: 'edX', free: true },
          { title: 'Practical Deep Learning – fast.ai', url: 'https://course.fast.ai/', platform: 'YouTube', free: true },
        ],
        children: [
          { id: 'ml-basics', name: 'Học máy cơ bản', level: 'skill' },
          { id: 'deep-learning', name: 'Deep Learning / CNN / RNN', level: 'skill' },
          { id: 'llm', name: 'LLM & Prompt Engineering', level: 'skill' },
          { id: 'mlops', name: 'MLOps & Deployment', level: 'skill' },
        ],
      },
      {
        id: 'data-track',
        name: 'Phân tích Dữ liệu',
        level: 'track',
        resources: [
          { title: 'Google Data Analytics', url: 'https://www.coursera.org/professional-certificates/google-data-analytics', platform: 'Coursera', free: false },
          { title: 'SQL for Data Science', url: 'https://www.edx.org/course/sql-for-data-science', platform: 'edX', free: true },
        ],
        children: [
          { id: 'sql', name: 'SQL & Database', level: 'skill' },
          { id: 'excel-powerbi', name: 'Excel & Power BI', level: 'skill' },
          { id: 'tableau', name: 'Tableau / Looker', level: 'skill' },
        ],
      },
    ],
  },
  {
    id: 'ky-thuat',
    name: '⚙️ Kỹ thuật & Cơ điện tử',
    level: 'field',
    description: 'Từ bản vẽ kỹ thuật đến robot tự động',
    children: [
      {
        id: 'cad-track',
        name: 'Thiết kế CAD/CAM',
        level: 'track',
        resources: [
          { title: 'AutoCAD Fundamentals', url: 'https://www.autodesk.com/certification/learn', platform: 'Udemy', free: false },
          { title: 'Fusion 360 cơ bản', url: 'https://www.youtube.com/c/Fusion360', platform: 'YouTube', free: true },
        ],
        children: [
          { id: 'autocad', name: 'AutoCAD 2D/3D', level: 'tool' },
          { id: 'solidworks', name: 'SolidWorks / Fusion 360', level: 'tool' },
          { id: 'revit', name: 'Revit (xây dựng)', level: 'tool' },
        ],
      },
      {
        id: 'arduino-track',
        name: 'Vi điều khiển & IoT',
        level: 'track',
        resources: [
          { title: 'Arduino Course for Beginners', url: 'https://www.youtube.com/watch?v=zJ-LqeX_fLU', platform: 'YouTube', free: true },
          { title: 'IoT with Raspberry Pi', url: 'https://www.edx.org/professional-certificate/iotx-iot', platform: 'edX', free: true },
        ],
        children: [
          { id: 'arduino', name: 'Arduino / ESP32', level: 'tool' },
          { id: 'raspberry-pi', name: 'Raspberry Pi', level: 'tool' },
          { id: 'plc', name: 'PLC Siemens S7', level: 'tool' },
          { id: 'robotics', name: 'ROS – Robot Operating System', level: 'skill' },
        ],
      },
      {
        id: 'electronics-track',
        name: 'Điện tử cơ bản',
        level: 'track',
        resources: [
          { title: 'Circuits & Electronics – MIT', url: 'https://www.edx.org/course/circuits-and-electronics-1', platform: 'edX', free: true },
        ],
        children: [
          { id: 'circuit', name: 'Mạch điện tử cơ bản', level: 'skill' },
          { id: 'pcb', name: 'Thiết kế PCB (KiCad)', level: 'skill' },
          { id: 'embedded', name: 'Lập trình nhúng (C/C++)', level: 'skill' },
        ],
      },
    ],
  },
  {
    id: 'toan-khoa-hoc',
    name: '🔢 Toán & Khoa học',
    level: 'field',
    description: 'Nền tảng toán học và khoa học cơ bản',
    children: [
      {
        id: 'math-track',
        name: 'Toán ứng dụng',
        level: 'track',
        resources: [
          { title: 'Mathematics for Machine Learning', url: 'https://www.coursera.org/specializations/mathematics-machine-learning', platform: 'Coursera', free: false },
          { title: 'Khan Academy – Calculus', url: 'https://www.khanacademy.org/math/calculus-1', platform: 'YouTube', free: true },
        ],
        children: [
          { id: 'calculus', name: 'Giải tích / Calculus', level: 'skill' },
          { id: 'linear-algebra', name: 'Đại số tuyến tính', level: 'skill' },
          { id: 'probability', name: 'Xác suất & Thống kê', level: 'skill' },
          { id: 'optimization', name: 'Tối ưu hóa', level: 'skill' },
        ],
      },
      {
        id: 'physics-track',
        name: 'Vật lý & Hóa học',
        level: 'track',
        resources: [
          { title: 'Physics 101 – Khan Academy', url: 'https://www.khanacademy.org/science/physics', platform: 'YouTube', free: true },
        ],
        children: [
          { id: 'mechanics', name: 'Cơ học / Động lực học', level: 'skill' },
          { id: 'thermodynamics', name: 'Nhiệt động lực học', level: 'skill' },
          { id: 'chemistry-basic', name: 'Hóa học phân tích', level: 'skill' },
        ],
      },
    ],
  },
  {
    id: 'ngoai-ngu',
    name: '🌐 Ngoại ngữ & Mềm',
    level: 'field',
    description: 'Kỹ năng mềm và ngôn ngữ quốc tế',
    children: [
      {
        id: 'english-track',
        name: 'Tiếng Anh học thuật',
        level: 'track',
        resources: [
          { title: 'Academic English – Coursera', url: 'https://www.coursera.org/specializations/academic-english', platform: 'Coursera', free: false },
          { title: 'IELTS Preparation', url: 'https://www.youtube.com/c/IELTSLiz', platform: 'YouTube', free: true },
        ],
        children: [
          { id: 'ielts', name: 'IELTS Academic (target 6.5+)', level: 'skill' },
          { id: 'english-writing', name: 'Viết học thuật tiếng Anh', level: 'skill' },
          { id: 'presentation', name: 'Thuyết trình tiếng Anh', level: 'skill' },
        ],
      },
      {
        id: 'soft-skills',
        name: 'Kỹ năng mềm STEM',
        level: 'track',
        children: [
          { id: 'critical-thinking', name: 'Tư duy phản biện', level: 'skill' },
          { id: 'project-management', name: 'Quản lý dự án (Agile)', level: 'skill' },
          { id: 'research-writing', name: 'Viết báo cáo nghiên cứu', level: 'skill' },
          { id: 'teamwork', name: 'Làm việc nhóm & Git', level: 'skill' },
        ],
      },
    ],
  },
];

export const OFFICIAL_LINKS: OfficialLink[] = [
  // ── Cổng thông tin chính thức ─────────────────────────────────────────────
  {
    id: 'bgddt',
    name: 'Cổng Tuyển sinh Bộ GD&ĐT',
    url: 'https://tuyensinh.moet.gov.vn',
    description: 'Thông tin tuyển sinh chính thức, điểm chuẩn và quy chế Bộ GD&ĐT',
    category: 'tuyen-sinh',
  },
  {
    id: 'hust',
    name: 'Tuyển sinh ĐHBK Hà Nội',
    url: 'https://ts.hust.edu.vn',
    description: 'Thông tin xét tuyển, điểm chuẩn và bài thi TSA Bách Khoa HN',
    category: 'truong-dai-hoc',
  },
  {
    id: 'uet',
    name: 'Tuyển sinh ĐH Công nghệ – ĐHQGHN',
    url: 'https://tuyensinh.uet.vnu.edu.vn',
    description: 'Tuyển sinh UET – xét HSA, học bạ và điểm thi THPT',
    category: 'truong-dai-hoc',
  },
  {
    id: 'hnu',
    name: 'Tuyển sinh ĐH Sư phạm HN',
    url: 'https://tuyensinh.hnue.edu.vn',
    description: 'Sư phạm Hà Nội – thông tin ngành đào tạo giáo viên STEM',
    category: 'truong-dai-hoc',
  },
  {
    id: 'hmu',
    name: 'Tuyển sinh ĐH Y Hà Nội',
    url: 'https://hmu.edu.vn/tuyen-sinh',
    description: 'Y khoa, Dược, Điều dưỡng – trường Y hàng đầu miền Bắc',
    category: 'truong-dai-hoc',
  },
  {
    id: 'hust-tsa',
    name: 'Luyện thi TSA Bách Khoa',
    url: 'https://tsa.hust.edu.vn',
    description: 'Portal luyện thi ĐGTD Bách Khoa (TSA) – đề thi thử và hướng dẫn',
    category: 'tuyen-sinh',
  },
  {
    id: 'vnu-hsa',
    name: 'Đánh giá Năng lực ĐHQGHN',
    url: 'https://hsa.vnu.edu.vn',
    description: 'Kỳ thi ĐGNL (HSA) ĐHQGHN – lịch thi và đề thi minh họa',
    category: 'tuyen-sinh',
  },
  // ── Học bổng ──────────────────────────────────────────────────────────────
  {
    id: 'vinif',
    name: 'Học bổng VinIF',
    url: 'https://vinif.org',
    description: 'Học bổng nghiên cứu sinh và sau đại học của Vingroup',
    category: 'hoc-bong',
  },
  {
    id: 'vied',
    name: 'Học bổng Chính phủ Việt Nam',
    url: 'https://vied.vn',
    description: 'Cục Đào tạo nước ngoài – học bổng đi du học toàn phần',
    category: 'hoc-bong',
  },
  // ── Học trực tuyến ────────────────────────────────────────────────────────
  {
    id: 'coursera',
    name: 'Coursera',
    url: 'https://www.coursera.org',
    description: 'Khóa học từ MIT, Stanford, Google – nhiều chứng chỉ miễn phí',
    category: 'khoa-hoc-truc-tuyen',
  },
  {
    id: 'edx',
    name: 'edX / CS50',
    url: 'https://www.edx.org',
    description: 'Harvard, MIT và 150+ trường – CS50 là khóa nổi tiếng nhất',
    category: 'khoa-hoc-truc-tuyen',
  },
  {
    id: 'viblo',
    name: 'Viblo – Community IT Việt Nam',
    url: 'https://viblo.asia',
    description: 'Cộng đồng lập trình viên Việt Nam – bài viết kỹ thuật chất lượng cao',
    category: 'khoa-hoc-truc-tuyen',
  },
];
