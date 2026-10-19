/**
 * Bộ câu hỏi Đa trí tuệ (Multiple Intelligences) – Howard Gardner
 * 8 loại trí tuệ × 5 câu = 40 câu
 * Thang điểm: 1-5 (Rất không đúng → Rất đúng)
 */

export type MIType =
  | 'linguistic'    // Ngôn ngữ
  | 'logical'       // Logic – Toán học
  | 'spatial'       // Không gian
  | 'musical'       // Âm nhạc
  | 'bodily'        // Thể chất – Vận động
  | 'interpersonal' // Giao tiếp xã hội
  | 'intrapersonal' // Nội tâm
  | 'naturalist';   // Tự nhiên

export interface MIQuestion {
  id: number;
  type: MIType;
  text: string;
}

export const MI_LABELS: Record<MIType, { name: string; desc: string; color: string; emoji: string; stemMatch: string }> = {
  linguistic:    { name: 'Ngôn ngữ',           emoji: '📝', color: '#3b82f6', desc: 'Giỏi đọc, viết, diễn đạt ngôn từ, kể chuyện',    stemMatch: 'Phù hợp: Công nghệ thông tin, Truyền thông kỹ thuật số, Biên phiên dịch' },
  logical:       { name: 'Logic – Toán học',   emoji: '🔢', color: '#8b5cf6', desc: 'Tư duy hệ thống, giải toán, lập luận logic',      stemMatch: 'Phù hợp tốt nhất: Khoa học máy tính, AI, Toán ứng dụng, Vật lý' },
  spatial:       { name: 'Không gian',          emoji: '🎯', color: '#06b6d4', desc: 'Tưởng tượng hình ảnh 3D, định hướng, thiết kế',   stemMatch: 'Phù hợp: Kỹ thuật cơ khí, Kiến trúc, Thiết kế đồ họa, Robot' },
  musical:       { name: 'Âm nhạc',             emoji: '🎵', color: '#ec4899', desc: 'Cảm thụ nhịp điệu, giai điệu, cấu trúc âm thanh', stemMatch: 'Phù hợp: Kỹ thuật âm thanh, Xử lý tín hiệu số, Game design' },
  bodily:        { name: 'Thể chất – Vận động', emoji: '🏃', color: '#f97316', desc: 'Khéo léo tay chân, học qua thực hành, phản xạ tốt', stemMatch: 'Phù hợp: Kỹ thuật robot, Y dược thực hành, Công nghệ thể thao' },
  interpersonal: { name: 'Giao tiếp xã hội',   emoji: '🤝', color: '#22c55e', desc: 'Hiểu người khác, lãnh đạo nhóm, giao tiếp tốt',   stemMatch: 'Phù hợp: Quản lý dự án IT, Y tế cộng đồng, Giáo dục STEM' },
  intrapersonal: { name: 'Nội tâm',             emoji: '🧘', color: '#6366f1', desc: 'Hiểu bản thân, tự học, đặt mục tiêu rõ ràng',     stemMatch: 'Phù hợp: Nghiên cứu khoa học, Data Science, Nghiên cứu AI' },
  naturalist:    { name: 'Tự nhiên',             emoji: '🌿', color: '#84cc16', desc: 'Quan sát, phân loại thiên nhiên, yêu môi trường',  stemMatch: 'Phù hợp: Công nghệ sinh học, Môi trường, Nông nghiệp công nghệ cao' },
};

export const MI_QUESTIONS: MIQuestion[] = [
  // Linguistic
  { id: 1,  type: 'linguistic',    text: 'Em thích đọc sách, truyện hoặc bài báo hơn là xem phim.' },
  { id: 2,  type: 'linguistic',    text: 'Em dễ dàng diễn đạt ý tưởng của mình bằng lời nói hoặc văn viết.' },
  { id: 3,  type: 'linguistic',    text: 'Em hay để ý cách dùng từ và cấu trúc câu trong khi đọc.' },
  { id: 4,  type: 'linguistic',    text: 'Em thích học ngoại ngữ hoặc tìm hiểu nguồn gốc các từ.' },
  { id: 5,  type: 'linguistic',    text: 'Em có thể ghi nhớ câu nói, đoạn văn hay thơ một cách tự nhiên.' },

  // Logical
  { id: 6,  type: 'logical',       text: 'Em thích giải câu đố, toán khó hoặc bài tập lập trình.' },
  { id: 7,  type: 'logical',       text: 'Em tìm kiếm quy luật và mối liên hệ giữa các sự vật, sự việc.' },
  { id: 8,  type: 'logical',       text: 'Em thích làm thí nghiệm và kiểm chứng các giả thuyết.' },
  { id: 9,  type: 'logical',       text: 'Em dễ hiểu các khái niệm toán học, vật lý hơn so với bạn bè.' },
  { id: 10, type: 'logical',       text: 'Em thích phân tích nguyên nhân – kết quả khi giải quyết vấn đề.' },

  // Spatial
  { id: 11, type: 'spatial',       text: 'Em dễ hình dung vật thể trong không gian 3 chiều khi nhìn bản vẽ kỹ thuật.' },
  { id: 12, type: 'spatial',       text: 'Em thích vẽ sơ đồ, bản đồ tư duy hoặc phác thảo để ghi nhớ.' },
  { id: 13, type: 'spatial',       text: 'Em ít khi bị lạc đường và có cảm giác định hướng tốt.' },
  { id: 14, type: 'spatial',       text: 'Em thích thiết kế, trang trí hoặc sắp xếp đồ vật gọn đẹp.' },
  { id: 15, type: 'spatial',       text: 'Em dễ nhớ mặt người, hình ảnh hơn là nhớ tên hay số.' },

  // Musical
  { id: 16, type: 'musical',       text: 'Em dễ nhận ra giai điệu hoặc nhịp điệu ngay cả khi nghe lần đầu.' },
  { id: 17, type: 'musical',       text: 'Em thường nghĩ bằng âm thanh, giai điệu hiện lên trong đầu khi học.' },
  { id: 18, type: 'musical',       text: 'Em chơi được một nhạc cụ hoặc rất muốn học nhạc.' },
  { id: 19, type: 'musical',       text: 'Em nhận ra khi một bản nhạc bị hát sai tông hoặc lạc nhịp.' },
  { id: 20, type: 'musical',       text: 'Em thích học thuộc bài hơn khi đặt nội dung vào điệu nhạc hoặc vần điệu.' },

  // Bodily
  { id: 21, type: 'bodily',        text: 'Em học tốt hơn khi được tự tay thực hành thay vì nghe giảng lý thuyết.' },
  { id: 22, type: 'bodily',        text: 'Em thích thể thao, nhảy múa, võ thuật hoặc các hoạt động thể chất.' },
  { id: 23, type: 'bodily',        text: 'Em khéo léo trong việc lắp ráp, thủ công hoặc làm việc bằng tay.' },
  { id: 24, type: 'bodily',        text: 'Em dễ bắt chước động tác, điệu bộ của người khác.' },
  { id: 25, type: 'bodily',        text: 'Em khó ngồi yên trong thời gian dài và thích di chuyển khi suy nghĩ.' },

  // Interpersonal
  { id: 26, type: 'interpersonal', text: 'Em dễ cảm nhận cảm xúc và tâm trạng của người xung quanh.' },
  { id: 27, type: 'interpersonal', text: 'Em thích làm việc nhóm và thường là người kết nối mọi người.' },
  { id: 28, type: 'interpersonal', text: 'Em giỏi hòa giải khi có mâu thuẫn trong nhóm.' },
  { id: 29, type: 'interpersonal', text: 'Em được bạn bè tìm đến để chia sẻ hoặc xin lời khuyên.' },
  { id: 30, type: 'interpersonal', text: 'Em thích tổ chức sự kiện, hoạt động tập thể hơn là làm việc một mình.' },

  // Intrapersonal
  { id: 31, type: 'intrapersonal', text: 'Em thường xuyên tự suy ngẫm về cảm xúc và hành động của mình.' },
  { id: 32, type: 'intrapersonal', text: 'Em biết rõ điểm mạnh, điểm yếu của bản thân.' },
  { id: 33, type: 'intrapersonal', text: 'Em thích làm việc một mình và tập trung cao hơn khi ở một mình.' },
  { id: 34, type: 'intrapersonal', text: 'Em đặt mục tiêu dài hạn và theo đuổi chúng một cách kiên trì.' },
  { id: 35, type: 'intrapersonal', text: 'Em có quan điểm, giá trị sống riêng và không dễ bị áp lực đám đông.' },

  // Naturalist
  { id: 36, type: 'naturalist',    text: 'Em yêu thích thiên nhiên: động vật, thực vật, môi trường sống.' },
  { id: 37, type: 'naturalist',    text: 'Em giỏi phân biệt và phân loại các loại cây, côn trùng hoặc đá khoáng.' },
  { id: 38, type: 'naturalist',    text: 'Em quan tâm đến biến đổi khí hậu và bảo vệ môi trường.' },
  { id: 39, type: 'naturalist',    text: 'Em thích quan sát và ghi chép về thế giới tự nhiên xung quanh.' },
  { id: 40, type: 'naturalist',    text: 'Em cảm thấy thoải mái và năng động hơn khi ở ngoài thiên nhiên.' },
];

export const MI_QUESTIONS_PER_TYPE = 5;
export const MI_MAX_SCORE = MI_QUESTIONS_PER_TYPE * 5; // 25
