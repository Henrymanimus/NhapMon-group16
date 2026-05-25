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
Chức năng cũng hỗ trợ quên mật khẩu bằng OTP gửi qua email đã cấu hình trong tài khoản chủ trọ, giúp người dùng đặt lại mật khẩu khi không nhớ mật khẩu cũ.
Ngoài ra, màn hình đăng nhập hỗ trợ đăng ký tài khoản chủ trọ mới bằng cách nhập họ tên, email, số điện thoại, tên đăng nhập, mật khẩu và xác nhận mật khẩu.

**3\. Mô tả nghiệp vụ**

Người dùng truy cập vào màn hình đăng nhập, nhập tên đăng nhập và mật khẩu.  
Hệ thống kiểm tra thông tin đăng nhập với dữ liệu tài khoản chủ trọ trong CSDL.

- Nếu đúng, hệ thống cho phép đăng nhập và chuyển đến trang Dashboard.
- Nếu sai, hệ thống hiển thị thông báo lỗi và yêu cầu nhập lại.
- Nếu người dùng bỏ trống thông tin, hệ thống phải cảnh báo ngay trên form.

**Luồng quên mật khẩu**

Người dùng chọn `Quên mật khẩu?` tại trang đăng nhập. Hệ thống mở hộp thoại quên mật khẩu gồm 3 bước:

1. Người dùng nhập tên đăng nhập hoặc email.
2. Hệ thống kiểm tra tài khoản, tạo OTP 5 chữ số và gửi OTP tới email của tài khoản.
3. Người dùng nhập OTP để xác thực.
4. Nếu OTP hợp lệ, người dùng nhập mật khẩu mới và xác nhận mật khẩu mới.
5. Hệ thống băm mật khẩu mới bằng `bcrypt`, cập nhật vào bảng `CHUTRO`, xóa OTP đã dùng và yêu cầu người dùng đăng nhập lại.

Nếu tài khoản không tồn tại, chưa cấu hình email, OTP sai, OTP hết hạn hoặc gửi email thất bại, hệ thống hiển thị thông báo lỗi phù hợp và không cập nhật mật khẩu.

**Luồng đăng ký tài khoản**

Người dùng chọn `Đăng ký tài khoản` tại trang đăng nhập. Hệ thống mở modal đăng ký tài khoản gồm các thông tin bắt buộc:

1. Họ tên.
2. Email.
3. Số điện thoại.
4. Tên đăng nhập.
5. Mật khẩu.
6. Xác nhận mật khẩu.

Khi người dùng nhấn `Apply`, hệ thống kiểm tra dữ liệu bắt buộc, định dạng email, số điện thoại 10 chữ số, mật khẩu tối thiểu 6 ký tự và xác nhận mật khẩu phải khớp.

Nếu hợp lệ, backend tự sinh `MaChuTro` theo prefix `CT` và số thứ tự tăng dần, ví dụ `CT001`, `CT002`, sau đó băm mật khẩu bằng `bcrypt` và lưu tài khoản mới vào bảng `CHUTRO`. Khi đăng ký thành công, modal đóng lại, hệ thống quay về form đăng nhập và hiển thị thông báo đăng ký thành công.

**4\. Màn hình áp dụng**

**Tên màn hình:** Trang đăng nhập

**4.1. Thành phần UI hiện có trên màn hình**
Image: login_screen

**Gợi ý validation UI**

- Validate ngay khi submit
- Có thể validate realtime khi blur khỏi input
- Mật khẩu nên được che mặc định
- Icon con mắt dùng để ẩn/hiện mật khẩu

**4.2. Thành phần UI quên mật khẩu**

- Nút `Quên mật khẩu?` nằm cạnh label mật khẩu trên form đăng nhập.
- Hộp thoại `Quên mật khẩu` có 3 trạng thái:
  - Nhập tên đăng nhập hoặc email để gửi OTP.
  - Nhập OTP đã nhận qua email.
  - Nhập mật khẩu mới và xác nhận mật khẩu mới.
- Email nhận OTP được hiển thị ở dạng đã che bớt ký tự để người dùng nhận biết đúng hộp thư nhưng không lộ toàn bộ email.
- Trường mật khẩu mới và xác nhận mật khẩu mới được che mặc định, có icon con mắt để ẩn/hiện nội dung.

**4.3. Thành phần UI đăng ký tài khoản**

- Nút `Đăng ký tài khoản` nằm dưới nút `Đăng nhập`, dùng màu nhạt hơn nút đăng nhập để phân biệt thao tác phụ.
- Khi nhấn nút, hệ thống mở modal đăng ký tài khoản kích thước lớn.
- Modal gồm các trường bắt buộc: họ tên, email, số điện thoại, tên đăng nhập, mật khẩu, xác nhận mật khẩu.
- Hai trường mật khẩu được che mặc định và có icon con mắt để ẩn/hiện nội dung.
- Nút `Apply` dùng để gửi đăng ký.
- Nút `Hủy` dùng để đóng modal và xóa dữ liệu đang nhập.

**11\. Điều kiện trước**

- Hệ thống đã có sẵn ít nhất 1 tài khoản chủ trọ trong bảng ChuTro
- Người dùng chưa đăng nhập
- Hệ thống và CSDL đang hoạt động bình thường
- Với luồng quên mật khẩu, tài khoản chủ trọ cần có email hợp lệ trong bảng `CHUTRO`
- Backend cần cấu hình SMTP để gửi OTP qua email thật:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_SECURE`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `SMTP_FROM`
- Với luồng đăng ký, tên đăng nhập không được trùng tài khoản đã có trong bảng `CHUTRO`.
- Với luồng đăng ký, email không được trùng tài khoản đã có trong bảng `CHUTRO`.

**12\. Điều kiện sau**

**Nếu thành công**

- Người dùng được xác thực
- Phiên đăng nhập được tạo
- Điều hướng sang Dashboard

**Nếu thất bại**

- Không tạo phiên đăng nhập
- Người dùng vẫn ở màn hình đăng nhập
- Hiển thị thông báo lỗi phù hợp

**Nếu quên mật khẩu thành công**

- Mật khẩu mới được băm bằng `bcrypt` rồi lưu vào bảng `CHUTRO`.
- OTP đã dùng bị xóa và không thể dùng lại.
- Người dùng quay lại màn hình đăng nhập và đăng nhập bằng mật khẩu mới.

**Nếu quên mật khẩu thất bại**

- Mật khẩu trong CSDL không thay đổi.
- Người dùng vẫn ở hộp thoại quên mật khẩu.
- Hệ thống hiển thị lỗi theo nguyên nhân: không tìm thấy tài khoản, tài khoản chưa có email, OTP sai hoặc hết hạn, mật khẩu xác nhận không khớp, hoặc không gửi được email OTP.

**Nếu đăng ký tài khoản thành công**

- Tài khoản chủ trọ mới được thêm vào bảng `CHUTRO`.
- `MaChuTro` được sinh theo dạng `CT###`.
- Mật khẩu được băm bằng `bcrypt` trước khi lưu.
- Người dùng quay lại màn hình đăng nhập.
- Hệ thống hiển thị thông báo đăng ký thành công.

**Nếu đăng ký tài khoản thất bại**

- Không thêm tài khoản mới vào CSDL.
- Người dùng vẫn ở modal đăng ký.
- Hệ thống hiển thị lỗi theo nguyên nhân: thiếu dữ liệu bắt buộc, email không hợp lệ, số điện thoại không đúng 10 chữ số, mật khẩu quá ngắn, xác nhận mật khẩu không khớp, tên đăng nhập hoặc email đã tồn tại.

**13\. Quy tắc nghiệp vụ**

- Hệ thống chỉ phục vụ **1 người dùng chính là chủ trọ**.
- Không cần xử lý phân quyền nhiều vai trò ở bước này.
- Sau khi đăng nhập thành công, người dùng được truy cập toàn bộ chức năng hệ thống.
- Tên đăng nhập trong CSDL phải là duy nhất.
- Mật khẩu cần được lưu bảo mật. Ở phiên bản hiện tại, hệ thống đã hỗ trợ mã hóa mật khẩu bằng `bcrypt` khi đổi mật khẩu.
- Khi đăng nhập, hệ thống ưu tiên so khớp mật khẩu đã mã hóa; chỉ cho phép đối chiếu plain text ở chế độ tương thích dữ liệu cũ nếu cấu hình backend bật fallback.
- Luồng quên mật khẩu cho phép tìm tài khoản bằng tên đăng nhập hoặc email.
- Chỉ tài khoản đã cấu hình email mới được yêu cầu OTP quên mật khẩu.
- OTP quên mật khẩu gồm đúng 5 chữ số và có hiệu lực trong 10 phút.
- OTP được lưu tạm trên backend theo tên đăng nhập/email đã nhập, không lưu trực tiếp vào CSDL.
- Khi OTP sai, hết hạn hoặc đã dùng, hệ thống không cho đặt lại mật khẩu.
- Khi đặt lại mật khẩu thành công, OTP bị xóa ngay để tránh tái sử dụng.
- Mật khẩu mới trong luồng quên mật khẩu tối thiểu 6 ký tự và phải khớp với ô xác nhận mật khẩu ở frontend.
- Nếu SMTP chưa được cấu hình trong môi trường dev, backend chỉ ghi OTP ra log server để hỗ trợ kiểm thử; khi SMTP đã cấu hình, OTP được gửi qua email thật.
- Khi đăng ký tài khoản, hệ thống tự sinh mã chủ trọ bằng prefix `CT` và số thứ tự tăng dần.
- Tên đăng nhập trong luồng đăng ký không được trùng với tài khoản đã có.
- Email trong luồng đăng ký không được trùng với tài khoản đã có.

**14\. Thông báo hệ thống đề xuất**

**Thông báo lỗi**

- Vui lòng nhập tên đăng nhập
- Vui lòng nhập mật khẩu
- Tên đăng nhập hoặc mật khẩu không chính xác
- Có lỗi xảy ra, vui lòng thử lại sau
- Vui lòng nhập tên đăng nhập hoặc email
- Không tìm thấy tài khoản
- Tài khoản chưa cấu hình email
- Vui lòng nhập mã OTP
- OTP phải gồm 5 chữ số
- OTP không đúng hoặc đã hết hạn
- Vui lòng nhập mật khẩu mới
- Vui lòng xác nhận mật khẩu mới
- Mật khẩu xác nhận không khớp
- Mật khẩu mới phải có ít nhất 6 ký tự
- Không gửi được mã OTP qua email. Vui lòng kiểm tra cấu hình SMTP.
- Vui lòng nhập họ tên
- Vui lòng nhập email
- Email không hợp lệ
- Vui lòng nhập số điện thoại
- Số điện thoại phải có 10 chữ số
- Vui lòng nhập tên đăng nhập
- Vui lòng nhập mật khẩu
- Mật khẩu phải có ít nhất 6 ký tự
- Vui lòng xác nhận mật khẩu
- Mật khẩu xác nhận không khớp
- Tên đăng nhập đã tồn tại
- Email đã được sử dụng

**Thông báo thành công**

- Đăng nhập thành công
- Đã gửi mã OTP 5 chữ số tới email của tài khoản
- OTP hợp lệ. Vui lòng nhập mật khẩu mới.
- Đổi mật khẩu thành công. Vui lòng đăng nhập lại.
- Đăng ký tài khoản thành công. Vui lòng đăng nhập.

**17\. Đề xuất kỹ thuật triển khai**

**Backend**

- API đăng nhập nhận:
  - tenDangNhap
  - matKhau
- API đăng ký tài khoản nhận:
  - hoTen
  - email
  - soDienThoai
  - tenDangNhap
  - matKhau
- Truy vấn bảng ChuTro
- So khớp tài khoản
- Trả về thông tin phiên đăng nhập
- API đăng ký hiện có:
  - `POST /api/auth/register`: tạo tài khoản chủ trọ mới, tự sinh `MaChuTro`, băm mật khẩu bằng `bcrypt`, lưu vào bảng `CHUTRO`.
- API tab Tài khoản hiện có:
  - `GET /api/auth/me`: lấy thông tin chủ trọ đang đăng nhập
  - `PUT /api/auth/profile`: cập nhật họ tên, email, số điện thoại, địa chỉ
  - `PUT /api/auth/change-password`: đổi mật khẩu bằng cách nhập mật khẩu cũ và mật khẩu mới
- API quên mật khẩu hiện có:
  - `POST /api/auth/forgot-password`: nhận `tenDangNhap`, cho phép nhập tên đăng nhập hoặc email; kiểm tra tài khoản, tạo OTP 5 chữ số, gửi OTP qua SMTP và trả về email đã che.
  - `POST /api/auth/verify-otp`: nhận `tenDangNhap` và `otp`; kiểm tra OTP còn hiệu lực trước khi cho nhập mật khẩu mới.
  - `POST /api/auth/reset-password`: nhận `tenDangNhap`, `otp`, `matKhauMoi`; kiểm tra lại OTP, băm mật khẩu mới bằng `bcrypt`, cập nhật bảng `CHUTRO` và xóa OTP.
- OTP quên mật khẩu được lưu tạm trong bộ nhớ backend với thời hạn 10 phút.
- Email OTP được gửi bằng `nodemailer` thông qua cấu hình SMTP trong `.env`.
- Mật khẩu mới được băm bằng `bcrypt` trước khi lưu vào CSDL.

**Frontend**

- Form submit
- Validate bắt buộc
- Hiển thị lỗi dưới input hoặc toast
- Điều hướng khi thành công
- Form đăng nhập có nút `Đăng ký tài khoản` dưới nút `Đăng nhập`.
- Dialog đăng ký tài khoản gồm họ tên, email, số điện thoại, tên đăng nhập, mật khẩu và xác nhận mật khẩu.
- Dialog đăng ký validate mật khẩu tối thiểu 6 ký tự và xác nhận mật khẩu phải khớp.
- Sau khi đăng ký thành công, dialog đóng lại, tên đăng nhập mới được điền vào form login và hiển thị thông báo đăng ký thành công.
- Form đăng nhập có nút `Quên mật khẩu?` mở dialog xử lý 3 bước: gửi OTP, xác nhận OTP, đặt mật khẩu mới.
- Dialog quên mật khẩu giữ lại tên đăng nhập/email đã nhập và hiển thị email đã che sau khi gửi OTP.
- Trường mật khẩu mới và xác nhận mật khẩu mới trong dialog có icon eye để ẩn/hiện mật khẩu.
- Sau khi đặt lại mật khẩu thành công, dialog đóng lại và trang đăng nhập hiển thị thông báo yêu cầu đăng nhập lại.
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

**Chức năng ACC-01.1 - Quên mật khẩu** cho phép chủ trọ yêu cầu OTP 5 chữ số qua email, xác thực OTP và đặt lại mật khẩu mới. OTP có hiệu lực 10 phút, được lưu tạm trên backend, bị xóa sau khi dùng hoặc hết hạn. Mật khẩu mới được băm bằng `bcrypt` trước khi cập nhật vào bảng `CHUTRO`.

**Chức năng ACC-01.2 - Đăng ký tài khoản** cho phép chủ trọ tạo tài khoản mới từ trang đăng nhập. Hệ thống validate thông tin bắt buộc, tự sinh `MaChuTro` theo prefix `CT`, băm mật khẩu bằng `bcrypt` và lưu vào bảng `CHUTRO`. Sau khi đăng ký thành công, người dùng quay lại form đăng nhập.

**Chức năng ACC-02 - Tab Tài khoản** cho phép chủ trọ xem và cập nhật thông tin cá nhân, đồng thời đổi mật khẩu bằng cơ chế xác thực mật khẩu cũ và mã hóa `bcrypt` cho mật khẩu mới trước khi lưu.
