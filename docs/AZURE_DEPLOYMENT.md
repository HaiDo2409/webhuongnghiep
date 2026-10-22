# Web trên Azure Ubuntu

Đã triển khai ngày 21/10/2026 tại **http://52.246.142.28**. SSH: `azureuser`. VM Ubuntu 22.04 có khoảng 1 GB RAM; build Java/React tại máy phát triển, không build trên VM.

## Cấu hình đang chạy

- Nginx cổng 80 phục vụ React production, nén dữ liệu và chuyển `/api` sang backend.
- Java 21 chạy Spring Boot qua dịch vụ `stem-compass`, chỉ nghe `127.0.0.1:8080`.
- PostgreSQL 14 của Ubuntu, database `huongnghiep`, chỉ nghe loopback cổng 5432. Mật khẩu server được tạo ngẫu nhiên, không dùng mật khẩu PostgreSQL trên máy phát triển.
- Swap 2 GB; Java heap tối đa 320 MB; Hikari tối đa 4 kết nối, PostgreSQL tối đa 25 kết nối.
- Nginx, PostgreSQL và backend đã được bật tự khởi động cùng VM. Đã kiểm tra restart backend; chưa thực hiện reboot cả VM.
- Database server tạo riêng từ dữ liệu đóng gói trong project: 378 nghề, 35 trường, 1.275 chương trình năm 2026, 45 tag định hướng, hai bộ quiz ban đầu. Không sao chép tài khoản, lịch sử bài làm hoặc những thay đổi riêng chỉ nằm trong database local.
- Admin server riêng là `admin`. Mật khẩu lưu trong file bỏ qua bởi Git: `.cache/azure-admin-access.txt` trên máy phát triển; bản gốc trên VM: `/etc/stem-compass/admin-access.txt`, chỉ root đọc được. Không đưa các file này vào Git hoặc gửi công khai.
- Sau lần khởi tạo đầu, `SEED_ENABLED=false` và `LOCAL_ADMIN_ENABLED=false`; dữ liệu và tài khoản đã tạo vẫn giữ nguyên.
- Đổi mật khẩu tại **Hồ sơ → Đổi mật khẩu**: nhập mật khẩu hiện tại, mật khẩu mới và xác nhận. Áp dụng cho học sinh/admin; đổi thành công sẽ đăng xuất các phiên đăng nhập bằng mật khẩu. File `admin-access.txt` chỉ chứa mật khẩu ban đầu, không tự cập nhật khi đổi trên web; giữ mật khẩu mới trong nơi quản lý mật khẩu của bạn.
- Chỉ hỗ trợ đăng ký/đăng nhập bằng tài khoản và mật khẩu. Đã gỡ tích hợp Google/OAuth khỏi giao diện, backend và thư viện phụ thuộc. Cột danh tính cũ trong database được giữ để không xóa dữ liệu lịch sử; không dùng để đăng nhập.
- Hiện dùng **HTTP**. Cổng 443 mở trong Azure chưa đồng nghĩa đã có HTTPS. Khi có địa chỉ HTTPS, cập nhật cookie secure và cấu hình Nginx tương ứng.

## Mở cổng Azure

Azure Portal → Virtual machines → VM → Networking → Network settings → Create port rule → Inbound port rule.

| Quy tắc | Source | Source ports | Destination | Destination port | Protocol | Action | Priority |
|---|---|---|---|---|---|---|---|
| Allow-HTTP | Any | * | Any | 80 | TCP | Allow | 310 |
| Allow-HTTPS | Any | * | Any | 443 | TCP | Allow | 320 |

Chọn priority chưa trùng nếu cần. Giữ SSH 22, không mở 8080/5432. UFW trên VM hiện không bật. Nếu bật về sau, cần cho phép SSH và Nginx trước khi áp dụng. Hướng dẫn: [Azure NSG](https://learn.microsoft.com/en-us/azure/virtual-network/tutorial-filter-network-traffic).

## Quản lý từ Windows

Trong PowerShell, thay đường dẫn khóa bằng vị trí khóa SSH của bạn:

```powershell
ssh -i "C:\duong-dan\vm_key.pem" azureuser@52.246.142.28
```

Sau khi vào Ubuntu:

```bash
# Trạng thái và log
sudo systemctl status stem-compass nginx postgresql --no-pager
sudo journalctl -u stem-compass -n 100 --no-pager
sudo journalctl -u stem-compass -f

# Khởi động lại backend
sudo systemctl restart stem-compass

# Kiểm tra cấu hình trước khi nạp lại Nginx
sudo nginx -t
sudo systemctl reload nginx

# Xem thông tin admin; chỉ chạy trong phiên SSH riêng
sudo cat /etc/stem-compass/admin-access.txt

# Sao lưu database; chọn tên mới cho mỗi bản
sudo -u postgres pg_dump -Fc -d huongnghiep \
  -f /var/backups/stem-compass/backup-YYYYMMDD.dump
```

Bản sao lưu đầu tiên: `/var/backups/stem-compass/initial-deployment.dump`. Hiện chưa thiết lập lịch sao lưu tự động hoặc sao lưu ngoài VM.

## Đường dẫn trên VM

| Nội dung | Vị trí |
|---|---|
| Bản chạy đang dùng | `/opt/stem-compass/current` |
| Các bản phát hành | `/opt/stem-compass/releases/<release-id>` |
| Cấu hình và mật khẩu | `/etc/stem-compass/app.env` |
| Dịch vụ backend | `/etc/systemd/system/stem-compass.service` |
| Nginx | `/etc/nginx/sites-available/stem-compass` |
| PostgreSQL tối ưu RAM | `/etc/postgresql/14/main/conf.d/90-stem-compass.conf` |
| Bản sao lưu | `/var/backups/stem-compass/` |

## Cập nhật bản chạy

1. Kiểm thử backend khi thay đổi logic; đóng gói JAR bằng Maven `package`. Backend dùng Java 21.
2. Build frontend với `VITE_USE_BACKEND=true`; không gửi `.env` phát triển lên server.
3. Đóng gói `backend.jar` và thư mục `web` chứa nội dung `frontend/dist` thành `release.tar.gz`.
4. Sao lưu database, rồi chuyển archive và ba file trong `deploy/ubuntu/` lên VM bằng SCP. Không đưa khóa PEM vào archive.
5. Chạy từ thư mục chứa `install.sh`:

```bash
sudo bash install.sh /duong-dan/release.tar.gz RELEASE_ID http://52.246.142.28
```

`RELEASE_ID` cần mới, chỉ gồm chữ/số/gạch ngang/gạch dưới. Script giữ nguyên `/etc/stem-compass/app.env` đã có, không reset tài khoản. Bản cũ được giữ lại trong `releases`; cần kiểm tra tương thích migration trước khi rollback ứng dụng.

Script cài đặt dành cho VM riêng của project: cài package nếu thiếu, cấu hình PostgreSQL/Nginx và thay site Nginx mặc định. Nếu chuyển sang HTTPS hoặc VM có nhiều ứng dụng, chỉnh script/cấu hình tương ứng trước khi chạy lại.

## Đã kiểm tra

- Truy cập từ Internet trang chủ, `/xet-tuyen`, `/trac-nghiem` và API qua cổng 80.
- Làm Holland với phiên khách, tra cứu COMBINED hai trang 15 mục, không trùng ID.
- Đăng nhập admin và đọc danh sách 35 trường, hai phiên bản quiz qua API quản trị; kiểm tra thực hiện nội bộ VM để không gửi mật khẩu qua Internet HTTP.
- Kiểm tra Java/PostgreSQL chỉ nghe loopback; dịch vụ không có lần tự khởi động lại do lỗi sau triển khai.

IP cần giữ nguyên (hoặc cấu hình DNS/IP tĩnh phù hợp) để liên kết vẫn dùng được. Lệnh Stop/Deallocate hoặc xóa tài nguyên Azure không nằm trong quy trình này.
