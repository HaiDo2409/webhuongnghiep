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

Backend chạy tại `http://localhost:8080`. Flyway áp dụng migration trước khi Hibernate kiểm tra schema. Không sửa migration đã chạy; tạo file `V2__...sql` cho thay đổi tiếp theo. Không dùng `ddl-auto=update` trên database này.

Với máy hiện tại, database `huongnghiep` và database kiểm thử `huongnghiep_test` đã được khởi tạo bằng role riêng. Thông tin kết nối nằm trong `backend/.env`, được Git bỏ qua. Không chép mật khẩu vào README hoặc source code.

Tùy chọn Docker: sau khi đặt biến `SPRING_DATASOURCE_PASSWORD`, có thể dùng `docker compose up -d postgres` thay cho PostgreSQL cài trực tiếp. Không chạy hai PostgreSQL trên cùng cổng 5432.

## 3. Kích hoạt đăng nhập Google

Khung dùng Spring Security OAuth2 Login, Authorization Code Flow và OpenID Connect. Không có tài khoản admin/mật khẩu demo hay API bỏ qua đăng nhập.

1. Tạo OAuth client loại Web application trong dự án Google của đơn vị.
2. Cấu hình consent screen và tài khoản thử nghiệm nếu ứng dụng đang ở chế độ testing.
3. Với frontend chạy qua Vite, khai báo callback chính xác:
   `http://localhost:5173/login/oauth2/code/google`.
4. Điền `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` trong `backend/.env`.
5. Giữ `APP_ORIGIN=http://localhost:5173` khi phát triển và khởi động lại backend.
6. Mở trang `/login`, chọn Google. Sau khi thành công, về `/dashboard`.

Proxy Vite đã chuyển tiếp `/api`, `/oauth2`, `/login/oauth2`. Production cần chuyển tiếp cùng các đường dẫn, HTTPS, `COOKIE_SECURE=true`, origin/callback phù hợp và cấu hình forwarded headers cho proxy đáng tin cậy. Chưa có cấu hình triển khai production tự động trong khung.

Nếu không điền Google client, backend vẫn chạy và các tính năng công khai vẫn dùng được; nút Google hiển thị chưa sẵn sàng. Không tạo client giả để làm đăng nhập trông như đã hoạt động.

### Cấp admin đầu tiên

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
| `GET /api/auth/csrf` | Token/header CSRF của phiên |
| `GET /api/users/me` | Tài khoản và quyền hiện hành |
| `GET /oauth2/authorization/google` | Bắt đầu đăng nhập |
| `GET /login/oauth2/code/google` | Callback do Spring Security xử lý |
| `POST /api/logout` | Đăng xuất, cần CSRF |
| `GET /api/quizzes` | Bộ quiz xuất bản, cố định phiên bản vào phiên trình duyệt |
| `POST /api/quiz-results` | Kiểm tra đầy đủ đáp án và chấm ở backend |
| `GET /api/me/quiz-results` | Lịch sử của mình, tối đa 50 bài gần nhất |
| `POST /api/me/quiz-results/claim` | Nhận kết quả tạm gần nhất vào tài khoản |
| `GET /api/careers`, `GET /api/programs` | Danh mục nghề/chương trình công khai |
| `POST /api/recommendations` | Xếp hạng theo Holland và tổng ba môn |
| `POST /api/admissions/search` | Cùng hợp đồng tra cứu đề xuất |
| `GET/PUT /api/me/profile` | Hồ sơ và điểm cá nhân có revision |
| `GET/POST/DELETE /api/me/bookmarks` | Xem, lưu hoặc xóa toàn bộ yêu thích của mình |
| `DELETE /api/me/bookmarks/{id}` | Xóa một yêu thích |
| `GET/POST /api/admin/quizzes` | Danh sách và tạo bản nháp quiz |
| `POST /api/admin/quizzes/{id}/publish` | Xuất bản, lưu trữ phiên bản công khai trước đó |
| `GET/POST /api/admin/programs` | Danh sách và tạo chương trình |
| `PUT /api/admin/programs/{id}` | Sửa chương trình, cần revision đúng |
| `GET /api/admin/users` | Danh sách tài khoản |
| `PUT /api/admin/users/{id}/access` | Đổi role/trạng thái; không tự đổi quyền của mình |
| `GET /api/admin/audit-logs` | 100 sự kiện quản trị gần nhất |

Các POST/PUT/DELETE phải lấy CSRF token và gửi lại bằng header do `/api/auth/csrf` trả về. Frontend đã tự xử lý việc này và dùng cookie phiên HttpOnly. Không lưu token đăng nhập trong localStorage.

## 6. Lỗi thường gặp

- **Connection refused / password authentication failed:** kiểm tra dịch vụ PostgreSQL, cổng, role, quyền database và các biến datasource.
- **Nút Google chưa sẵn sàng:** điền cả client ID và secret rồi khởi động lại backend.
- **Google redirect URI mismatch:** callback phải trùng chính xác host, cổng, giao thức và đường dẫn đã đăng ký.
- **403 khi gửi dữ liệu:** kiểm tra CSRF, đăng nhập và quyền admin; không tắt CSRF để bỏ qua lỗi.
- **Không có quiz/ngành:** database sạch chưa nạp dữ liệu, hoặc admin chưa xuất bản. Seed chỉ chạy khi bật và bảng tương ứng còn rỗng.
- **Không dùng được kết quả quiz cũ trong phiên khác:** đăng nhập để lưu lịch sử và chọn lại kết quả sở hữu; không dùng ID kết quả của người khác.
- **Flyway cảnh báo PostgreSQL mới hơn phiên bản được kiểm chứng:** migration trên PostgreSQL 18 đã được chạy thử ở máy hiện tại; cần kiểm tra và cập nhật tương thích dependency trước khi triển khai production.
