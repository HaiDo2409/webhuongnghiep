export type HollandType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface HollandQuestion {
  id: number;
  text: string;
  type: HollandType;
}

export const HOLLAND_LABELS: Record<HollandType, { name: string; desc: string; color: string; emoji: string }> = {
  R: { name: 'Kỹ thuật', desc: 'Thực tế – làm việc với máy móc, công cụ, thiên nhiên', color: '#ef4444', emoji: '🔧' },
  I: { name: 'Nghiên cứu', desc: 'Tư duy – phân tích, khám phá khoa học', color: '#3b82f6', emoji: '🔬' },
  A: { name: 'Nghệ thuật', desc: 'Sáng tạo – biểu đạt qua nghệ thuật, âm nhạc, thiết kế', color: '#a855f7', emoji: '🎨' },
  S: { name: 'Xã hội', desc: 'Hỗ trợ – giúp đỡ, dạy học, chăm sóc người khác', color: '#22c55e', emoji: '🤝' },
  E: { name: 'Quản lý', desc: 'Lãnh đạo – thuyết phục, tổ chức, kinh doanh', color: '#f97316', emoji: '💼' },
  C: { name: 'Nghiệp vụ', desc: 'Quy trình – sắp xếp, phân tích dữ liệu, thực hiện đúng quy trình', color: '#06b6d4', emoji: '📊' },
};

export const HOLLAND_QUESTIONS: HollandQuestion[] = [
  // R – Kỹ thuật (Realistic)
  { id: 1,  type: 'R', text: 'Tôi thích sửa chữa hoặc lắp ráp các thiết bị điện tử, máy móc.' },
  { id: 2,  type: 'R', text: 'Tôi thích làm việc ngoài trời, tiếp xúc với thiên nhiên.' },
  { id: 3,  type: 'R', text: 'Tôi thích các hoạt động thực hành như hàn, mộc, cơ khí.' },
  { id: 4,  type: 'R', text: 'Tôi thích dùng dụng cụ, máy móc để tạo ra sản phẩm hữu hình.' },
  { id: 5,  type: 'R', text: 'Tôi thích điều hướng, lái xe hoặc vận hành phương tiện cơ giới.' },
  { id: 6,  type: 'R', text: 'Tôi thích làm những việc đòi hỏi kỹ năng tay nghề cao.' },
  { id: 7,  type: 'R', text: 'Tôi thích trồng cây, chăm sóc vật nuôi hoặc làm nông nghiệp.' },
  { id: 8,  type: 'R', text: 'Tôi thích các môn thể thao hoặc hoạt động đòi hỏi thể lực.' },

  // I – Nghiên cứu (Investigative)
  { id: 9,  type: 'I', text: 'Tôi thích đọc sách khoa học và tìm hiểu các hiện tượng tự nhiên.' },
  { id: 10, type: 'I', text: 'Tôi thích giải những bài toán khó hoặc câu đố logic.' },
  { id: 11, type: 'I', text: 'Tôi thích làm thí nghiệm và quan sát kết quả.' },
  { id: 12, type: 'I', text: 'Tôi thích phân tích dữ liệu để tìm ra quy luật hoặc kết luận.' },
  { id: 13, type: 'I', text: 'Tôi thích đặt câu hỏi "Tại sao?" và tìm kiếm giải thích khoa học.' },
  { id: 14, type: 'I', text: 'Tôi thích lập trình hoặc giải quyết vấn đề bằng thuật toán.' },
  { id: 15, type: 'I', text: 'Tôi thích nghiên cứu về vũ trụ, sinh học hoặc hóa học.' },
  { id: 16, type: 'I', text: 'Tôi thích tư duy độc lập hơn là làm theo chỉ dẫn có sẵn.' },

  // A – Nghệ thuật (Artistic)
  { id: 17, type: 'A', text: 'Tôi thích vẽ, thiết kế đồ họa hoặc nhiếp ảnh.' },
  { id: 18, type: 'A', text: 'Tôi thích viết truyện, thơ, hoặc sáng tác nội dung sáng tạo.' },
  { id: 19, type: 'A', text: 'Tôi thích biểu diễn âm nhạc, nhảy múa hoặc diễn xuất.' },
  { id: 20, type: 'A', text: 'Tôi thích trang trí không gian, phối màu và thiết kế nội thất.' },
  { id: 21, type: 'A', text: 'Tôi thích làm video, chỉnh sửa phim hoặc dựng nội dung số.' },
  { id: 22, type: 'A', text: 'Tôi thích thể hiện cảm xúc qua nghệ thuật hơn là qua lời nói.' },
  { id: 23, type: 'A', text: 'Tôi thích các hoạt động không có khuôn mẫu cố định.' },
  { id: 24, type: 'A', text: 'Tôi thích tham quan triển lãm nghệ thuật, bảo tàng, sân khấu.' },

  // S – Xã hội (Social)
  { id: 25, type: 'S', text: 'Tôi thích giải thích, hướng dẫn hoặc dạy học cho người khác.' },
  { id: 26, type: 'S', text: 'Tôi thích lắng nghe và giúp bạn bè giải quyết vấn đề cá nhân.' },
  { id: 27, type: 'S', text: 'Tôi thích làm tình nguyện và cống hiến cho cộng đồng.' },
  { id: 28, type: 'S', text: 'Tôi thích chăm sóc người bệnh hoặc hỗ trợ người khó khăn.' },
  { id: 29, type: 'S', text: 'Tôi thích làm việc nhóm và hòa giải khi có mâu thuẫn.' },
  { id: 30, type: 'S', text: 'Tôi thích tư vấn, hỗ trợ tâm lý hoặc định hướng nghề nghiệp.' },
  { id: 31, type: 'S', text: 'Tôi thích tham gia các câu lạc bộ xã hội, hoạt động nhân đạo.' },
  { id: 32, type: 'S', text: 'Tôi cảm thấy có ích khi đóng góp vào sự phát triển của người khác.' },

  // E – Quản lý (Enterprising)
  { id: 33, type: 'E', text: 'Tôi thích thuyết phục người khác và dẫn dắt nhóm.' },
  { id: 34, type: 'E', text: 'Tôi thích kinh doanh, buôn bán hoặc phát triển ý tưởng thành dự án.' },
  { id: 35, type: 'E', text: 'Tôi thích thi đua, cạnh tranh và đặt mục tiêu cao.' },
  { id: 36, type: 'E', text: 'Tôi thích lên kế hoạch tổ chức sự kiện và điều phối mọi người.' },
  { id: 37, type: 'E', text: 'Tôi thích đàm phán, thương lượng và tìm kiếm cơ hội.' },
  { id: 38, type: 'E', text: 'Tôi muốn trở thành người có tầm ảnh hưởng và ra quyết định quan trọng.' },
  { id: 39, type: 'E', text: 'Tôi thích phát biểu trước đám đông hoặc điều hành cuộc họp.' },
  { id: 40, type: 'E', text: 'Tôi hứng thú với chiến lược kinh doanh và marketing.' },

  // C – Nghiệp vụ (Conventional)
  { id: 41, type: 'C', text: 'Tôi thích làm việc với số liệu, bảng tính và tài liệu có cấu trúc.' },
  { id: 42, type: 'C', text: 'Tôi thích tuân theo quy trình và làm việc đúng theo hướng dẫn.' },
  { id: 43, type: 'C', text: 'Tôi thích sắp xếp, phân loại và quản lý hồ sơ, dữ liệu.' },
  { id: 44, type: 'C', text: 'Tôi thích công việc văn phòng có lịch trình ổn định.' },
  { id: 45, type: 'C', text: 'Tôi thích kiểm tra tính chính xác của số liệu kế toán, tài chính.' },
  { id: 46, type: 'C', text: 'Tôi thích nhập liệu, xử lý dữ liệu hoặc quản lý cơ sở dữ liệu.' },
  { id: 47, type: 'C', text: 'Tôi thích làm những việc có đáp án đúng/sai rõ ràng.' },
  { id: 48, type: 'C', text: 'Tôi thích lập báo cáo, lên kế hoạch tài chính hoặc ngân sách.' },
];
