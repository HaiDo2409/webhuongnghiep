# Quản lý trường

Mở admin → **Quản lý trường**.

- **Thêm trường**: nhập mã, tên, website (tùy chọn), trạng thái công khai. Mã dùng chữ A–Z, số, gạch ngang hoặc gạch dưới, từ 2–100 ký tự; không trùng kể cả với trường đang ẩn.
- **Sửa**: đổi tên, website, trạng thái. Mã trường giữ nguyên. Đổi tên đồng bộ tên hiển thị của các chương trình và tăng revision để ngăn lưu đè từ form cũ.
- **Ẩn trường**: giữ chương trình, điểm chuẩn, tag, quyết định liên kết và lịch sử. Trường và các chương trình của trường không xuất hiện trong danh sách công khai, kết quả tra điểm hoặc chương trình liên quan ở trang nghề.
- **Khôi phục**: hiện lại trường; từng chương trình vẫn giữ trạng thái công khai/ẩn trước đó.
- **Xóa trường**: chỉ dành cho trường chưa có chương trình, có bước xác nhận ngay trong giao diện. Trường đã có chương trình kể cả chương trình đang ẩn bị chặn xóa; dùng Ẩn trường thay thế.

Trong **Ngành và trường**, form chương trình chọn trường từ danh mục, không cần gõ lại tên. Trường mới chưa có chương trình vẫn xuất hiện trong danh mục quản trị và, nếu công khai, trang trường. Khi chọn trường đang ẩn, chương trình vẫn lưu được để chuẩn bị nội dung nhưng chưa xuất hiện công khai.

Migration V10 tạo bảng `schools` và khóa ngoại `programs.school_id`, chuyển 35 trường/cơ sở hiện có sang danh mục. Các mã/ID chương trình, điểm, tag và lịch sử không bị xóa. Mã trường được chuẩn hóa hoa thường; các cơ sở có mã khác nhau được giữ riêng.

API quản trị cần quyền admin và CSRF: `GET/POST /api/admin/schools`, `PUT/DELETE /api/admin/schools/{id}`. Cập nhật và xóa kiểm tra revision. Xóa còn kiểm tra dữ liệu phụ thuộc tại backend và khóa ngoại database, không chỉ dựa vào nút bị vô hiệu hóa ở giao diện. Các thao tác có nhật ký.

Các luồng tạo chương trình từ admin, Excel chuẩn và seed nguồn đều liên kết trường theo ID. Khi dùng file chuẩn cũ không có school ID, mã trường được đối chiếu với danh mục; trường mới được đăng ký nếu chưa có. Dữ liệu cũ thiếu ID vẫn được kiểm tra trạng thái trường theo mã để tránh hiện lại trường đang ẩn.

Trước cập nhật đã sao lưu database tại `.cache/backups/huongnghiep-before-school-management.dump`.
