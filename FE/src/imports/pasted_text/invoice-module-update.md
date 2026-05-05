Cập nhật giao diện module QUẢN LÝ HÓA ĐƠN cho website quản lý nhà trọ theo ERD và nghiệp vụ mới nhất.

Bối cảnh hệ thống:

* Website quản lý nhà trọ dành cho 1 chủ trọ duy nhất.
* Một phòng có thể có nhiều người thuê cùng lúc.
* Một hợp đồng thuộc về 1 phòng.
* Một hợp đồng có 1 người đại diện và nhiều người ở cùng.
* Hóa đơn gắn với hợp đồng, không gắn trực tiếp với từng người thuê hoặc từng phòng.
* Khi hiển thị người trên hóa đơn, hãy hiển thị “Người đại diện” thay vì “Người thuê”.
* Đơn giá điện và đơn giá nước chỉ dùng trên UI để tính tiền khi lập/chỉnh sửa hóa đơn, không cần thể hiện như field lưu chính trong database.
* Database hóa đơn gồm: MaHoaDon, MaHopDong, Thang, Nam, ChiSoDienCu, ChiSoDienMoi, ChiSoNuocCu, ChiSoNuocMoi, TienDien, TienNuoc, TienThue, TongTien, TrangThai, NgayLap, HanThanhToan, GhiChu.

YÊU CẦU CHỈ UPDATE MODULE HÓA ĐƠN, giữ nguyên layout tổng thể:

* Sidebar trái: Dashboard, Nhà trọ, Người thuê, Hợp đồng, Hóa đơn, Báo cáo, Tài khoản.
* Topbar có ô tìm kiếm nhanh, avatar chủ trọ.
* Style admin dashboard hiện đại, clean, dễ đọc, ưu tiên desktop.
* Dữ liệu mẫu tiếng Việt, không dùng lorem ipsum.

==================================================

1. TRANG DANH SÁCH HÓA ĐƠN
   ==================================================

Route: /invoices

Header:

* Tiêu đề: Quản lý hóa đơn
* Mô tả: Danh sách hóa đơn thu tiền nhà
* Nút CTA chính: + Lập hóa đơn mới

Card thống kê:

* Tổng hóa đơn
* Đã thanh toán
* Chưa thanh toán
* Tổng tiền
* Có thể thêm card “Quá hạn” nếu phù hợp

Bộ lọc:

* Tìm theo mã hóa đơn, mã hợp đồng, mã phòng, người đại diện
* Lọc theo tháng/năm
* Lọc theo trạng thái: Tất cả / Đã thanh toán / Chưa thanh toán / Quá hạn
* Lọc theo phòng hoặc hợp đồng nếu còn chỗ

Bảng danh sách hóa đơn cần có các cột:

* Mã HĐơn
* Tháng
* Hợp đồng
* Người đại diện
* Phòng
* Số tiền
* Hạn thanh toán
* Trạng thái
* Thao tác

Yêu cầu chỉnh nhãn:

* Đổi cột “Người thuê” thành “Người đại diện”.
* Cột “Hợp đồng” hiển thị mã hợp đồng, ví dụ HD001.
* Cột “Phòng” hiển thị mã phòng, ví dụ A101.
* Cột “Người đại diện” hiển thị tên người đại diện trong hợp đồng.
* Nếu có đủ không gian, hiển thị thêm badge “3 người” hoặc tooltip danh sách người trong hợp đồng.

Trạng thái:

* Đã thanh toán: badge xanh
* Chưa thanh toán: badge cam
* Quá hạn: badge đỏ nhạt nếu HanThanhToan < ngày hiện tại và chưa thanh toán

Thao tác:

* Icon xem chi tiết
* Icon chỉnh sửa chỉ hiển thị với hóa đơn chưa thanh toán
* Icon xác nhận thanh toán với hóa đơn chưa thanh toán
* Không cần icon xóa hóa đơn để giữ lịch sử thanh toán

==================================================
2. TRANG CHI TIẾT HÓA ĐƠN
=========================

Route: /invoices/:id

Header:

* Nút quay lại
* Tiêu đề: Hóa đơn HD001
* Mô tả: Chi tiết hóa đơn tháng 04/2026
* Badge trạng thái thanh toán
* Nút “Xác nhận thanh toán” nếu hóa đơn chưa thanh toán
* Nút “Chỉnh sửa” nếu hóa đơn chưa thanh toán
* Nếu hóa đơn đã thanh toán thì ẩn nút chỉnh sửa hoặc disabled readonly

Layout gồm 2 cột:

Cột trái lớn:

BLOCK 1: Thông tin hóa đơn

* Mã hóa đơn
* Mã hợp đồng
* Tháng/Năm
* Ngày lập
* Hạn thanh toán
* Trạng thái
* Ghi chú

BLOCK 2: Thông tin hợp đồng

* Mã hợp đồng
* Phòng
* Người đại diện
* Số người trong hợp đồng
* Thời hạn hợp đồng
* Link xem chi tiết hợp đồng
* Link xem chi tiết phòng

BLOCK 3: Chi tiết thanh toán
Hiển thị rõ 3 khoản:

* Tiền thuê nhà
* Tiền điện
* Tiền nước
* Tổng cộng

Với tiền điện:

* Chỉ số cũ
* Chỉ số mới
* Số điện sử dụng = chỉ số mới - chỉ số cũ
* Tiền điện

Với tiền nước:

* Chỉ số cũ
* Chỉ số mới
* Số nước sử dụng = chỉ số mới - chỉ số cũ
* Tiền nước

Lưu ý:

* Nếu vẫn hiển thị đơn giá điện/nước trên UI, hãy ghi nhãn là “Đơn giá dùng để tính tại thời điểm lập hóa đơn”.
* Không cần thể hiện đơn giá như dữ liệu chính của hóa đơn.
* Có thể tính ngược đơn giá để hiển thị: tiền điện / số điện sử dụng, tiền nước / số nước sử dụng.
* Nếu muốn đơn giản, chỉ hiển thị chỉ số cũ, chỉ số mới, lượng sử dụng và số tiền.

Cột phải:

BLOCK 4: Tổng thanh toán nổi bật

* Tổng tiền
* Hạn thanh toán
* Trạng thái
* Nếu chưa thanh toán và quá hạn thì cảnh báo “Hóa đơn đã quá hạn”.

BLOCK 5: Người đại diện

* Avatar
* Họ tên
* Số điện thoại
* Vai trò: Đại diện
* Nếu có nhiều người trong hợp đồng, hiển thị text: “Hợp đồng này có 3 người đang ở.”

BLOCK 6: Thao tác nhanh

* Xác nhận thanh toán
* Chỉnh sửa hóa đơn
* Xem hợp đồng
* Xem phòng

==================================================
3. FORM LẬP HÓA ĐƠN MỚI
=======================

Route: /invoices/new

Header:

* Nút quay lại
* Tiêu đề: Lập hóa đơn mới
* Mô tả: Điền thông tin để lập hóa đơn tháng

Form chia thành các block:

BLOCK 1: Thông tin cơ bản

* Dropdown chọn hợp đồng
* Tháng/Năm hóa đơn
* Ngày lập
* Hạn thanh toán

Dropdown hợp đồng cần hiển thị rõ:
HD001 | Phòng A101 | Đại diện: Nguyễn Văn A | 3 người

Sau khi chọn hợp đồng, hiển thị preview card:

* Mã hợp đồng
* Phòng
* Người đại diện
* Số người thuê trong hợp đồng
* Tiền thuê theo hợp đồng
* Thời hạn hợp đồng
* Trạng thái hợp đồng

BLOCK 2: Tiền thuê

* Tiền thuê nhà
* Tự động fill từ HopDong.TienThue
* Cho phép chỉnh nếu cần
* Helper text: “Tiền thuê được lấy mặc định từ hợp đồng.”

BLOCK 3: Tiền điện

* Chỉ số điện cũ
* Chỉ số điện mới
* Đơn giá điện trên UI
* Số điện sử dụng auto calculate
* Tiền điện auto calculate
* Helper text: “Đơn giá điện chỉ dùng để tính tiền trên giao diện, hệ thống lưu kết quả tiền điện.”

BLOCK 4: Tiền nước

* Chỉ số nước cũ
* Chỉ số nước mới
* Đơn giá nước trên UI
* Số nước sử dụng auto calculate
* Tiền nước auto calculate
* Helper text: “Đơn giá nước chỉ dùng để tính tiền trên giao diện, hệ thống lưu kết quả tiền nước.”

BLOCK 5: Ghi chú

* Textarea ghi chú hóa đơn

BLOCK 6: Tổng tiền

* Summary card bên phải hoặc cuối form:

  * Tiền thuê
  * Tiền điện
  * Tiền nước
  * Tổng tiền
  * Hạn thanh toán
* Tổng tiền auto calculate:
  Tổng tiền = Tiền thuê + Tiền điện + Tiền nước

Nút:

* Hủy
* Lưu hóa đơn

Validation:

* Bắt buộc chọn hợp đồng
* Chỉ cho chọn hợp đồng đang hiệu lực
* Không cho lập trùng hóa đơn cùng hợp đồng trong cùng tháng/năm
* Tháng/Năm bắt buộc
* Hạn thanh toán bắt buộc
* Chỉ số điện mới phải lớn hơn hoặc bằng chỉ số điện cũ
* Chỉ số nước mới phải lớn hơn hoặc bằng chỉ số nước cũ
* Tiền thuê phải là số không âm
* Đơn giá điện/nước nếu nhập thì phải là số không âm
* Tổng tiền tự tính và không cho nhập tay

==================================================
4. FORM CHỈNH SỬA HÓA ĐƠN
=========================

Route: /invoices/:id/edit

Header:

* Tiêu đề: Chỉnh sửa hóa đơn
* Mô tả: Cập nhật thông tin hóa đơn

Quy tắc:

* Chỉ cho chỉnh sửa hóa đơn có trạng thái “Chưa thanh toán”.
* Nếu hóa đơn đã thanh toán, form readonly hoặc không hiển thị nút chỉnh sửa.
* Không cho đổi hợp đồng nếu hóa đơn đã được lập và đã phát sinh dữ liệu.
* Có thể cho chỉnh:

  * Tháng/Năm nếu chưa thanh toán
  * Hạn thanh toán
  * Tiền thuê
  * Chỉ số điện cũ/mới
  * Chỉ số nước cũ/mới
  * Đơn giá điện/nước trên UI để tính lại tiền
  * Ghi chú

Form hiển thị giống form lập hóa đơn, nhưng có dữ liệu hiện tại được load sẵn.

Summary card:

* Tiền thuê
* Tiền điện
* Tiền nước
* Tổng tiền

Nút:

* Hủy
* Cập nhật hóa đơn

==================================================
5. MODAL XÁC NHẬN THANH TOÁN
============================

Khi nhấn “Xác nhận thanh toán”, hiển thị modal:

Tiêu đề:

* Xác nhận thanh toán

Nội dung:

* Mã hóa đơn
* Hợp đồng
* Phòng
* Người đại diện
* Tháng/Năm
* Tổng tiền
* Hạn thanh toán

Cảnh báo nhẹ:

* “Sau khi xác nhận thanh toán, hóa đơn sẽ không được chỉnh sửa số tiền.”

Nút:

* Hủy
* Xác nhận thanh toán

Sau khi xác nhận:

* Trạng thái chuyển thành “Đã thanh toán”
* Ẩn nút chỉnh sửa
* Badge chuyển sang màu xanh

==================================================
6. DATA SAMPLE
==============

Dùng dữ liệu mẫu:

Hóa đơn HD001:

* Hợp đồng: HD001
* Phòng: A101 - Phòng A101
* Người đại diện: Nguyễn Văn A
* Số người trong hợp đồng: 3 người
* Tháng/Năm: 04/2026
* Tiền thuê: 4.500.000 VNĐ
* Chỉ số điện cũ: 120
* Chỉ số điện mới: 145
* Tiền điện: 87.500 VNĐ
* Chỉ số nước cũ: 45
* Chỉ số nước mới: 52
* Tiền nước: 105.000 VNĐ
* Tổng tiền: 4.692.500 VNĐ
* Ngày lập: 24/04/2026
* Hạn thanh toán: 30/04/2026
* Trạng thái: Chưa thanh toán

Hóa đơn HD015:

* Hợp đồng: HD001
* Phòng: A101
* Người đại diện: Nguyễn Văn A
* Tháng/Năm: 03/2026
* Tổng tiền: 4.500.000 VNĐ
* Trạng thái: Đã thanh toán

==================================================
7. STYLE REQUIREMENTS
=====================

* Modern admin dashboard
* Giao diện sạch, dễ đọc
* Số tiền cần nổi bật
* Badge trạng thái rõ ràng
* Summary card tổng tiền nổi bật bên phải
* Form có helper text rõ để dev và người dùng hiểu đơn giá điện/nước chỉ dùng để tính
* Empty state, loading state, error state
* Component có thể bàn giao cho dev implement
