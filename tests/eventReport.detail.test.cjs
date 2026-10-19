const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loadService(user, reports) {
    class User {}
    class EventReport {}
    const { outputText } = ts.transpileModule(
        fs.readFileSync('src/services/eventReport.service.ts', 'utf8'),
        { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }
    );
    const context = {
        exports: {},
        require: name => {
            if (name.endsWith('/User')) return { User };
            if (name.endsWith('/EventReport')) return { EventReport };
            if (name.includes('permissions')) return { reportScope: user => user.role === 'admin' ? {} : { reporter: { id: 'user' } } };
            if (name.includes('UserRole')) return { UserRole: { User: 'user', Admin: 'admin' } };
            if (name.includes('datasource')) return { AppDataSource: {
                getRepository: entity => entity === User
                    ? { findOne: async () => user }
                    : { findOne: async ({ where }) => reports.find(report =>
                        report.id === where.id && (!where.reporter || report.reporter.id === where.reporter.id)) }
            } };
            if (name.includes('formatEventReport')) return { formatEventReportForClient: report => report };
            return {};
        }
    };
    vm.runInNewContext(outputText, context);
    return context.exports.EventReportService;
}

const reports = [{ id: 'own', reporter: { id: 'user' } }, { id: 'other', reporter: { id: 'other-user' } }];

test('basic user can load own report but not another report', async () => {
    const service = loadService({ role: 'user' }, reports);
    assert.equal((await service.getById('own', 'user')).id, 'own');
    assert.equal(await service.getById('other', 'user'), null);
});

test('missing user and missing report return no data', async () => {
    assert.equal(await loadService(null, reports).getById('own', 'user'), null);
    assert.equal(await loadService({ role: 'admin' }, reports).getById('missing', 'user'), null);
});

test('administrator can load reports across users', async () => {
    assert.equal((await loadService({ role: 'admin' }, reports).getById('other', 'user')).id, 'other');
});
