const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const jwt = require('jsonwebtoken');
const secret = 'test-only-signing-secret';

function load(file, requireMock) {
    const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true }
    });
    const context = { exports: {}, require: requireMock, Error };
    vm.runInNewContext(outputText, context);
    return context.exports;
}

const auth = load('src/utils/auth.ts', name => name === 'jsonwebtoken'
    ? jwt : { config: { secretString: secret } });
const { checkAuth, checkRank } = load('src/middlewares/auth.middleware.ts', () => auth);

function response() {
    return { statusCode: 200, status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }, clearCookie() {} };
}

test('new tokens are valid for three hours and verify successfully', () => {
    const token = auth.generateToken({ id: 'user', rank: 'basic' });
    const decoded = auth.verifyToken(token);
    assert.equal(decoded.exp - decoded.iat, 3 * 60 * 60);
    assert.equal(decoded.id, 'user');
    assert.equal(jwt.verify(token, secret, { clockTimestamp: decoded.iat + 7200 }).id, 'user');
    assert.throws(() => jwt.verify(token, secret, { clockTimestamp: decoded.exp + 1 }));
});

test('expired and incorrectly signed tokens return 401', () => {
    for (const [token, code] of [
        [jwt.sign({ id: 'user' }, secret, { expiresIn: -1 }), 'TOKEN_EXPIRED'],
        [jwt.sign({ id: 'user' }, 'wrong-secret'), 'INVALID_TOKEN']
    ]) {
        const res = response();
        checkAuth({ headers: { authorization: `Bearer ${token}` } }, res,
            () => assert.fail('must not authenticate'));
        assert.equal(res.statusCode, 401);
        assert.equal(res.body.code, code);
    }
});

test('valid token proceeds; missing token is 401; insufficient rank stays 403', () => {
    const req = { headers: { authorization: `Bearer ${auth.generateToken({ id: 'user', rank: 'basic' })}` } };
    let called = false;
    checkAuth(req, response(), () => { called = true; });
    assert.equal(called, true);
    assert.equal(req.user.id, 'user');
    const missing = response();
    checkAuth({ headers: {} }, missing, () => assert.fail());
    assert.equal(missing.statusCode, 401);
    const denied = response();
    checkRank(['admin'])(req, denied, () => assert.fail());
    assert.equal(denied.statusCode, 403);
});
