require('ts-node/register/transpile-only');
require('reflect-metadata');

const { test, before, after, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { DataSource } = require('typeorm');
const { AppDataSource } = require('../src/config/datasource');
const { User } = require('../src/entities/User');
const { UserService } = require('../src/services/user.service');
const { generateToken } = require('../src/utils/auth');

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP')]);
const AVATAR_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars');
const TYPE_MESSAGE = 'ניתן להעלות קובצי תמונה בלבד (JPG, PNG, WEBP או GIF)';
const SIZE_MESSAGE = 'גודל התמונה חורג מהמותר (עד 5MB)';
const REQUIRED_MESSAGE = 'יש לבחור תמונת פרופיל';
const INVALID_MESSAGE = 'הקובץ אינו תמונה תקינה';
const FIELD_MESSAGE = 'יש להעלות קובץ תמונה אחד בשדה avatar';
const UPDATED_MESSAGE = 'תמונת הפרופיל עודכנה בהצלחה';
const REMOVED_MESSAGE = 'תמונת הפרופיל הוסרה';
const MISSING_MESSAGE = 'אין תמונת פרופיל להסרה';

function loadDefault(mod) {
    return mod && mod.__esModule ? mod.default : (mod.default || mod);
}

function multipart(field, filename, contentType, content) {
    const boundary = `----AvatarTest${Date.now()}${Math.random().toString(16).slice(2)}`;
    const body = Buffer.concat([
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${field}"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`),
        Buffer.isBuffer(content) ? content : Buffer.from(content),
        Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    return { body, headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` } };
}

function emptyMultipart() {
    const boundary = `----AvatarTest${Date.now()}`;
    return {
        body: Buffer.from(`--${boundary}--\r\n`),
        headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    };
}

describe('profile picture', { concurrency: false }, () => {
    let app;
    let service;
    let user;
    let other;
    let admin;
    let token;
    let otherToken;
    let adminToken;
    const createdBefore = new Set();

    function request(method, urlPath, { token: auth, body, headers } = {}) {
        return new Promise((resolve, reject) => {
            const server = app.listen(0, '127.0.0.1', () => {
                const address = server.address();
                if (!address || typeof address === 'string') {
                    server.close();
                    reject(new Error('missing port'));
                    return;
                }
                const req = http.request({
                    hostname: '127.0.0.1',
                    port: address.port,
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
                        server.close();
                        const raw = Buffer.concat(chunks);
                        let parsed = null;
                        try { parsed = JSON.parse(raw.toString('utf8')); } catch { parsed = null; }
                        resolve({ status: res.statusCode, body: parsed, raw, headers: res.headers });
                    });
                });
                req.on('error', (err) => { server.close(); reject(err); });
                if (body) req.write(body);
                req.end();
            });
        });
    }

    before(async () => {
        if (fs.existsSync(AVATAR_DIR)) {
            for (const name of fs.readdirSync(AVATAR_DIR)) createdBefore.add(name);
        }
        AppDataSource.setOptions({ database: ':memory:', synchronize: true });
        await AppDataSource.initialize();
        const repo = AppDataSource.getRepository(User);
        user = await repo.save(repo.create({ fullName: 'Dana', email: 'dana@example.test' }));
        other = await repo.save(repo.create({ fullName: 'Noam', email: 'noam@example.test' }));
        admin = await repo.save(repo.create({ fullName: 'Admin', email: 'admin@example.test', role: 'admin' }));
        token = generateToken({ id: user.id, rank: user.rank, email: user.email });
        otherToken = generateToken({ id: other.id, rank: other.rank, email: other.email });
        adminToken = generateToken({ id: admin.id, rank: admin.rank, email: admin.email });
        service = new UserService();
        const express = require('express');
        app = express();
        app.use(require('cookie-parser')());
        app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
        app.use(express.json());
        app.use('/auth', loadDefault(require('../src/routes/auth.router')));
        app.use('/users', loadDefault(require('../src/routes/user.router')));
    });

    after(async () => {
        if (AppDataSource.isInitialized) await AppDataSource.destroy();
        if (!fs.existsSync(AVATAR_DIR)) return;
        for (const name of fs.readdirSync(AVATAR_DIR)) {
            if (!createdBefore.has(name)) fs.unlinkSync(path.join(AVATAR_DIR, name));
        }
    });

    test('synchronize adds avatarUrl to an existing database without dropping users', async () => {
        const dbPath = path.join(os.tmpdir(), `avatar-schema-${process.pid}-${Date.now()}.sqlite`);
        const options = {
            type: 'sqlite',
            database: dbPath,
            entities: [path.join(__dirname, '../src/entities/*.{ts,js}')],
            synchronize: true,
        };
        const first = new DataSource(options);
        try {
            await first.initialize();
            const saved = await first.getRepository(User).save(first.getRepository(User).create({
                fullName: 'Demo', email: 'demo@example.test',
            }));
            const tables = await first.query("SELECT name FROM sqlite_master WHERE type = 'table'");
            const userTable = tables.map((table) => table.name).find((name) => name.toLowerCase() === 'user');
            assert.ok(userTable, `user table missing: ${JSON.stringify(tables)}`);
            await first.query(`ALTER TABLE "${userTable}" DROP COLUMN "avatarUrl"`);
            const before = await first.query(`PRAGMA table_info("${userTable}")`);
            assert.equal(before.some((column) => column.name === 'avatarUrl'), false);
            await first.destroy();

            const second = new DataSource(options);
            await second.initialize();
            const columns = await second.query(`PRAGMA table_info("${userTable}")`);
            assert.equal(columns.some((column) => column.name === 'avatarUrl'), true);
            const reloaded = await second.getRepository(User).findOneByOrFail({ id: saved.id });
            assert.equal(reloaded.email, 'demo@example.test');
            assert.equal(reloaded.avatarUrl, null);
            const created = await second.getRepository(User).save(second.getRepository(User).create({
                fullName: 'New', email: 'new@example.test',
            }));
            assert.equal(created.avatarUrl, null);
            await second.destroy();
        } finally {
            for (const suffix of ['', '-journal', '-wal', '-shm']) {
                fs.rmSync(dbPath + suffix, { force: true });
            }
        }
    });

    test('login, current user, and a new account expose avatarUrl before a picture is chosen', async () => {
        const me = await request('GET', '/users/me', { token });
        assert.equal(me.status, 200);
        assert.equal(me.body.success, true);
        assert.equal(me.body.data.avatarUrl, null);

        const login = await request('POST', '/auth/login', {
            body: JSON.stringify({ fullName: 'Dana Updated', email: 'dana@example.test' }),
            headers: { 'Content-Type': 'application/json' },
        });
        assert.equal(login.status, 200);
        assert.equal(login.body.user.avatarUrl, null);
        assert.equal(login.body.user.fullName, 'Dana Updated');

        const signup = await request('POST', '/auth/signup', {
            body: JSON.stringify({ fullName: 'New User', email: 'new-user@example.test' }),
            headers: { 'Content-Type': 'application/json' },
        });
        assert.equal(signup.status, 201);
        assert.equal(signup.body.user.avatarUrl, null);
    });

    test('upload requires authentication and an image in the avatar field', async () => {
        const missingAuth = await request('POST', '/users/me/avatar', multipart('avatar', 'a.png', 'image/png', PNG));
        assert.equal(missingAuth.status, 401);
        assert.equal(missingAuth.body.message, 'אין טוקן – התחבר מחדש');

        const text = await request('POST', '/users/me/avatar', { token, ...multipart('avatar', 'notes.txt', 'text/plain', 'hello') });
        assert.equal(text.status, 400);
        assert.equal(text.body.message, TYPE_MESSAGE);

        const renamed = await request('POST', '/users/me/avatar', { token, ...multipart('avatar', 'photo.png', 'image/png', 'not an image') });
        assert.equal(renamed.status, 400);
        assert.equal(renamed.body.message, INVALID_MESSAGE);

        const empty = await request('POST', '/users/me/avatar', { token, ...emptyMultipart() });
        assert.equal(empty.status, 400);
        assert.equal(empty.body.message, REQUIRED_MESSAGE);

        const wrongField = await request('POST', '/users/me/avatar', { token, ...multipart('photo', 'a.png', 'image/png', PNG) });
        assert.equal(wrongField.status, 400);
        assert.equal(wrongField.body.message, FIELD_MESSAGE);

        const oversized = Buffer.alloc(5 * 1024 * 1024 + 1, 0);
        PNG.copy(oversized);
        const tooBig = await request('POST', '/users/me/avatar', { token, ...multipart('avatar', 'big.png', 'image/png', oversized) });
        assert.equal(tooBig.status, 400);
        assert.equal(tooBig.body.message, SIZE_MESSAGE);

        const names = fs.existsSync(AVATAR_DIR) ? fs.readdirSync(AVATAR_DIR).filter((name) => !createdBefore.has(name)) : [];
        assert.deepEqual(names, []);
        assert.equal((await AppDataSource.getRepository(User).findOneByOrFail({ id: user.id })).avatarUrl, null);
    });

    test('an authenticated user can upload, replace, and remove only their own picture', async () => {
        const uploaded = await request('POST', '/users/me/avatar', { token, ...multipart('avatar', 'me.PNG', 'image/png', PNG) });
        assert.equal(uploaded.status, 200);
        assert.equal(uploaded.body.message, UPDATED_MESSAGE);
        assert.match(uploaded.body.data.avatarUrl, /^\/uploads\/avatars\/\d+-\d+\.png$/);
        assert.equal(uploaded.body.data.id, user.id);
        const firstUrl = uploaded.body.data.avatarUrl;
        const firstName = path.posix.basename(firstUrl);
        assert.equal(fs.existsSync(path.join(AVATAR_DIR, firstName)), true);

        const image = await request('GET', firstUrl);
        assert.equal(image.status, 200);
        assert.match(String(image.headers['content-type']), /^image\/png/);
        assert.deepEqual(image.raw, PNG);

        const me = await request('GET', '/users/me', { token });
        assert.equal(me.body.data.avatarUrl, firstUrl);
        const login = await request('POST', '/auth/login', {
            body: JSON.stringify({ fullName: 'Dana Updated', email: 'dana@example.test' }),
            headers: { 'Content-Type': 'application/json' },
        });
        assert.equal(login.body.user.avatarUrl, firstUrl);
        const list = await request('GET', '/users/get-all', { token: adminToken });
        assert.equal(list.body.status, 'success');
        assert.equal(list.body.data.find((item) => item.id === user.id).avatarUrl, firstUrl);
        const byId = await request('GET', `/users/${user.id}`, { token: adminToken });
        assert.equal(byId.body.data.avatarUrl, firstUrl);

        const otherUpload = await request('POST', '/users/me/avatar', { token: otherToken, ...multipart('avatar', 'other.webp', 'image/webp', WEBP) });
        assert.equal(otherUpload.status, 200);
        assert.match(otherUpload.body.data.avatarUrl, /^\/uploads\/avatars\/\d+-\d+\.webp$/);
        assert.equal(fs.existsSync(path.join(AVATAR_DIR, firstName)), true);

        const replaced = await request('POST', '/users/me/avatar', { token, ...multipart('avatar', 'me.jpeg', 'image/jpeg', JPEG) });
        assert.equal(replaced.status, 200);
        assert.match(replaced.body.data.avatarUrl, /^\/uploads\/avatars\/\d+-\d+\.jpeg$/);
        assert.notEqual(replaced.body.data.avatarUrl, firstUrl);
        assert.equal(fs.existsSync(path.join(AVATAR_DIR, firstName)), false);
        assert.equal(fs.existsSync(path.join(AVATAR_DIR, path.posix.basename(otherUpload.body.data.avatarUrl))), true);
        const jpeg = await request('GET', replaced.body.data.avatarUrl);
        assert.equal(jpeg.status, 200);
        assert.match(String(jpeg.headers['content-type']), /^image\/jpeg/);
        assert.deepEqual(jpeg.raw, JPEG);

        const gif = await request('POST', '/users/me/avatar', { token, ...multipart('avatar', 'me.gif', 'image/gif', GIF) });
        assert.equal(gif.status, 200);
        assert.match(gif.body.data.avatarUrl, /\.gif$/);
        assert.equal(fs.existsSync(path.join(AVATAR_DIR, path.posix.basename(replaced.body.data.avatarUrl))), false);

        const saved = await service.updateUser(user.id, admin.id, { role: 'user', rank: 'סרן', unit: 'אלון', position: 'נהג' });
        assert.equal(saved.avatarUrl, gif.body.data.avatarUrl);
        assert.equal(saved.rank, 'סרן');

        const removed = await request('DELETE', '/users/me/avatar', { token });
        assert.equal(removed.status, 200);
        assert.equal(removed.body.message, REMOVED_MESSAGE);
        assert.equal(removed.body.data.avatarUrl, null);
        assert.equal(fs.existsSync(path.join(AVATAR_DIR, path.posix.basename(gif.body.data.avatarUrl))), false);
        const gone = await request('GET', gif.body.data.avatarUrl);
        assert.equal(gone.status, 404);
        const meAfter = await request('GET', '/users/me', { token });
        assert.equal(meAfter.body.data.avatarUrl, null);

        const again = await request('DELETE', '/users/me/avatar', { token });
        assert.equal(again.status, 400);
        assert.equal(again.body.message, MISSING_MESSAGE);
        assert.equal((await request('GET', '/users/me', { token: otherToken })).body.data.avatarUrl, otherUpload.body.data.avatarUrl);
    });

    test('rejected uploads do not replace a stored picture or delete files outside the avatar directory', async () => {
        const uploaded = await request('POST', '/users/me/avatar', { token, ...multipart('avatar', 'keep.png', 'image/png', PNG) });
        const kept = uploaded.body.data.avatarUrl;
        const bad = await request('POST', '/users/me/avatar', { token, ...multipart('avatar', 'keep.png', 'image/png', 'nope') });
        assert.equal(bad.status, 400);
        assert.equal(bad.body.message, INVALID_MESSAGE);
        assert.equal((await request('GET', '/users/me', { token })).body.data.avatarUrl, kept);
        assert.equal(fs.existsSync(path.join(AVATAR_DIR, path.posix.basename(kept))), true);

        const outside = path.join(os.tmpdir(), `avatar-outside-${process.pid}.png`);
        fs.writeFileSync(outside, PNG);
        await assert.rejects(
            () => service.setAvatar(user.id, {
                fieldname: 'avatar', originalname: 'x.png', encoding: '7bit', mimetype: 'image/png',
                size: PNG.length, destination: os.tmpdir(), filename: path.basename(outside), path: outside,
            }),
            (err) => err instanceof Error && err.message === 'הקובץ אינו תקין'
        );
        assert.equal(fs.existsSync(outside), true);
        assert.equal((await AppDataSource.getRepository(User).findOneByOrFail({ id: user.id })).avatarUrl, kept);
        fs.unlinkSync(outside);

        const orphanName = `orphan-${process.pid}.png`;
        const orphanPath = path.join(AVATAR_DIR, orphanName);
        fs.writeFileSync(orphanPath, PNG);
        await assert.rejects(
            () => service.setAvatar('missing-user', {
                fieldname: 'avatar', originalname: 'orphan.png', encoding: '7bit', mimetype: 'image/png',
                size: PNG.length, destination: AVATAR_DIR, filename: orphanName, path: orphanPath,
            }),
            (err) => err instanceof Error && err.message === 'המשתמש לא נמצא'
        );
        assert.equal(fs.existsSync(orphanPath), false);
        assert.equal((await AppDataSource.getRepository(User).findOneByOrFail({ id: user.id })).avatarUrl, kept);
    });
});
