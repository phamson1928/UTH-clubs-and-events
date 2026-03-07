const fs = require('fs');

const f1 = 'uth-club-frontend/src/pages/admin/Dashboard.tsx';
let d1 = fs.readFileSync(f1, 'utf8');

// Translate remaining headers
d1 = d1.replace(/Monthly Events by Status \(This Year\)/g, 'Sự kiện hàng tháng theo trạng thái (Năm nay)');

// Translate Pie Chart data
d1 = d1.replace(/data={eventsStatus}/g, "data={eventsStatus.map(e => ({...e, status: e.status === 'approved' ? 'Đã duyệt' : e.status === 'pending' ? 'Chờ duyệt' : e.status === 'rejected' ? 'Từ chối' : e.status}))}");

// Translate BarChart names
d1 = d1.replace(/name="approved"/g, 'name="Đã duyệt"');
d1 = d1.replace(/name="pending"/g, 'name="Chờ duyệt"');
d1 = d1.replace(/name="rejected"/g, 'name="Từ chối"');

fs.writeFileSync(f1, d1, 'utf8');

console.log('Fixed admin chart texts');
