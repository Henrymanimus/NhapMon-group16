**SRS - QUẢN LÝ HÓA ĐƠN**

**1\. Thông tin chung**

| **Nội dung**       | **Chi tiết**                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------- |
| Mã nhóm chức năng  | HĐN                                                                                      |
| Tên chức năng      | Quản lý hóa đơn                                                                          |
| Tác nhân           | Chủ trọ                                                                                  |
| Mức độ ưu tiên     | Bắt buộc                                                                                 |
| Màn hình liên quan | Danh sách hóa đơn, chi tiết hóa đơn, lập hóa đơn, chỉnh sửa hóa đơn, xác nhận thanh toán |

**2\. Mục tiêu chức năng**

Chức năng **Quản lý hóa đơn** cho phép chủ trọ:

- Lập hóa đơn tiền thuê phòng theo tháng
- Tính tiền thuê, tiền điện, tiền nước
- Theo dõi trạng thái thanh toán
- Xem danh sách hóa đơn
- Xem chi tiết hóa đơn
- Chỉnh sửa hóa đơn khi chưa thanh toán
- Xác nhận thanh toán
- Theo dõi hóa đơn quá hạn
- Theo dõi công nợ của hợp đồng/phòng

**3\. Nguyên tắc nghiệp vụ chính**

Hóa đơn được lập theo **hợp đồng thuê**, không lập trực tiếp theo người thuê hay phòng.

HopDong → HoaDon

Mỗi hóa đơn thuộc về một hợp đồng. Thông tin phòng và người đại diện được lấy gián tiếp qua hợp đồng.

HoaDon → HopDong → NhaTro  
HoaDon → HopDong → NguoiThue(MaNguoiDaiDien)

Các nguyên tắc nghiệp vụ cần áp dụng:

| **STT** | **Quy tắc**                                                                                |
| ------- | ------------------------------------------------------------------------------------------ |
| 1       | Một hóa đơn thuộc về một hợp đồng                                                          |
| 2       | Một hợp đồng có thể phát sinh nhiều hóa đơn theo tháng                                     |
| 3       | Không được lập trùng hóa đơn cho cùng hợp đồng trong cùng tháng/năm                        |
| 4       | Hóa đơn chỉ nên lập cho hợp đồng đang hiệu lực                                             |
| 5       | Tiền thuê mặc định lấy từ HopDong.TienThue                                                 |
| 6       | Tiền điện = số điện sử dụng × đơn giá điện trên UI                                         |
| 7       | Tiền nước = số nước sử dụng × đơn giá nước trên UI                                         |
| 8       | Tổng tiền = tiền thuê + tiền điện + tiền nước                                              |
| 9       | Đơn giá điện/nước chỉ dùng để tính trên giao diện, hệ thống lưu kết quả TienDien, TienNuoc |
| 10      | Hóa đơn đã thanh toán không được chỉnh sửa số tiền                                         |
| 11      | Hóa đơn chưa thanh toán và quá hạn thanh toán được xem là "Quá hạn"                        |
| 12      | Hóa đơn đã thanh toán được tính vào doanh thu                                              |
| 13      | Hóa đơn chưa thanh toán được tính vào công nợ                                              |
| 14      | Hạn thanh toán phải nằm trong khoảng **NgayLap đến NgayLap + 4** (tối đa 5 ngày từ ngày lập, bao gồm ngày lập). Hệ thống gợi ý sẵn 5 lựa chọn ngày, người dùng không thể chọn ngày ngoài khoảng này. |

**4\. Danh sách chức năng con**

| **Mã chức năng** | **Tên chức năng**      | **Mô tả**                                               |
| ---------------- | ---------------------- | ------------------------------------------------------- |
| HĐN-01           | Xem danh sách hóa đơn  | Hiển thị toàn bộ hóa đơn                                |
| HĐN-02           | Tìm kiếm hóa đơn       | Tìm theo mã hóa đơn, mã hợp đồng, phòng, người đại diện |
| HĐN-03           | Lọc hóa đơn            | Lọc theo tháng/năm, trạng thái                          |
| HĐN-04           | Xem chi tiết hóa đơn   | Xem thông tin hóa đơn và chi tiết thanh toán            |
| HĐN-05           | Lập hóa đơn mới        | Tạo hóa đơn cho hợp đồng theo tháng                     |
| HĐN-06           | Chỉnh sửa hóa đơn      | Cập nhật hóa đơn khi chưa thanh toán                    |
| HĐN-07           | Xác nhận thanh toán    | Chuyển trạng thái hóa đơn sang đã thanh toán            |
| HĐN-08           | Tính tổng tiền hóa đơn | Tự động tính tiền thuê, điện, nước và tổng tiền         |
| HĐN-09           | Xem hóa đơn quá hạn    | Xác định hóa đơn chưa thanh toán đã quá hạn             |
| HĐN-10           | Xem công nợ            | Tổng hợp hóa đơn chưa thanh toán                        |

**5\. ERD liên quan**

**5.1. Bảng chính: HoaDon**

| **Cột**      | **Mô tả**             |
| ------------ | --------------------- |
| MaHoaDon     | Mã hóa đơn            |
| MaHopDong    | Mã hợp đồng           |
| Thang        | Tháng hóa đơn         |
| Nam          | Năm hóa đơn           |
| ChiSoDienCu  | Chỉ số điện cũ        |
| ChiSoDienMoi | Chỉ số điện mới       |
| ChiSoNuocCu  | Chỉ số nước cũ        |
| ChiSoNuocMoi | Chỉ số nước mới       |
| TienDien     | Tiền điện đã tính     |
| TienNuoc     | Tiền nước đã tính     |
| TienThue     | Tiền thuê nhà         |
| TongTien     | Tổng tiền hóa đơn     |
| TrangThai    | Trạng thái thanh toán |
| NgayLap      | Ngày lập hóa đơn      |
| HanThanhToan | Hạn thanh toán        |
| GhiChu       | Ghi chú hóa đơn       |

**5.2. Bảng liên quan**

| **Bảng**          | **Vai trò**                                         |
| ----------------- | --------------------------------------------------- |
| HopDong           | Xác định hợp đồng, tiền thuê, phòng, người đại diện |
| NhaTro            | Lấy thông tin phòng                                 |
| NguoiThue         | Lấy thông tin người đại diện                        |
| HopDong_NguoiThue | Lấy số người trong hợp đồng                         |
| HoaDon            | Lưu thông tin hóa đơn                               |

**6\. HĐN-01 - Xem danh sách hóa đơn**

**6.1. Mục tiêu**

Cho phép chủ trọ xem danh sách toàn bộ hóa đơn đã lập, theo dõi hóa đơn đã thanh toán, chưa thanh toán, quá hạn và tổng tiền.

**6.2. Thành phần UI**

Màn hình danh sách hóa đơn gồm:

**Card thống kê**

| **Card**        | **Ý nghĩa**                           |
| --------------- | ------------------------------------- |
| Tổng hóa đơn    | Tổng số hóa đơn                       |
| Đã thanh toán   | Số hóa đơn đã thanh toán              |
| Chưa thanh toán | Số hóa đơn chưa thanh toán            |
| Quá hạn         | Số hóa đơn chưa thanh toán và quá hạn |
| Tổng tiền       | Tổng tiền hóa đơn                     |

**Bộ lọc/tìm kiếm**

- Tìm theo mã hóa đơn, mã hợp đồng, phòng, người đại diện
- Lọc theo tháng
- Lọc theo trạng thái

**Bảng danh sách hóa đơn**

| **Cột UI**     | **Mô tả**                                 |
| -------------- | ----------------------------------------- |
| Mã HĐơn        | Mã hóa đơn                                |
| Tháng          | Tháng/năm hóa đơn                         |
| Hợp đồng       | Mã hợp đồng                               |
| Người đại diện | Người đại diện ký hợp đồng                |
| Phòng          | Mã phòng                                  |
| Số tiền        | Tổng tiền hóa đơn                         |
| Hạn TT         | Hạn thanh toán                            |
| Trạng thái     | Đã thanh toán / Chưa thanh toán / Quá hạn |
| Thao tác       | Xem, chỉnh sửa, xác nhận thanh toán       |

**6.3. Mapping UI với DB**

| **UI**                  | **Bảng**           | **Cột**               |
| ----------------------- | ------------------ | --------------------- |
| Mã HĐơn                 | HoaDon             | MaHoaDon              |
| Tháng                   | HoaDon             | Thang, Nam            |
| Hợp đồng                | HoaDon             | MaHopDong             |
| Người đại diện          | HopDong, NguoiThue | MaNguoiDaiDien, HoTen |
| Số người trong hợp đồng | HopDong_NguoiThue  | COUNT(MaNguoiThue)    |
| Phòng                   | HopDong, NhaTro    | MaNhaTro, TenNhaTro   |
| Số tiền                 | HoaDon             | TongTien              |
| Hạn TT                  | HoaDon             | HanThanhToan          |
| Trạng thái              | HoaDon             | TrangThai             |

**6.4. Luồng xử lý chính**

- Chủ trọ chọn menu **Hóa đơn**.
- Hệ thống truy vấn danh sách hóa đơn.
- Hệ thống join dữ liệu từ HoaDon, HopDong, NhaTro, NguoiThue.
- Hệ thống hiển thị card thống kê và bảng danh sách.
- Chủ trọ có thể tìm kiếm, lọc, xem chi tiết, chỉnh sửa hoặc xác nhận thanh toán.

**6.5. Query gợi ý**

SELECT  
hd.MaHoaDon,  
hd.Thang,  
hd.Nam,  
hd.MaHopDong,  
nt.MaNhaTro,  
nd.HoTen AS NguoiDaiDien,  
COUNT(hdnt.MaNguoiThue) AS SoNguoiTrongHopDong,  
hdon.TongTien,  
hdon.HanThanhToan,  
CASE  
WHEN hdon.TrangThai = N'Chưa thanh toán'  
AND hdon.HanThanhToan < CAST(GETDATE() AS DATE)  
THEN N'Quá hạn'  
ELSE hdon.TrangThai  
END AS TrangThaiHienThi  
FROM HoaDon hdon  
JOIN HopDong hd  
ON hdon.MaHopDong = hd.MaHopDong  
JOIN NhaTro nt  
ON hd.MaNhaTro = nt.MaNhaTro  
JOIN NguoiThue nd  
ON hd.MaNguoiDaiDien = nd.MaNguoiThue  
LEFT JOIN HopDong_NguoiThue hdnt  
ON hd.MaHopDong = hdnt.MaHopDong  
GROUP BY  
hd.MaHoaDon,  
hdon.Thang,  
hdon.Nam,  
hdon.MaHopDong,  
nt.MaNhaTro,  
nd.HoTen,  
hdon.TongTien,  
hdon.HanThanhToan,  
hdon.TrangThai;

**Lưu ý:** Trong query thực tế, phần hd.MaHoaDon là lỗi tên alias nếu dùng đúng SQL. Nên viết lại như sau:

SELECT  
hdon.MaHoaDon,  
hdon.Thang,  
hdon.Nam,  
hdon.MaHopDong,  
nt.MaNhaTro,  
nd.HoTen AS NguoiDaiDien,  
COUNT(hdnt.MaNguoiThue) AS SoNguoiTrongHopDong,  
hdon.TongTien,  
hdon.HanThanhToan,  
CASE  
WHEN hdon.TrangThai = N'Chưa thanh toán'  
AND hdon.HanThanhToan < CAST(GETDATE() AS DATE)  
THEN N'Quá hạn'  
ELSE hdon.TrangThai  
END AS TrangThaiHienThi  
FROM HoaDon hdon  
JOIN HopDong hd  
ON hdon.MaHopDong = hd.MaHopDong  
JOIN NhaTro nt  
ON hd.MaNhaTro = nt.MaNhaTro  
JOIN NguoiThue nd  
ON hd.MaNguoiDaiDien = nd.MaNguoiThue  
LEFT JOIN HopDong_NguoiThue hdnt  
ON hd.MaHopDong = hdnt.MaHopDong  
GROUP BY  
hdon.MaHoaDon,  
hdon.Thang,  
hdon.Nam,  
hdon.MaHopDong,  
nt.MaNhaTro,  
nd.HoTen,  
hdon.TongTien,  
hdon.HanThanhToan,  
hdon.TrangThai;

**7\. HĐN-02 - Tìm kiếm hóa đơn**

**7.1. Mục tiêu**

Cho phép chủ trọ tìm kiếm nhanh hóa đơn theo mã hóa đơn, mã hợp đồng, phòng hoặc người đại diện.

**7.2. Input**

| **Trường**       | **Kiểu** | **Bắt buộc** |
| ---------------- | -------- | ------------ |
| Từ khóa tìm kiếm | Text     | Không        |

**7.3. Phạm vi tìm kiếm**

- Mã hóa đơn
- Mã hợp đồng
- Mã phòng
- Tên phòng
- Tên người đại diện
- Số điện thoại người đại diện

**7.4. Query điều kiện gợi ý**

WHERE hdon.MaHoaDon LIKE '%' + @keyword + '%'  
OR hdon.MaHopDong LIKE '%' + @keyword + '%'  
OR nt.MaNhaTro LIKE '%' + @keyword + '%'  
OR nt.TenNhaTro LIKE '%' + @keyword + '%'  
OR nd.HoTen LIKE '%' + @keyword + '%'  
OR nd.SoDienThoai LIKE '%' + @keyword + '%'

**8\. HĐN-03 - Lọc hóa đơn**

**8.1. Lọc theo tháng/năm**

Dựa trên:

HoaDon.Thang  
HoaDon.Nam

Ví dụ:

- 04/2026
- 03/2026

**8.2. Lọc theo trạng thái**

| **UI**            | **Điều kiện**                                                        |
| ----------------- | -------------------------------------------------------------------- |
| Tất cả trạng thái | Không lọc                                                            |
| Đã thanh toán     | HoaDon.TrangThai = 'Đã thanh toán'                                   |
| Chưa thanh toán   | HoaDon.TrangThai = 'Chưa thanh toán' và chưa quá hạn                 |
| Quá hạn           | HoaDon.TrangThai = 'Chưa thanh toán' và HanThanhToan < ngày hiện tại |

**9\. HĐN-04 - Xem chi tiết hóa đơn**

**9.1. Mục tiêu**

Cho phép chủ trọ xem đầy đủ thông tin hóa đơn, bao gồm:

- Thông tin hóa đơn
- Thông tin hợp đồng
- Người đại diện
- Phòng
- Chi tiết tiền thuê, tiền điện, tiền nước
- Tổng tiền
- Trạng thái thanh toán
- Hạn thanh toán
- Thao tác nhanh

**9.2. Thành phần UI**

**Header**

- Mã hóa đơn
- Tháng/năm hóa đơn
- Badge trạng thái
- Nút **Xác nhận thanh toán**
- Nút **Chỉnh sửa**

**Block 1: Thông tin hóa đơn**

- Mã hóa đơn
- Mã hợp đồng
- Tháng/Năm
- Ngày lập
- Hạn thanh toán
- Trạng thái
- Ghi chú

**Block 2: Thông tin hợp đồng**

- Mã hợp đồng
- Phòng
- Người đại diện
- Số người trong hợp đồng
- Thời hạn hợp đồng

**Block 3: Chi tiết thanh toán**

- Tiền thuê nhà
- Tiền điện
- Tiền nước
- Tổng cộng

**Block 4: Tổng thanh toán**

- Tổng tiền
- Hạn thanh toán
- Trạng thái

**Block 5: Người đại diện**

- Tên người đại diện
- Số điện thoại
- Badge "Đại diện"
- Số người đang ở trong hợp đồng

**Block 6: Thao tác nhanh**

- Xác nhận thanh toán
- Chỉnh sửa hóa đơn
- Xem hợp đồng
- Xem phòng

**9.3. Mapping chi tiết hóa đơn với DB**

| **UI**          | **Bảng**           | **Cột**                 |
| --------------- | ------------------ | ----------------------- |
| Mã hóa đơn      | HoaDon             | MaHoaDon                |
| Mã hợp đồng     | HoaDon             | MaHopDong               |
| Tháng/Năm       | HoaDon             | Thang, Nam              |
| Ngày lập        | HoaDon             | NgayLap                 |
| Hạn thanh toán  | HoaDon             | HanThanhToan            |
| Ghi chú         | HoaDon             | GhiChu                  |
| Trạng thái      | HoaDon             | TrangThai               |
| Phòng           | HopDong, NhaTro    | MaNhaTro, TenNhaTro     |
| Người đại diện  | HopDong, NguoiThue | MaNguoiDaiDien, HoTen   |
| Số người HĐ     | HopDong_NguoiThue  | COUNT(MaNguoiThue)      |
| Thời hạn HĐ     | HopDong            | NgayBatDau, NgayKetThuc |
| Tiền thuê       | HoaDon             | TienThue                |
| Chỉ số điện cũ  | HoaDon             | ChiSoDienCu             |
| Chỉ số điện mới | HoaDon             | ChiSoDienMoi            |
| Tiền điện       | HoaDon             | TienDien                |
| Chỉ số nước cũ  | HoaDon             | ChiSoNuocCu             |
| Chỉ số nước mới | HoaDon             | ChiSoNuocMoi            |
| Tiền nước       | HoaDon             | TienNuoc                |
| Tổng tiền       | HoaDon             | TongTien                |

**9.4. Query lấy chi tiết hóa đơn**

SELECT  
hdon.MaHoaDon,  
hdon.MaHopDong,  
hdon.Thang,  
hdon.Nam,  
hdon.NgayLap,  
hdon.HanThanhToan,  
hdon.GhiChu,  
hdon.TrangThai,  
hdon.TienThue,  
hdon.ChiSoDienCu,  
hdon.ChiSoDienMoi,  
hdon.TienDien,  
hdon.ChiSoNuocCu,  
hdon.ChiSoNuocMoi,  
hdon.TienNuoc,  
hdon.TongTien,  
nt.MaNhaTro,  
nt.TenNhaTro,  
hd.NgayBatDau,  
hd.NgayKetThuc,  
nd.MaNguoiThue AS MaNguoiDaiDien,  
nd.HoTen AS NguoiDaiDien,  
nd.SoDienThoai  
FROM HoaDon hdon  
JOIN HopDong hd  
ON hdon.MaHopDong = hd.MaHopDong  
JOIN NhaTro nt  
ON hd.MaNhaTro = nt.MaNhaTro  
JOIN NguoiThue nd  
ON hd.MaNguoiDaiDien = nd.MaNguoiThue  
WHERE hdon.MaHoaDon = @MaHoaDon;

**9.5. Query lấy số người trong hợp đồng**

SELECT COUNT(\*) AS SoNguoiTrongHopDong  
FROM HopDong_NguoiThue  
WHERE MaHopDong = @MaHopDong  
AND TrangThai = N'Đang ở';

**10\. HĐN-05 - Lập hóa đơn mới**

**10.1. Mục tiêu**

Cho phép chủ trọ lập hóa đơn mới cho một hợp đồng đang hiệu lực theo tháng/năm.

**10.2. Thành phần UI**

Form lập hóa đơn gồm các phần:

**Block 1: Thông tin cơ bản**

- Chọn hợp đồng
- Tháng hóa đơn
- Ngày lập
- Hạn thanh toán *(chỉ được chọn trong vòng 5 ngày kể từ ngày lập, hệ thống hiển thị 5 nút gợi ý nhanh)*

Sau khi chọn hợp đồng, hệ thống hiển thị preview:

- Mã hợp đồng
- Phòng
- Người đại diện
- Số người thuê
- Tiền thuê hợp đồng
- Thời hạn hợp đồng
- Trạng thái hợp đồng

**Block 2: Tiền thuê nhà**

- Tiền thuê nhà
- Mặc định lấy từ HopDong.TienThue

**Block 3: Tiền điện**

- Chỉ số cũ
- Chỉ số mới
- Đơn giá điện trên UI
- Số điện sử dụng
- Tiền điện

**Block 4: Tiền nước**

- Chỉ số cũ
- Chỉ số mới
- Đơn giá nước trên UI
- Số nước sử dụng
- Tiền nước

**Block 5: Ghi chú**

- Ghi chú hóa đơn

**Block 6: Tổng tiền**

- Tiền thuê
- Tiền điện
- Tiền nước
- Tổng tiền
- Hạn thanh toán

**10.3. Dữ liệu đầu vào**

| **Field UI**    | **Bảng**     | **Cột DB**   | **Bắt buộc**            |
| --------------- | ------------ | ------------ | ----------------------- |
| Hợp đồng        | HoaDon       | MaHopDong    | Có                      |
| Tháng           | HoaDon       | Thang, Nam   | Có                      |
| Ngày lập        | HoaDon       | NgayLap      | Có                      |
| Hạn thanh toán  | HoaDon       | HanThanhToan | Có *(phải trong khoảng NgayLap … NgayLap+4)* |
| Tiền thuê       | HoaDon       | TienThue     | Có                      |
| Chỉ số điện cũ  | HoaDon       | ChiSoDienCu  | Có                      |
| Chỉ số điện mới | HoaDon       | ChiSoDienMoi | Có                      |
| Đơn giá điện    | Không lưu DB | Chỉ dùng UI  | Không bắt buộc trong DB |
| Tiền điện       | HoaDon       | TienDien     | Có                      |
| Chỉ số nước cũ  | HoaDon       | ChiSoNuocCu  | Có                      |
| Chỉ số nước mới | HoaDon       | ChiSoNuocMoi | Có                      |
| Đơn giá nước    | Không lưu DB | Chỉ dùng UI  | Không bắt buộc trong DB |
| Tiền nước       | HoaDon       | TienNuoc     | Có                      |
| Ghi chú         | HoaDon       | GhiChu       | Không                   |
| Tổng tiền       | HoaDon       | TongTien     | Có                      |

**10.4. Luồng xử lý chính**

- Chủ trọ nhấn **Lập hóa đơn mới**.
- Hệ thống mở form lập hóa đơn.
- Chủ trọ chọn hợp đồng.
- Hệ thống load thông tin hợp đồng:
  - phòng
  - người đại diện
  - số người đang ở
  - tiền thuê
- Chủ trọ chọn tháng/năm hóa đơn.
- Chủ trọ nhập ngày lập. Hệ thống tự động hiển thị 5 nút gợi ý hạn thanh toán (NgayLap, NgayLap+1, …, NgayLap+4). Chủ trọ chọn một trong 5 ngày đó; không thể chọn ngày nằm ngoài khoảng này.
- Chủ trọ nhập chỉ số điện cũ, chỉ số điện mới, đơn giá điện.
- Hệ thống tính:
  - số điện sử dụng
  - tiền điện
- Chủ trọ nhập chỉ số nước cũ, chỉ số nước mới, đơn giá nước.
- Hệ thống tính:

- số nước sử dụng
- tiền nước

- Hệ thống tự tính tổng tiền.
- Chủ trọ nhấn **Lưu hóa đơn**.
- Hệ thống validate dữ liệu.
- Nếu hợp lệ:

- lưu hóa đơn vào bảng HoaDon
- trạng thái mặc định là **Chưa thanh toán**

- Nếu không hợp lệ:

- hiển thị lỗi tại field tương ứng.

**10.5. Công thức tính**

**Số điện sử dụng**

Số điện sử dụng = ChiSoDienMoi - ChiSoDienCu

**Tiền điện**

TienDien = Số điện sử dụng × Đơn giá điện trên UI

**Số nước sử dụng**

Số nước sử dụng = ChiSoNuocMoi - ChiSoNuocCu

**Tiền nước**

TienNuoc = Số nước sử dụng × Đơn giá nước trên UI

**Tổng tiền**

TongTien = TienThue + TienDien + TienNuoc

**10.6. Validation**

| **Trường**        | **Quy tắc**                                          |
| ----------------- | ---------------------------------------------------- |
| Hợp đồng          | Bắt buộc chọn                                        |
| Hợp đồng          | Chỉ chọn hợp đồng đang hiệu lực                      |
| Hóa đơn tháng/năm | Không được trùng với hóa đơn đã có của cùng hợp đồng |
| Ngày lập          | Bắt buộc                                             |
| Hạn thanh toán    | Bắt buộc; phải nằm trong đoạn \[NgayLap, NgayLap + 4\] (tối đa 5 ngày từ ngày lập) |
| Tiền thuê         | Bắt buộc, không âm                                   |
| Chỉ số điện mới   | Phải lớn hơn hoặc bằng chỉ số điện cũ                |
| Đơn giá điện      | Phải là số không âm                                  |
| Chỉ số nước mới   | Phải lớn hơn hoặc bằng chỉ số nước cũ                |
| Đơn giá nước      | Phải là số không âm                                  |
| Tổng tiền         | Tự tính, không nhập tay                              |

**10.7. Kiểm tra trùng hóa đơn**

SELECT COUNT(\*)  
FROM HoaDon  
WHERE MaHopDong = @MaHopDong  
AND Thang = @Thang  
AND Nam = @Nam;

Nếu kết quả > 0, không cho lập hóa đơn mới.

**10.8. Query thêm hóa đơn**

INSERT INTO HoaDon (  
MaHoaDon,  
MaHopDong,  
Thang,  
Nam,  
ChiSoDienCu,  
ChiSoDienMoi,  
ChiSoNuocCu,  
ChiSoNuocMoi,  
TienDien,  
TienNuoc,  
TienThue,  
TongTien,  
TrangThai,  
NgayLap,  
HanThanhToan,  
GhiChu  
)  
VALUES (  
@MaHoaDon,  
@MaHopDong,  
@Thang,  
@Nam,  
@ChiSoDienCu,  
@ChiSoDienMoi,  
@ChiSoNuocCu,  
@ChiSoNuocMoi,  
@TienDien,  
@TienNuoc,  
@TienThue,  
@TongTien,  
N'Chưa thanh toán',  
@NgayLap,  
@HanThanhToan,  
@GhiChu  
);

**11\. HĐN-06 - Chỉnh sửa hóa đơn**

**11.1. Mục tiêu**

Cho phép chủ trọ cập nhật thông tin hóa đơn khi hóa đơn chưa thanh toán.

**11.2. Nguyên tắc chỉnh sửa**

| **Trạng thái hóa đơn** | **Quy tắc**                             |
| ---------------------- | --------------------------------------- |
| Chưa thanh toán        | Được chỉnh sửa                          |
| Quá hạn                | Được chỉnh sửa nếu vẫn chưa thanh toán  |
| Đã thanh toán          | Không cho chỉnh sửa số tiền hoặc chỉ số |

**11.3. Field được chỉnh sửa**

| **Field**          | **Cho sửa?**   | **Ghi chú**                                   |
| ------------------ | -------------- | --------------------------------------------- |
| Hợp đồng           | Không nên sửa  | UI hiện tại đã disable hợp đồng khi chỉnh sửa |
| Tháng/Năm          | Có điều kiện   | Chỉ khi chưa thanh toán                       |
| Ngày lập           | Có điều kiện   | Chỉ khi chưa thanh toán                       |
| Hạn thanh toán     | Có             | Có thể gia hạn hạn thanh toán                 |
| Tiền thuê          | Có             | Nếu chưa thanh toán                           |
| Chỉ số điện cũ/mới | Có             | Nếu chưa thanh toán                           |
| Đơn giá điện UI    | Có             | Dùng để tính lại TienDien                     |
| Chỉ số nước cũ/mới | Có             | Nếu chưa thanh toán                           |
| Đơn giá nước UI    | Có             | Dùng để tính lại TienNuoc                     |
| Ghi chú            | Có             | Nếu chưa thanh toán                           |
| Tổng tiền          | Không nhập tay | Tự tính                                       |

**11.4. Luồng xử lý chính**

- Chủ trọ nhấn icon chỉnh sửa hóa đơn.
- Hệ thống kiểm tra trạng thái hóa đơn.
- Nếu hóa đơn đã thanh toán:
  - không cho chỉnh sửa
  - hiển thị thông báo hoặc mở readonly.
- Nếu hóa đơn chưa thanh toán:
  - mở form chỉnh sửa.
- Hệ thống load dữ liệu hiện tại của hóa đơn.
- Chủ trọ cập nhật thông tin.
- Hệ thống tự tính lại tiền điện, tiền nước, tổng tiền.
- Chủ trọ nhấn **Cập nhật hóa đơn**.
- Hệ thống validate.
- Nếu hợp lệ:

- cập nhật bảng HoaDon

- Nếu không hợp lệ:

- hiển thị lỗi.

**11.5. Query cập nhật hóa đơn**

UPDATE HoaDon  
SET  
Thang = @Thang,  
Nam = @Nam,  
ChiSoDienCu = @ChiSoDienCu,  
ChiSoDienMoi = @ChiSoDienMoi,  
ChiSoNuocCu = @ChiSoNuocCu,  
ChiSoNuocMoi = @ChiSoNuocMoi,  
TienDien = @TienDien,  
TienNuoc = @TienNuoc,  
TienThue = @TienThue,  
TongTien = @TongTien,  
NgayLap = @NgayLap,  
HanThanhToan = @HanThanhToan,  
GhiChu = @GhiChu  
WHERE MaHoaDon = @MaHoaDon  
AND TrangThai = N'Chưa thanh toán';

**12\. HĐN-07 - Xác nhận thanh toán**

**12.1. Mục tiêu**

Cho phép chủ trọ xác nhận hóa đơn đã được thanh toán.

**12.2. Quy tắc**

Khi xác nhận thanh toán:

- HoaDon.TrangThai được cập nhật thành **Đã thanh toán**
- Hóa đơn được tính vào doanh thu
- Hóa đơn không còn tính vào công nợ
- Hóa đơn đã thanh toán không được chỉnh sửa số tiền

**12.3. Luồng xử lý**

- Chủ trọ nhấn **Xác nhận thanh toán**.
- Hệ thống hiển thị modal xác nhận.
- Chủ trọ xác nhận.
- Hệ thống cập nhật trạng thái hóa đơn.
- Hệ thống ẩn nút chỉnh sửa hoặc khóa chỉnh sửa.
- Hệ thống hiển thị thông báo thành công.

**12.4. Query cập nhật trạng thái**

UPDATE HoaDon  
SET TrangThai = N'Đã thanh toán'  
WHERE MaHoaDon = @MaHoaDon  
AND TrangThai = N'Chưa thanh toán';

**13\. HĐN-08 - Tính tổng tiền hóa đơn**

**13.1. Mục tiêu**

Hệ thống tự động tính tiền điện, tiền nước và tổng tiền trên form.

**13.2. Công thức**

SoDienSuDung = ChiSoDienMoi - ChiSoDienCu  
TienDien = SoDienSuDung × DonGiaDien_UI  
SoNuocSuDung = ChiSoNuocMoi - ChiSoNuocCu  
TienNuoc = SoNuocSuDung × DonGiaNuoc_UI  
TongTien = TienThue + TienDien + TienNuoc

**13.3. Lưu ý lưu DB**

ERD không lưu DonGiaDien và DonGiaNuoc.

Hệ thống chỉ lưu:

- TienDien
- TienNuoc
- TongTien

Đơn giá điện/nước chỉ phục vụ tính toán tại UI.

**14\. HĐN-09 - Xem hóa đơn quá hạn**

**14.1. Mục tiêu**

Cho phép hệ thống xác định hóa đơn quá hạn để chủ trọ theo dõi công nợ.

**14.2. Điều kiện quá hạn**

HoaDon.TrangThai = 'Chưa thanh toán'  
AND HoaDon.HanThanhToan < Ngày hiện tại

**14.3. Query gợi ý**

SELECT \*  
FROM HoaDon  
WHERE TrangThai = N'Chưa thanh toán'  
AND HanThanhToan < CAST(GETDATE() AS DATE);

**15\. HĐN-10 - Xem công nợ**

**15.1. Mục tiêu**

Tổng hợp số tiền chưa thanh toán.

**15.2. Query công nợ toàn hệ thống**

SELECT SUM(TongTien) AS TongCongNo  
FROM HoaDon  
WHERE TrangThai = N'Chưa thanh toán';

**15.3. Query công nợ theo hợp đồng**

SELECT SUM(TongTien) AS CongNoHopDong  
FROM HoaDon  
WHERE MaHopDong = @MaHopDong  
AND TrangThai = N'Chưa thanh toán';

**16\. Card thống kê hóa đơn**

**16.1. Tổng hóa đơn**

SELECT COUNT(\*)  
FROM HoaDon;

**16.2. Đã thanh toán**

SELECT COUNT(\*)  
FROM HoaDon  
WHERE TrangThai = N'Đã thanh toán';

**16.3. Chưa thanh toán**

SELECT COUNT(\*)  
FROM HoaDon  
WHERE TrangThai = N'Chưa thanh toán';

**16.4. Quá hạn**

SELECT COUNT(\*)  
FROM HoaDon  
WHERE TrangThai = N'Chưa thanh toán'  
AND HanThanhToan < CAST(GETDATE() AS DATE);

**16.5. Tổng tiền**

SELECT SUM(TongTien)  
FROM HoaDon;

Nếu muốn chỉ tính doanh thu đã thu:

SELECT SUM(TongTien)  
FROM HoaDon  
WHERE TrangThai = N'Đã thanh toán';

**17\. Validation tổng hợp**

| **Nhóm**             | **Validation**                              |
| -------------------- | ------------------------------------------- |
| Hợp đồng             | Bắt buộc chọn                               |
| Hợp đồng             | Chỉ chọn hợp đồng đang hiệu lực khi lập mới |
| Trùng hóa đơn        | Không cho trùng hợp đồng + tháng + năm      |
| Tháng/Năm            | Bắt buộc                                    |
| Ngày lập             | Bắt buộc                                    |
| Hạn thanh toán       | Bắt buộc                                    |
| Chỉ số điện          | Chỉ số mới ≥ chỉ số cũ                      |
| Chỉ số nước          | Chỉ số mới ≥ chỉ số cũ                      |
| Đơn giá điện/nước UI | Phải là số không âm                         |
| Tiền thuê            | Phải là số không âm                         |
| Tổng tiền            | Tự tính, không cho nhập tay                 |
| Đã thanh toán        | Không cho chỉnh sửa số tiền                 |
| Xác nhận thanh toán  | Chỉ áp dụng cho hóa đơn chưa thanh toán     |

**18\. Thông báo hệ thống**

| **Trường hợp**                       | **Thông báo**                                            |
| ------------------------------------ | -------------------------------------------------------- |
| Lập hóa đơn thành công               | Lập hóa đơn thành công                                   |
| Cập nhật hóa đơn thành công          | Cập nhật hóa đơn thành công                              |
| Xác nhận thanh toán thành công       | Xác nhận thanh toán thành công                           |
| Chưa chọn hợp đồng                   | Vui lòng chọn hợp đồng                                   |
| Hóa đơn đã tồn tại                   | Hóa đơn của hợp đồng này trong tháng/năm đã tồn tại      |
| Chỉ số điện không hợp lệ             | Chỉ số điện mới phải lớn hơn hoặc bằng chỉ số điện cũ    |
| Chỉ số nước không hợp lệ             | Chỉ số nước mới phải lớn hơn hoặc bằng chỉ số nước cũ    |
| Hạn thanh toán trống                 | Vui lòng nhập hạn thanh toán                             |
| Không được sửa hóa đơn đã thanh toán | Hóa đơn đã thanh toán không thể chỉnh sửa                |
| Không thể xác nhận                   | Chỉ hóa đơn chưa thanh toán mới được xác nhận thanh toán |
| Lỗi hệ thống                         | Có lỗi xảy ra, vui lòng thử lại                          |

**19\. API gợi ý**

| **Method** | **Endpoint**                       | **Mục đích**                  |
| ---------- | ---------------------------------- | ----------------------------- |
| GET        | /api/invoices                      | Lấy danh sách hóa đơn         |
| GET        | /api/invoices/{id}                 | Xem chi tiết hóa đơn          |
| POST       | /api/invoices                      | Lập hóa đơn mới               |
| PUT        | /api/invoices/{id}                 | Cập nhật hóa đơn              |
| PUT        | /api/invoices/{id}/confirm-payment | Xác nhận thanh toán           |
| GET        | /api/invoices/overdue              | Lấy danh sách hóa đơn quá hạn |
| GET        | /api/contracts/{id}/invoices       | Lấy hóa đơn theo hợp đồng     |

**20\. Kết luận**

Chức năng **Quản lý hóa đơn (HĐN)** đã khớp với ERD và UI mới nhất.

Module này đảm nhiệm các nghiệp vụ:

Lập hóa đơn → Tính tiền → Theo dõi hạn thanh toán → Xác nhận thanh toán → Công nợ/Doanh thu

Về mặt dữ liệu, hóa đơn gắn với:

HoaDon.MaHopDong → HopDong.MaHopDong

Sau đó thông tin phòng và người đại diện được truy xuất thông qua hợp đồng:

HoaDon → HopDong → NhaTro  
HoaDon → HopDong → NguoiThue(MaNguoiDaiDien)

Với scope đồ án sinh viên, cách thiết kế hiện tại là hợp lý vì hóa đơn chỉ gồm:

Tiền thuê nhà + Tiền điện + Tiền nước = Tổng tiền

Đơn giá điện/nước được dùng trên UI để tính, còn DB chỉ lưu kết quả TienDien, TienNuoc, TongTien.