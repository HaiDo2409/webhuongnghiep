export type HollandType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface HollandQuestion {
  id: number;
  text: string;
  type: HollandType;
}

export const HOLLAND_LABELS: Record<HollandType, { name: string; desc: string; color: string; emoji: string }> = {
  R: { name: 'Kỹ thuật – Thực tế', desc: 'Thích sửa chữa, lắp ráp máy móc, thực hành', color: '#ef4444', emoji: '🔧' },
  I: { name: 'Nghiên cứu',         desc: 'Tư duy – phân tích, khám phá khoa học',       color: '#3b82f6', emoji: '🔬' },
  A: { name: 'Nghệ thuật',         desc: 'Sáng tạo – biểu đạt qua nghệ thuật, thiết kế', color: '#a855f7', emoji: '🎨' },
  S: { name: 'Xã hội',             desc: 'Hỗ trợ – giúp đỡ, dạy học, chăm sóc người khác', color: '#22c55e', emoji: '🤝' },
  E: { name: 'Quản lý – Kinh doanh', desc: 'Lãnh đạo – thuyết phục, tổ chức, kinh doanh', color: '#f97316', emoji: '💼' },
  C: { name: 'Nghiệp vụ – Quy củ', desc: 'Quy trình – sắp xếp, phân tích dữ liệu, làm việc đúng quy trình', color: '#06b6d4', emoji: '📊' },
};

/**
 * Bộ câu hỏi chính thức của Tổ HĐTNHN – THPT Chuyên Biên Hòa
 * Nguồn: RIASEC_tracnghiem_24cau.md (bộ 24 câu rút gọn, 4 câu/nhóm)
 * Thang điểm: 1 = Hoàn toàn không đúng · 2 = Không đúng · 3 = Phân vân · 4 = Đúng · 5 = Hoàn toàn đúng
 * Tối đa: 20 điểm/nhóm
 */
export const HOLLAND_QUESTIONS: HollandQuestion[] = [
  // R – Kỹ thuật – Thực tế (Realistic)
  { id: 1,  type: 'R', text: 'Em thích sửa chữa, lắp ráp máy móc, đồ vật hoặc thiết bị điện tử.' },
  { id: 2,  type: 'R', text: 'Em thích làm việc ngoài trời hoặc với dụng cụ, máy móc hơn là ngồi bàn giấy.' },
  { id: 3,  type: 'R', text: 'Em thích các môn thực hành, thí nghiệm hơn là học lý thuyết suông.' },
  { id: 4,  type: 'R', text: 'Em thấy hứng thú khi lắp ráp, vận hành hoặc điều khiển một thiết bị kỹ thuật.' },

  // I – Nghiên cứu (Investigative)
  { id: 5,  type: 'I', text: 'Em thích tìm hiểu vì sao mọi việc lại xảy ra như vậy, thích đặt câu hỏi "tại sao".' },
  { id: 6,  type: 'I', text: 'Em thích giải các bài toán, câu đố logic hoặc phân tích số liệu.' },
  { id: 7,  type: 'I', text: 'Em thích đọc sách khoa học, xem chương trình khám phá, tìm hiểu hiện tượng tự nhiên.' },
  { id: 8,  type: 'I', text: 'Em thích tự nghiên cứu sâu một chủ đề trước khi đưa ra kết luận.' },

  // A – Nghệ thuật (Artistic)
  { id: 9,  type: 'A', text: 'Em thích vẽ, viết, sáng tác nhạc hoặc thiết kế hình ảnh.' },
  { id: 10, type: 'A', text: 'Em thích thể hiện ý tưởng của mình theo cách riêng, không rập khuôn.' },
  { id: 11, type: 'A', text: 'Em thích tham gia các hoạt động văn nghệ, mỹ thuật, nhiếp ảnh hoặc viết lách.' },
  { id: 12, type: 'A', text: 'Em cảm thấy gò bó khi phải làm việc theo một quy trình cố định, lặp lại.' },

  // S – Xã hội (Social)
  { id: 13, type: 'S', text: 'Em thích giúp đỡ, lắng nghe hoặc hướng dẫn người khác.' },
  { id: 14, type: 'S', text: 'Em thích làm việc nhóm, trò chuyện và kết nối với nhiều người.' },
  { id: 15, type: 'S', text: 'Em quan tâm đến cảm xúc, khó khăn của bạn bè và muốn hỗ trợ họ.' },
  { id: 16, type: 'S', text: 'Em thích tham gia hoạt động tình nguyện, cộng đồng.' },

  // E – Quản lý – Kinh doanh (Enterprising)
  { id: 17, type: 'E', text: 'Em thích đứng ra tổ chức, lãnh đạo hoặc điều phối một nhóm/sự kiện.' },
  { id: 18, type: 'E', text: 'Em thích thuyết phục, đàm phán hoặc thuyết trình trước đám đông.' },
  { id: 19, type: 'E', text: 'Em thích lên kế hoạch kinh doanh, bán hàng hoặc gây quỹ.' },
  { id: 20, type: 'E', text: 'Em thích cạnh tranh và đặt mục tiêu để đạt thành tích cao hơn.' },

  // C – Nghiệp vụ – Quy củ (Conventional)
  { id: 21, type: 'C', text: 'Em thích sắp xếp, phân loại số liệu, hồ sơ, giấy tờ một cách gọn gàng.' },
  { id: 22, type: 'C', text: 'Em thích làm việc theo quy trình, quy định rõ ràng hơn là tuỳ hứng.' },
  { id: 23, type: 'C', text: 'Em cẩn thận, tỉ mỉ khi kiểm tra lại số liệu hoặc văn bản.' },
  { id: 24, type: 'C', text: 'Em thích sử dụng bảng tính, sổ sách để theo dõi công việc, chi tiêu.' },
];

/** Số câu mỗi nhóm (dùng để tính maxScore = QUESTIONS_PER_GROUP × 5) */
export const QUESTIONS_PER_GROUP = 4;
export const MAX_SCORE_PER_GROUP = QUESTIONS_PER_GROUP * 5; // = 20
