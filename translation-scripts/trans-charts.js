const fs = require('fs'); const path = require('path'); function walk(dir, cb) { fs.readdirSync(dir).forEach(f => { let p = path.join(dir, f); if (fs.statSync(p).isDirectory()) walk(p, cb); else cb(p); }); } walk('d:/UTH-clubs-and-events/uth-club-frontend/src', f => {
    if (!f.endsWith('.tsx')) return; let c = fs.readFileSync(f, 'utf8'); let init = c;
    // Admin Dashboard Stats & Charts
    c = c.replace(/title: "Total Clubs"/g, 'title: "Tổng số CLB"').replace(/sub: "Active clubs in system"/g, 'sub: "Câu lạc bộ đang hoạt động"');
    c = c.replace(/title: "Total Members"/g, 'title: "Tổng thành viên"').replace(/sub: "Verified users"/g, 'sub: "Người dùng đã xác định"');
    c = c.replace(/title: "Total Events"/g, 'title: "Tổng sự kiện"').replace(/sub: "Total events"/g, 'sub: "Tất cả sự kiện"');
    c = c.replace(/title: "Pending Event"/g, 'title: "Sự kiện chờ duyệt"').replace(/title: "Pending Events"/g, 'title: "Sự kiện chờ duyệt"').replace(/sub: "Awaiting approval"/g, 'sub: "Đang chờ duyệt"');
    c = c.replace(/Events Growth \(This Year\)/g, 'Biểu đồ sự kiện (Năm nay)');
    c = c.replace(/New Users \(This Year\)/g, 'Người dùng mới (Năm nay)');
    c = c.replace(/Club Categories/g, 'Danh mục câu lạc bộ');
    c = c.replace(/name="Events"/g, 'name="Sự kiện"');
    c = c.replace(/name="Users"/g, 'name="Người dùng"');

    // Club Owner Dashboard Stats & Charts
    c = c.replace(/sub: "Active members in your club"/g, 'sub: "Thành viên hiện tại"');
    c = c.replace(/sub: "Approved events"/g, 'sub: "Sự kiện đã duyệt"').replace(/sub: "Completed events"/g, 'sub: "Sự kiện đã hoàn thành"');
    c = c.replace(/sub: "Awaiting review"/g, 'sub: "Đang chờ admin duyệt"');
    c = c.replace(/title: "Past Events"/g, 'title: "Sự kiện đã qua"');
    c = c.replace(/Welcome back! Here's your club overview/g, 'Chào mừng trở lại! Hân hạnh được gặp lại bạn');
    c = c.replace(/Member Growth \(This Year\)/g, 'Biểu đồ thành viên (Năm nay)');
    c = c.replace(/Your club's member count over time/g, 'Số lượng thành viên theo thời gian');
    c = c.replace(/name="New Members"/g, 'name="Thành viên mới"');
    c = c.replace(/Number of events created each month/g, 'Số sự kiện tạo bởi CLB mỗi tháng');

    if (c !== init) { fs.writeFileSync(f, c); console.log('Updated', f); }
});
