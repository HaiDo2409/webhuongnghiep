# Tối ưu tra cứu xét tuyển

Ngày kiểm tra: 21/10/2026. Dữ liệu thực tế: 1.275 chương trình công khai năm 2026.

## Nguyên nhân và thay đổi

Trước đây, giao diện chỉ vẽ 15 thẻ nhưng API vẫn trả toàn bộ danh sách, gồm metadata Excel, lịch sử, giải thích; tài khoản đăng nhập còn lưu toàn bộ danh sách vào snapshot mỗi lần tra cứu.

Hiện tại:

- Giao diện gửi phân trang 15 mục. “Xem thêm” gọi trang kế tiếp và nối danh sách, không cuộn lên đầu.
- Server đọc các trường nhỏ phục vụ xếp hạng: tổ hợp, Holland, điểm chuẩn và cờ hỗ trợ công thức. Chỉ lấy dữ liệu chi tiết và lịch sử ba năm cho các mục trong trang cần trả về.
- Vẫn xếp hạng trên toàn bộ chương trình phù hợp với năm và bộ lọc. Quy tắc cộng điểm, giảm ưu tiên, xu hướng 50–30–20 và tương đồng Holland không đổi. ID là tiêu chí cuối để ổn định thứ tự khi tên/điểm bằng nhau.
- Truy vấn ghép nghề–chương trình chỉ lấy các cặp có tag chung đang hoạt động và loại trùng; chỉ trả hai ID cần tính Holland. Áp dụng loại trừ và trạng thái công khai/trường đang hoạt động. Liên kết thủ công và chế độ cũ không tham gia.
- Lọc tên ngành, nguồn đã xác minh và chương trình được chọn chạy trước phân trang. Gõ tên ngành có chờ 250 ms; yêu cầu cũ bị hủy/bỏ qua để tránh ghi đè kết quả mới.
- Với tra cứu phân trang của tài khoản đăng nhập, chỉ lưu snapshot trang đầu. Tải thêm không tạo lịch sử mới. Snapshot có `algorithmVersion=thpt-priority-trend-v2-paged` và input chứa tham số trang; không diễn giải đây là snapshot toàn bộ danh sách.
- Không dùng cache dữ liệu tuyển sinh. Mỗi trang đọc dữ liệu hiện tại; nếu quản trị viên cập nhật giữa các lần tải, nên tra cứu lại để đồng bộ danh sách. Giao diện loại mục trùng và theo dõi offset độc lập với số thẻ đã nối.

## Giao thức

`POST /api/recommendations` hoặc `/api/admissions/search`, giữ các trường input hiện có và thêm:

```json
{
  "page": {
    "offset": 0,
    "limit": 15,
    "major": "Công nghệ",
    "verifiedOnly": false,
    "programId": null
  }
}
```

`offset`: 0–1.000.000; `limit`: 1–50. `major` tối đa 255 ký tự, không phân biệt hoa/thường và giữ dấu tiếng Việt. UUID chương trình và dữ liệu phân trang được kiểm tra trước xử lý. Kết quả có `items`, `total`, `offset`, `hasMore`, cùng `id` và `calculationNote` hiện có. `total` là số **chương trình**, không phải số trường khác nhau. Hết dữ liệu trả mảng rỗng và `hasMore=false`.

Client cũ không gửi `page` vẫn nhận toàn bộ danh sách để tương thích; giao diện tra cứu và gợi ý từ kết quả quiz đã gửi phân trang. Quyền sử dụng bài Holland vẫn được kiểm tra ở mỗi yêu cầu.

## Đo thực tế

Cùng máy, qua Vite proxy `127.0.0.1:5173`, khách chưa đăng nhập, năm 2026, chế độ POINTS, Toán/Lý/Hóa cùng 9 điểm. Đây là thời gian HTTP đo bằng PowerShell, không phải thời gian render trình duyệt hoặc cam kết trên Azure.

| Trường hợp | Số mục trong phản hồi | Dung lượng | Thời gian |
|---|---:|---:|---:|
| Trước tối ưu, 3 lần | 1.275 | 3.577.298 byte | 1.346 / 1.089 / 969 ms |
| Sau tối ưu, lần đầu sau khởi động | 15 | 42.668 byte | 678 ms |
| Sau tối ưu, trang đầu, 2 lần tiếp | 15 | 42.668 byte | 136 / 153 ms |
| Sau tối ưu, offset 15 | 15 | 43.334 byte | 186 ms |
| Sau tối ưu, offset 30 | 15 | 43.916 byte | 136 ms |

Dung lượng trang đầu giảm khoảng 98,8%. Lần đầu khởi động vẫn có chi phí khởi tạo/JIT. Chưa dùng số đo POINTS để suy ra tốc độ chế độ Holland hoặc khi nhiều người truy cập đồng thời.

## Kiểm chứng

- So sánh nội dung hai trang đầu với danh sách đầy đủ: điểm, ưu tiên, thứ tự, giải thích, lịch sử và metadata Excel.
- Kiểm tra lọc trước phân trang, chọn đúng UUID chương trình, nguồn đã kiểm tra, công thức chưa hỗ trợ, hết trang, giới hạn input và không ghi thêm snapshot khi tải tiếp.
- So sánh truy vấn ghép nhanh với danh sách công khai, kiểm tra metadata chế độ cũ không đổi quy tắc tag và EXCLUDE luôn có hiệu lực.
- So sánh trang đầu với danh sách đầy đủ trong cả INTEREST/COMBINED bằng bài Holland của khách; khách khác không được dùng bài đó.
- Bộ kiểm thử chính và kiểm tra PostgreSQL riêng được chạy; kiểm thử cần Docker được bỏ qua vì môi trường không có Docker. Build TypeScript/Vite thành công. Không thay đổi schema hoặc dữ liệu danh mục trong đợt tối ưu này.
