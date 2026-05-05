erDiagram

    CHUTRO {
        varchar MaChuTro PK "Mã chủ trọ"
        nvarchar HoTen "Họ tên"
        varchar SoDienThoai "Số điện thoại"
        varchar Email "Email"
        varchar TenDangNhap UK "Tên đăng nhập"
        varchar MatKhau "Mật khẩu"
        nvarchar DiaChi "Địa chỉ"
    }

    NHATRO {
        varchar MaNhaTro PK "Mã nhà trọ/phòng"
        nvarchar TenNhaTro "Tên nhà trọ/phòng"
        nvarchar DiaChi "Địa chỉ"
        decimal DienTich "Diện tích"
        decimal GiaThue "Giá thuê mặc định"
        decimal TienCoc "Tiền cọc mặc định"
        nvarchar MoTa "Mô tả"
        nvarchar TienNghi "Tiện nghi"
        nvarchar TrangThai "Trống / Đang thuê / Bảo trì"
        varchar MaChuTro FK "Mã chủ trọ"
    }

    NGUOITHUE {
        varchar MaNguoiThue PK "Mã người thuê"
        nvarchar HoTen "Họ tên"
        varchar SoDienThoai "Số điện thoại"
        varchar CCCD UK "CCCD/CMND"
        varchar Email "Email"
        date NgaySinh "Ngày sinh"
        nvarchar DiaChi "Địa chỉ thường trú"
        nvarchar GhiChu "Ghi chú"
    }

    HOPDONG {
        varchar MaHopDong PK "Mã hợp đồng"
        varchar MaNguoiDaiDien FK "Người đại diện"
        varchar MaNhaTro FK "Mã nhà trọ/phòng"
        date NgayBatDau "Ngày bắt đầu"
        date NgayKetThuc "Ngày kết thúc"
        decimal TienThue "Tiền thuê/tháng"
        decimal TienCoc "Tiền cọc"
        nvarchar GhiChu "Ghi chú"
        nvarchar TrangThai "Đang hiệu lực / Đã kết thúc / Đã hủy"
    }

    HOPDONG_NGUOITHUE {
        varchar MaHopDong PK, FK "Mã hợp đồng"
        varchar MaNguoiThue PK, FK "Mã người thuê"
        nvarchar VaiTro "Đại diện / Ở cùng"
        date NgayThamGia "Ngày tham gia"
        date NgayRoiDi "Ngày rời đi"
        nvarchar TrangThai "Đang ở / Đã rời"
    }

    HOADON {
        varchar MaHoaDon PK "Mã hóa đơn"
        varchar MaHopDong FK "Mã hợp đồng"
        int Thang "Tháng"
        int Nam "Năm"
        int ChiSoDienCu "Chỉ số điện cũ"
        int ChiSoDienMoi "Chỉ số điện mới"
        int ChiSoNuocCu "Chỉ số nước cũ"
        int ChiSoNuocMoi "Chỉ số nước mới"
        decimal TienDien "Tiền điện"
        decimal TienNuoc "Tiền nước"
        decimal TienThue "Tiền thuê"
        decimal TongTien "Tổng tiền"
        nvarchar TrangThai "Đã thanh toán / Chưa thanh toán"
        date NgayLap "Ngày lập"
        date HanThanhToan "Hạn thanh toán"
        nvarchar GhiChu "Ghi chú"
    }

    CHUTRO ||--o{ NHATRO : "sở hữu"

    NHATRO ||--o{ HOPDONG : "có hợp đồng"

    NGUOITHUE ||--o{ HOPDONG : "làm đại diện"

    HOPDONG ||--o{ HOPDONG_NGUOITHUE : "có người thuê"

    NGUOITHUE ||--o{ HOPDONG_NGUOITHUE : "tham gia"

    HOPDONG ||--o{ HOADON : "phát sinh hóa đơn"