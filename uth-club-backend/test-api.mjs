// =============================================================================
// UTH Clubs & Events — Baseline API Test Script (Node.js ESM)
// node test-api.mjs
// =============================================================================

const BASE = 'http://localhost:3000';

const C = {
    reset: '\x1b[0m', cyan: '\x1b[36m', yellow: '\x1b[33m',
    green: '\x1b[32m', red: '\x1b[31m', gray: '\x1b[90m', magenta: '\x1b[35m',
};

let passed = 0, failed = 0;

function header(t) {
    console.log(`\n${C.cyan}${'-'.repeat(40)}${C.reset}`);
    console.log(`${C.cyan}  ${t}${C.reset}`);
    console.log(`${C.cyan}${'-'.repeat(40)}${C.reset}`);
}
function test(l) { process.stdout.write(`${C.yellow}▶ ${l}${C.reset}\n`); }
function ok(m) { console.log(`${C.green}  ✅ ${m}${C.reset}`); passed++; }
function fail(m) { console.log(`${C.red}  ❌ ${m}${C.reset}`); failed++; }
function info(m) { console.log(`${C.gray}  ℹ  ${m}${C.reset}`); }

async function api(method, path, { body, token } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
        const res = await fetch(`${BASE}${path}`, {
            method, headers,
            body: body ? JSON.stringify(body) : undefined,
        });
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text; }
        return { ok: res.ok, status: res.status, data };
    } catch (e) {
        return { ok: false, status: 0, data: null, error: e.message };
    }
}

function expectStatus(r, status, label) {
    if (r.status === status) {
        ok(`[${r.status}] ${label} — Match!`);
        return true;
    } else {
        fail(`[${r.status}] ${label} — Expected ${status}. Message: ${JSON.stringify(r.data?.message ?? r.data)}`);
        return false;
    }
}

async function login(email, password) {
    const r = await api('POST', '/auth/login', { body: { email, password } });
    if (r.ok && r.data?.token) return r.data.token;
    throw new Error(`Login failed for ${email}: ${JSON.stringify(r.data)}`);
}

async function run() {
    let ADMIN, OWNER, STUDENT, S15;

    header('1. AUTHENTICATION');
    try {
        ADMIN = await login('admin@uth.edu.vn', 'Admin@123');
        ok('Admin Login (admin@uth.edu.vn)');

        OWNER = await login('an.nguyen@uth.edu.vn', 'Owner@123');
        ok('Owner Login (an.nguyen@uth.edu.vn)');

        STUDENT = await login('quynh.ly@uth.edu.vn', 'Student@123');
        ok('Student Login (quynh.ly@uth.edu.vn, ID=14)');

        S15 = await login('son.truong@uth.edu.vn', 'Student@123');
        ok('Student15 Login (son.truong@uth.edu.vn, ID=15)');
    } catch (e) {
        fail(e.message);
        process.exit(1);
    }

    header('2. CORE USER TESTS');
    test('GET /users/me — profile');
    let r = await api('GET', '/users/me', { token: STUDENT });
    expectStatus(r, 200, 'Student profile');

    test('GET /users — Admin (Authorized)');
    r = await api('GET', '/users', { token: ADMIN });
    expectStatus(r, 200, 'Admin can view users');

    test('GET /users — Student (Forbidden)');
    r = await api('GET', '/users', { token: STUDENT });
    expectStatus(r, 403, 'Student cannot view users');

    header('3. CLUB & MEMBERSHIP TESTS');
    test('GET /clubs — Public');
    r = await api('GET', '/clubs');
    expectStatus(r, 200, 'Public can view clubs');

    test('POST /memberships/8/join — Student join Club 8 (Yoga)');
    r = await api('POST', '/memberships/8/join', {
        token: STUDENT,
        body: { join_reason: 'Testing', skills: 'Testing', promise: 'Testing' }
    });
    if (r.ok || r.status === 409) {
        ok(`[${r.status}] Joined/Requested successfully`);
    } else {
        fail(`[${r.status}] Failed to join: ${JSON.stringify(r.data)}`);
    }

    test('GET /memberships/request — Owner view pending');
    r = await api('GET', '/memberships/request', { token: OWNER });
    expectStatus(r, 200, 'Owner can view membership requests');

    test('GET /memberships/members — Admin view Club 1 (Lập trình UTH)');
    r = await api('GET', '/memberships/members?clubId=1', { token: ADMIN });
    expectStatus(r, 200, 'Admin can view club members with ?clubId=1');

    header('4. EVENT TESTS');
    test('GET /events — Public');
    r = await api('GET', '/events?status=approved');
    expectStatus(r, 200, 'Public can view approved events');

    test('POST /event-registrations/7/register — Join future public event');
    r = await api('POST', '/event-registrations/7/register', { token: STUDENT });
    if (r.ok || r.status === 409) {
        ok(`[${r.status}] Registration OK/Duplicate`);
    } else {
        fail(`[${r.status}] Registration failed: ${JSON.stringify(r.data)}`);
    }

    test('GET /event-registrations/1/participants — Owner');
    r = await api('GET', '/event-registrations/1/participants', { token: OWNER });
    expectStatus(r, 200, 'Owner view participants');

    test('GET /event-registrations/1/participants — Student (Forbidden)');
    r = await api('GET', '/event-registrations/1/participants', { token: STUDENT });
    expectStatus(r, 403, 'Student cannot view participants');

    header('5. STATISTICS');
    test('GET /statistics/admin_statistics — Admin');
    r = await api('GET', '/statistics/admin_statistics', { token: ADMIN });
    expectStatus(r, 200, 'Admin view statistics');

    test('GET /statistics/own-club_statistics — Owner');
    r = await api('GET', '/statistics/own-club_statistics', { token: OWNER });
    expectStatus(r, 200, 'Owner view own club statistics');

    test('GET /statistics/admin_statistics — Student (Forbidden)');
    r = await api('GET', '/statistics/admin_statistics', { token: STUDENT });
    expectStatus(r, 403, 'Student cannot view admin statistics');

    header('--- SUMMARY ---');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    if (failed === 0) ok('All baseline tests passed!');
    else fail('Some baseline tests failed.');
}

run().catch(e => console.error(e));
