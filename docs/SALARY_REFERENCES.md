# Lương tham khảo

Danh mục bổ sung lương từ `backend/src/main/resources/reference/vn-salary-2026-v1.json`. Đây là bộ tham chiếu có phiên bản, được đọc một lần khi khởi động. Không gọi mạng khi người dùng tìm nghề.

## Nguồn và phạm vi

- [Adecco Vietnam Salary Guide 2026](https://www.adecco.com/-/jssmedia/project/adecco/adeccovn/pdf/adecco-vietnam-salary-guide-2026.pdf): các trang 18, 23, 27, 31, 35, 48–49; dùng cột Hà Nội, nhóm kinh nghiệm 1–5 năm, lương trước thuế theo tháng. Mã nghề O*NET và vị trí tuyển dụng không tương đương hoàn toàn, nên ứng dụng gắn nhãn **Ước tính tham khảo**, giữ tên vị trí đối chiếu và đường dẫn trang nguồn. Đặc biệt nhóm kinh nghiệm này không có nghĩa là lương mới ra trường, hoặc chỉ cần 1–5 năm đi làm để thành quản lý.
- [Tin tuyển dụng R&D thực phẩm và đồ uống của APBEV](https://apbev.vn/nghe-nghiep/chuyen-vien-rd-thuc-pham-do-uong-hcm): TP. Hồ Chí Minh, kinh nghiệm 3–4 năm, hạn 05/07/2026, đã hết hạn. Chỉ là một ví dụ tuyển dụng, không phải trung bình thị trường. Nguồn không nêu rõ trước/sau thuế nên ứng dụng giữ trạng thái chưa rõ.

Ngày đối chiếu: 22/10/2026. Không chuyển lương Hoa Kỳ thành lương Việt Nam. Không tự suy rộng sang mọi mã cùng nhóm; chỉ các mã được liệt kê có tham chiếu. Nghề chưa có căn cứ vẫn hiện đang bổ sung.

## Cách hoạt động

`SalaryReferenceService` bổ sung vào bản sao trả về API danh mục/chi tiết và màn quản trị. Áp dụng ngay cả với cơ sở dữ liệu đã nhập trước đó, không phụ thuộc seed và không ghi đè dữ liệu đã lưu. Nếu nghề có mức lương được nhập riêng qua Excel, dữ liệu đó được ưu tiên; cả mức lương nhập dở cũng không bị trộn với nguồn tham chiếu.

Bộ lọc lương dùng mức cao nhất của khoảng tham khảo, gồm các ước tính. Chi tiết hiển thị năm, khu vực, kinh nghiệm, gross hoặc chưa rõ, vị trí đối chiếu, phương pháp và nguồn. Khoảng lương không bảo đảm thu nhập của người học.

Excel xuất dữ liệu vẫn xuất thông tin đã lưu trong database; không biến ước tính ứng dụng thành dữ liệu khảo sát khi xuất rồi nhập lại. Các tham chiếu được quản lý trong file JSON riêng ở trên. Khi có số liệu xác minh riêng cho nghề, quản trị viên nhập đủ mức thấp/cao, đơn vị MONTH, khu vực, năm và URL bằng mẫu Excel hiện có; dữ liệu này thay thế phần tham chiếu khi hiển thị.

## Bổ sung sau này

Thêm mã nghề cụ thể vào quy tắc tương đương hoặc thêm quy tắc mới với nguồn, khu vực, kinh nghiệm, phương pháp rõ ràng. Giữ đúng phiên bản/năm; không đổi năm báo cáo thành năm hiện tại. Chạy `SalaryReferenceTest` để kiểm tra mã có trong danh mục, không trùng mã, khoảng lương hợp lệ, đủ ngữ cảnh và không ghi đè dữ liệu đã nhập.
