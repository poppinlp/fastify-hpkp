import test from 'ava';
import fastify from 'fastify';
import plugin from '../src/index';

test.beforeEach(t => {
	const app = fastify();

	app.get('/', (request, reply) => {
		reply.send('hello world');
	});

	t.context.app = app;
});

const register = (t, opts) =>
	t.context.app.register(plugin, opts).inject({ method: 'get', url: '/' });
const mockGen = name => (t, opts) => register(t, opts).then(rsp => rsp.headers[name]);
const mock = mockGen('public-key-pins');
const mockReportOnly = mockGen('public-key-pins-report-only');

// with improper input
test('fails if called with no arguments', async t => {
	await t.throws(register(t));
});

test('fails if called with an empty object', async t => {
	await t.throws(register(t, {}));
});

test('fails if called without a max-age', async t => {
	await t.throws(register(t, { sha256s: ['abc123', 'xyz456'] }));
});

test('fails if called with a lowercase "maxage" option', async t => {
	await t.throws(register(t, { maxage: 10, sha256s: ['abc123', 'xyz456'] }));
});

[undefined, null, 'abc123', [], ['abc123']].forEach(value => {
	test(`fails if called with invalid SHAs: ${JSON.stringify(value)}`, async t => {
		await t.throws(register(t, { maxAge: 10, sha256s: value }));
	});
});

test('fails if called with a zero maxAge', async t => {
	await t.throws(register(t, { maxAge: 0, sha256s: ['abc123', 'xyz456'] }));
});

test('fails if called with a negative maxAge', async t => {
	await t.throws(register(t, { maxAge: -10, sha256s: ['abc123', 'xyz456'] }));
});

test('fails if called with reportOnly: true but no reportUri', async t => {
	await t.throws(register(t, { maxAge: 10, sha256s: ['abc123', 'xyz456'], reportOnly: true }));
});

[123, true].forEach(value => {
	test(`fails if called with no function: ${value}`, async t => {
		await t.throws(register(t, { maxAge: 10, sha256s: ['abc123', 'xyz456'], setIf: value }));
	});
});

// with proper input
test('sets header with a multi-value array key called "sha256s"', async t => {
	const header = await mock(t, { maxAge: 10, sha256s: ['abc123', 'xyz456'] });
	t.is(header, 'pin-sha256="abc123"; pin-sha256="xyz456"; max-age=10');
});

test('can include subdomains with the includeSubdomains option', async t => {
	const header = await mock(t, {
		maxAge: 10,
		sha256s: ['abc123', 'xyz456'],
		includeSubdomains: true
	});
	t.is(header, 'pin-sha256="abc123"; pin-sha256="xyz456"; max-age=10; includeSubDomains');
});

test('can include subdomains with the includeSubDomains option', async t => {
	const header = await mock(t, {
		maxAge: 10,
		sha256s: ['abc123', 'xyz456'],
		includeSubDomains: true
	});
	t.is(header, 'pin-sha256="abc123"; pin-sha256="xyz456"; max-age=10; includeSubDomains');
});

test('can set a report-uri', async t => {
	const header = await mock(t, {
		maxAge: 10,
		sha256s: ['abc123', 'xyz456'],
		reportUri: 'http://example.com'
	});
	t.is(
		header,
		'pin-sha256="abc123"; pin-sha256="xyz456"; max-age=10; report-uri="http://example.com"'
	);
});

test('can enable Report-Only header', async t => {
	const header = await mockReportOnly(t, {
		maxAge: 10,
		sha256s: ['abc123', 'xyz456'],
		reportUri: 'http://example.com',
		reportOnly: true
	});
	t.is(
		header,
		'pin-sha256="abc123"; pin-sha256="xyz456"; max-age=10; report-uri="http://example.com"'
	);
});

test('can use a report URI and include subdomains', async t => {
	const header = await mock(t, {
		maxAge: 10,
		sha256s: ['abc123', 'xyz456'],
		reportUri: 'http://example.com',
		includeSubDomains: true
	});
	t.is(
		header,
		'pin-sha256="abc123"; pin-sha256="xyz456"; max-age=10; includeSubDomains; report-uri="http://example.com"'
	);
});

test('rounds down to the nearest second', async t => {
	const header = await mock(t, { maxAge: 1.234, sha256s: ['abc123', 'xyz456'] });
	t.is(header, 'pin-sha256="abc123"; pin-sha256="xyz456"; max-age=1');
});

test('rounds up to the nearest second', async t => {
	const header = await mock(t, { maxAge: 1.567, sha256s: ['abc123', 'xyz456'] });
	t.is(header, 'pin-sha256="abc123"; pin-sha256="xyz456"; max-age=2');
});

test('set the header when the condition is true', async t => {
	const header = await mock(t, {
		maxAge: 10,
		sha256s: ['abc123', 'xyz456'],
		setIf: () => true
	});
	t.is(header, 'pin-sha256="abc123"; pin-sha256="xyz456"; max-age=10');
});

test('not set the header when the condition is false', async t => {
	const header = await mock(t, {
		maxAge: 10,
		sha256s: ['abc123', 'xyz456'],
		setIf: () => false
	});
	t.is(header, undefined);
});
