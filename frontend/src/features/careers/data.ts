export const stemGroups = [
  { id: 'S', name: 'Khoa học', subtitle: 'Tò mò để hiểu thế giới.', description: 'Đặt câu hỏi, thử nghiệm và tìm lời giải cho những vấn đề của sự sống và môi trường.', tags: ['Y sinh', 'Môi trường', 'Nghiên cứu'] },
  { id: 'T', name: 'Công nghệ', subtitle: 'Biến ý tưởng thành sản phẩm.', description: 'Xây dựng phần mềm, dữ liệu và hệ thống số. Bắt đầu từ một ý tưởng nhỏ, mở ra những khả năng lớn.', tags: ['Trí tuệ nhân tạo', 'An ninh mạng', 'Phát triển phần mềm'] },
  { id: 'E', name: 'Kỹ thuật', subtitle: 'Thiết kế điều chưa từng có.', description: 'Kết nối kiến thức với thực hành để tạo nên máy móc, công trình và các giải pháp cho cuộc sống.', tags: ['Cơ điện tử', 'Robot', 'Thiết kế công trình'] },
  { id: 'M', name: 'Toán học', subtitle: 'Tìm quy luật trong những con số.', description: 'Dùng tư duy logic, mô hình và phân tích để giải thích dữ liệu và hỗ trợ những quyết định tốt hơn.', tags: ['Phân tích dữ liệu', 'Mô hình hóa', 'Thống kê'] },
] as const;
export type StemGroup = typeof stemGroups[number]['id'];
