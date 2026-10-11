# GocTriThuc · Bản đồ Hướng Nghiệp

> **THPT Chuyên Biên Hòa** – Hệ thống hướng nghiệp tích hợp: Trắc nghiệm Holland RIASEC, Tra cứu Xét tuyển, Bản tin và Bản đồ Kỹ năng STEM.

---

## 🚀 Chạy nhanh — Frontend Only (Bản đồ Hướng Nghiệp)

> ✅ Không cần Backend, không cần Docker, không cần đăng nhập.  
> Chỉ cần **Node.js v18+**. Kiểm tra: `node -v`

**Bước 1 — Vào thư mục frontend:**
```bash
cd frontend
```

**Bước 2 — Cài thư viện** _(chỉ lần đầu)_:
```bash
npm install
```

**Bước 3 — Khởi chạy:**
```bash
npm run dev
```

**Bước 4 — Mở trình duyệt:** http://localhost:5173

| Trang | URL |
|---|---|
| 🏠 Trang chủ | http://localhost:5173/ |
| 🧠 Trắc nghiệm Holland | http://localhost:5173/trac-nghiem |
| 📊 Tra cứu Xét tuyển | http://localhost:5173/xet-tuyen |
| 📰 Bản tin | http://localhost:5173/ban-tin |
| 🗺️ Bản đồ Kỹ năng | http://localhost:5173/ky-nang |

> Để dừng: nhấn **Ctrl + C** trong terminal.

---

## 👥 Thành viên dự án

| Vai trò               | Họ và tên        | Nơi công tác    | Email                             |
| --------------------- | ---------------- | --------------- | --------------------------------- |
| Quản lý dự án         | Trần Tuấn Anh    | ĐH Bách Khoa HN | <anh.tt2416124@sis.hust.edu.vn>   |
| Trưởng nhóm Kỹ thuật  | Nguyễn Công Vinh | ĐH Bách Khoa HN | <vinh.nc2400083@sis.hust.edu.vn>  |
| Thành viên phát triển | Phạm Văn Sâm     | ĐH Bách Khoa HN | <sam.pv2400114@sis.hust.edu.vn>   |
| Thành viên phát triển | Vũ Hoàng Tuấn    | ĐH Bách Khoa HN | <tuan.vh2400080@sis.hust.edu.vn>  |
| Chuyên viên Phân tích | Lê Thành Trung   | ĐH Bách Khoa HN | <trung.lt2400076@sis.hust.edu.vn> |

---

## 🛠️ Cài đặt đầy đủ (Full-stack với Backend)

### Yêu cầu hệ thống

- Java 21+
- Node.js v18+
- Docker & Docker Compose

### Bước 0 – Cấu hình biến môi trường

```bash
# Tạo file .env từ mẫu
cp .env.example .env
# Mở .env và điền thông tin: POSTGRES_PASSWORD, OAuth Google...
```

### Bước 1 – Khởi chạy Database (PostgreSQL)

```bash
docker compose -f docker-compose.dev.yml up -d
```

### Bước 2 – Chạy Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
# Windows: mvnw.cmd spring-boot:run
```

Sau khi backend chạy:
- **Swagger UI**: http://localhost:8080/swagger-ui/index.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

> Tài liệu API chỉ hoạt động ở môi trường dev, tự động tắt trên Production.

### Bước 3 – Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

Truy cập: **http://localhost:5173**

## CI/CD và Chạy Production

Dự án đã được thiết lập các GitHub Workflows tự động:

- **Backend/Frontend CI**: Tự động kiểm tra code format và chạy build/test khi
  có thay đổi trên nhánh `main`.
- **CodeQL**: Tự động phân tích bảo mật tìm các lỗ hổng (như SQL Injection, XSS)
  cài đặt hàng tuần theo lịch hoặc khi có Push/PR lên `main`.
- **Dependabot**: Trình quản lý thư viện tự động đánh giá và tạo Pull Request
  nâng cấp phiên bản định kỳ hàng tuần.
- **Docker Build & Publish**: Khi được cập nhật lên `main`, hệ thống tự động
  build toàn bộ ứng dụng thành một Docker image Full-stack và đẩy lên GitHub
  Container Registry (GHCR).

### Hướng dẫn deploy trên server (Production)

Nhờ việc Docker image đã được build tự động trên platform GitHub Actions, server
của bạn không cần cài Node.js, Maven hay JDK. Bạn chỉ cần thiết lập file cấu
hình các biến môi trường (`.env`) và chạy lệnh sau trên server:

```bash
# Kéo Docker image mới nhất và khởi chạy cùng database
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## Các lưu ý trong quá trình phát triển

### Luật viết tên schema migrations

```
V{DATE_TIME}_{ISSUE_NUMBER}__{DESCRIPTION}.sql
```

Trong đó:

- `DATE_TIME`: Thời gian tạo migration theo định dạng `yyyyMMddHHmm` (ví dụ:
  `202406011230`).
- `ISSUE_NUMBER`: Số issue liên quan đến migration (ví dụ: `1`)
- `DESCRIPTION`: Mô tả ngắn gọn về nội dung của migration (ví dụ:
  `create_user_table`)

Tổng kết ta có: `V202406011230_1__create_user_table.sql`

### Java Code Style

- Sử dụng google-java-format để định dạng code theo chuẩn Google Java Style.
- Trong IntelliJ IDEA, cài đặt
  [google-java-format](https://github.com/google/google-java-format/blob/master/README.md#intellij-jre-config)
  plugin và cấu hình để tự động format code khi lưu file.

### Typescript Code Style

- Dự án sử dụng **Prettier** kết hợp với **ESLint** để định dạng và kiểm soát
  chất lượng mã nguồn TypeScript/React.
- Các quy tắc format được định nghĩa sẵn tại tệp `frontend/.prettierrc`.
- Chạy lệnh `pnpm run format` tại thư mục `frontend` để tự động định dạng toàn
  bộ source code, và `pnpm run lint` để kiểm tra các cảnh báo/lỗi.
- **Trong VS Code:** Khuyến nghị cài đặt extension
  [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  cùng với
  [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).
  Bạn nên thêm cấu hình sau vào User Settings của Workspace
  (`.vscode/settings.json`) để tự động format khi lưu file:

  ```json
  {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
  ```
