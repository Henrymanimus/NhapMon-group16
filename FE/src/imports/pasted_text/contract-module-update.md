Cập nhật giao diện module QUẢN LÝ HỢP ĐỒNG cho website quản lý nhà trọ theo ERD và nghiệp vụ mới.

Bối cảnh hệ thống:

* Website quản lý nhà trọ dành cho 1 chủ trọ duy nhất.
* Một phòng có thể có nhiều người thuê cùng lúc.
* Một hợp đồng chỉ thuộc về 1 phòng.
* Một hợp đồng có 1 người đại diện ký hợp đồng.
* Một hợp đồng có thể có nhiều người thuê ở cùng.
* Người đại diện cũng nằm trong danh sách người thuê của hợp đồng với vai trò “Đại diện”.
* Những người còn lại có vai trò “Ở cùng”.
* Danh sách người thuê trong hợp đồng được lưu qua bảng trung gian HopDong_NguoiThue.
* Hóa đơn vẫn gắn với hợp đồng, không gắn trực tiếp với từng người thuê.

YÊU CẦU CHỈ UPDATE MODULE HỢP ĐỒNG, giữ nguyên layout tổng thể:

* Sidebar trái: Dashboard, Nhà trọ, Người thuê, Hợp đồng, Hóa đơn, Báo cáo, Tài khoản.
* Topbar có ô tìm kiếm nhanh, avatar chủ trọ.
* Style admin dashboard hiện đại, clean, dễ đọc, ưu tiên desktop.
* Dữ liệu mẫu tiếng Việt, không dùng lorem ipsum.

==================================================

1. TRANG DANH SÁCH HỢP ĐỒNG
   ==================================================

Thiết kế trang danh sách hợp đồng tại route /contracts.

Header:

* Tiêu đề: Quản lý hợp đồng
* Mô tả: Danh sách hợp đồng thuê phòng
* Nút CTA chính: + Tạo hợp đồng

Card thống kê:

* Tổng hợp đồng
* Đang hiệu lực
* Sắp hết hạn
* Đã kết thúc
* Đã hủy

Bộ lọc:

* Tìm theo mã hợp đồng, mã phòng, tên phòng, người đại diện
* Lọc theo trạng thái: Tất cả / Đang hiệu lực / Sắp hết hạn / Đã kết thúc / Hủy
* Lọc theo phòng
* Lọc theo khoảng ngày bắt đầu - ngày kết thúc

Bảng danh sách hợp đồng gồm các cột:

* Mã HĐ
* Phòng
* Người đại diện
* Số người thuê
* Thời hạn thuê
* Tiền thuê
* Tiền cọc
* Trạng thái
* Thao tác

Cột “Phòng”:

* Hiển thị mã phòng + tên phòng
* Ví dụ: A101 - Phòng A101

Cột “Người đại diện”:

* Hiển thị avatar chữ cái đầu
* Tên người đại diện
* SĐT nhỏ bên dưới nếu đủ chỗ

Cột “Số người thuê”:

* Hiển thị stacked avatars hoặc badge
* Ví dụ: 3 người
* Tooltip khi hover: Nguyễn Văn A - Đại diện, Trần Văn B - Ở cùng, Lê Thị C - Ở cùng

Cột “Thời hạn thuê”:

* Hiển thị ngày bắt đầu - ngày kết thúc
* Nếu còn dưới 30 ngày thì hiển thị badge “Sắp hết hạn”

Cột “Trạng thái”:

* Đang hiệu lực: badge xanh
* Sắp hết hạn: badge cam
* Đã kết thúc: badge xám
* Hủy: badge đỏ nhạt

Cột “Thao tác”:

* Icon xem chi tiết
* Icon chỉnh sửa
* Icon kết thúc hợp đồng nếu đang hiệu lực
* Icon xóa/hủy nếu hợp đồng chưa phát sinh hóa đơn

Empty state:

* Nếu chưa có hợp đồng, hiển thị minh họa nhỏ và nút “Tạo hợp đồng đầu tiên”.

==================================================
2. FORM TẠO HỢP ĐỒNG MỚI
========================

Thiết kế màn hình tạo hợp đồng tại route /contracts/new.

Header:

* Nút quay lại
* Tiêu đề: Tạo hợp đồng mới
* Mô tả: Chọn phòng, người đại diện và danh sách người thuê

Form chia thành 4 block rõ ràng:

BLOCK 1: Thông tin phòng

* Dropdown chọn phòng
* Chỉ ưu tiên hiển thị phòng Trống
* Khi chọn phòng, hiển thị card preview:

  * Mã phòng
  * Tên phòng
  * Địa chỉ
  * Diện tích
  * Giá thuê mặc định
  * Tiền cọc mặc định
  * Trạng thái hiện tại

Nếu chọn phòng đang thuê:

* Hiển thị cảnh báo: “Phòng này đang có hợp đồng hiệu lực, không thể tạo hợp đồng mới.”

BLOCK 2: Người thuê trong hợp đồng

* Dropdown chọn Người đại diện
* Search/select người thuê có sẵn
* Nút “+ Thêm người thuê mới” nếu chưa có trong danh sách
* Sau khi chọn người đại diện, tự động thêm người này vào danh sách người thuê với badge “Đại diện”

Bên dưới có khu vực “Danh sách người thuê trong hợp đồng”:

* Hiển thị dạng table hoặc card list
* Cột: Người thuê, SĐT, CCCD, Vai trò, Ngày tham gia, Thao tác
* Người đại diện có badge “Đại diện”
* Người ở cùng có badge “Ở cùng”
* Nút “+ Thêm người ở cùng”
* Cho phép remove người ở cùng khỏi danh sách trước khi lưu
* Không cho remove người đại diện nếu chưa chọn người đại diện khác

Yêu cầu UX:

* Có stacked avatar preview tổng số người thuê
* Có text: “Người đại diện sẽ là người ký và chịu trách nhiệm chính cho hợp đồng.”

BLOCK 3: Thời gian và chi phí

* Ngày bắt đầu
* Ngày kết thúc
* Tiền thuê tháng
* Tiền cọc
* Ghi chú

Yêu cầu:

* Tiền thuê và tiền cọc tự fill từ thông tin phòng sau khi chọn phòng
* Cho phép chỉnh tiền thuê và tiền cọc trong hợp đồng
* Ghi rõ: “Giá trong hợp đồng có thể khác giá mặc định của phòng.”

BLOCK 4: Kiểm tra trước khi lưu

* Summary card:

  * Phòng được chọn
  * Người đại diện
  * Tổng số người thuê
  * Thời hạn thuê
  * Tiền thuê
  * Tiền cọc
* Nút Hủy
* Nút Lưu hợp đồng

Validation UI:

* Bắt buộc chọn phòng
* Bắt buộc chọn người đại diện
* Danh sách người thuê phải có ít nhất 1 người
* Người đại diện phải nằm trong danh sách người thuê
* Ngày kết thúc phải lớn hơn ngày bắt đầu
* Tiền thuê phải là số hợp lệ
* Tiền cọc phải là số hợp lệ
* Không cho tạo hợp đồng nếu phòng đang có hợp đồng hiệu lực

==================================================
3. TRANG CHI TIẾT HỢP ĐỒNG
==========================

Thiết kế trang chi tiết hợp đồng tại route /contracts/:id.

Header:

* Nút quay lại
* Mã hợp đồng
* Badge trạng thái
* Nút chỉnh sửa
* Nút kết thúc hợp đồng nếu đang hiệu lực

Layout chia thành 2 cột:

Cột trái lớn:

BLOCK 1: Thông tin hợp đồng

* Mã hợp đồng
* Phòng
* Ngày bắt đầu
* Ngày kết thúc
* Tiền thuê tháng
* Tiền cọc
* Ghi chú
* Trạng thái

BLOCK 2: Danh sách người thuê trong hợp đồng

* Người đại diện ở đầu danh sách, highlight nhẹ
* Các người ở cùng ở dưới
* Mỗi người hiển thị:

  * Avatar
  * Họ tên
  * SĐT
  * CCCD
  * Vai trò
  * Ngày tham gia
  * Trạng thái: Đang ở / Đã rời
* Có nút “Thêm người ở cùng” nếu hợp đồng đang hiệu lực
* Có action “Đánh dấu đã rời” cho người ở cùng
* Không cho đánh dấu người đại diện rời nếu chưa đổi đại diện

BLOCK 3: Hóa đơn liên quan

* Mã hóa đơn
* Tháng/năm
* Tổng tiền
* Trạng thái thanh toán
* Nút xem hóa đơn
* Nút lập hóa đơn mới

Cột phải:

BLOCK 4: Card phòng

* Mã phòng
* Tên phòng
* Địa chỉ
* Trạng thái
* Nút xem phòng

BLOCK 5: Tóm tắt hợp đồng

* Tổng số người thuê
* Số người đang ở
* Số người đã rời
* Số hóa đơn
* Tổng công nợ chưa thanh toán

BLOCK 6: Timeline hợp đồng

* Ngày tạo hợp đồng
* Ngày thêm người thuê
* Ngày lập hóa đơn
* Ngày kết thúc hợp đồng nếu có

==================================================
4. FORM CHỈNH SỬA HỢP ĐỒNG
==========================

Thiết kế màn hình chỉnh sửa hợp đồng tại route /contracts/:id/edit.

Yêu cầu:

* Không cho đổi phòng nếu hợp đồng đã phát sinh hóa đơn.
* Không cho đổi người đại diện nếu người đại diện hiện tại vẫn còn là người duy nhất trong hợp đồng.
* Cho phép cập nhật:

  * Ngày kết thúc
  * Tiền thuê
  * Tiền cọc
  * Ghi chú
  * Danh sách người ở cùng
* Nếu hợp đồng đã kết thúc, toàn bộ form readonly.

Form gồm:

* Thông tin phòng: readonly hoặc disabled nếu không được đổi
* Người đại diện: dropdown có điều kiện
* Danh sách người thuê: cho thêm người ở cùng, đánh dấu đã rời
* Thời gian và chi phí
* Nút Hủy
* Nút Cập nhật hợp đồng

Cảnh báo UI:

* “Thay đổi thông tin hợp đồng có thể ảnh hưởng đến hóa đơn các kỳ sau.”
* “Người đại diện phải là một người trong danh sách người thuê của hợp đồng.”

==================================================
5. MODAL KẾT THÚC HỢP ĐỒNG
==========================

Khi nhấn “Kết thúc hợp đồng”, hiển thị modal:

Tiêu đề:

* Kết thúc hợp đồng

Nội dung:

* Mã hợp đồng
* Phòng
* Người đại diện
* Số người thuê đang ở
* Ngày kết thúc thực tế
* Ghi chú kết thúc

Cảnh báo:

* “Sau khi kết thúc hợp đồng, phòng sẽ chuyển về trạng thái Trống.”
* “Tất cả người thuê trong hợp đồng sẽ được đánh dấu Đã rời.”
* “Các hóa đơn chưa thanh toán vẫn được giữ lại trong công nợ.”

Nút:

* Hủy
* Xác nhận kết thúc

==================================================
6. DATA SAMPLE
==============

Dùng dữ liệu mẫu:

Hợp đồng HD001:

* Phòng: A101 - Phòng A101
* Người đại diện: Nguyễn Văn A
* Người ở cùng: Trần Văn B, Lê Thị C
* Tổng: 3 người
* Ngày bắt đầu: 01/01/2026
* Ngày kết thúc: 31/12/2026
* Tiền thuê: 4.500.000 VNĐ/tháng
* Tiền cọc: 9.000.000 VNĐ
* Trạng thái: Đang hiệu lực

Hợp đồng HD005:

* Phòng: A102 - Phòng A102
* Người đại diện: Hoàng Văn F
* Người ở cùng: Đinh Thị Hoa
* Tổng: 2 người
* Trạng thái: Đang hiệu lực

Hợp đồng HD012:

* Phòng: A103 - Phòng A103
* Người đại diện: Võ Thị G
* Người ở cùng: Phạm Minh Đức, Ngô Thị Hằng, Vũ Văn Nam
* Tổng: 4 người
* Trạng thái: Đang hiệu lực

==================================================
7. STYLE REQUIREMENTS
=====================

* Modern admin dashboard
* Clean table
* Card rõ ràng
* Badge role rõ:

  * Đại diện: màu xanh/primary, icon vương miện hoặc shield
  * Ở cùng: màu xám/secondary
* Badge trạng thái rõ:

  * Đang hiệu lực: xanh
  * Sắp hết hạn: cam
  * Đã kết thúc: xám
  * Hủy: đỏ nhạt
* Stacked avatar để thể hiện nhiều người thuê
* Tooltip để xem nhanh danh sách người thuê
* Empty state, loading state, error state
* Form validation rõ ràng
* Component có thể bàn giao cho dev implement
