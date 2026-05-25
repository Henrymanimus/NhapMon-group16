**SRS - QUẢN LÝ NGƯỜI THUÊ (NGT)**

**1\. Thông tin chung**

**Mã nhóm chức năng: NGT
Tên chức năng: Quản lý người thuê
Tác nhân: Chủ trọ
Mức độ ưu tiên: Bắt buộc**

**Chức năng này cho phép chủ trọ quản lý thông tin cá nhân người thuê, xem tình trạng đang ở, vai trò trong hợp đồng, phòng hiện tại, lịch sử thuê và hóa đơn liên quan.**

**2\. Mục tiêu chức năng**

**Chủ trọ có thể:**

- **Xem danh sách người thuê**
- **Thêm người thuê mới**
- **Xem chi tiết người thuê**
- **Chỉnh sửa thông tin người thuê**
- **Xóa người thuê nếu đủ điều kiện**
- **Theo dõi phòng hiện tại của người thuê**
- **Theo dõi vai trò: Đại diện hoặc Ở cùng**
- **Xem lịch sử thuê**
- **Xem hóa đơn/công nợ liên quan**

**3\. Danh sách chức năng con**

| **Mã**     | **Tên chức năng**            | **Mô tả**                                                      |
| ---------- | ---------------------------- | -------------------------------------------------------------- |
| **NGT-01** | **Xem danh sách người thuê** | **Hiển thị danh sách toàn bộ người thuê**                      |
| **NGT-02** | **Tìm kiếm người thuê**      | **Tìm theo tên, SĐT, CCCD, phòng**                             |
| **NGT-03** | **Lọc người thuê**           | **Lọc theo trạng thái hoặc vai trò**                           |
| **NGT-04** | **Xem chi tiết người thuê**  | **Xem thông tin cá nhân, phòng đang ở, lịch sử thuê, hóa đơn** |
| **NGT-05** | **Thêm người thuê**          | **Thêm mới thông tin cá nhân người thuê**                      |
| **NGT-06** | **Chỉnh sửa người thuê**     | **Cập nhật thông tin cá nhân người thuê**                      |
| **NGT-07** | **Xóa người thuê**           | **Xóa người thuê nếu trạng thái hiện tại là Đã rời**           |
| **NGT-08** | **Xem lịch sử thuê**         | **Xem các hợp đồng người thuê đã tham gia**                    |
| **NGT-09** | **Xem hóa đơn liên quan**    | **Xem hóa đơn phát sinh từ các hợp đồng liên quan**            |

**4\. Màn hình liên quan**

| **STT** | **Màn hình**             | **Route**             |
| ------- | ------------------------ | --------------------- |
| **1**   | **Danh sách người thuê** | **/tenants**          |
| **2**   | **Thêm người thuê**      | **/tenants/new**      |
| **3**   | **Chi tiết người thuê**  | **/tenants/:id**      |
| **4**   | **Chỉnh sửa người thuê** | **/tenants/:id/edit** |
| **5**   | **Popup xác nhận xóa**   | **Modal**             |

**5\. ERD liên quan**

**5.1. Bảng chính: NguoiThue**

| **Cột**         | **Mô tả**              |
| --------------- | ---------------------- |
| **MaNguoiThue** | **Mã người thuê**      |
| **HoTen**       | **Họ tên**             |
| **SoDienThoai** | **Số điện thoại**      |
| **CCCD**        | **CCCD/CMND**          |
| **Email**       | **Email**              |
| **NgaySinh**    | **Ngày sinh**          |
| **DiaChi**      | **Địa chỉ thường trú** |

**5.2. Bảng liên quan**

| **Bảng**              | **Vai trò**                                                                         |
| --------------------- | ----------------------------------------------------------------------------------- |
| **HopDong_NguoiThue** | **Xác định người thuê tham gia hợp đồng nào, vai trò gì, trạng thái đang ở/đã rời** |
| **HopDong**           | **Xác định phòng, thời gian thuê, hợp đồng hiệu lực**                               |
| **NhaTro**            | **Lấy thông tin phòng hiện tại**                                                    |
| **HoaDon**            | **Lấy hóa đơn và công nợ liên quan**                                                |

**6\. Nguyên tắc nghiệp vụ mới**

**6.1. Người thuê không gắn trực tiếp với phòng**

**Người thuê được gắn với phòng thông qua:**

**NguoiThue → HopDong_NguoiThue → HopDong → NhaTro**

**Không được lưu trực tiếp MaNhaTro trong bảng NguoiThue.**

**6.2. Một phòng có thể có nhiều người thuê**

**Một hợp đồng có thể có nhiều người thuê thông qua bảng HopDong_NguoiThue.**

**Trong đó:**

- **1 người có vai trò Đại diện**
- **Các người còn lại có vai trò Ở cùng**

**6.3. Người đại diện**

**Người đại diện được xác định bởi:**

**HopDong.MaNguoiDaiDien**

**Đồng thời người này cũng phải tồn tại trong bảng:**

**HopDong_NguoiThue**

**với:**

**VaiTro = 'Đại diện'**

**6.4. Trạng thái người thuê**

**Trạng thái người thuê không lưu trực tiếp trong bảng NguoiThue.**

**Trạng thái được suy ra từ bảng HopDong_NguoiThue:**

| **Trạng thái UI** | **Điều kiện**                                                                      |
| ----------------- | ---------------------------------------------------------------------------------- |
| **Đang ở**        | **Có bản ghi HopDong_NguoiThue.TrangThai = 'Đang ở' trong hợp đồng đang hiệu lực** |
| **Đã rời**        | **Không còn hợp đồng đang ở hoặc bản ghi có TrangThai = 'Đã rời'**                 |

**7\. NGT-01 - Xem danh sách người thuê**

**7.1. Mục tiêu**

**Hiển thị danh sách người thuê để chủ trọ dễ theo dõi ai đang ở, ở phòng nào, vai trò gì và trạng thái hiện tại.**

**7.2. Thành phần UI**

**Màn hình danh sách gồm:**

**Card thống kê**

- **Tổng người thuê**
- **Đang ở**
- **Đã rời**
- **Người đại diện**

**Bộ lọc/tìm kiếm**

- **Tìm theo tên, SĐT, CCCD, phòng**
- **Lọc theo trạng thái**
- **Lọc theo vai trò**

**Bảng danh sách**

- **Người thuê**
- **SĐT**
- **CCCD/CMND**
- **Phòng hiện tại**
- **Vai trò**
- **Ngày tham gia**
- **Trạng thái**
- **Thao tác**

**7.3. Mapping UI với DB**

| **UI**             | **Bảng**              | **Cột**                 |
| ------------------ | --------------------- | ----------------------- |
| **Người thuê**     | **NguoiThue**         | **HoTen**               |
| **SĐT**            | **NguoiThue**         | **SoDienThoai**         |
| **CCCD/CMND**      | **NguoiThue**         | **CCCD**                |
| **Phòng hiện tại** | **NhaTro**            | **MaNhaTro, TenNhaTro** |
| **Vai trò**        | **HopDong_NguoiThue** | **VaiTro**              |
| **Ngày tham gia**  | **HopDong_NguoiThue** | **NgayThamGia**         |
| **Trạng thái**     | **HopDong_NguoiThue** | **TrangThai**           |

**7.4. Luồng xử lý chính**

- **Chủ trọ chọn menu Người thuê.**
- **Hệ thống truy xuất danh sách người thuê.**
- **Hệ thống join dữ liệu từ NguoiThue, HopDong_NguoiThue, HopDong, NhaTro.**
- **Hệ thống hiển thị danh sách người thuê.**
- **Chủ trọ có thể tìm kiếm, lọc, xem chi tiết, chỉnh sửa hoặc xóa.**

**7.5. Query gợi ý**

**SELECT
nt.MaNguoiThue,
nt.HoTen,
nt.SoDienThoai,
nt.CCCD,
n.MaNhaTro,
n.TenNhaTro,
hdnt.VaiTro,
hdnt.NgayThamGia,
hdnt.TrangThai
FROM NguoiThue nt
LEFT JOIN HopDong_NguoiThue hdnt
ON nt.MaNguoiThue = hdnt.MaNguoiThue
AND hdnt.TrangThai = N'Đang ở'
LEFT JOIN HopDong hd
ON hdnt.MaHopDong = hd.MaHopDong
AND hd.TrangThai = N'Đang hiệu lực'
LEFT JOIN NhaTro n
ON hd.MaNhaTro = n.MaNhaTro;**

**8\. NGT-02 - Tìm kiếm người thuê**

**8.1. Mục tiêu**

**Cho phép chủ trọ tìm kiếm người thuê theo thông tin cá nhân hoặc phòng đang ở.**

**8.2. Input**

| **Trường**  | **Kiểu** | **Bắt buộc** |
| ----------- | -------- | ------------ |
| **Từ khóa** | **Text** | **Không**    |

**8.3. Phạm vi tìm kiếm**

- **Họ tên**
- **Số điện thoại**
- **CCCD/CMND**
- **Mã phòng**
- **Tên phòng**

**8.4. Query gợi ý**

**WHERE nt.HoTen LIKE '%' + @keyword + '%'
OR nt.SoDienThoai LIKE '%' + @keyword + '%'
OR nt.CCCD LIKE '%' + @keyword + '%'
OR n.MaNhaTro LIKE '%' + @keyword + '%'
OR n.TenNhaTro LIKE '%' + @keyword + '%'**

**9\. NGT-03 - Lọc người thuê**

**9.1. Lọc theo trạng thái**

| **UI**                | **DB**                                     |
| --------------------- | ------------------------------------------ |
| **Tất cả trạng thái** | **Không lọc**                              |
| **Đang ở**            | **HopDong_NguoiThue.TrangThai = 'Đang ở'** |
| **Đã rời**            | **HopDong_NguoiThue.TrangThai = 'Đã rời'** |

**9.2. Lọc theo vai trò**

| **UI**             | **DB**                                    |
| ------------------ | ----------------------------------------- |
| **Tất cả vai trò** | **Không lọc**                             |
| **Đại diện**       | **HopDong_NguoiThue.VaiTro = 'Đại diện'** |
| **Ở cùng**         | **HopDong_NguoiThue.VaiTro = 'Ở cùng'**   |

**10\. NGT-04 - Xem chi tiết người thuê**

**10.1. Mục tiêu**

**Hiển thị chi tiết thông tin một người thuê, bao gồm:**

- **thông tin cá nhân**
- **phòng đang ở**
- **vai trò hiện tại**
- **người ở cùng phòng**
- **lịch sử thuê**
- **hóa đơn liên quan**
- **công nợ**

**10.2. Thành phần UI**

**Header**

- **Avatar**
- **Tên người thuê**
- **Badge trạng thái**
- **Vai trò**
- **Phòng hiện tại**
- **Nút chỉnh sửa**

**Block 1: Thông tin cá nhân**

- **Họ tên**
- **Số điện thoại**
- **Email**
- **CCCD/CMND**
- **Ngày sinh**
- **Ngày tham gia**
- **Địa chỉ thường trú**

**Block 2: Phòng đang ở**

- **Mã phòng**
- **Tên phòng**
- **Giá thuê**
- **Vai trò**
- **Mã hợp đồng**
- **Ngày bắt đầu**
- **Ngày kết thúc**
- **Người ở cùng phòng**

**Block 3: Lịch sử thuê**

- **Mã hợp đồng**
- **Phòng**
- **Vai trò**
- **Số người trong hợp đồng**
- **Thời gian**
- **Trạng thái**

**Block 4: Hóa đơn liên quan**

- **Mã hóa đơn**
- **Phòng**
- **Tháng**
- **Số tiền**
- **Trạng thái thanh toán**

**Block 5: Công nợ**

- **Tổng nợ chưa thanh toán**
- **Số hóa đơn chưa thanh toán**

**10.3. Mapping chi tiết người thuê với DB**

| **UI**                    | **Bảng**              | **Cột**                                       |
| ------------------------- | --------------------- | --------------------------------------------- |
| **Họ tên**                | **NguoiThue**         | **HoTen**                                     |
| **SĐT**                   | **NguoiThue**         | **SoDienThoai**                               |
| **Email**                 | **NguoiThue**         | **Email**                                     |
| **CCCD/CMND**             | **NguoiThue**         | **CCCD**                                      |
| **Ngày sinh**             | **NguoiThue**         | **NgaySinh**                                  |
| **Địa chỉ**               | **NguoiThue**         | **DiaChi**                                    |
| **Ngày tham gia**         | **HopDong_NguoiThue** | **NgayThamGia**                               |
| **Vai trò**               | **HopDong_NguoiThue** | **VaiTro**                                    |
| **Phòng hiện tại**        | **NhaTro**            | **MaNhaTro, TenNhaTro**                       |
| **Hợp đồng**              | **HopDong**           | **MaHopDong**                                 |
| **Ngày bắt đầu/kết thúc** | **HopDong**           | **NgayBatDau, NgayKetThuc**                   |
| **Hóa đơn**               | **HoaDon**            | **MaHoaDon, Thang, Nam, TongTien, TrangThai** |

**10.4. Query lấy thông tin phòng đang ở**

**SELECT
n.MaNhaTro,
n.TenNhaTro,
hd.MaHopDong,
hd.NgayBatDau,
hd.NgayKetThuc,
hd.TienThue,
hdnt.VaiTro,
hdnt.NgayThamGia,
hdnt.TrangThai
FROM HopDong_NguoiThue hdnt
JOIN HopDong hd
ON hdnt.MaHopDong = hd.MaHopDong
JOIN NhaTro n
ON hd.MaNhaTro = n.MaNhaTro
WHERE hdnt.MaNguoiThue = @MaNguoiThue
AND hdnt.TrangThai = N'Đang ở'
AND hd.TrangThai = N'Đang hiệu lực';**

**10.5. Query lấy người ở cùng phòng**

**SELECT
nt.MaNguoiThue,
nt.HoTen,
nt.SoDienThoai,
hdnt.VaiTro
FROM HopDong_NguoiThue hdnt
JOIN NguoiThue nt
ON hdnt.MaNguoiThue = nt.MaNguoiThue
WHERE hdnt.MaHopDong = @MaHopDong
AND hdnt.TrangThai = N'Đang ở'
AND nt.MaNguoiThue <> @MaNguoiThue;**

**10.6. Query lấy lịch sử thuê**

**SELECT
hd.MaHopDong,
n.MaNhaTro,
n.TenNhaTro,
hdnt.VaiTro,
hd.NgayBatDau,
hd.NgayKetThuc,
hd.TrangThai,
COUNT(hdnt2.MaNguoiThue) AS SoNguoi
FROM HopDong_NguoiThue hdnt
JOIN HopDong hd
ON hdnt.MaHopDong = hd.MaHopDong
JOIN NhaTro n
ON hd.MaNhaTro = n.MaNhaTro
LEFT JOIN HopDong_NguoiThue hdnt2
ON hd.MaHopDong = hdnt2.MaHopDong
WHERE hdnt.MaNguoiThue = @MaNguoiThue
GROUP BY
hd.MaHopDong,
n.MaNhaTro,
n.TenNhaTro,
hdnt.VaiTro,
hd.NgayBatDau,
hd.NgayKetThuc,
hd.TrangThai;**

**10.7. Query lấy hóa đơn liên quan**

**SELECT
hd.MaHoaDon,
n.MaNhaTro,
hd.Thang,
hd.Nam,
hd.TongTien,
hd.TrangThai
FROM HoaDon hd
JOIN HopDong h
ON hd.MaHopDong = h.MaHopDong
JOIN NhaTro n
ON h.MaNhaTro = n.MaNhaTro
JOIN HopDong_NguoiThue hdnt
ON h.MaHopDong = hdnt.MaHopDong
WHERE hdnt.MaNguoiThue = @MaNguoiThue;**

**10.8. Query tính công nợ**

**SELECT
SUM(hd.TongTien) AS TongNo,
COUNT(hd.MaHoaDon) AS SoHoaDonChuaThanhToan
FROM HoaDon hd
JOIN HopDong h
ON hd.MaHopDong = h.MaHopDong
JOIN HopDong_NguoiThue hdnt
ON h.MaHopDong = hdnt.MaHopDong
WHERE hdnt.MaNguoiThue = @MaNguoiThue
AND hd.TrangThai = N'Chưa thanh toán';**

**11\. NGT-05 - Thêm người thuê**

**11.1. Mục tiêu**

**Cho phép chủ trọ tạo mới thông tin cá nhân người thuê.**

**11.2. Nguyên tắc quan trọng**

**Khi thêm người thuê:**

- **chỉ nhập thông tin cá nhân**
- **không gán phòng tại đây**
- **không chọn vai trò tại đây**
- **không chọn ngày tham gia tại đây**

**Việc gán phòng, xác định vai trò và ngày tham gia sẽ được thực hiện khi tạo hợp đồng.**

**11.3. Dữ liệu đầu vào**

| **Field UI**           | **Bảng**                      | **Cột**         | **Bắt buộc** |
| ---------------------- | ----------------------------- | --------------- | ------------ |
| **Họ tên**             | **NguoiThue**                 | **HoTen**       | **Có**       |
| **Số điện thoại**      | **NguoiThue**                 | **SoDienThoai** | **Có**       |
| **Email**              | **NguoiThue**                 | **Email**       | **Không**    |
| **CCCD/CMND**          | **NguoiThue**                 | **CCCD**        | **Có**       |
| **Ngày sinh**          | **NguoiThue**                 | **NgaySinh**    | **Có**       |
| **Địa chỉ thường trú** | **NguoiThue**                 | **DiaChi**      | **Có**       |
| **Ghi chú**            | **Có thể bổ sung cột GhiChu** | **GhiChu**      | **Không**    |

**11.4. Luồng xử lý chính**

- **Chủ trọ nhấn Thêm người thuê.**
- **Hệ thống mở form thêm người thuê.**
- **Chủ trọ nhập thông tin cá nhân.**
- **Chủ trọ nhấn Lưu.**
- **Hệ thống validate dữ liệu.**
- **Nếu hợp lệ:**
  - **thêm bản ghi vào bảng NguoiThue**
  - **hiển thị thông báo thành công**
  - **điều hướng về danh sách hoặc chi tiết người thuê**
- **Nếu không hợp lệ:**
  - **hiển thị lỗi tại field tương ứng**

**11.5. Validation**

| **Field**         | **Quy tắc**                                 |
| ----------------- | ------------------------------------------- |
| **Họ tên**        | **Không rỗng**                              |
| **Số điện thoại** | **Không rỗng, đúng định dạng**              |
| **Email**         | **Nếu nhập thì phải đúng định dạng email**  |
| **CCCD/CMND**     | **Không rỗng, không trùng**                 |
| **Ngày sinh**     | **Không rỗng, không lớn hơn ngày hiện tại** |
| **Địa chỉ**       | **Không rỗng**                              |

**11.6. Query gợi ý**

**INSERT INTO NguoiThue (
MaNguoiThue,
HoTen,
SoDienThoai,
CCCD,
Email,
NgaySinh,
DiaChi
)
VALUES (
@MaNguoiThue,
@HoTen,
@SoDienThoai,
@CCCD,
@Email,
@NgaySinh,
@DiaChi
);**

**12\. NGT-06 - Chỉnh sửa người thuê**

**12.1. Mục tiêu**

**Cho phép chủ trọ cập nhật thông tin cá nhân của người thuê.**

**12.2. Nguyên tắc nghiệp vụ**

**Form chỉnh sửa chỉ cập nhật thông tin cá nhân, không cập nhật thông tin thuê phòng.**

**Không được chỉnh sửa tại đây:**

- **phòng hiện tại**
- **vai trò**
- **ngày tham gia**
- **hợp đồng**

**Các thông tin này chỉ được thay đổi qua chức năng quản lý hợp đồng.**

**12.3. Field được chỉnh sửa**

| **Field**              | **Cho sửa?**     | **Ghi chú**                   |
| ---------------------- | ---------------- | ----------------------------- |
| **Họ tên**             | **Có**           | **Cho phép sửa nếu nhập sai** |
| **Số điện thoại**      | **Có**           | **Người thuê có thể đổi số**  |
| **Email**              | **Có**           | **Không bắt buộc**            |
| **Ngày sinh**          | **Có**           | **Cho sửa nếu nhập sai**      |
| **Địa chỉ thường trú** | **Có**           | **Cho sửa**                   |
| **Ghi chú**            | **Có**           | **Nếu có cột GhiChu**         |
| **CCCD/CMND**          | **Có điều kiện** | **Khóa nếu đã có hợp đồng**   |

**12.4. Rule khóa CCCD/CMND**

**Đối với chức năng chỉnh sửa người thuê, hệ thống cho phép cập nhật thông tin cá nhân như họ tên, số điện thoại, email, ngày sinh, địa chỉ và ghi chú. Riêng trường CCCD/CMND sẽ bị khóa chỉnh sửa nếu người thuê đã từng tham gia ít nhất một hợp đồng. Trường hợp người thuê chưa có hợp đồng nào, chủ trọ được phép chỉnh sửa CCCD/CMND.**

**12.5. Kiểm tra người thuê đã có hợp đồng hay chưa**

**SELECT COUNT(\*)
FROM HopDong_NguoiThue
WHERE MaNguoiThue = @MaNguoiThue;**

**Nếu kết quả > 0:**

- **disable field CCCD/CMND**
- **hiển thị note:**

**CCCD/CMND đã được sử dụng trong hợp đồng nên không thể chỉnh sửa.**

**12.6. Luồng xử lý chính**

- **Chủ trọ click icon chỉnh sửa.**
- **Hệ thống mở màn hình chỉnh sửa người thuê.**
- **Hệ thống load dữ liệu người thuê từ bảng NguoiThue.**
- **Hệ thống kiểm tra người thuê đã từng tham gia hợp đồng chưa.**
- **Nếu đã có hợp đồng:**
  - **khóa field CCCD/CMND.**
- **Chủ trọ cập nhật thông tin cá nhân.**
- **Chủ trọ nhấn Cập nhật người thuê.**
- **Hệ thống validate dữ liệu.**
- **Nếu hợp lệ:**
  - **cập nhật bảng NguoiThue**
  - **hiển thị thông báo thành công**
- **Nếu không hợp lệ:**

- **hiển thị lỗi tương ứng.**

**12.7. Query cập nhật**

**Trường hợp chưa có hợp đồng, cho phép sửa CCCD**

**UPDATE NguoiThue
SET
HoTen = @HoTen,
SoDienThoai = @SoDienThoai,
Email = @Email,
CCCD = @CCCD,
NgaySinh = @NgaySinh,
DiaChi = @DiaChi
WHERE MaNguoiThue = @MaNguoiThue;**

**Trường hợp đã có hợp đồng, không sửa CCCD**

**UPDATE NguoiThue
SET
HoTen = @HoTen,
SoDienThoai = @SoDienThoai,
Email = @Email,
NgaySinh = @NgaySinh,
DiaChi = @DiaChi
WHERE MaNguoiThue = @MaNguoiThue;**

**13\. NGT-07 - Xóa người thuê**

**13.1. Mục tiêu**

**Cho phép chủ trọ xóa người thuê trong trường hợp nhập sai hoặc không còn cần quản lý.**

**13.2. Rule xóa**

**Không cho xóa người thuê nếu:**

- **người thuê đang có trạng thái Đang ở**
- **người thuê còn bản ghi HopDong_NguoiThue.TrangThai = 'Đang ở'**

**Cho phép xóa người thuê nếu:**

- **người thuê có trạng thái Đã rời**
- **người thuê không còn bản ghi HopDong_NguoiThue.TrangThai = 'Đang ở'**

**Khi xóa người thuê Đã rời, hệ thống được phép dọn các dòng liên kết lịch sử có TrangThai = 'Đã rời' trước khi xóa người thuê khỏi DB để đảm bảo ràng buộc khóa ngoại.**

**13.3. UI hiện tại**

**Khi nhấn icon xóa, hệ thống hiển thị modal:**

**Xóa người thuê
Bạn có chắc muốn xóa người thuê này?**

**Nếu người thuê đang ở, hệ thống không mở luồng xóa thành công và hiển thị cảnh báo:**

**Người thuê đang ở trong hợp đồng hiệu lực, cần kết thúc hợp đồng trước khi xóa.**

**13.4. Luồng xử lý**

- **Chủ trọ nhấn icon xóa.**
- **Hệ thống kiểm tra người thuê có bản ghi HopDong_NguoiThue.TrangThai = 'Đang ở' hay không.**
- **Nếu có trạng thái Đang ở:**
  - **không cho xóa**
  - **hiển thị cảnh báo.**
- **Nếu trạng thái Đã rời hoặc không có bản ghi Đang ở:**
  - **hiển thị modal xác nhận xóa.**
- **Chủ trọ nhấn xác nhận.**
- **Hệ thống dọn các dòng HopDong_NguoiThue có TrangThai = 'Đã rời' liên quan.**
- **Hệ thống xóa người thuê khỏi bảng NguoiThue.**

**13.5. Đề xuất cho đồ án sinh viên**

**Rule áp dụng trong đồ án:**

**Nếu người thuê đang ở thì không cho xóa.
Nếu người thuê đã rời thì cho phép xóa khỏi DB.**

**13.6. Query kiểm tra**

**SELECT COUNT(\*)
FROM HopDong_NguoiThue
WHERE MaNguoiThue = @MaNguoiThue
AND TrangThai = N'Đang ở';**

**13.7. Query xóa**

**DELETE FROM HopDong_NguoiThue
WHERE MaNguoiThue = @MaNguoiThue
AND TrangThai = N'Đã rời';

DELETE FROM NguoiThue
WHERE MaNguoiThue = @MaNguoiThue;**

**Với đồ án hiện tại dùng xóa cứng khỏi DB: chỉ chặn người thuê Đang ở, cho phép xóa người thuê Đã rời.**

**14\. Card thống kê người thuê**

**14.1. Tổng người thuê**

**SELECT COUNT(\*)
FROM NguoiThue;**

**14.2. Đang ở**

**SELECT COUNT(DISTINCT MaNguoiThue)
FROM HopDong_NguoiThue
WHERE TrangThai = N'Đang ở';**

**14.3. Đã rời**

**SELECT COUNT(DISTINCT MaNguoiThue)
FROM HopDong_NguoiThue
WHERE TrangThai = N'Đã rời';**

**14.4. Người đại diện**

**SELECT COUNT(DISTINCT MaNguoiThue)
FROM HopDong_NguoiThue
WHERE VaiTro = N'Đại diện'
AND TrangThai = N'Đang ở';**

**15\. API gợi ý**

| **Method** | **Endpoint**                    | **Mục đích**                 |
| ---------- | ------------------------------- | ---------------------------- |
| **GET**    | **/api/tenants**                | **Lấy danh sách người thuê** |
| **GET**    | **/api/tenants/{id}**           | **Xem chi tiết người thuê**  |
| **POST**   | **/api/tenants**                | **Thêm người thuê**          |
| **PUT**    | **/api/tenants/{id}**           | **Cập nhật người thuê**      |
| **DELETE** | **/api/tenants/{id}**           | **Xóa người thuê**           |
| **GET**    | **/api/tenants/{id}/contracts** | **Lấy lịch sử thuê**         |
| **GET**    | **/api/tenants/{id}/invoices**  | **Lấy hóa đơn liên quan**    |
| **GET**    | **/api/tenants/{id}/debt**      | **Lấy công nợ**              |

**16\. Thông báo hệ thống**

| **Trường hợp**          | **Thông báo**                                                              |
| ----------------------- | -------------------------------------------------------------------------- |
| **Thêm thành công**     | **Thêm người thuê thành công**                                             |
| **Cập nhật thành công** | **Cập nhật người thuê thành công**                                         |
| **Xóa thành công**      | **Xóa người thuê thành công**                                              |
| **CCCD trùng**          | **CCCD/CMND đã tồn tại**                                                   |
| **Không cho sửa CCCD**  | **CCCD/CMND đã được sử dụng trong hợp đồng nên không thể chỉnh sửa**       |
| **Không cho xóa**       | **Không thể xóa người thuê đang ở**                                        |
| **Người thuê đang ở**   | **Người thuê đang ở trong hợp đồng hiệu lực, cần kết thúc hợp đồng trước** |
| **Không tìm thấy**      | **Không tìm thấy người thuê**                                              |
| **Lỗi hệ thống**        | **Có lỗi xảy ra, vui lòng thử lại**                                        |

**17\. Kết luận**

**Chức năng Quản lý người thuê (NGT) sau khi cập nhật đã phù hợp với ERD mới:**

**NguoiThue → HopDong_NguoiThue → HopDong → NhaTro**

**Hệ thống hỗ trợ đúng nghiệp vụ:**

- **Một phòng có nhiều người thuê**
- **Một hợp đồng có một người đại diện**
- **Người thuê có thể là đại diện hoặc người ở cùng**
- **Không gán phòng trực tiếp trong form người thuê**
- **Không sửa CCCD nếu người thuê đã có hợp đồng**
- **Không xóa người thuê đang ở, cho phép xóa người thuê đã rời**
