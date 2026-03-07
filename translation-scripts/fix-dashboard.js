const fs = require('fs');
let p1 = 'd:/UTH-clubs-and-events/uth-club-frontend/src/pages/admin/Dashboard.tsx';
let c1 = fs.readFileSync(p1, 'utf8');
c1 = c1.replace(/B\?ng \S+ Admin/g, 'Bảng điều khiển Admin');
c1 = c1.replace(/System overview and statistics/g, 'Tổng quan và thống kê hệ thống');
fs.writeFileSync(p1, c1, 'utf8');

let p2 = 'd:/UTH-clubs-and-events/uth-club-frontend/src/pages/club-owner/Dashboard.tsx';
let c2 = fs.readFileSync(p2, 'utf8');
c2 = c2.replace(/B\?ng \S+ khi\?n/g, 'Bảng điều khiển');
c2 = c2.replace(/Welcome back! Here's your club overview/g, 'Chào mừng trở lại! Tổng quan câu lạc bộ của bạn');
c2 = c2.replace(/name="Events"/g, 'name="Sự kiện"');
fs.writeFileSync(p2, c2, 'utf8');
console.log('Fixed dashboards');
