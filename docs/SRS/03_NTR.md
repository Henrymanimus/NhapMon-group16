**1\. Thông tin chung**

- **Mã chức năng: NTR**
- **Tên: Quản lý nhà trọ**
- **Tác nhân: Chủ trọ**
- **Mô tả:  
   Quản lý thông tin phòng trọ, trạng thái thuê, danh sách người thuê (nhiều người), lịch sử hợp đồng và doanh thu theo phòng.**

**2\. Mục tiêu chức năng**

**Cho phép:**

- **Quản lý danh sách phòng**
- **Theo dõi trạng thái phòng (trống / đang thuê / bảo trì)**
- **Hiển thị người đại diện + danh sách người ở cùng**
- **Xem lịch sử thuê của phòng**
- **Xem doanh thu theo phòng**
- **CRUD phòng trọ**

**3\. Danh sách chức năng con**

| **Mã**     | **Tên**                   |
| ---------- | ------------------------- |
| **NTR-01** | **Xem danh sách nhà trọ** |
| **NTR-02** | **Tìm kiếm & lọc**        |
| **NTR-03** | **Xem chi tiết nhà trọ**  |
| **NTR-04** | **Thêm nhà trọ**          |
| **NTR-05** | **Chỉnh sửa nhà trọ**     |
| **NTR-06** | **Xóa nhà trọ**           |

**4\. ERD liên quan**

**Bảng chính**

**NhaTro  
\- MaNhaTro  
\- TenNhaTro  
\- DiaChi  
\- DienTich  
\- GiaThue  
\- TienCoc  
\- MoTa  
\- TrangThai  
\- MaChuTro**

**Bảng liên quan**

| **Bảng**              | **Vai trò**                   |
| --------------------- | ----------------------------- |
| **HopDong**           | **xác định trạng thái phòng** |
| **HopDong_NguoiThue** | **danh sách người thuê**      |
| **NguoiThue**         | **thông tin người**           |
| **HoaDon**            | **doanh thu**                 |

**5\. NTR-01: DANH SÁCH NHÀ TRỌ**

**5.1 UI Components (UPDATED)**

**Card thống kê**

- **Tổng phòng**
- **Đang thuê**
- **Còn trống**
- **Bảo trì**

**Table**

| **Cột**            | **Mô tả**                      |
| ------------------ | ------------------------------ |
| **Mã phòng**       | **MaNhaTro**                   |
| **Tên phòng**      | **TenNhaTro**                  |
| **Địa chỉ**        | **DiaChi**                     |
| **DT / Giá**       | **DienTich + GiaThue**         |
| **Người đại diện** | **HopDong.MaNguoiDaiDien**     |
| **Người đang ở**   | **COUNT người trong hợp đồng** |
| **Trạng thái**     | **Derived**                    |
| **Thao tác**       | **View / Edit / Delete**       |

**5.2 Mapping DB**

| **UI**             | **DB**                  |
| ------------------ | ----------------------- |
| **Người đại diện** | **HopDong → NguoiThue** |
| **Người đang ở**   | **HopDong_NguoiThue**   |
| **Trạng thái**     | **HopDong**             |

**5.3 Query chính**

**SELECT  
n.MaNhaTro,  
n.TenNhaTro,  
n.DiaChi,  
n.DienTich,  
n.GiaThue,  
<br/>nd.HoTen AS NguoiDaiDien,  
<br/>COUNT(hdnt.MaNguoiThue) AS SoNguoiDangO,  
<br/>CASE  
WHEN hd.MaHopDong IS NOT NULL THEN N'Đang thuê'  
ELSE N'Trống'  
END AS TrangThai  
<br/>FROM NhaTro n  
<br/>LEFT JOIN HopDong hd  
ON n.MaNhaTro = hd.MaNhaTro  
AND hd.TrangThai = N'Đang hiệu lực'  
<br/>LEFT JOIN NguoiThue nd  
ON hd.MaNguoiDaiDien = nd.MaNguoiThue  
<br/>LEFT JOIN HopDong_NguoiThue hdnt  
ON hd.MaHopDong = hdnt.MaHopDong  
AND hdnt.TrangThai = N'Đang ở'  
<br/>GROUP BY  
n.MaNhaTro, n.TenNhaTro, n.DiaChi, n.DienTich, n.GiaThue, nd.HoTen, hd.MaHopDong;**

**6\. NTR-03: CHI TIẾT NHÀ TRỌ (UPDATED)**

**6.1 Block 1 - Thông tin chung**

- **Mã phòng**
- **Địa chỉ**
- **Diện tích**
- **Giá thuê**
- **Tiền cọc**
- **Mô tả**
- **Tiện nghi**

**6.2 Block 2 - Trạng thái hiện tại (UPDATED)**

**Hiển thị:**

**Người đại diện**

- **Họ tên**
- **SĐT**
- **Badge: "Đại diện"**

**Người ở cùng**

- **List nhiều người**
- **Badge: "Ở cùng"**

**Tổng số người**

**6.3 Query người thuê hiện tại**

**SELECT  
nt.HoTen,  
hdnt.VaiTro,  
nt.SoDienThoai  
FROM HopDong hd  
JOIN HopDong_NguoiThue hdnt  
ON hd.MaHopDong = hdnt.MaHopDong  
JOIN NguoiThue nt  
ON hdnt.MaNguoiThue = nt.MaNguoiThue  
WHERE hd.MaNhaTro = @MaNhaTro  
AND hd.TrangThai = N'Đang hiệu lực'  
AND hdnt.TrangThai = N'Đang ở';**

**6.4 Block 3 - Lịch sử hợp đồng**

**Hiển thị:**

- **Mã hợp đồng**
- **Người đại diện**
- **Số người thuê**
- **Thời gian**
- **Trạng thái**

**Query**

**SELECT  
hd.MaHopDong,  
nd.HoTen AS NguoiDaiDien,  
COUNT(hdnt.MaNguoiThue) AS SoNguoi,  
hd.NgayBatDau,  
hd.NgayKetThuc,  
hd.TrangThai  
FROM HopDong hd  
LEFT JOIN NguoiThue nd  
ON hd.MaNguoiDaiDien = nd.MaNguoiThue  
LEFT JOIN HopDong_NguoiThue hdnt  
ON hd.MaHopDong = hdnt.MaHopDong  
WHERE hd.MaNhaTro = @MaNhaTro  
GROUP BY hd.MaHopDong, nd.HoTen, hd.NgayBatDau, hd.NgayKetThuc, hd.TrangThai;**

**6.5 Block 4 - Doanh thu**

- **Tổng doanh thu 12 tháng**
- **Theo tháng**

**6.6 Query doanh thu**

**SELECT  
SUM(TongTien) AS TongDoanhThu  
FROM HoaDon hd  
JOIN HopDong h  
ON hd.MaHopDong = h.MaHopDong  
WHERE h.MaNhaTro = @MaNhaTro;**

**7\. NTR-04: THÊM NHÀ TRỌ**

**Input**

- **Mã phòng**
- **Tên phòng**
- **Địa chỉ**
- **Diện tích**
- **Giá thuê**
- **Tiền cọc**
- **Mô tả**
- **Tiện nghi**

**Rule**

**❌ Không chọn người thuê tại đây  
❌ Không set trạng thái "Đang thuê" thủ công**

**8\. NTR-05: CHỈNH SỬA**

**Rule**

- **Không cho chỉnh sửa phòng khi trạng thái hiển thị là "Đang thuê"**
- **Không sửa trạng thái nếu có hợp đồng active**
- **Giá thuê có thể update → áp dụng hợp đồng mới**

**9\. NTR-06: XÓA NHÀ TRỌ**

**Rule**

**❌ Không xóa nếu có:**

- **Phòng đang ở trạng thái "Đang thuê"**
- **Hợp đồng**
- **Hóa đơn**

**👉 dùng soft delete**

**10\. BUSINESS RULE QUAN TRỌNG (UPDATED)**

**1\. Phòng có nhiều người thuê**

**NhaTro → HopDong → HopDong_NguoiThue → NguoiThue**

**2\. Người đại diện**

**HopDong.MaNguoiDaiDien**

**và:**

**HopDong_NguoiThue.VaiTro = 'Đại diện'**

**3\. Trạng thái phòng (UPDATED)**

| **Trạng thái** | **Logic**              |
| -------------- | ---------------------- |
| **Đang thuê**  | **Có hợp đồng active** |
| **Trống**      | **Không có hợp đồng**  |
| **Bảo trì**    | **Manual**             |

**4\. Không lưu trực tiếp người thuê trong phòng**

**👉 luôn join qua hợp đồng**

**11\. API gợi ý**

| **Method** | **API**         |
| ---------- | --------------- |
| **GET**    | **/rooms**      |
| **GET**    | **/rooms/{id}** |
| **POST**   | **/rooms**      |
| **PUT**    | **/rooms/{id}** |
| **DELETE** | **/rooms/{id}** |
