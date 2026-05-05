**ĐẶC TẢ CHỨC NĂNG: DASHBOARD**

**1\. Thông tin chung**

**Mã chức năng:** BC-01  
**Tên chức năng:** Dashboard tổng quan  
**Phân hệ:** Báo cáo & thống kê  
**Tác nhân sử dụng:** Chủ trọ  
**Mức độ ưu tiên:** Bắt buộc

**2\. Mục tiêu chức năng**

Hiển thị tổng quan tình trạng hoạt động của hệ thống quản lý nhà trọ, giúp chủ trọ:

- Nắm nhanh số lượng nhà trọ
- Theo dõi tình trạng thuê (trống / đang thuê)
- Theo dõi hợp đồng đang hiệu lực
- Theo dõi công nợ (hóa đơn chưa thanh toán)
- Theo dõi doanh thu
- Xem các cảnh báo quan trọng:
  - Hóa đơn chưa thanh toán
  - Hợp đồng sắp hết hạn

**3\. Mô tả nghiệp vụ**

Sau khi đăng nhập thành công, hệ thống điều hướng người dùng đến Dashboard.

Tại đây:

- Hệ thống tự động tổng hợp dữ liệu từ các bảng
- Hiển thị dưới dạng:
  - Card thống kê
  - Danh sách cảnh báo
  - Biểu đồ doanh thu

Dashboard chỉ **READ dữ liệu**, không thực hiện ghi (Insert/Update/Delete).

**4\. Thành phần UI**

**4.1. Thanh điều hướng chung**

- Sidebar:
  - Dashboard
  - Nhà trọ
  - Người thuê
  - Hợp đồng
  - Hóa đơn
  - Báo cáo
  - Tài khoản
- Topbar:
  - Ô tìm kiếm nhanh
  - Avatar chủ trọ
  - Tên người dùng

**4.2. Khối thao tác nhanh**

**UI có:**

- Lập hóa đơn mới
- Tạo hợp đồng
- Thêm người thuê
- Thêm nhà trọ

**Ý nghĩa:**

- Shortcut tới các chức năng:
  - HĐN-06
  - HD-05
  - NGT-05
  - NTR-05

**Mapping:**

👉 Không dùng dữ liệu trực tiếp  
👉 Chỉ là điều hướng UI

**4.3. Card thống kê tổng quan**

**Các card:**

- Tổng nhà trọ
- Đang cho thuê
- Còn trống
- Hợp đồng hiệu lực
- Hóa đơn chưa thanh toán
- Doanh thu tháng này

**5\. Mapping UI ↔ ERD (QUAN TRỌNG NHẤT)**

**5.1. Tổng nhà trọ**

| **UI**       | **ERD**               |
| ------------ | --------------------- |
| Tổng nhà trọ | COUNT(\*) FROM NhaTro |

**5.2. Nhà đang cho thuê**

| **UI**        | **ERD**                                             |
| ------------- | --------------------------------------------------- |
| Đang cho thuê | COUNT(\*) FROM NhaTro WHERE TrangThai = 'Đang thuê' |

**5.3. Nhà còn trống**

| **UI**    | **ERD**                                         |
| --------- | ----------------------------------------------- |
| Còn trống | COUNT(\*) FROM NhaTro WHERE TrangThai = 'Trống' |

**5.4. Hợp đồng hiệu lực**

| **UI**            | **ERD**                                              |
| ----------------- | ---------------------------------------------------- |
| Hợp đồng hiệu lực | COUNT(\*) FROM HopDong WHERE TrangThai = 'Đang thuê' |

**5.5. Hóa đơn chưa thanh toán**

| **UI**                  | **ERD**                                            |
| ----------------------- | -------------------------------------------------- |
| Hóa đơn chưa thanh toán | COUNT(\*) FROM HoaDon WHERE TrangThai = 'Chưa trả' |

**5.6. Doanh thu tháng này**

| **UI**          | **ERD**                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------ |
| Doanh thu tháng | SUM(TongTien) FROM HoaDon WHERE Thang = current AND Nam = current AND TrangThai = 'Đã trả' |

**6\. Biểu đồ doanh thu theo tháng**

**UI:**

- Line chart
- Trục X: tháng
- Trục Y: doanh thu (triệu VND)

**ERD:**

SELECT Thang, Nam, SUM(TongTien)  
FROM HoaDon  
WHERE TrangThai = 'Đã trả'  
GROUP BY Nam, Thang  
ORDER BY Nam, Thang

**7\. Khối "Hóa đơn chưa thanh toán"**

**UI hiển thị:**

- Mã hóa đơn
- Người thuê
- Nhà trọ
- Hạn thanh toán
- Số tiền
- Tag "Quá hạn"

**Mapping ERD:**

JOIN nhiều bảng:

| **UI**     | **ERD**                |
| ---------- | ---------------------- |
| Mã hóa đơn | HoaDon.MaHoaDon        |
| Người thuê | NguoiThue.HoTen        |
| Nhà trọ    | NhaTro.TenNhaTro       |
| Số tiền    | HoaDon.TongTien        |
| Hạn        | tính từ NgayLap + rule |
| Quá hạn    | so sánh ngày hiện tại  |

**JOIN:**

HoaDon  
JOIN HopDong ON HoaDon.MaHopDong  
JOIN NguoiThue ON HopDong.MaNguoiThue  
JOIN NhaTro ON HopDong.MaNhaTro

**8\. Khối "Hợp đồng sắp hết hạn"**

**UI hiển thị:**

- Mã hợp đồng
- Người thuê
- Nhà trọ
- Ngày kết thúc
- Badge "còn X ngày"

**Mapping ERD:**

| **UI**        | **ERD**             |
| ------------- | ------------------- |
| Mã hợp đồng   | HopDong.MaHopDong   |
| Người thuê    | NguoiThue.HoTen     |
| Nhà trọ       | NhaTro.TenNhaTro    |
| Ngày kết thúc | HopDong.NgayKetThuc |

**Logic:**

WHERE NgayKetThuc - TODAY <= 30 ngày  
AND TrangThai = 'Đang thuê'

**9\. Dữ liệu đầu ra Dashboard**

Dashboard KHÔNG có input, chỉ có output:

- Tổng số nhà
- Số nhà đang thuê
- Số nhà trống
- Số hợp đồng hiệu lực
- Số hóa đơn chưa thanh toán
- Tổng doanh thu tháng
- Danh sách hóa đơn chưa thanh toán
- Danh sách hợp đồng sắp hết hạn
- Dữ liệu biểu đồ

**10\. Luồng xử lý**

- Người dùng đăng nhập thành công
- Hệ thống load Dashboard
- Gọi các API:
  - get stats
  - get revenue chart
  - get unpaid invoices
  - get expiring contracts
- Render UI

**11\. Validation / ràng buộc**

Dashboard không có validation input, nhưng có rule:

- Chỉ hiển thị dữ liệu của chủ trọ hiện tại
- Không hiển thị dữ liệu null (phải có empty state)
- Nếu chưa có dữ liệu:
  - Card = 0
  - List = empty state

**12\. Điều kiện trước**

- Người dùng đã đăng nhập thành công

**13\. Điều kiện sau**

- Dashboard hiển thị dữ liệu tổng quan
- Không thay đổi dữ liệu trong hệ thống

**14\. Ngoại lệ**

| **Trường hợp**   | **Xử lý**            |
| ---------------- | -------------------- |
| Không có dữ liệu | Hiển thị 0 + empty   |
| API lỗi          | Hiển thị lỗi + retry |
| Load chậm        | Hiển thị skeleton    |