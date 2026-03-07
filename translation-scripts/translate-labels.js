const fs = require('fs');
const path = require('path');

const reps = [
    [/>Name</g, '>Họ Tên<'],
    [/>Club Name</g, '>Tên CLB<'],
    [/>Description</g, '>Mô tả<'],
    [/>Role</g, '>Vai trò<'],
    [/>Student ID</g, '>MSSV<'],
    [/>Points</g, '>Điểm rèn luyện<'],
    [/>Status</g, '>Trạng thái<'],
    [/>Joined</g, '>Ngày tham gia<'],
    [/>Actions</g, '>Thao tác<'],
    [/>Edit</g, '>Sửa<'],
    [/>Update</g, '>Cập nhật<'],
    [/>Delete</g, '>Xóa<'],
    [/>Save</g, '>Lưu<'],
    [/>Cancel</g, '>Hủy<'],
    [/>Approve</g, '>Duyệt<'],
    [/>Reject</g, '>Từ chối<'],
    [/>Manage </g, '>Quản lý '],
    [/placeholder="Search c.*"/gi, 'placeholder="Tìm kiếm câu lạc bộ..."'],
    [/placeholder="Search e.*"/gi, 'placeholder="Tìm kiếm sự kiện..."'],
    [/placeholder="Search u.*"/gi, 'placeholder="Tìm kiếm người dùng..."'],
    [/placeholder="Search m.*"/gi, 'placeholder="Tìm kiếm thành viên..."'],
    [/placeholder="Search r.*"/gi, 'placeholder="Tìm kiếm yêu cầu..."'],
    [/>Add User</g, '>Thêm người dùng<'],
    [/>Add Member</g, '>Thêm thành viên<'],
    [/>Add Event</g, '>Thêm sự kiện<'],
    [/>Create Event</g, '>Tạo sự kiện<'],
    [/>Create Club</g, '>Thành lập CLB<'],
    [/>Total Members</g, '>Tổng thành viên<'],
    [/>Total Events</g, '>Tổng sự kiện<'],
    [/>Event Details</g, '>Chi tiết sự kiện<'],
    [/>Club Details</g, '>Chi tiết câu lạc bộ<'],
    [/>Location</g, '>Địa điểm<'],
    [/>Date</g, '>Ngày tổ chức<'],
    [/>Capacity</g, '>Số lượng<'],
    [/>Create/g, '>Tạo'],
    [/>No results found/g, '>Không tìm thấy kết quả'],
    [/>No events found/g, '>Không có sự kiện nào'],
    [/>No members found/g, '>Không có thành viên nào'],
];

function walk(dir) {
    let modified = 0;
    fs.readdirSync(dir).forEach(f => {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) walk(p);
        else if (p.endsWith('.tsx')) {
            let code = fs.readFileSync(p, 'utf8');
            const orig = code;

            reps.forEach(r => {
                code = code.replace(r[0], r[1]);
            });

            if (code !== orig) {
                fs.writeFileSync(p, code, 'utf8');
                console.log('Updated:', p);
                modified++;
            }
        }
    });
}

walk('d:/UTH-clubs-and-events/uth-club-frontend/src/pages');
console.log('Finished deep translations');
