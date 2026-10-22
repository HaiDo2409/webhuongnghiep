# Dữ liệu 35 trường và bộ 45 tag

## Phạm vi đã nạp

Nguồn: `Điểm chuẩn 35 trường+công thức tính (1).xlsx`, sheet `Điểm chuẩn chi tiết`, dòng 2–1276. Đã lưu 1.275 dòng chương trình thuộc 35 tên trường/cơ sở, kèm 4.678 ô điểm dạng số: THPT 2024/2025/2026 và TSA/HSA/SPT/V-ACT 2026 khi có. Danh sách trường ở sheet thứ hai còn chứa nhiều trường chưa có dữ liệu chi tiết, không tạo chương trình giả cho các trường đó.

Mỗi chương trình lưu tên trường, nhóm ngành, công thức nguyên văn, dòng/file/sheet nguồn và các điểm trong `programs.admission_details.workbook`. Giữ các ký hiệu GM, dấu gạch và ô trống; không biến chúng thành số 0. Một ô `24. 63` được đọc số 24.63 nhưng vẫn giữ nguyên chuỗi nguồn để đối chiếu.

Giữ riêng 12 dòng thuộc 6 cặp trùng tên, vì có điểm hoặc công thức khác nhau và thiếu mã chương trình để kết luận là cùng một chương trình. Đánh dấu 86 dòng có nội dung cần rà soát, gồm trùng tên, giá trị vượt thang theo công thức và công thức chưa đủ thông tin. Không tự sửa các điểm này theo phỏng đoán.

File không cung cấp URL nguồn từng dòng hoặc mã ngành/chương trình chính thức. Chương trình mới được đánh dấu chưa xác minh; mã `FILE-…` chỉ là mã nội bộ theo dòng, không phải mã xét tuyển chính thức. Với chương trình đã có nguồn đối chiếu và điểm 2026 trùng khớp, giữ thông tin xác minh trước đó. Không gán trạng thái đã xác minh cho toàn bộ file.

## Công thức và đối chiếu

1.150 dòng có thể dùng bộ cộng ba môn thang 30 theo mô tả trong file và phạm vi môn hiện hỗ trợ. 125 dòng còn lại lưu điểm gốc/công thức đầy đủ nhưng không tự tính theo công thức ba môn. Các công thức nhân hệ số, tổ hợp năng khiếu, ngoại ngữ khác, điểm trên 30 hoặc tên trùng chưa rõ phiên bản không bị áp sai thang.

Điểm các kỳ thi khác được giữ riêng; không coi điểm HSA, TSA, SPT, V-ACT là điểm THPT. File không ghi rõ mọi thang điểm nên những thang chưa rõ để trống, không tự suy ra từ giá trị tối đa. Điểm lịch sử từ file chưa kiểm chứng không tự bật cờ so sánh 3 năm; nguồn đã kiểm tra trước đây được giữ.

## Giao diện

- `/truong`: thẻ từng trường/cơ sở, tìm theo tên hoặc tên viết tắt. Chọn trường để xem danh sách ngành và mở bảng điểm/công thức của từng dòng.
- Admin → **Ngành và trường**: danh sách trường thay cho danh sách phẳng toàn bộ chương trình. Chọn trường rồi chọn ngành. Có tìm kiếm, bộ lọc hiện chương trình đang ẩn và bảng điểm nguồn trong form.
- Tra điểm cho phép xem cả dữ liệu nguồn chưa xác minh và có bộ lọc chỉ xem nguồn đã kiểm tra; liên kết từ một chương trình giữ đúng ID được chọn.

## Bộ tag

Có 45 tag định hướng khởi đầu trong `seed/orientation-tags-v1.json`, gồm lập trình, phần mềm, dữ liệu, AI, điện tử, cơ khí, giáo dục, ngôn ngữ, kinh doanh, tài chính, y tế… Admin tiếp tục được tạo/bổ sung tag.

Các tag tên ngành cũ ngừng tham gia khớp và mặc định ẩn khỏi danh sách; quan hệ cũ được lưu vào `retired_tag_assignments`. Quy tắc từ khóa và nhóm ngành gợi ý tối đa 6 tag cho mỗi đối tượng; đây là phân loại ứng dụng cần biên tập, không phải chứng nhận nội dung đào tạo. Không xóa liên kết chương trình đã xác nhận hoặc các quyết định loại trừ. Tag riêng do admin tạo được giữ lại.

## Cập nhật và sao lưu

Migration V9 và `SchoolDatasetBootstrap` áp dụng dữ liệu một lần theo khóa `admissions-35-schools-v1`, lưu báo cáo và checksum trong `catalog_dataset_upgrades`. Khởi động lại không nạp đè những thay đổi sau đó của admin. Các ID chương trình cũ khớp duy nhất được giữ; dữ liệu mẫu phát triển chưa chỉnh sửa được ẩn, không xóa ID hoặc lịch sử. Chương trình riêng năm 2027 không bị thay thế bởi dữ liệu năm 2026.

Trước khi cập nhật đã sao lưu database cục bộ vào `.cache/backups/huongnghiep-before-35-schools.dump`. Không dùng file Excel như bản sao lưu toàn bộ database.

Xuất Excel hiện có thêm sheet `DIEM_TU_FILE` chứa toàn bộ 1.275 dòng điểm gốc/công thức, để đối chiếu. Mẫu v1 vẫn chỉ nhập ngược các sheet chuẩn và phương thức THPT thang 30 có nguồn URL; `DIEM_TU_FILE` chưa phải sheet cập nhật tự động. Các phương thức/công thức ngoài phạm vi đó vẫn lưu đủ trong database và trang trường.

Nguồn Excel không bị sửa; các công thức phân loại có tham chiếu workbook ngoài không được thực thi. Chỉ đọc giá trị đã lưu cho trường phân loại, dùng nội dung nhóm/ngành để lập tag.
