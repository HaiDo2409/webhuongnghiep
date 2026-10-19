# Chạy project và cấu hình môi trường

## 1. Hai chế độ frontend

| Cấu hình trong `frontend/.env.local` | Hành vi |
|---|---|
| `VITE_USE_BACKEND=false` | Giao diện demo, dữ liệu có sẵn; không cần PostgreSQL |
| `VITE_USE_BACKEND=true` | Quiz, tra cứu, hồ sơ và admin gọi Spring Boot |

Sau khi sửa cấu hình, khởi động lại Vite. Trong chế độ backend, MSW không được khởi tạo để tránh API giả lập che mất API thật. Khi đổi từ demo sang backend trong cùng trình duyệt, tải lại trang để service worker cũ ngừng kiểm soát trang.

```powershell
cd frontend
npm install
npm run dev
```

Mở [website cục bộ](http://localhost:5173). Nên dùng nhất quán `localhost` thay vì trộn với `127.0.0.1`, đặc biệt khi đăng nhập Google dùng cookie.

## 2. Backend với PostgreSQL

Yêu cầu: Java 21, PostgreSQL và kết nối mạng lần đầu để Maven Wrapper tải Maven/dependency. Đã có `backend/mvnw` và `backend/mvnw.cmd`, không bắt buộc cài Maven riêng. Docker không bắt buộc. Backend không tự đọc `.env`; script `scripts/backend.ps1` đọc file cục bộ rồi truyền thành biến môi trường. Khi chạy bằng IDE, khai báo các biến trong run configuration.

1. Tạo role database riêng và database `huongnghiep`, cấp role đó làm chủ database. Không dùng quyền superuser cho ứng dụng.
2. Sao chép `backend/.env.example` thành `backend/.env`.
3. Điền URL JDBC, username và password cho role đó.
4. Dùng `SEED_ENABLED=true` nếu muốn nạp bộ dữ liệu phát triển lần đầu. Dữ liệu trường/điểm/hồ sơ Holland nhập từ mã cũ chưa được xác minh.
5. Từ thư mục gốc chạy:

```powershell
./scripts/backend.ps1 -Task run
```

Backend chạy tại `http://localhost:8080`. Flyway áp dụng migration trước khi Hibernate kiểm tra schema. Không sửa migration đã chạy; hiện có V1 (nền tảng), V2 (tài khoản mật khẩu), V3 (xóa mềm lịch sử) và V4 (xóa mềm bộ câu hỏi), tạo `V5__...sql` cho thay đổi tiếp theo. Không dùng `ddl-auto=update` trên database này.

Với máy hiện tại, database `huongnghiep` và database kiểm thử `huongnghiep_test` đã được khởi tạo bằng role riêng. Thông tin kết nối nằm trong `backend/.env`, được Git bỏ qua. Không chép mật khẩu vào README hoặc source code.

Tùy chọn Docker: sau khi đặt biến `SPRING_DATASOURCE_PASSWORD`, có thể dùng `docker compose up -d postgres` thay cho PostgreSQL cài trực tiếp. Không chạy hai PostgreSQL trên cùng cổng 5432.

## 3. Đăng nhập tài khoản/mật khẩu và Google

### 3.1. Tài khoản và mật khẩu

Mở `/login`, chọn **Đăng ký** để nhập họ tên, tài khoản, mật khẩu và xác nhận mật khẩu. Đăng ký thành công chuyển về form đăng nhập. Không cần cấu hình Google để dùng chức năng này.

- Tài khoản dài 3–40 ký tự: chữ không dấu, số, dấu chấm, gạch dưới/gạch ngang; lưu dưới dạng chữ thường, đăng nhập không phân biệt hoa/thường.
- Mật khẩu ít nhất 8 ký tự, tối đa 72 byte UTF-8; lưu bằng BCrypt, không lưu mật khẩu rõ trong database hoặc phiên đăng nhập.
- Đăng ký công khai luôn là `STUDENT`; không nhận quyền admin từ nội dung request. Tên `admin` và `administrator` dành cho quản trị.
- Spring Security xác thực mật khẩu, đổi session ID, làm mới CSRF và lưu SecurityContext vào Spring Session JDBC. Sau tải lại trang vẫn dùng phiên đã xác thực.
- Đăng nhập sai hoặc tài khoản khóa trả lỗi chung; có giới hạn 10 lần thử/15 phút cho mỗi cặp IP/tài khoản. Đăng ký giới hạn 10 lần/15 phút theo IP. Bộ đếm hiện trong bộ nhớ một backend; triển khai nhiều server cần kho dùng chung.
- Chưa có quên mật khẩu, xác minh email hoặc tự liên kết tài khoản Google với tài khoản mật khẩu.

**Admin cục bộ trên máy hiện tại:** tài khoản `admin`; thông tin đăng nhập riêng nằm trong `.cache/admin-login.txt` (file bị loại khỏi Git). Truy cập `/login`, đăng nhập rồi mở `/admin`, hoặc chọn **Quản trị nội dung** từ trang cá nhân/menu tài khoản.

Để tạo admin trên môi trường mới: tự đặt `LOCAL_ADMIN_ENABLED=true`, `LOCAL_ADMIN_USERNAME` và `LOCAL_ADMIN_PASSWORD` trong cấu hình riêng trước khi khởi động backend. Không có mật khẩu mặc định trong mã. Bootstrap chỉ tạo tài khoản chưa tồn tại, không đổi mật khẩu hoặc nâng quyền tài khoản cũ. Sau khi tạo xong, tắt `LOCAL_ADMIN_ENABLED`. Đây là tài khoản database thật của ứng dụng, không phải cơ chế bỏ qua xác thực.

### 3.2. Google (tùy chọn)

Khung dùng Spring Security OAuth2 Login, Authorization Code Flow và OpenID Connect; hoạt động song song với tài khoản/mật khẩu.

1. Tạo OAuth client loại Web application trong dự án Google của đơn vị.
2. Cấu hình consent screen và tài khoản thử nghiệm nếu ứng dụng đang ở chế độ testing.
3. Với frontend chạy qua Vite, khai báo callback chính xác:
   `http://localhost:5173/login/oauth2/code/google`.
4. Điền `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` trong `backend/.env`.
5. Giữ `APP_ORIGIN=http://localhost:5173` khi phát triển và khởi động lại backend.
6. Mở trang `/login`, chọn Google. Sau khi thành công, về `/dashboard`.

Proxy Vite đã chuyển tiếp `/api`, `/oauth2`, `/login/oauth2`. Production cần chuyển tiếp cùng các đường dẫn, HTTPS, `COOKIE_SECURE=true`, origin/callback phù hợp và cấu hình forwarded headers cho proxy đáng tin cậy. Chưa có cấu hình triển khai production tự động trong khung.

Nếu không điền Google client, backend và đăng nhập mật khẩu vẫn hoạt động; nút Google được ẩn cho đến khi cấu hình đủ. Không tạo client giả để làm đăng nhập trông như đã hoạt động.

### Cấp admin qua Google

- Đặt `BOOTSTRAP_ADMIN_GOOGLE_SUB` bằng đúng định danh `sub` của tài khoản Google trước lần đăng nhập đầu tiên của tài khoản đó. Không đặt bằng email.
- Nếu tài khoản đã đăng nhập với quyền học sinh, người vận hành database có thể cấp quyền bằng thao tác quản trị có kiểm soát. Ví dụ chạy câu lệnh tham số hóa theo **UUID đã xác định**: `UPDATE app_users SET role = 'ADMIN' WHERE id = :user_id;`.
- Định danh Google và UUID nội bộ nằm trong bảng `app_users`; không công khai chúng trong log hoặc ảnh chụp cấu hình.
- Sau đó truy cập `/admin`. Role được backend đọc lại cho mỗi thao tác, không tin role trình duyệt gửi lên.
- API cấp/thu hồi quyền đã có; giao diện quản lý người dùng đầy đủ còn nằm trong backlog.

## 4. Kiểm thử và build

```powershell
# Kiểm thử Java không cần PostgreSQL/Docker
./scripts/backend.ps1 -Task test

# Đóng gói backend
./scripts/backend.ps1 -Task package

# Kiểm tra frontend
npm run lint --prefix frontend
npm run build --prefix frontend
```

`LocalPostgresTest` mặc định bị bỏ qua. Để kiểm thử database thật, dùng database thử nghiệm riêng, không trỏ vào database đang sử dụng:

```powershell
$env:LOCAL_POSTGRES_TEST='true'
$env:TEST_DATABASE_URL='jdbc:postgresql://localhost:5432/huongnghiep_test'
$env:TEST_DATABASE_USERNAME='<role database thử nghiệm>'
$env:TEST_DATABASE_PASSWORD='<mật khẩu role đó>'
./scripts/backend.ps1 -Task test
```

Test Flyway có thể tạo schema và dữ liệu phát triển trong database thử nghiệm. Các thao tác kiểm thử nghiệp vụ được rollback. `PostgresIntegrationTest` là lựa chọn chạy PostgreSQL container khi có Docker; tự bỏ qua nếu không có Docker.

## 5. API hiện có

| API | Chức năng |
|---|---|
| `GET /api/auth/config` | Kiểm tra Google đã được cấu hình |
| `POST /api/auth/register` | Tạo tài khoản học sinh với mật khẩu băm, cần CSRF |
| `POST /api/auth/login` | Đăng nhập tài khoản/mật khẩu, tạo phiên và đổi session ID, cần CSRF |
| `GET /api/auth/csrf` | Token/header CSRF của phiên |
| `GET /api/users/me` | Tài khoản và quyền hiện hành |
| `GET /oauth2/authorization/google` | Bắt đầu đăng nhập |
| `GET /login/oauth2/code/google` | Callback do Spring Security xử lý |
| `POST /api/logout` | Đăng xuất, cần CSRF |
| `GET /api/quizzes` | Bộ quiz xuất bản, cố định phiên bản vào phiên trình duyệt |
| `POST /api/quiz-results` | Kiểm tra đầy đủ đáp án và chấm ở backend |
| `GET /api/me/quiz-results` | Lịch sử của mình, tối đa 50 bài gần nhất |
| `GET /api/me/quiz-results/{id}` | Xem lại kết quả thuộc tài khoản hiện tại |
| `DELETE /api/me/quiz-results/{id}` | Xóa mềm kết quả của mình khỏi lịch sử và tra cứu |
| `POST /api/me/quiz-results/{id}/restore` | Hoàn tác xóa kết quả của mình |
| `POST /api/me/quiz-results/claim` | Nhận kết quả tạm gần nhất vào tài khoản |
| `GET /api/careers`, `GET /api/programs` | Danh mục nghề/chương trình công khai |
| `POST /api/recommendations` | Xếp hạng theo Holland và tổng ba môn |
| `POST /api/admissions/search` | Cùng hợp đồng tra cứu đề xuất |
| `GET/PUT /api/me/profile` | Hồ sơ và điểm cá nhân có revision |
| `GET/POST/DELETE /api/me/bookmarks` | Xem, lưu hoặc xóa toàn bộ yêu thích của mình |
| `DELETE /api/me/bookmarks/{id}` | Xóa một yêu thích |
| `GET/POST /api/admin/quizzes` | Danh sách và tạo bản nháp quiz |
| `DELETE /api/admin/quizzes/{id}?revision=...` | Xóa mềm bản nháp/bản lưu trữ, giữ ít nhất một bộ mỗi loại |
| `POST /api/admin/quizzes/{id}/restore` | Hoàn tác xóa bộ câu hỏi, cần quyền admin |
| `POST /api/admin/quizzes/{id}/publish` | Xuất bản, lưu trữ phiên bản công khai trước đó |
| `GET/POST /api/admin/programs` | Danh sách và tạo chương trình |
| `PUT /api/admin/programs/{id}` | Sửa chương trình, cần revision đúng |
| `GET /api/admin/users` | Danh sách tài khoản |
| `PUT /api/admin/users/{id}/access` | Đổi role/trạng thái; không tự đổi quyền của mình |
| `GET /api/admin/audit-logs` | 100 sự kiện quản trị gần nhất |

Các POST/PUT/DELETE phải lấy CSRF token và gửi lại bằng header do `/api/auth/csrf` trả về. Frontend đã tự xử lý việc này và dùng cookie phiên HttpOnly. Không lưu token đăng nhập trong localStorage.

### Tra cứu có hoặc không dùng quiz

Điểm và năm dự tuyển đã lưu trong **Hồ sơ → Thông tin học tập** được tự điền khi tài khoản mở trang tra cứu. Người dùng có thể sửa cho lần tra cứu hiện tại; thay đổi này không tự ghi đè hồ sơ. Nếu người dùng đang nhập khi yêu cầu tải hồ sơ trả về, phần đang nhập được giữ nguyên.

### Xem lại lịch sử và tạo phiên bản quiz

- Tại `/dashboard`, chọn tên bài hoặc **Xem kết quả** để mở kết quả chi tiết; URL có thể tải lại hoặc mở trực tiếp khi đăng nhập đúng tài khoản.
- **Xóa kết quả** ẩn bài khỏi lịch sử và ngăn sử dụng để tra cứu. Có nút **Hoàn tác** trên trang ngay sau khi xóa. API khôi phục kiểm tra quyền sở hữu; dữ liệu chưa bị xóa vật lý.
- Tại **Quản trị nội dung → Bộ trắc nghiệm**, chọn **Dùng làm mẫu** hoặc **Sao chép phiên bản** để tạo nội dung cho bản mới. Hoặc chọn **Tạo khung đủ nhóm** và nhập nội dung.
- Holland cần đủ 6 nhóm, Đa trí tuệ cần đủ 8 nhóm, mỗi nhóm ít nhất một câu có nội dung. Giao diện liệt kê nhóm còn thiếu và số câu chưa nhập trước khi lưu. **Lưu bản nháp** tạo phiên bản mới; chọn **Dùng bộ này** ở danh sách để học sinh sử dụng. Có thể chọn bản nháp hợp lệ hoặc chọn lại bản đã lưu trữ; bộ đang dùng trước đó của cùng loại tự chuyển sang lưu trữ. Mỗi loại chỉ có một bộ đang dùng.
- **Xóa bộ câu hỏi** áp dụng cho bản nháp hoặc bản đã lưu trữ; luôn giữ ít nhất một bộ Holland và một bộ Đa trí tuệ. Với bộ đang công khai, cần chọn **Dùng bộ này** ở một bộ thay thế cùng loại trước, rồi xóa bản cũ. Backend kiểm tra quyền admin, revision và khóa các phiên bản cùng loại khi xóa/xuất bản để tránh hai quản trị viên xóa đồng thời làm mất bộ cuối cùng.
- Có **Hoàn tác xóa bộ câu hỏi** ngay trên trang. Xóa mềm giữ nội dung gốc cho lịch sử bài làm và đề xuất; số phiên bản tiếp theo không dùng lại số của bản đã xóa.

### Lựa chọn kết quả khi tra cứu

Trên `/xet-tuyen`, công tắc **Dùng kết quả trắc nghiệm Holland** thể hiện lựa chọn trực tiếp. Khi tắt, bộ chọn kết quả bị vô hiệu hóa, sắp xếp theo tổng điểm, request gửi `quizResultId=null` và mức phù hợp hiển thị chưa đánh giá. Khi bật và đã chọn kết quả, có thể sắp xếp theo hướng nghiệp/kết hợp. Bật nhưng chưa có bài thì vẫn tra cứu theo điểm, kèm hướng dẫn làm hoặc chọn bài đã lưu. Đổi công tắc xóa kết quả hiển thị cũ để tránh nhầm chế độ; tổng điểm môn học không thay đổi.

## 6. Lỗi thường gặp

- **Connection refused / password authentication failed:** kiểm tra dịch vụ PostgreSQL, cổng, role, quyền database và các biến datasource.
- **Nút Google chưa sẵn sàng:** điền cả client ID và secret rồi khởi động lại backend.
- **Google redirect URI mismatch:** callback phải trùng chính xác host, cổng, giao thức và đường dẫn đã đăng ký.
- **403 khi gửi dữ liệu:** kiểm tra CSRF, đăng nhập và quyền admin; không tắt CSRF để bỏ qua lỗi.
- **Không có quiz/ngành:** database sạch chưa nạp dữ liệu, hoặc admin chưa xuất bản. Seed chỉ chạy khi bật và bảng tương ứng còn rỗng.
- **Không dùng được kết quả quiz cũ trong phiên khác:** đăng nhập để lưu lịch sử và chọn lại kết quả sở hữu; không dùng ID kết quả của người khác.
- **Flyway cảnh báo PostgreSQL mới hơn phiên bản được kiểm chứng:** migration trên PostgreSQL 18 đã được chạy thử ở máy hiện tại; cần kiểm tra và cập nhật tương thích dependency trước khi triển khai production.
