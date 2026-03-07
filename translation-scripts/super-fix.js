const fs = require('fs');
const file = 'uth-club-frontend/src/pages/admin/Dashboard.tsx';
let data = fs.readFileSync(file, 'utf8');

// The file definitely has an h1 tag near the top with class "text-3xl"
data = data.replace(/<h1 className="text-3xl font-bold mb-2">.*?<\/h1>/, '<h1 className="text-3xl font-bold mb-2">Bảng điều khiển Admin</h1>');

// The pie chart for events by status title
data = data.replace(/<CardTitle>Events by Status<\/CardTitle>/, '<CardTitle>Trạng thái sự kiện</CardTitle>');

fs.writeFileSync(file, data, 'utf8');
console.log('Fixed correctly via JS');
