**ĐẶC TẢ CHỨC NĂNG: ĐĂNG NHẬP**

**1\. Thông tin chung**

**Mã chức năng:** ACC-01  
**Tên chức năng:** Đăng nhập hệ thống  
**Phân hệ:** Tài khoản  
**Tác nhân sử dụng:** Chủ trọ  
**Mức độ ưu tiên:** Bắt buộc

**2\. Mục tiêu chức năng**

Cho phép chủ trọ đăng nhập vào hệ thống bằng tài khoản đã được cấp để truy cập các chức năng quản lý nhà trọ, người thuê, hợp đồng, hóa đơn và báo cáo.
Ngoài ra, sau khi đăng nhập thành công, chủ trọ có thể vào tab Tài khoản để cập nhật thông tin cá nhân và đổi mật khẩu.

**3\. Mô tả nghiệp vụ**

Người dùng truy cập vào màn hình đăng nhập, nhập tên đăng nhập và mật khẩu.  
Hệ thống kiểm tra thông tin đăng nhập với dữ liệu tài khoản chủ trọ trong CSDL.

- Nếu đúng, hệ thống cho phép đăng nhập và chuyển đến trang Dashboard.
- Nếu sai, hệ thống hiển thị thông báo lỗi và yêu cầu nhập lại.
- Nếu người dùng bỏ trống thông tin, hệ thống phải cảnh báo ngay trên form.

**4\. Màn hình áp dụng**

**Tên màn hình:** Trang đăng nhập

**4.1. Thành phần UI hiện có trên màn hình**
Image: login_screen

**Gợi ý validation UI**

- Validate ngay khi submit
- Có thể validate realtime khi blur khỏi input
- Mật khẩu nên được che mặc định
- Icon con mắt dùng để ẩn/hiện mật khẩu

**11\. Điều kiện trước**

- Hệ thống đã có sẵn ít nhất 1 tài khoản chủ trọ trong bảng ChuTro
- Người dùng chưa đăng nhập
- Hệ thống và CSDL đang hoạt động bình thường

**12\. Điều kiện sau**

**Nếu thành công**

- Người dùng được xác thực
- Phiên đăng nhập được tạo
- Điều hướng sang Dashboard

**Nếu thất bại**

- Không tạo phiên đăng nhập
- Người dùng vẫn ở màn hình đăng nhập
- Hiển thị thông báo lỗi phù hợp

**13\. Quy tắc nghiệp vụ**

- Hệ thống chỉ phục vụ **1 người dùng chính là chủ trọ**.
- Không cần xử lý phân quyền nhiều vai trò ở bước này.
- Sau khi đăng nhập thành công, người dùng được truy cập toàn bộ chức năng hệ thống.
- Tên đăng nhập trong CSDL phải là duy nhất.
- Mật khẩu cần được lưu bảo mật. Ở phiên bản hiện tại, hệ thống đã hỗ trợ mã hóa mật khẩu bằng `bcrypt` khi đổi mật khẩu.
- Khi đăng nhập, hệ thống ưu tiên so khớp mật khẩu đã mã hóa; chỉ cho phép đối chiếu plain text ở chế độ tương thích dữ liệu cũ nếu cấu hình backend bật fallback.

**14\. Thông báo hệ thống đề xuất**

**Thông báo lỗi**

- Vui lòng nhập tên đăng nhập
- Vui lòng nhập mật khẩu
- Tên đăng nhập hoặc mật khẩu không chính xác
- Có lỗi xảy ra, vui lòng thử lại sau

**Thông báo thành công**

- Đăng nhập thành công

**17\. Đề xuất kỹ thuật triển khai**

**Backend**

- API đăng nhập nhận:
  - tenDangNhap
  - matKhau
- Truy vấn bảng ChuTro
- So khớp tài khoản
- Trả về thông tin phiên đăng nhập
- API tab Tài khoản hiện có:
  - `GET /api/auth/me`: lấy thông tin chủ trọ đang đăng nhập
  - `PUT /api/auth/profile`: cập nhật họ tên, email, số điện thoại, địa chỉ
  - `PUT /api/auth/change-password`: đổi mật khẩu bằng cách nhập mật khẩu cũ và mật khẩu mới
- Mật khẩu mới được băm bằng `bcrypt` trước khi lưu vào CSDL.

**Frontend**

- Form submit
- Validate bắt buộc
- Hiển thị lỗi dưới input hoặc toast
- Điều hướng khi thành công
- Tab Tài khoản giữ UI dạng form đơn giản, cho phép sửa thông tin cá nhân và mở modal đổi mật khẩu.
- Modal đổi mật khẩu hiển thị ngay trên tab Tài khoản, nền phía sau được blur nhẹ để người dùng vẫn nhận biết đang thao tác trong cùng màn hình.

**18\. Tab Tài khoản (ACC-02)**

**Mã chức năng:** ACC-02  
**Tên chức năng:** Quản lý tài khoản chủ trọ  
**Phân hệ:** Tài khoản  
**Tác nhân sử dụng:** Chủ trọ

**Mục tiêu**

- Cho phép chủ trọ xem và cập nhật thông tin cá nhân.
- Cho phép chủ trọ đổi mật khẩu ngay trong tab Tài khoản.

**Thành phần UI hiện có**

- Khối thông tin cá nhân: họ tên, email, số điện thoại, địa chỉ.
- Nút `Chỉnh sửa` để chuyển form sang trạng thái cập nhật.
- Khối bảo mật với nút `Đổi mật khẩu`.
- Modal đổi mật khẩu với 3 trường:
  - Mật khẩu hiện tại
  - Mật khẩu mới
  - Xác nhận mật khẩu mới

**Quy tắc nghiệp vụ**

- Họ tên không được để trống.
- Email nếu nhập thì phải đúng định dạng email.
- Số điện thoại nếu nhập thì phải gồm đúng 10 chữ số.
- Mật khẩu cũ là bắt buộc khi đổi mật khẩu.
- Mật khẩu mới tối thiểu 6 ký tự.
- Mật khẩu xác nhận phải khớp với mật khẩu mới.
- Nếu mật khẩu cũ sai, hệ thống trả lỗi `Mật khẩu cũ không đúng`.

**Điều kiện sau**

**Nếu cập nhật thông tin thành công**

- Thông tin chủ trọ được cập nhật trong bảng `CHUTRO`.
- Giao diện hiển thị thông báo `Đã cập nhật thông tin thành công`.

**Nếu đổi mật khẩu thành công**

- Mật khẩu mới được băm bằng `bcrypt` rồi mới lưu vào CSDL.
- Modal đóng lại.
- Giao diện hiển thị thông báo `Đổi mật khẩu thành công`.

**19\. Tóm tắt đặc tả ngắn gọn**

**Chức năng ACC-01 - Đăng nhập** cho phép chủ trọ nhập tên đăng nhập và mật khẩu để truy cập hệ thống. Chức năng sử dụng dữ liệu từ bảng ChuTro, cụ thể là các cột TenDangNhap và MatKhau. Khi xác thực thành công, hệ thống tạo phiên đăng nhập và chuyển người dùng đến Dashboard. Nếu thông tin không hợp lệ hoặc bỏ trống, hệ thống hiển thị lỗi tương ứng.

**Chức năng ACC-02 - Tab Tài khoản** cho phép chủ trọ xem và cập nhật thông tin cá nhân, đồng thời đổi mật khẩu bằng cơ chế xác thực mật khẩu cũ và mã hóa `bcrypt` cho mật khẩu mới trước khi lưu.