# BPMN – Quy trình lập hợp đồng thuê phòng và quản lý người thuê trong hợp đồng

## 1. Tên quy trình

**Quy trình lập hợp đồng thuê phòng và quản lý người thuê trong hợp đồng**

---

## 2. Bối cảnh nghiệp vụ

Hệ thống là website quản lý nhà trọ dành cho **1 chủ trọ duy nhất**.

Logic nghiệp vụ mới của hệ thống:

- Một phòng có thể có nhiều người thuê cùng lúc.
- Một hợp đồng chỉ thuộc về đúng một phòng.
- Một hợp đồng bắt buộc có một người đại diện ký hợp đồng.
- Một hợp đồng có thể bao gồm nhiều người thuê.
- Người đại diện cũng phải nằm trong danh sách người thuê của hợp đồng với vai trò **“Đại diện”**.
- Các người thuê còn lại trong cùng hợp đồng có vai trò **“Ở cùng”**.
- Người thuê không được gán trực tiếp vào phòng.
- Người thuê được gán vào phòng thông qua hợp đồng.
- Hóa đơn được tạo từ hợp đồng, không tạo trực tiếp từ người thuê hoặc phòng.

---

## 3. Participants / Lanes

| STT | Lane | Vai trò |
|---|---|---|
| 1 | 👤 Chủ trọ | Người thao tác tạo hợp đồng, chọn phòng, chọn người thuê và nhập thông tin hợp đồng |
| 2 | 🖥️ Hệ thống quản lý nhà trọ | Kiểm tra dữ liệu, hiển thị form, validate và xử lý nghiệp vụ |
| 3 | 🗄️ Cơ sở dữ liệu | Lưu hợp đồng và danh sách người thuê trong hợp đồng |

---

## 4. Start Event

Quy trình bắt đầu khi:

**Chủ trọ muốn tạo hợp đồng thuê phòng cho một phòng trống.**

---

## 5. Main Flow

| Bước | Lane | Hoạt động | Loại task BPMN |
|---|---|---|---|
| 1 | 👤 Chủ trọ | Mở màn hình **Quản lý hợp đồng** | User Task |
| 2 | 👤 Chủ trọ | Chọn **Tạo hợp đồng mới** | User Task |
| 3 | 🖥️ Hệ thống quản lý nhà trọ | Hiển thị form tạo hợp đồng | Service Task |
| 4 | 👤 Chủ trọ | Chọn phòng cần cho thuê | User Task |
| 5 | 🖥️ Hệ thống quản lý nhà trọ | Kiểm tra trạng thái phòng | Service Task |
| 6 | 🖥️ Hệ thống quản lý nhà trọ | Kiểm tra phòng có hợp đồng đang hiệu lực hay không | Exclusive Gateway |
| 7A | 🖥️ Hệ thống quản lý nhà trọ | Nếu phòng đang có hợp đồng hiệu lực, hiển thị thông báo: **“Phòng đang có hợp đồng hiệu lực, không thể tạo hợp đồng mới”** | Service Task |
| 7B | 🖥️ Hệ thống quản lý nhà trọ | Nếu phòng chưa có hợp đồng hiệu lực, cho phép tiếp tục tạo hợp đồng | Service Task |
| 8 | 👤 Chủ trọ | Chọn người đại diện ký hợp đồng | User Task |
| 9 | 🖥️ Hệ thống quản lý nhà trọ | Kiểm tra người đại diện đã tồn tại trong hệ thống hay chưa | Exclusive Gateway |
| 10A | 👤 Chủ trọ | Nếu chưa tồn tại, thêm mới thông tin người thuê | User Task |
| 10B | 🖥️ Hệ thống quản lý nhà trọ | Nếu đã tồn tại, chọn người đại diện từ danh sách người thuê | Service Task |
| 11 | 🖥️ Hệ thống quản lý nhà trọ | Thêm người đại diện vào danh sách người thuê của hợp đồng với vai trò **Đại diện** | Service Task |
| 12 | 👤 Chủ trọ | Thêm người ở cùng nếu có | User Task |
| 13 | 🖥️ Hệ thống quản lý nhà trọ | Kiểm tra có thêm người ở cùng hay không | Exclusive Gateway |
| 14A | 👤 Chủ trọ | Nếu có, chọn hoặc thêm mới người thuê | User Task |
| 15A | 🖥️ Hệ thống quản lý nhà trọ | Thêm người thuê vào danh sách hợp đồng với vai trò **Ở cùng** | Service Task |
| 14B | 🖥️ Hệ thống quản lý nhà trọ | Nếu không có người ở cùng, tiếp tục nhập thông tin hợp đồng | Service Task |
| 16 | 👤 Chủ trọ | Nhập thông tin hợp đồng: ngày bắt đầu, ngày kết thúc, tiền thuê, tiền cọc, ghi chú | User Task |
| 17 | 🖥️ Hệ thống quản lý nhà trọ | Kiểm tra dữ liệu hợp đồng | Service Task |
| 18 | 🖥️ Hệ thống quản lý nhà trọ | Kiểm tra dữ liệu hợp đồng hợp lệ hay không | Exclusive Gateway |
| 19A | 🖥️ Hệ thống quản lý nhà trọ | Nếu không hợp lệ, hiển thị lỗi và yêu cầu chủ trọ chỉnh sửa | Service Task |
| 19B | 🖥️ Hệ thống quản lý nhà trọ | Nếu hợp lệ, tiến hành lưu hợp đồng | Service Task |
| 20 | 🗄️ Cơ sở dữ liệu | Tạo bản ghi trong bảng `HopDong` | Service Task |
| 21 | 🗄️ Cơ sở dữ liệu | Tạo các bản ghi trong bảng `HopDong_NguoiThue` | Service Task |
| 22 | 🖥️ Hệ thống quản lý nhà trọ | Cập nhật trạng thái phòng thành **Đang thuê** | Service Task |
| 23 | 🖥️ Hệ thống quản lý nhà trọ | Hiển thị thông báo **“Tạo hợp đồng thành công”** | Service Task |
| 24 | 🖥️ Hệ thống quản lý nhà trọ | Điều hướng đến màn hình chi tiết hợp đồng | Service Task |

---

## 6. Decision Points

| STT | Gateway | Câu hỏi điều kiện | Nhánh xử lý |
|---|---|---|---|
| 1 | Phòng có hợp đồng đang hiệu lực không? | Kiểm tra phòng đã có hợp đồng active chưa | Có: dừng quy trình / Không: tiếp tục |
| 2 | Người đại diện đã tồn tại trong hệ thống chưa? | Kiểm tra thông tin người đại diện trong bảng `NguoiThue` | Chưa có: thêm mới / Đã có: chọn từ danh sách |
| 3 | Có thêm người ở cùng không? | Chủ trọ có muốn thêm người thuê khác vào hợp đồng không | Có: thêm người ở cùng / Không: tiếp tục |
| 4 | Dữ liệu hợp đồng hợp lệ không? | Validate thông tin hợp đồng trước khi lưu | Không hợp lệ: báo lỗi / Hợp lệ: lưu dữ liệu |

---

## 7. Validation Rules

Khi chủ trọ lưu hợp đồng, hệ thống cần kiểm tra:

| STT | Quy tắc kiểm tra |
|---|---|
| 1 | Phòng là bắt buộc |
| 2 | Phòng không được có hợp đồng đang hiệu lực |
| 3 | Người đại diện là bắt buộc |
| 4 | Danh sách người thuê phải có ít nhất 1 người |
| 5 | Người đại diện phải nằm trong danh sách người thuê của hợp đồng |
| 6 | Người ở cùng không được trùng với người đại diện |
| 7 | Không được có người thuê trùng nhau trong cùng hợp đồng |
| 8 | Ngày kết thúc phải lớn hơn ngày bắt đầu |
| 9 | Tiền thuê phải là số hợp lệ và lớn hơn hoặc bằng 0 |
| 10 | Tiền cọc phải là số hợp lệ và lớn hơn hoặc bằng 0 |

---

## 8. Database Actions

Khi dữ liệu hợp lệ, hệ thống cần cập nhật CSDL như sau:

### 8.1. Tạo bản ghi trong bảng `HopDong`

Thông tin cần lưu:

- `MaHopDong`
- `MaNguoiDaiDien`
- `MaNhaTro`
- `NgayBatDau`
- `NgayKetThuc`
- `TienThue`
- `TienCoc`
- `GhiChu`
- `TrangThai = 'Đang hiệu lực'`

### 8.2. Tạo bản ghi trong bảng `HopDong_NguoiThue`

Với người đại diện:

```text
VaiTro = 'Đại diện'
TrangThai = 'Đang ở'
NgayThamGia = NgayBatDau
NgayRoiDi = NULL
```

Với người ở cùng:

```text
VaiTro = 'Ở cùng'
TrangThai = 'Đang ở'
NgayThamGia = ngày tham gia được chọn
NgayRoiDi = NULL
```

### 8.3. Cập nhật trạng thái phòng

Sau khi tạo hợp đồng thành công:

```text
NhaTro.TrangThai = 'Đang thuê'
```

---

## 9. End Events

### 9.1. End Event thành công

Quy trình kết thúc khi:

**Hợp đồng thuê phòng được tạo thành công và danh sách người thuê được gắn với hợp đồng.**

### 9.2. End Event thất bại

Quy trình kết thúc sớm nếu:

**Phòng đã có hợp đồng đang hiệu lực, hệ thống không cho tạo hợp đồng mới.**

---

## 10. Special Requirements

- Sử dụng BPMN notation rõ ràng:
  - Start Event
  - User Task
  - Service Task
  - Exclusive Gateway
  - End Event
- Tất cả task, event và gateway dùng tiếng Việt.
- Thể hiện rõ 3 lane:
  - 👤 Chủ trọ
  - 🖥️ Hệ thống quản lý nhà trọ
  - 🗄️ Cơ sở dữ liệu
- Không gán người thuê trực tiếp vào phòng.
- Người thuê chỉ được gán với phòng thông qua hợp đồng.
- Người đại diện phải nằm trong danh sách người thuê của hợp đồng.
- Hóa đơn phát sinh từ hợp đồng sau này, không nằm trong quy trình tạo hợp đồng.

---

## 11. Prompt BPMN dùng để generate lại

```text
Create a BPMN process map for “Quy trình lập hợp đồng thuê phòng và quản lý người thuê trong hợp đồng” for a student rental management system.

Context:
The system is a rental room management website used by only one landlord. The updated business logic is:
- One room can have multiple tenants at the same time.
- One contract belongs to exactly one room.
- One contract must have one representative tenant who signs the contract.
- One contract can include multiple tenants.
- The representative tenant must also be included in the tenant list of the contract with role = “Đại diện”.
- Other tenants in the same contract have role = “Ở cùng”.
- Tenants are not assigned directly to rooms. Tenants are assigned to rooms through contracts.
- Invoices are generated from contracts, not directly from tenants or rooms.

Participants / Lanes:
1. 👤 Chủ trọ
2. 🖥️ Hệ thống quản lý nhà trọ
3. 🗄️ Cơ sở dữ liệu

Start event:
Chủ trọ muốn tạo hợp đồng thuê phòng cho một phòng trống.

Main flow:
1. Chủ trọ mở màn hình Quản lý hợp đồng.
2. Chủ trọ chọn “Tạo hợp đồng mới”.
3. Hệ thống hiển thị form tạo hợp đồng.
4. Chủ trọ chọn phòng cần cho thuê.
5. Hệ thống kiểm tra trạng thái phòng.
6. Decision: Phòng có hợp đồng đang hiệu lực không?
   - Nếu có: hệ thống hiển thị thông báo “Phòng đang có hợp đồng hiệu lực, không thể tạo hợp đồng mới”, kết thúc quy trình.
   - Nếu không: hệ thống cho phép tiếp tục tạo hợp đồng.
7. Chủ trọ chọn người đại diện ký hợp đồng.
8. Decision: Người đại diện đã tồn tại trong hệ thống chưa?
   - Nếu chưa: chủ trọ thêm mới thông tin người thuê.
   - Nếu có: hệ thống chọn người đại diện từ danh sách người thuê.
9. Hệ thống thêm người đại diện vào danh sách người thuê của hợp đồng với vai trò “Đại diện”.
10. Chủ trọ thêm người ở cùng nếu có.
11. Decision: Có thêm người ở cùng không?
   - Nếu có: chủ trọ chọn hoặc thêm mới người thuê, sau đó hệ thống thêm vào danh sách người thuê với vai trò “Ở cùng”.
   - Nếu không: tiếp tục bước nhập thông tin hợp đồng.
12. Chủ trọ nhập thông tin hợp đồng:
   - ngày bắt đầu
   - ngày kết thúc
   - tiền thuê
   - tiền cọc
   - ghi chú
13. Hệ thống kiểm tra dữ liệu hợp đồng:
   - phòng bắt buộc
   - người đại diện bắt buộc
   - danh sách người thuê có ít nhất 1 người
   - người đại diện phải nằm trong danh sách người thuê
   - ngày kết thúc phải lớn hơn ngày bắt đầu
   - tiền thuê và tiền cọc hợp lệ
14. Decision: Dữ liệu hợp đồng hợp lệ không?
   - Nếu không: hệ thống hiển thị lỗi và yêu cầu chủ trọ chỉnh sửa.
   - Nếu có: hệ thống lưu hợp đồng.
15. Cơ sở dữ liệu tạo bản ghi trong bảng HopDong.
16. Cơ sở dữ liệu tạo các bản ghi trong bảng HopDong_NguoiThue:
   - người đại diện: VaiTro = “Đại diện”, TrangThai = “Đang ở”
   - người ở cùng: VaiTro = “Ở cùng”, TrangThai = “Đang ở”
17. Hệ thống cập nhật trạng thái phòng thành “Đang thuê”.
18. Hệ thống hiển thị thông báo “Tạo hợp đồng thành công”.
19. Hệ thống điều hướng đến màn hình chi tiết hợp đồng.

End event:
Hợp đồng thuê phòng được tạo thành công và danh sách người thuê được gắn với hợp đồng.

Decision points:
- Phòng có hợp đồng đang hiệu lực không?
- Người đại diện đã tồn tại trong hệ thống chưa?
- Có thêm người ở cùng không?
- Dữ liệu hợp đồng hợp lệ không?

Special requirements:
- Use BPMN notation clearly:
  + Start Event
  + User Task
  + Service Task
  + Exclusive Gateway
  + End Event
- Show database actions as service tasks in the “Cơ sở dữ liệu” lane.
- Use Vietnamese labels for all tasks, events and gateways.
- Use emojis in lane names for better visual navigation:
  + 👤 Chủ trọ
  + 🖥️ Hệ thống quản lý nhà trọ
  + 🗄️ Cơ sở dữ liệu
```
