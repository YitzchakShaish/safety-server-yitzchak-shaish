require('ts-node/register/transpile-only');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { AppDataSource } = require('../src/config/datasource');
const { User } = require('../src/entities/User');
const { UserAudit } = require('../src/entities/UserAudit');
const { UserService } = require('../src/services/user.service');
const { canManageReport, reportScope } = require('../src/utils/permissions');
let admin, regular, service;
before(async () => {
    AppDataSource.setOptions({ database: ':memory:', synchronize: true });
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(User);
    admin = await repo.save(repo.create({ fullName: 'Admin', email: 'admin@example.test', role: 'admin' }));
    regular = await repo.save(repo.create({ fullName: 'User', email: 'user@example.test' }));
    service = new UserService();
});
after(async () => { if (AppDataSource.isInitialized) await AppDataSource.destroy(); });

test('existing/default rank does not grant administration', () => {
    assert.equal(regular.role, 'user');
    assert.deepEqual(reportScope({ id: 'u', rank: 'רב אלוף', role: 'user', unit: '' }), { reporter: { id: 'u' } });
});
test('non-admin changes are rejected and leave no audit entry', async () => {
    await assert.rejects(service.updateUser(admin.id, regular.id, { role: 'user', rank: 'טוראי', unit: '', position: '' }));
    assert.equal(await AppDataSource.getRepository(UserAudit).count(), 0);
});
test('administrator changes rank separately and records actor and old/new values', async () => {
    const saved = await service.updateUser(regular.id, admin.id, { role: 'user', rank: 'סרן', unit: 'A', position: 'Driver' });
    assert.equal(saved.role, 'user');
    assert.equal(saved.rank, 'סרן');
    const audit = await AppDataSource.getRepository(UserAudit).findOneByOrFail({ userId: regular.id });
    assert.equal(audit.actorId, admin.id);
    assert.equal(audit.after.rank, 'סרן');
    assert.equal(audit.before.rank, 'טוראי');
});
test('self demotion and officer without unit are rejected', async () => {
    await assert.rejects(service.updateUser(admin.id, admin.id, { role: 'user', rank: 'טוראי', unit: '', position: '' }));
    await assert.rejects(service.updateUser(regular.id, admin.id, { role: 'safety_officer', rank: 'טוראי', unit: ' ', position: '' }));
    assert.equal((await AppDataSource.getRepository(User).findOneByOrFail({ id: admin.id })).role, 'admin');
});
test('officer may only manage assigned unit and regular users cannot manage', () => {
    const report = { reporter: { id: 'u' }, reporterProfile: { unit: 'A' } };
    assert.equal(canManageReport({ id: 'u', role: 'user', unit: 'A' }, report), false);
    assert.equal(canManageReport({ role: 'safety_officer', unit: 'B' }, report), false);
    assert.equal(canManageReport({ role: 'safety_officer', unit: 'A' }, report), true);
    assert.equal(canManageReport({ role: 'admin', unit: '' }, report), true);
});
