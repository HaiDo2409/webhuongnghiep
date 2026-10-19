# 🎓 Web Hướng Nghiệp – THPT Chuyên Biên Hòa – Hà Nam

> Hệ thống hướng nghiệp STEM tích hợp: Trắc nghiệm Holland RIASEC + Đa trí tuệ, Tra cứu Xét tuyển Đại học, Bản tin, Bản đồ Kỹ năng và Bookmark yêu thích.

[![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)

---

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Yêu cầu cài đặt](#-yêu-cầu-cài-đặt)
- [Chạy nhanh – Frontend Only](#-chạy-nhanh--frontend-only-khuyên-dùng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Danh sách trang & URL](#-danh-sách-trang--url)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Đóng góp](#-đóng-góp)

---

## ✨ Tính năng

| # | Tính năng | Mô tả |
|---|---|---|
| 1 | 🧠 **Trắc nghiệm Holland RIASEC** | 24 câu · 6 nhóm tính cách · cho ra Mã Holland 3 chữ cái + biểu đồ mạng nhện + danh sách nghề phù hợp |
| 2 | 💡 **Trắc nghiệm Đa trí tuệ (MI)** | 40 câu · 8 loại trí tuệ (Howard Gardner) · gợi ý ngành STEM phù hợp |
| 3 | 📊 **Tra cứu Xét tuyển ĐH** | Nhập điểm → dự báo cơ hội 4 phương thức (THPT, ĐGNL, Học bạ + IELTS, HSG) tại 10+ trường top |
| 4 | ❤️ **Bookmark yêu thích** | Lưu nghề nghiệp / ngành học / trường ĐH để so sánh sau (lưu local, không cần đăng nhập) |
| 5 | 📰 **Bản tin hướng nghiệp** | Tin tức tuyển sinh, học bổng, sự kiện STEM |
| 6 | 🗺️ **Bản đồ Kỹ năng STEM** | Lộ trình học kỹ năng theo ngành + link khóa học Coursera / edX / YouTube miễn phí |
| 7 | 🔗 **Link tuyển sinh chính thức** | Liên kết trực tiếp đến cổng Bộ GD&ĐT, các trường ĐH, học bổng |

---

## 🛠 Yêu cầu cài đặt

| Công cụ | Phiên bản tối thiểu | Kiểm tra |
|---|---|---|
| **Node.js** | v18 trở lên | `node -v` |
| **pnpm** *(khuyên dùng)* | v8 trở lên | `pnpm -v` |
| **npm** *(thay thế)* | v9 trở lên | `npm -v` |
| **Git** | Bất kỳ | `git -v` |

> 💡 **Cài pnpm** (nếu chưa có): `npm install -g pnpm`

---

## 🚀 Chạy nhanh – Frontend Only *(khuyên dùng)*

> ✅ **Không cần Backend, không cần Docker, không cần đăng nhập.**  
> Tất cả tính năng chính hoạt động hoàn toàn offline.

### Bước 1 – Clone dự án

```bash
git clone https://github.com/HaiDo2409/webhuongnghiep.git
cd webhuongnghiep
```

### Bước 2 – Vào thư mục frontend

```bash
cd frontend
```

### Bước 3 – Cài thư viện *(chỉ lần đầu)*

```bash
# Dùng pnpm (nhanh hơn, khuyên dùng)
pnpm install

# Hoặc dùng npm
npm install
```

### Bước 4 – Khởi chạy

```bash
# Dùng pnpm
pnpm dev

# Hoặc npm
npm run dev
```

### Bước 5 – Mở trình duyệt

Truy cập: **http://localhost:5173**

> Để dừng server: nhấn **Ctrl + C** trong terminal.

---

## 📁 Cấu trúc dự án

```
webhuongnghiep/
├── frontend/                        # Toàn bộ giao diện React
│   ├── src/
│   │   ├── App.tsx                  # Cấu hình Routes chính
│   │   ├── layouts/
│   │   │   └── MainLayout.tsx       # Header + Nav bar + Footer dùng chung
│   │   ├── pages/
│   │   │   ├── index.tsx            # Trang chủ
│   │   │   ├── trac-nghiem/         # Trắc nghiệm Holland & Đa trí tuệ
│   │   │   │   ├── index.tsx        # Trang trắc nghiệm (tab Holland / MI)
│   │   │   │   ├── MIQuiz.tsx       # Component trắc nghiệm Đa trí tuệ
│   │   │   │   ├── CareerResults.tsx# Kết quả nghề nghiệp + Bookmark
│   │   │   │   ├── HollandRadarChart.tsx
│   │   │   │   └── data/
│   │   │   │       ├── questions.ts # 24 câu Holland RIASEC
│   │   │   │       ├── mi-questions.ts # 40 câu Đa trí tuệ
│   │   │   │       └── careers.ts   # Danh sách nghề nghiệp
│   │   │   ├── xet-tuyen/           # Tra cứu xét tuyển
│   │   │   │   ├── index.tsx
│   │   │   │   └── data/
│   │   │   │       ├── schools.ts   # Dữ liệu 10+ trường ĐH
│   │   │   │       └── scoring.ts   # Thuật toán tính điểm 4 phương thức
│   │   │   ├── ban-tin/             # Bản tin hướng nghiệp
│   │   │   ├── ky-nang/             # Bản đồ kỹ năng STEM
│   │   │   │   └── data/skills.ts  # Lộ trình kỹ năng + links
│   │   │   ├── bookmarks/           # Trang yêu thích đã lưu
│   │   │   ├── login/               # Đăng nhập Google OAuth
│   │   │   └── dashboard/           # Dashboard (sau đăng nhập)
│   │   ├── hooks/
│   │   │   └── useBookmarks.ts      # Hook lưu yêu thích (localStorage)
│   │   ├── lib/
│   │   │   └── routes.ts            # Hằng số đường dẫn URL
│   │   └── components/
│   │       └── ui/                  # shadcn/ui components
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md
```

---

## 🌐 Danh sách trang & URL

| Trang | URL | Ghi chú |
|---|---|---|
| 🏠 Trang chủ | `/` | Giới thiệu tổng quan |
| 🧠 Trắc nghiệm | `/trac-nghiem` | Tab Holland RIASEC + Đa trí tuệ |
| 📊 Tra cứu XTS | `/xet-tuyen` | Nhập điểm → xem cơ hội |
| 📰 Bản tin | `/ban-tin` | Tin tức & sự kiện |
| 🗺️ Bản đồ Kỹ năng | `/ky-nang` | Lộ trình STEM + Links |
| ❤️ Yêu thích | `/yeu-thich` | Nghề / ngành đã bookmark |
| 🔐 Đăng nhập | `/login` | Google OAuth |
| 👤 Dashboard | `/dashboard` | Yêu cầu đăng nhập |

---

## 🏗 Các lệnh khác

```bash
# Build cho production
pnpm build
# hoặc: npm run build
# → Tạo thư mục frontend/dist/ để deploy

# Xem trước bản build production
pnpm preview
# hoặc: npm run preview

# Kiểm tra lỗi TypeScript
pnpm tsc --noEmit

# Kiểm tra lint
pnpm lint

# Format code (Prettier)
pnpm format
```

---

## ⚙️ Công nghệ sử dụng

| Công nghệ | Vai trò |
|---|---|
| **React 19** | UI framework |
| **TypeScript 6** | Type-safe code |
| **Vite 8** | Build tool, dev server siêu nhanh |
| **Tailwind CSS 4** | Utility-first styling |
| **shadcn/ui** | UI components (Button, Badge, Select...) |
| **React Router v7** | Client-side routing |
| **Recharts** | Biểu đồ mạng nhện (Radar Chart) |
| **Lucide React** | Icon library |
| **localStorage** | Lưu bookmark yêu thích (không cần DB) |

---

## 🤝 Đóng góp

1. Fork dự án
2. Tạo nhánh mới: `git checkout -b ten-tinh-nang`
3. Commit thay đổi: `git commit -m "mo-ta-ngan-gon"`
4. Push lên nhánh: `git push origin ten-tinh-nang`
5. Tạo Pull Request

---

## 📄 Giấy phép

Dự án phục vụ mục đích học tập và hướng nghiệp tại THPT Chuyên Biên Hòa – Hà Nam.  
Không sử dụng cho mục đích thương mại.

---

<div align="center">
  Made with ❤️ by học sinh THPT Chuyên Biên Hòa – Hà Nam
</div>
