const fs = require('fs');
const path = require('path');

const reps = [
    [/Clubs Management/g, 'Quản lý câu lạc bộ'],
    [/Manage your club members/g, 'Quản lý thành viên câu lạc bộ'],
    [/Submit and manage event requests/g, 'Gửi và quản lý yêu cầu sự kiện'],
    [/Review and manage membership applications/g, 'Xem xét và quản lý đơn đăng ký tham gia'],
    [/Events Management/g, 'Quản lý sự kiện'],
    [/>Clubs</g, '>Câu lạc bộ<'],
    [/>Events</g, '>Sự kiện<'],
    [/>Users</g, '>Người dùng<'],
];

function walk(dir) {
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
                console.log('Final Updated:', p);
            }
        }
    });
}

walk('d:/UTH-clubs-and-events/uth-club-frontend/src/pages');
console.log('Finished final translation');
