# Bản đồ Hướng nghiệp — Hiểu mình, mở tương lai

Website hướng nghiệp dành cho học sinh THPT Chuyên Biên Hòa, giúp bạn khám phá sở thích, tìm hiểu ngành học và bắt đầu xây dựng hướng đi cho mình.

Bạn không cần biết ngay mình sẽ trở thành ai. Hãy bắt đầu từ những điều khiến bạn thấy hứng thú.

## Website giúp bạn làm gì?

- **Khám phá bản thân:** làm trắc nghiệm Holland hoặc Đa trí tuệ, mỗi màn hình một câu hỏi, có thanh tiến độ và hướng dẫn thân thiện.
- **Hiểu kết quả:** xem các nhóm nổi bật, gợi ý ngành học hoặc hướng học và lộ trình kỹ năng để tìm hiểu thêm.
- **Tìm ngành và trường:** nhập điểm môn học, kết hợp sở thích nếu muốn để sắp xếp các lựa chọn gần với bạn hơn.
- **Theo dõi hành trình:** tạo tài khoản để lưu thông tin học tập, xem lại lịch sử trắc nghiệm và lưu những lựa chọn yêu thích.
- **Khám phá thêm:** đọc nội dung hướng nghiệp, tìm tài nguyên và các bước học kỹ năng.

Giao diện Bản đồ Hướng nghiệp tối giản với Deep Blue và Neon Teal, phù hợp cả máy tính lẫn điện thoại. Trang chủ có bản đồ STEM tương tác; mục Ngành nghề hỗ trợ tìm kiếm, lọc lĩnh vực, khoảng lương tham khảo và kỹ năng.

Danh mục mới có **378 nghề và 41 nhóm**, đọc từ PostgreSQL. Kỹ năng và hồ sơ sở thích được bổ sung từ O*NET 31.0; thông tin có đường dẫn nguồn. Bạn có thể chọn bài Holland để xem mức tương đồng sở thích của từng nghề và ưu tiên những nghề gần với mình hơn. Có thêm lương tham khảo cho **34 nghề**, đối chiếu nguồn Việt Nam năm 2026; mức suy từ vị trí tương đương ghi rõ **Ước tính**, khu vực và kinh nghiệm khi mở chi tiết. Nghề chưa có căn cứ phù hợp vẫn để đang bổ sung. [Nguồn và cách cập nhật lương](docs/SALARY_REFERENCES.md).

## Cách hoạt động

Admin có mục **Quản lý trường** để thêm, sửa, ẩn và khôi phục trường. Chỉ xóa hẳn trường chưa có chương trình; trường đang có dữ liệu được ẩn để giữ điểm chuẩn và lịch sử. Khi thêm chương trình, chọn trường từ danh mục có sẵn.

Nghề và chương trình đào tạo dùng chung bộ tag để gợi ý liên kết. Admin gắn tag và xem chương trình tự khớp; có thể loại trừ hoặc khôi phục gợi ý, không cần chọn ngành/chương trình thủ công. Mức khớp tag khác với độ phù hợp Holland của học sinh. [Cách quản lý tag](docs/TAG_MATCHING.md).

### 1. Khám phá bản thân

Mở **Trắc nghiệm**, chọn một trong hai bài:

| Bài trắc nghiệm | Giúp bạn tìm hiểu |
|---|---|
| **Holland RIASEC** | Sáu nhóm sở thích và những ngành học bạn có thể muốn khám phá |
| **Đa trí tuệ** | Những khả năng nổi bật và các hướng học, kỹ năng để phát triển |

Trả lời từng câu theo cảm nhận của bạn. Có thể quay lại để đổi đáp án trước khi nộp. Kết quả hiển thị nhóm nổi bật, điểm từng nhóm và những bước gợi ý tiếp theo.

Không có đáp án đúng hay sai. Kết quả là điểm khởi đầu để trải nghiệm và tìm hiểu, không phải kết luận cố định về bản thân.

### 2. Tìm ngành và trường

Mở **Tra điểm → Điểm thi THPT**, nhập điểm các môn và năm dự tuyển. Nếu đã lưu thông tin học tập trong hồ sơ, website tự điền các thông tin đó để bạn không cần nhập lại.

Bạn có thể bật hoặc tắt **Dùng kết quả trắc nghiệm Holland**:

- **Tắt:** tra cứu theo điểm môn học.
- **Bật:** chọn bài Holland đã làm để kết hợp sở thích; có thể ưu tiên theo điểm, theo sở thích hoặc kết hợp cả hai.

Holland giúp thay đổi thứ tự gợi ý, không cộng thêm vào điểm môn học. Mỗi chương trình hiển thị thông tin trường/ngành, tổng điểm tổ hợp có thể tính được, mức tương đồng Holland khi có và mốc điểm tham khảo.

Với năm **2026**, website tính tổng ba môn không hệ số và ưu tiên khu vực/đối tượng theo thông tin tự khai, có giảm ưu tiên từ 22,5/30. Khi admin đã bổ sung đủ ba năm điểm chuẩn có nguồn và xác nhận tương thích, website hiển thị mốc xu hướng theo trọng số **50%–30%–20%**, cùng ba mức **Thấp hơn / Gần / Cao hơn mốc**. Thiếu dữ liệu sẽ ghi rõ năm còn thiếu.

Hai tab **Đánh giá năng lực** và **Xét tuyển kết hợp** đã tính điểm theo một số quy tắc **Ngoại thương 2026**: HSA, V-ACT, TSA cho nhóm chương trình được hỗ trợ; học bạ từng môn lớp 10–12 kết hợp IELTS Academic. Chọn đúng nhóm chương trình để xem công thức, điểm ưu tiên, từng bước tính và các điều kiện đã kiểm tra. Kết quả được lưu kèm phiên bản quy tắc khi đăng nhập.

**Lưu ý:** danh mục ngành/trường còn có dữ liệu mẫu. Phần THPT phổ thông chưa áp dụng hệ số hoặc công thức riêng; các bộ tính Ngoại thương chưa tính điểm thưởng giải thưởng, chưa thẩm định hồ sơ và chưa đối chiếu lịch sử riêng từng mã ngành. Chưa hỗ trợ quy đổi riêng của Bách khoa, ĐH Công nghệ hoặc Kinh tế Quốc dân. Website không công bố xác suất đỗ hay thay thế kết quả xét tuyển của trường.

Danh mục đã bổ sung **1.275 dòng chương trình tại 35 trường/cơ sở** từ file điểm chuẩn, với điểm THPT 2024–2026 và các kỳ thi ĐGNL khi có. Mở **Trường**, chọn trường rồi xem ngành, điểm chuẩn và công thức. Dữ liệu nguồn chưa mặc định xác minh; có thể bật bộ lọc chỉ xem nguồn đã kiểm tra. Công thức hoặc thang điểm chưa rõ được hiển thị để đối chiếu, chưa tự tính sai thành tổng ba môn. Mốc xu hướng chỉ tính khi đủ ba năm được xác nhận tương thích. [Phạm vi dữ liệu](docs/DATASET_35_SCHOOLS.md).

### 3. Lưu lại hành trình của bạn

Chọn **Đăng nhập → Tạo tài khoản** để đăng ký bằng tài khoản và mật khẩu. Đổi mật khẩu tại **menu tài khoản ở góc phải → Đổi mật khẩu**; sau khi đổi, đăng nhập lại bằng mật khẩu mới.

Trong **Hồ sơ**, bạn có thể:

- Nhập trường, lớp, năm dự tuyển và điểm môn học rồi bấm **Lưu hồ sơ**.
- Bấm tên bài hoặc **Xem kết quả** trong lịch sử để mở lại kết quả chi tiết.
- Chọn **Dùng kết quả này để tra cứu** với bài Holland.
- Xóa kết quả khỏi lịch sử và hoàn tác ngay trên trang nếu cần.

Bạn có thể làm trắc nghiệm trước khi đăng nhập. Để giữ lịch sử và tiếp tục trên thiết bị khác, hãy đăng nhập và mở hồ sơ để nhận kết quả gần nhất trong phiên.

### 4. Bắt đầu từ một kỹ năng nhỏ

Từ trang chủ hoặc trang chi tiết nghề, mở **Lộ trình kỹ năng** để tìm các bước học và tài nguyên tham khảo. Bạn cũng có thể xem **Góc cảm hứng** hoặc lưu nghề/chương trình vào danh sách yêu thích để quay lại tìm hiểu sau.

### Dành cho quản trị viên

Tài khoản admin có mục **Quản trị nội dung** để cập nhật chương trình tại các trường và quản lý bộ trắc nghiệm.

Admin có thể tạo bộ câu hỏi từ mẫu, lưu bản nháp và bấm **Dùng bộ này** để chọn phiên bản cho học sinh làm. Mỗi loại có một bộ đang dùng; có thể chọn lại bộ cũ đã lưu trữ. Bộ câu hỏi được xóa bằng cơ chế xóa mềm, có hoàn tác và vẫn giữ nguyên lịch sử bài làm. Hệ thống giữ ít nhất một bộ Holland và một bộ Đa trí tuệ.

Trong **Ngành và trường**, chọn một chương trình đã lưu rồi xuống **Lịch sử điểm chuẩn** để nhập điểm từng năm/tổ hợp và đường dẫn công bố. Chỉ bật xác nhận nguồn và khả năng so sánh sau khi đã kiểm tra. Đây là quản lý dữ liệu đầu vào; chức năng admin tự tạo công thức tính mới chưa triển khai.

Mục **Dữ liệu nghề & Excel** cho phép tải mẫu chuẩn kèm quy tắc từng cột, xuất dữ liệu hiện tại để sửa và nhập lại. Hỗ trợ file nghề 7 cột ban đầu hoặc mẫu nhiều sheet liên kết nghề–ngành–chương trình–điểm chuẩn. Luồng nhập gồm **tải file → xem trước thêm/sửa/lỗi → xác nhận nhập**, có lịch sử và hoàn tác nếu chưa có cập nhật tiếp. Hướng dẫn đầy đủ tại [Quy tắc nhập Excel](docs/EXCEL_IMPORT.md).

## Cách chạy chương trình

Website gồm giao diện, backend Java/Spring Boot và database PostgreSQL. Cần chạy cả giao diện lẫn backend để sử dụng đầy đủ chức năng.

### Chuẩn bị

- **Node.js:** phiên bản `20.19.x` trở lên trong nhánh 20, hoặc `22.12.0` trở lên.
- **Java:** JDK 21.
- **PostgreSQL:** đã cài đặt và dịch vụ đang chạy.

Project có sẵn Maven Wrapper, không bắt buộc cài Maven riêng. Lần cài thư viện đầu tiên cần có kết nối mạng.

### Chạy trên máy hiện tại đã cấu hình

Mở **hai cửa sổ PowerShell**.

**Cửa sổ 1 — chạy backend:**

```powershell
cd D:\HungCao\webhuongnghiep
.\scripts\backend.ps1 -Task run
```

Chờ xuất hiện dòng `Started CareerGuidanceApplication`.

**Cửa sổ 2 — chạy giao diện:**

```powershell
cd D:\HungCao\webhuongnghiep\frontend
npm run dev
```

Sau đó mở **[http://localhost:5173](http://localhost:5173)**.

Giữ hai cửa sổ Terminal mở trong lúc sử dụng. Nhấn **Ctrl + C** trong từng cửa sổ để dừng chương trình.

### Thiết lập lần đầu trên máy mới

Chạy các lệnh dưới đây từ thư mục gốc project. Nếu đã có file cấu hình riêng, giữ lại file đó thay vì sao chép đè.

**1. Cài thư viện và tạo cấu hình mẫu:**

```powershell
npm ci --prefix frontend
Copy-Item frontend/.env.example frontend/.env.local
Copy-Item backend/.env.example backend/.env
```

**2. Bật kết nối backend** trong `frontend/.env.local`:

```dotenv
VITE_USE_BACKEND=true
FRONTEND_PORT=5173
APP_PORT=8080
```

**3. Tạo database** trong PostgreSQL bằng tài khoản có quyền tạo role/database. Thay mật khẩu ví dụ bằng mật khẩu riêng:

```sql
CREATE ROLE huongnghiep LOGIN PASSWORD 'replace-with-your-own-password';
CREATE DATABASE huongnghiep OWNER huongnghiep;
```

**4. Điền kết nối** trong `backend/.env`:

```dotenv
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/huongnghiep
SPRING_DATASOURCE_USERNAME=huongnghiep
SPRING_DATASOURCE_PASSWORD=replace-with-your-own-password
APP_ORIGIN=http://localhost:5173
SEED_ENABLED=true
COOKIE_SECURE=false
LOCAL_ADMIN_ENABLED=false
```

Mật khẩu phải khớp với role PostgreSQL vừa tạo. Khi backend khởi động, chương trình tự tạo bảng và nạp dữ liệu mẫu ban đầu nếu các danh mục còn rỗng.

**5. Chạy backend và giao diện** theo hướng dẫn hai cửa sổ PowerShell phía trên. Nếu lưu project ở thư mục khác, thay đường dẫn trong lệnh cho phù hợp.

### Tạo admin trên máy mới

Trước khi khởi động backend lần đầu, đặt trong `backend/.env`:

```dotenv
LOCAL_ADMIN_ENABLED=true
LOCAL_ADMIN_USERNAME=admin
LOCAL_ADMIN_PASSWORD=replace-with-a-strong-password
```

Sau khi tạo thành công, đổi lại `LOCAL_ADMIN_ENABLED=false`. Đăng nhập tại `/login`, rồi mở `/admin`. Không có mật khẩu admin mặc định; máy phát triển hiện tại đã có tài khoản riêng và không cần tạo lại.

### Khi gặp lỗi kết nối

Nếu website báo **“Chưa kết nối được máy chủ”**, kiểm tra:

1. PostgreSQL có đang chạy không.
2. Terminal backend đã hiện `Started CareerGuidanceApplication` chưa.
3. Thông tin kết nối trong `backend/.env` có đúng không.
4. `frontend/.env.local` đã đặt `VITE_USE_BACKEND=true` chưa.

Sau khi sửa cấu hình, khởi động lại dịch vụ tương ứng và tải lại trang.
