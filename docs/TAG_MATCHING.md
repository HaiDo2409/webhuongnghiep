# Tự khớp nghề và chương trình theo tag

Bộ khởi đầu có **45 tag định hướng**, admin có thể bổ sung. Tag tên ngành cũ đã ngừng sử dụng và không tham gia khớp.

## Thao tác admin

1. Trong **Quản lý tag dùng chung**, tạo, sửa tên hoặc ngừng sử dụng tag. Đổi tên không đổi ID/quan hệ.
2. Trong **Ngành và trường**, mở chương trình và lưu **Tag của chương trình**.
3. Trong **Dữ liệu nghề & Excel**, chọn **Sửa nghề & tag**, gắn tag rồi bấm **Lưu tag nghề**. Nghề mới chỉ cần lưu thông tin trước để có ID; không cần chọn ngành/chương trình thủ công.
4. Xem **Chương trình tự khớp theo tag**: danh sách tự cập nhật khi lưu tag, có trường, năm, tag chung và mức khớp; hỗ trợ tìm kiếm.
5. Bấm **Loại trừ gợi ý** nếu chưa phù hợp; **Bỏ loại trừ** để trở về quy tắc khớp tag hiện tại. Không có bước xác nhận từng chương trình.

Thông tin nghề, tag và loại trừ có nút lưu riêng. Khi gặp xung đột revision, tải lại trước khi lưu tiếp. Nghề chưa có tag vẫn lưu được nhưng chưa có chương trình tự khớp.

## Quy tắc

- Cần ít nhất một **ID tag chung đang hoạt động**. Không ghép theo tên gần giống hay lấy danh sách ngành để thay thế tag.
- Mức khớp = số tag chung đang hoạt động / số tag đang hoạt động của nghề × 100. Tag dư bên chương trình không cộng thêm điểm. Đây không phải độ phù hợp Holland hoặc xác suất trúng tuyển.
- `EXCLUDE` loại chương trình khỏi gợi ý. `RESET` bỏ loại trừ; không tạo liên kết nếu không còn tag chung. Backend không nhận quyết định `INCLUDE` nữa.
- Nghề, chương trình hoặc trường đang ẩn không xuất hiện trong liên kết công khai. Tắt/gỡ tag làm gợi ý cập nhật ở lần đọc tiếp theo.
- Trang nghề và nguồn nghề dùng tính Holland cho chương trình áp dụng cùng quy tắc. Một cặp nghề–chương trình có nhiều tag chung chỉ được tính một lần.
- Danh sách admin gồm chương trình có tag chung và các chương trình đã loại trừ để có thể khôi phục. Không tải chương trình khác để chọn thủ công.

## Dữ liệu cũ và Excel

- Giữ danh mục ngành, tên ngành tham khảo từ Excel, lịch sử nhập và các bảng liên kết cũ để bảo toàn thông tin đã lưu.
- `MAJOR`/`EXPLICIT`, liên kết chọn tay và quyết định `INCLUDE` cũ không còn tham gia gợi ý. Mọi nghề dùng tag, kể cả khi metadata cũ chưa sửa. Lưu nghề sẽ ghi chế độ `TAG`.
- Form nghề không gửi lựa chọn ngành/chương trình. Những trường lựa chọn cũ từ client cũ không tạo liên kết; backend giữ nguyên thông tin ngành tham khảo đã nhập.
- Excel v1 vẫn có cột ngành đại học tham khảo, nhưng ô này được phép trống để nghề tạo bằng tag có thể xuất rồi nhập lại. Cột này không quyết định ghép nghề–chương trình. Tag/loại trừ quản lý riêng trên admin; Excel v1 chưa xuất/nhập các quan hệ này và không thay thế sao lưu PostgreSQL.
- Không có migration xóa/chuyển đổi hàng loạt trong lần thay đổi này. Bảng tag/revision hiện tại tiếp tục được dùng. Sửa dữ liệu cần admin, CSRF và có audit.
