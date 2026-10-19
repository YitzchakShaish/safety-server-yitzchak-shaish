require('ts-node/register/transpile-only');
require('reflect-metadata');

const { test, before, after, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { AppDataSource } = require('../src/config/datasource');
const { User } = require('../src/entities/User');
const { generateToken } = require('../src/utils/auth');
const { AVATAR_SIZE_MESSAGE, AVATAR_TYPE_MESSAGE } = require('../src/utils/avatarFile');

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP')]);
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const TODAY = new Date().toISOString().slice(0, 10);
const YESTERDAY = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

function loadDefault(mod) {
    return mod && mod.__esModule ? mod.default : (mod.default || mod);
}

function jsonBody(value) {
    return {
        body: Buffer.from(JSON.stringify(value)),
        headers: { 'Content-Type': 'application/json' },
    };
}

function multipart(field, filename, contentType, content) {
    const boundary = `----EventImage${Date.now()}${Math.random().toString(16).slice(2)}`;
    const body = Buffer.concat([
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${field}"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`),
        Buffer.isBuffer(content) ? content : Buffer.from(content),
        Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    return { body, headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` } };
}

function reportBody(overrides = {}) {
    const body = {
        reporterInfo: {
            fullName: 'Dana',
            phone: '0500000001',
            unit: 'אלון',
            subUnit: 'מחלקה א',
            position: 'נהג',
            ...(overrides.reporterInfo || {}),
        },
        eventInfo: {
            eventDate: TODAY,
            eventTime: '10:00',
            eventDescription: 'אירוע בדיקה',
            unitActivityType: 'אימונים',
            personalActivityType: 'אימון',
            category: 'נשק ומקלעים',
            location: 'בסיס',
            eventSeverity: 'קל',
            eventResult: 'א.נ.א.נ (אין נפגעים, אין נזק)',
            weatherCondition: 'נאה',
            address: 'רחוב הרצל 1, תל אביב',
            latitude: 32.5,
            longitude: 34.75,
            ...(overrides.eventInfo || {}),
        },
        summaryInfo: {
            recommendations: 'אין',
            approval: false,
            eventStatus: 'לא טופל',
            ...(overrides.summaryInfo || {}),
        },
    };
    for (const key of overrides.omitReporter || []) delete body.reporterInfo[key];
    for (const key of overrides.omitEvent || []) delete body.eventInfo[key];
    return body;
}

function uploadFiles() {
    if (!fs.existsSync(UPLOAD_DIR)) return [];
    return fs.readdirSync(UPLOAD_DIR).filter((name) => fs.statSync(path.join(UPLOAD_DIR, name)).isFile());
}

async function updateColumn(tableHint, id, columnHint, value) {
    const tables = await AppDataSource.query("SELECT name FROM sqlite_master WHERE type = 'table'");
    const normalize = (name) => name.toLowerCase().replace(/_/g, '');
    const table = tables.map((row) => row.name).find((name) => normalize(name) === normalize(tableHint));
    if (!table) throw new Error(`missing table ${tableHint}: ${tables.map((row) => row.name).join(',')}`);
    const columns = await AppDataSource.query(`PRAGMA table_info("${table}")`);
    const column = columns.find((item) => normalize(item.name) === normalize(columnHint));
    const idColumn = columns.find((item) => normalize(item.name) === 'id');
    if (!column || !idColumn) throw new Error(`missing column on ${table}: ${JSON.stringify(columns)}`);
    await AppDataSource.query(
        `UPDATE "${table}" SET "${column.name}" = ? WHERE "${idColumn.name}" = ?`,
        [value, id]
    );
}

describe('event bugs', { concurrency: false }, () => {
    let app;
    let server;
    let port;
    let token;
    let adminToken;
    const createdBefore = new Set();

    function request(method, urlPath, { token: auth, body, headers } = {}) {
        return new Promise((resolve, reject) => {
            const req = http.request({
                hostname: '127.0.0.1',
                port,
                path: urlPath,
                method,
                headers: {
                    ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
                    ...(body ? { 'Content-Length': body.length } : {}),
                    ...headers,
                },
            }, (res) => {
                const chunks = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('end', () => {
                    const raw = Buffer.concat(chunks);
                    let parsed = null;
                    try { parsed = JSON.parse(raw.toString('utf8')); } catch { parsed = null; }
                    resolve({ status: res.statusCode, body: parsed, raw, headers: res.headers });
                });
            });
            req.on('error', reject);
            if (body) req.write(body);
            req.end();
        });
    }

    before(async () => {
        for (const name of uploadFiles()) createdBefore.add(name);
        AppDataSource.setOptions({ database: ':memory:', synchronize: true });
        await AppDataSource.initialize();
        const repo = AppDataSource.getRepository(User);
        const user = await repo.save(repo.create({ fullName: 'Dana', email: 'dana-events@example.test' }));
        const admin = await repo.save(repo.create({ fullName: 'Admin', email: 'admin-events@example.test', role: 'admin' }));
        token = generateToken({ id: user.id, rank: user.rank, email: user.email });
        adminToken = generateToken({ id: admin.id, rank: admin.rank, email: admin.email });
        const express = require('express');
        app = express();
        app.use(express.json());
        app.use('/', loadDefault(require('../src/routes/eventReport.router')));
        app.use('/reports', loadDefault(require('../src/routes/reportImages.routes')));
        server = http.createServer(app);
        await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
        port = server.address().port;
    });

    after(async () => {
        if (server) await new Promise((resolve) => server.close(resolve));
        if (AppDataSource.isInitialized) await AppDataSource.destroy();
        for (const name of uploadFiles()) {
            if (!createdBefore.has(name)) fs.unlinkSync(path.join(UPLOAD_DIR, name));
        }
    });

    test('event list and single event return address, latitude, and longitude', async () => {
        const created = await request('POST', '/event-report', { token, ...jsonBody(reportBody()) });
        assert.equal(created.status, 201, JSON.stringify(created.body));
        const id = created.body.data.id;

        const listed = await request('GET', '/event-reports?page=1&perPage=50', { token });
        assert.equal(listed.status, 200);
        const fromList = listed.body.data.find((item) => item.id === id);
        assert.equal(fromList.eventInfo.address, 'רחוב הרצל 1, תל אביב');
        assert.equal(fromList.eventInfo.latitude, 32.5);
        assert.equal(fromList.eventInfo.longitude, 34.75);

        const detail = await request('GET', `/event-report/${id}`, { token });
        assert.equal(detail.status, 200);
        assert.equal(detail.body.data.eventInfo.address, 'רחוב הרצל 1, תל אביב');
        assert.equal(detail.body.data.eventInfo.latitude, 32.5);
        assert.equal(detail.body.data.eventInfo.longitude, 34.75);

        const empty = await request('POST', '/event-report', {
            token,
            ...jsonBody(reportBody({
                reporterInfo: { phone: '0500000009', subUnit: 'אחר' },
                omitEvent: ['address', 'latitude', 'longitude'],
            })),
        });
        assert.equal(empty.status, 201, JSON.stringify(empty.body));
        const missing = await request('GET', `/event-report/${empty.body.data.id}`, { token });
        assert.equal(missing.status, 200);
        assert.equal(missing.body.data.eventInfo.address, null);
        assert.equal(missing.body.data.eventInfo.latitude, null);
        assert.equal(missing.body.data.eventInfo.longitude, null);
        const missingInList = (await request('GET', '/event-reports?page=1&perPage=50', { token })).body.data
            .find((item) => item.id === empty.body.data.id);
        assert.equal(missingInList.eventInfo.address, null);
        assert.equal(missingInList.eventInfo.latitude, null);
        assert.equal(missingInList.eventInfo.longitude, null);
    });

    test('date filter uses the event date and includes the whole end day', async () => {
        const duringToday = await request('POST', '/event-report', {
            token,
            ...jsonBody(reportBody({
                reporterInfo: { phone: '0500000011', subUnit: 'יום' },
                eventInfo: { eventDate: TODAY, address: 'היום' },
            })),
        });
        assert.equal(duringToday.status, 201, JSON.stringify(duringToday.body));

        const timed = await request('POST', '/event-report', {
            token,
            ...jsonBody(reportBody({
                reporterInfo: { phone: '0500000012', subUnit: 'שעה', reportDate: '2020-01-15T12:00:00.000Z' },
                eventInfo: { eventDate: TODAY, address: 'עם שעה' },
            })),
        });
        assert.equal(timed.status, 201, JSON.stringify(timed.body));
        await updateColumn('eventinfo', timed.body.data.eventInfo.id, 'eventDate', `${TODAY} 18:30:00`);

        const createdTodayButEarlierEvent = await request('POST', '/event-report', {
            token,
            ...jsonBody(reportBody({
                reporterInfo: { phone: '0500000013', subUnit: 'אתמול', reportDate: TODAY },
                eventInfo: { eventDate: YESTERDAY, address: 'אתמול' },
            })),
        });
        assert.equal(createdTodayButEarlierEvent.status, 201, JSON.stringify(createdTodayButEarlierEvent.body));
        await updateColumn('eventreport', createdTodayButEarlierEvent.body.data.id, 'createdAt', TODAY);

        const listed = await request('GET', `/event-reports?dateFrom=${TODAY}&dateTo=${TODAY}&page=1&perPage=50`, { token });
        assert.equal(listed.status, 200, JSON.stringify(listed.body));
        const ids = listed.body.data.map((item) => item.id);
        assert.equal(ids.includes(duringToday.body.data.id), true);
        assert.equal(ids.includes(timed.body.data.id), true);
        assert.equal(ids.includes(createdTodayButEarlierEvent.body.data.id), false);
        assert.equal(listed.body.data.find((item) => item.id === timed.body.data.id).eventInfo.address, 'עם שעה');
    });

    test('omitted subUnit does not reuse another report profile', async () => {
        const first = await request('POST', '/event-report', {
            token,
            ...jsonBody(reportBody({
                reporterInfo: { phone: '0501111111', unit: 'גפן', subUnit: 'מחלקה א', position: 'נהג' },
            })),
        });
        assert.equal(first.status, 201, JSON.stringify(first.body));

        const second = await request('POST', '/event-report', {
            token,
            ...jsonBody(reportBody({
                reporterInfo: { phone: '0502222222', unit: 'גפן', position: 'נהג' },
                omitReporter: ['subUnit'],
            })),
        });
        assert.equal(second.status, 201, JSON.stringify(second.body));
        assert.notEqual(second.body.data.reporterProfile.id, first.body.data.reporterProfile.id);
        assert.equal(second.body.data.reporterProfile.subUnit, '');

        const secondView = await request('GET', `/event-report/${second.body.data.id}`, { token });
        assert.equal(secondView.body.data.reporterInfo.subUnit, '');
        assert.equal(secondView.body.data.reporterInfo.phone, '0502222222');
        const firstView = await request('GET', `/event-report/${first.body.data.id}`, { token });
        assert.equal(firstView.body.data.reporterInfo.subUnit, 'מחלקה א');
        assert.equal(firstView.body.data.reporterInfo.phone, '0501111111');

        const third = await request('POST', '/event-report', {
            token,
            ...jsonBody(reportBody({
                reporterInfo: { phone: '0502222222', unit: 'גפן', position: 'נהג' },
                omitReporter: ['subUnit'],
            })),
        });
        assert.equal(third.status, 201, JSON.stringify(third.body));
        assert.equal(third.body.data.reporterProfile.id, second.body.data.reporterProfile.id);
        assert.equal(third.body.data.reporterProfile.subUnit, '');
    });

    test('event image uploads accept only jpeg, png, webp, and gif up to 5MB', async () => {
        const created = await request('POST', '/event-report', {
            token,
            ...jsonBody(reportBody({ reporterInfo: { phone: '0500000088', subUnit: 'תמונות' } })),
        });
        assert.equal(created.status, 201, JSON.stringify(created.body));
        const id = created.body.data.id;
        const url = `/reports/${id}/images`;

        const missingAuth = await request('POST', url, multipart('images', 'a.png', 'image/png', PNG));
        assert.equal(missingAuth.status, 401);

        const text = await request('POST', url, { token, ...multipart('images', 'notes.txt', 'text/plain', 'hello') });
        assert.equal(text.status, 400);
        assert.equal(text.body.message, AVATAR_TYPE_MESSAGE);

        const renamed = await request('POST', url, { token, ...multipart('images', 'notes.txt', 'image/png', PNG) });
        assert.equal(renamed.status, 400);
        assert.equal(renamed.body.message, AVATAR_TYPE_MESSAGE);

        const before = uploadFiles();
        const oversized = Buffer.alloc(5 * 1024 * 1024 + 1);
        PNG.copy(oversized);
        const tooBig = await request('POST', url, { token, ...multipart('images', 'big.png', 'image/png', oversized) });
        assert.equal(tooBig.status, 400);
        assert.equal(tooBig.body.message, AVATAR_SIZE_MESSAGE);
        assert.deepEqual(uploadFiles(), before);

        for (const [filename, type, content] of [
            ['photo.png', 'image/png', PNG],
            ['photo.jpg', 'image/jpeg', JPEG],
            ['photo.jpeg', 'image/jpeg', JPEG],
            ['photo.webp', 'image/webp', WEBP],
            ['photo.gif', 'image/gif', GIF],
        ]) {
            const uploaded = await request('POST', url, { token, ...multipart('images', filename, type, content) });
            assert.equal(uploaded.status, 200, `${filename}: ${JSON.stringify(uploaded.body)}`);
            assert.equal(uploaded.body.success, true);
            assert.equal(uploaded.body.images.length >= 1, true);
        }

        const detail = await request('GET', `/event-report/${id}`, { token });
        assert.equal(detail.body.data.images.length, 5);
    });

    test('deleting a missing event returns 404 and an existing event still deletes', async () => {
        const missing = await request('DELETE', `/event-report/${randomUUID()}`, { token: adminToken });
        assert.equal(missing.status, 404);
        assert.equal(missing.body.message, 'האירוע לא נמצא');

        const invalid = await request('DELETE', '/event-report/not-a-uuid', { token: adminToken });
        assert.equal(invalid.status, 400);

        const created = await request('POST', '/event-report', {
            token,
            ...jsonBody(reportBody({ reporterInfo: { phone: '0500000077', subUnit: 'מחיקה' } })),
        });
        assert.equal(created.status, 201, JSON.stringify(created.body));
        const removed = await request('DELETE', `/event-report/${created.body.data.id}`, { token: adminToken });
        assert.equal(removed.status, 200);
        const again = await request('DELETE', `/event-report/${created.body.data.id}`, { token: adminToken });
        assert.equal(again.status, 404);
        assert.equal(again.body.message, 'האירוע לא נמצא');
    });
});
