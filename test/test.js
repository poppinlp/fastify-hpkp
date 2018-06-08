import test from 'ava';
import fastify from 'fastify';
import plugin from '../src/index';

const optionMissError = new Error(
	'hpkp must be called with a maxAge and at least two SHA-256s (one actually used and another kept as a backup)'
);

test.beforeEach(t => {
	const app = fastify();

	app.get('/', (request, reply) => {
		reply.send('hello world');
	});

	t.context.app = app;
});

test('no option', async t => {
	const { app } = t.context;

	app.register(plugin);
	app.after(err => {
		t.deepEqual(err, optionMissError, 'should throw error when no option');
	});
	await app.inject({ method: 'get', url: '/' });
});

test('maxAge is not number', async t => {
	const { app } = t.context;

	app.register(plugin, {
		maxAge: 'not number'
	});
	app.after(err => {
		t.deepEqual(err, optionMissError, 'should throw error when maxAge is not number');
	});
	await app.inject({ method: 'get', url: '/' });
});

test('sha256s is not array', async t => {
	const { app } = t.context;

	app.register(plugin, {
		maxAge: 12345,
		sha256s: 'not array'
	});
	app.after(err => {
		t.deepEqual(err, optionMissError, 'should throw error when sha256s is not array');
	});
	await app.inject({ method: 'get', url: '/' });
});

test('sha256s length less than 2', async t => {
	const { app } = t.context;

	app.register(plugin, {
		maxAge: 12345,
		sha256s: ['aaa']
	});
	app.after(err => {
		t.deepEqual(err, optionMissError, 'should throw error when sha256s length is less than 2');
	});
	await app.inject({ method: 'get', url: '/' });
});

test('basic passed option', async t => {
	const { app } = t.context;

	app.register(plugin, {
		maxAge: 12345,
		sha256s: ['aaa', 'bbb']
	});
	app.after(err => {
		t.is(err, null, 'should not throw error');
	});

	const rsp = await app.inject({ method: 'get', url: '/' });

	t.is(rsp.payload, 'hello world');
	t.is(rsp.headers['public-key-pins'], 'pin-sha256="aaa"; pin-sha256="bbb"; max-age=12345');
});

test('set includeSubDomains', async t => {
	const { app } = t.context;

	app.register(plugin, {
		maxAge: 12345,
		sha256s: ['aaa', 'bbb'],
		includeSubDomains: true
	});

	const rsp = await app.inject({ method: 'get', url: '/' });

	t.is(rsp.payload, 'hello world');
	t.is(rsp.headers['public-key-pins'], 'pin-sha256="aaa"; pin-sha256="bbb"; max-age=12345; includeSubDomains');
});

test('set reportUri', async t => {
	const { app } = t.context;

	app.register(plugin, {
		maxAge: 12345,
		sha256s: ['aaa', 'bbb'],
		reportUri: 'http://www.foobar.com'
	});

	const rsp = await app.inject({ method: 'get', url: '/' });

	t.is(rsp.payload, 'hello world');
	t.is(rsp.headers['public-key-pins'], 'pin-sha256="aaa"; pin-sha256="bbb"; max-age=12345; report-uri="http://www.foobar.com"');
});

test('set reportOnly', async t => {
	const { app } = t.context;

	app.register(plugin, {
		maxAge: 12345,
		sha256s: ['aaa', 'bbb'],
		reportOnly: true
	});

	const rsp = await app.inject({ method: 'get', url: '/' });

	t.is(rsp.payload, 'hello world');
	t.is(rsp.headers['public-key-pins'], undefined);
	t.is(rsp.headers['public-key-pins-report-only'], 'pin-sha256="aaa"; pin-sha256="bbb"; max-age=12345');
});

test('set setIf but not matching', async t => {
	const { app } = t.context;

	app.register(plugin, {
		maxAge: 12345,
		sha256s: ['aaa', 'bbb'],
		setIf: () => false
	});

	const rsp = await app.inject({ method: 'get', url: '/' });

	t.is(rsp.payload, 'hello world');
	t.is(rsp.headers['public-key-pins'], undefined);
});

test('set setIf and matching', async t => {
	const { app } = t.context;

	app.register(plugin, {
		maxAge: 12345,
		sha256s: ['aaa', 'bbb'],
		setIf: () => true
	});

	const rsp = await app.inject({ method: 'get', url: '/' });

	t.is(rsp.payload, 'hello world');
	t.is(rsp.headers['public-key-pins'], 'pin-sha256="aaa"; pin-sha256="bbb"; max-age=12345');
});
