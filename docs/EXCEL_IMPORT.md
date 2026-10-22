# Nhập dữ liệu nghề và tuyển sinh bằng Excel

Đã bổ sung **tag dùng chung giữa nghề và chương trình** và loại trừ/khôi phục gợi ý trong admin. Xem [cách dùng và quy tắc khớp tag](TAG_MATCHING.md). Excel v1 giữ nguyên các tag đã gắn khi cập nhật trên cùng database, nhưng chưa xuất/nhập bộ tag; cần sao lưu PostgreSQL để giữ đầy đủ dữ liệu.

Đã triển khai mẫu **STEM_COMPASS_CATALOG_V1**, ngày 21/10/2026. PostgreSQL là nơi lưu dữ liệu; Excel là định dạng nhập/cập nhật, không phải file thay thế toàn bộ database.

## Sử dụng trên web

Ngoài Excel, tab **Dữ liệu nghề & Excel** có phần **Quản lý nghề và chương trình liên quan**. Chọn **Sửa nghề & tag**, lưu thông tin nghề và gắn tag chung với chương trình. Web tự gợi ý chương trình khi có tag chung; admin có thể loại trừ hoặc bỏ loại trừ. Không cần chọn ngành/chương trình thủ công và không cần xác nhận từng gợi ý.

Danh sách ngành tham khảo từ Excel vẫn được giữ. Ô ngành đại học trong sheet nghề được phép trống; tag và loại trừ không nằm trong file Excel v1 nên cần sao lưu PostgreSQL để giữ đầy đủ.

1. Đăng nhập admin, vào **Quản trị nội dung → Dữ liệu nghề & Excel**.
2. Lần đầu chọn **Tải mẫu Excel và quy tắc**. Mẫu có sheet hướng dẫn, bảng quy tắc từng cột và các dòng ví dụ có nguồn. Nếu cập nhật dữ liệu đã có, chọn **Xuất dữ liệu hiện tại để cập nhật** để giữ đúng mã/khóa hiện hành.
3. Sửa dữ liệu, giữ dòng 1 làm tiêu đề. Có thể đổi thứ tự cột nhưng giữ tên cột. Lưu `.xlsx`, tối đa 2 MB và 10.000 dòng mỗi sheet.
4. Chọn file, bấm **Kiểm tra & xem trước**. Xem số nghề thêm/cập nhật/giữ nguyên và số ngành/chương trình/điểm chuẩn; kiểm tra các trường sẽ thay đổi.
5. Có lỗi thì sửa đúng sheet/dòng/cột được báo rồi tải lại. Chưa có dữ liệu nào được ghi vào danh mục ở bước xem trước.
6. Bấm **Xác nhận nhập các thay đổi trên**. Mọi sheet được áp dụng cùng một transaction. Nếu dữ liệu đã đổi sau preview, hệ thống trả xung đột và không ghi dở.
7. Trong lịch sử có nút **Hoàn tác lần nhập**. Chỉ hoàn tác khi các bản ghi liên quan chưa bị sửa tiếp; nếu có xung đột hệ thống giữ dữ liệu mới. Bản ghi mới có thể được lưu trữ thay vì xóa để giữ tham chiếu.

Giữ ID nội bộ và mã nghề khi cập nhật. Dòng vắng khỏi file không xóa dữ liệu. Ô tùy chọn trống giữ giá trị cũ; nội dung nhóm/ngành của dòng nghề được thay theo danh sách trong preview. Chưa có thao tác xóa riêng một trường tùy chọn bằng ô trống.

## Bảy sheet trong mẫu

| Sheet | Vai trò |
|---|---|
| `HUONG_DAN` | Cách nhập, quy ước và giới hạn |
| `QUY_TAC_COT` | Mức bắt buộc, kiểu dữ liệu và quy tắc của từng trường |
| `NGHE_NGHIEP` | Một dòng một nghề |
| `NGANH_DAO_TAO` | Danh mục ngành có khóa ổn định |
| `LIEN_KET_NGHE_NGANH` | Một dòng một quan hệ nghề–ngành |
| `CHUONG_TRINH` | Ngành được tuyển tại trường theo năm |
| `DIEM_CHUAN` | Điểm chuẩn từng chương trình/năm/tổ hợp, có nguồn |

Vẫn nhận file 7 cột tiếng Việt người dùng đã gửi. Nếu không có sheet `NGHE_NGHIEP`, mặc định đọc sheet đầu hoặc sheet admin chỉ định. Các sheet dữ liệu phụ là tùy chọn nhưng khi có phải đủ tiêu đề và đúng tham chiếu. File chỉ cập nhật chương trình cũng dùng cấu trúc mẫu, để sheet nghề trống và điền đủ ngành/chương trình cần tham chiếu.

## Quy tắc cột

### NGHE_NGHIEP

| Cột | Yêu cầu |
|---|---|
| `onet_soc_code` | Bắt buộc, chuỗi theo mẫu `15-1252.00`, duy nhất trong file; không lưu thành số |
| `holland_code` | Bắt buộc, 1–6 ký tự R/I/A/S/E/C, không lặp, giữ thứ tự nguồn |
| `job_title_en`, `job_title_vi` | Bắt buộc, tối đa 255 ký tự; cùng tên nhưng khác mã là hai nghề |
| `description_vi` | Bắt buộc, tối đa 2.000 ký tự |
| `vn_university_majors` | Tên ngành ngăn bằng dấu phẩy; có thể bỏ cột nếu đã khai sheet liên kết hợp lệ. Khi có liên kết theo mã cho nghề, danh sách đó được ưu tiên |
| `career_groups` | Bắt buộc; nhiều nhóm ngăn bằng dấu `;`, không dùng dấu phẩy để tách nhóm |
| `stem_groups` | Tùy chọn; S/T/E/M/OTHER, nhiều mã ngăn `;`; đây là phân nhóm ứng dụng |
| `skills_vi` | Tùy chọn; các kỹ năng ngăn `;` |
| `salary_min_vnd`, `salary_max_vnd` | Nếu nhập lương thì cần cả hai; số nguyên VND, tối đa 12 chữ số, min ≤ max; không ghi “triệu” trong ô |
| `salary_period`, `salary_region`, `salary_year`, `salary_source_url` | Bắt buộc khi có lương; kỳ hiện hỗ trợ `MONTH`, khu vực, năm và nguồn HTTP/HTTPS. Không chuyển lương Mỹ sang Việt Nam bằng tỷ giá |
| `outlook_vi` | Triển vọng từ nguồn; nếu có phải kèm `outlook_region`, `outlook_year`, `outlook_source_url` |
| `source_url`, `data_year` | Nguồn nội dung và năm dữ liệu, khuyến nghị điền; URL hợp lệ, năm nguyên 2000–2099 |
| `published` | `TRUE`/`FALSE`; bỏ trống giữ trạng thái cũ, nghề mới mặc định công khai khi admin xác nhận |

Các ô dữ liệu tùy chọn có giới hạn 2.000 ký tự. Không chạy công thức, macro, liên kết workbook ngoài hoặc ô Excel đang lỗi. Điểm số và tiền phải là giá trị, không phải công thức.

### NGANH_DAO_TAO và LIEN_KET_NGHE_NGANH

| Cột | Yêu cầu |
|---|---|
| `major_key` | Mã nội bộ ngành ổn định, tối đa 100 ký tự, duy nhất; dùng khóa từ file xuất để sửa ngành đang có |
| `major_name` | Tên ngành tối đa 255 ký tự; không trùng sau chuẩn hóa khoảng trắng/Unicode và chữ hoa thường |
| `major_code` | Mã ngành chính thức nếu đã đối chiếu; không dùng mã O*NET làm mã ngành |
| `source_url`, `data_year`, `verified` | Năm và trạng thái xác minh bắt buộc; `verified=TRUE` cần mã ngành và URL nguồn. Chưa đủ nguồn dùng FALSE |
| `onet_soc_code`, `major_key` ở sheet liên kết | Mỗi dòng một cặp mã; cả hai phải có trong workbook; không trùng cặp |

Tên ngành chưa chuẩn hóa trong file nghề cũ được tạo với trạng thái chưa xác minh. Không tự gộp tên gần giống hoặc tự gán mã ngành chính thức. Quan hệ nghề–ngành là gợi ý học tập, không có nghĩa chỉ ngành đó mới có thể làm nghề.

### CHUONG_TRINH

| Cột | Yêu cầu |
|---|---|
| `program_key` | Khóa chương trình/năm ổn định; giữ từ file xuất để cập nhật, mỗi dòng duy nhất |
| `school`, `short_name`, `program_code` | Tên trường, viết tắt và mã xét tuyển do trường quy định; tối đa 255 ký tự |
| `major_key` | Phải có trong NGANH_DAO_TAO |
| `admission_year` | Năm tuyển sinh, số nguyên 2000–2099 |
| `subject_groups` | Danh sách không trùng, ngăn `;`. Hỗ trợ A00, A01, A02, B00, D01, D07, C00, X06 |
| `method`, `scale`, `formula` | V1 chỉ nhận `THPT`, `30`, `THPT_STANDARD_30`: tổng ba môn không hệ số |
| `source_url`, `verified`, `published` | URL nguồn, xác nhận đối chiếu và trạng thái công khai; hai trạng thái TRUE/FALSE độc lập |

Mẫu chưa nhập công thức HSA/IELTS, môn nhân hệ số, quy đổi riêng theo trường, điểm thưởng hoặc điều kiện tuyển sinh tùy ý. Không nhập các dữ liệu đó dưới nhãn THPT_STANDARD_30. Các bộ tính Ngoại thương hiện tại vẫn là catalog có phiên bản riêng trong backend.

### DIEM_CHUAN

| Cột | Yêu cầu |
|---|---|
| `program_key` | Phải có trong CHUONG_TRINH của workbook |
| `benchmark_year` | Không sau admission_year; năm trước là lịch sử, cùng năm là điểm chuẩn đã công bố |
| `subject_group` | Một tổ hợp có trong chương trình; không dùng chuỗi nhiều tổ hợp trong ô này |
| `method`, `scale` | V1 chỉ THPT và 30 |
| `benchmark` | Số từ 0 đến 30, tối đa hai chữ số thập phân; dùng dấu chấm, không phải % |
| `source_url`, `verified` | URL thông báo điểm chuẩn đúng phương thức; TRUE chỉ khi đã đối chiếu |
| `comparable` | TRUE sau khi rà soát khả năng so sánh với chương trình hiện tại; không tự bật chỉ vì cùng thang 30 |

Khóa chống trùng là chương trình + năm + tổ hợp. Điểm chuẩn cùng năm của các tổ hợp trong một chương trình cần bằng nhau trong mẫu v1; nếu trường có độ lệch điểm, phải bổ sung mô hình đó trước khi nhập. Không nhập điểm sàn thành điểm chuẩn, không lấy năm 2026 làm dữ liệu lịch sử để dự báo chính 2026.

## Dữ liệu đã nạp và nguồn

- 378 mã nghề từ file người dùng; 41 nhóm và các liên kết ngành theo tên trong file. Chưa coi toàn bộ danh sách tên ngành là mã ngành chính thức.
- Hồ sơ sở thích sáu nhóm cho 378 mã nghề và kỹ năng cho 372 mã từ [O*NET 31.0](https://www.onetcenter.org/database.html). Tên kỹ năng được dịch. Dữ liệu có nguồn gốc Hoa Kỳ; không phải dữ liệu lương Việt Nam. Sáu mã chưa có bảng kỹ năng được để trống.
- 20 chương trình UET năm 2026, điểm chuẩn công bố năm 2026 và các năm 2023–2025 khi có. [Điểm chuẩn 2026](https://tuyensinh.uet.vnu.edu.vn/uncategorized/thong-bao-diem-trung-tuyen-dai-hoc-chinh-quy-vao-truong-dai-hoc-cong-nghe-dhqghn-nam-2026/), [2025](https://tuyensinh.uet.vnu.edu.vn/uncategorized/thong-bao-diem-trung-tuyen-dai-hoc-chinh-quy-vao-truong-dai-hoc-cong-nghe-dhqghn-nam-2025/), [2024](https://tuyensinh.uet.vnu.edu.vn/tin-tuyen-sinh/thong-bao-diem-trung-tuyen-vao-truong-dai-hoc-cong-nghe-dhqghn-nam-2024-theo-phuong-thuc-thpt/), [2023](https://tuyensinh.uet.vnu.edu.vn/uncategorized/thong-bao-diem-trung-tuyen-vao-truong-dh-cong-nghe-dhqghn-nam-2023-theo-phuong-thuc-thpt/).
- Tổ hợp A00/A01 và phương thức được đối chiếu theo [thông tin tuyển sinh UET 2026](https://tuyensinh.uet.vnu.edu.vn/wp-content/images/Thong-tin-tuyen-sinh-DHCQ-nam-2026-cap-nhat.pdf). Chưa nạp mọi tổ hợp/phương thức của trường. Chương trình đổi tên/phạm vi hoặc thiếu năm không tự bật so sánh ba năm.

Các nguồn Bách khoa đã tìm được nhưng chưa tải/đối chiếu đủ bảng và công thức trong lần này, nên chưa thêm dữ liệu chưa kiểm chứng của trường đó. Dữ liệu mẫu trước đây vẫn được giữ riêng; tra điểm mặc định lọc bản ghi đã kiểm tra nguồn, có thể tắt bộ lọc để xem dữ liệu cũ.

## Cách tính độ phù hợp nghề

Ưu tiên hồ sơ sáu nhóm O*NET đã chuẩn hóa về 0–100: `cosine(hồ sơ Holland của học sinh, hồ sơ nghề) × 100`. Công thức có phiên bản `onet31-cosine-v1`. Khi không có hồ sơ số từ nguồn, dùng trung bình điểm học sinh ở các nhóm có trong mã nghề, trọng số theo thứ tự mã (3–2–1 cho ba mã), phiên bản `holland-code-weighted-v1`.

Không có bài Holland, bài không thuộc người dùng/phiên khách hoặc hồ sơ toàn 0 thì không tự tạo điểm phù hợp. API kiểm tra quyền sử dụng bài, không tin điểm do trình duyệt gửi. Người dùng có thể bật/tắt và chọn bài Holland trong danh mục.

Với chương trình đã liên kết ngành nhưng chưa có hồ sơ Holland biên tập riêng, dùng trung bình tối đa ba nghề liên quan có độ tương đồng cao nhất để sắp xếp. Đây là quy tắc tư vấn của ứng dụng, không phải xác suất việc làm/trúng tuyển. Điểm xét tuyển, ưu tiên và điểm chuẩn không được cộng với độ phù hợp.

## Vận hành

Migration V6 bổ sung bảng nhóm/ngành/liên kết/import, cột mã nghề và revision. Các ID cũ không bị xóa; nghề cũ chưa có mã O*NET chưa xuất hiện trong danh mục mới, nhưng bookmark snapshot cũ vẫn giữ được thông tin. Seed nguồn chỉ chạy một lần theo checksum khi SEED_ENABLED=true, không ghi đè lại sau mỗi lần khởi động.

Nội dung đọc chung từ database ở trang chủ, danh mục nghề, phần gợi ý nghề sau quiz và phần liên kết chương trình. API cũ `/api/careers` được giữ để tương thích; giao diện mới dùng `/api/career-catalog` có phân trang, bộ lọc và kiểm tra bài Holland.

Import dùng Apache POI 5.5.1. Chỉ admin có thể tải mẫu/xuất/preview/commit/revert; các thao tác ghi cần CSRF. Staging lưu toàn bộ kế hoạch và revision, commit có khóa giao dịch, nhật ký và kiểm tra đồng thời. Bản mới còn phụ thuộc được lưu trữ khi hoàn tác, không xóa cứng.
