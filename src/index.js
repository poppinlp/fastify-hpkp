const fp = require('fastify-plugin');

const hpkp = (app, opts = {}, next) => {
	if (!opts.maxAge || typeof opts.maxAge !== 'number' || !opts.sha256s || !Array.isArray(opts.sha256s) || opts.sha256s.length < 2) {
		throw new Error('hpkp must be called with a maxAge and at least two SHA-256s (one actually used and another kept as a backup)');
	}
	const setIf = typeof opts.setIf === 'function' ? opts.setIf : () => true;
	const headerKey = opts.reportOnly ? 'Public-Key-Pins-Report-Only' : 'Public-Key-Pins';
	const headerValueArr = opts.sha256s.map(sha => `pin-sha256="${sha}"`).concat(`max-age=${Math.round(opts.maxAge)}`);

	opts.includeSubDomains && headerValueArr.push('includeSubDomains');
	opts.reportUri && headerValueArr.push(`report-uri="${opts.reportUri}"`);

	const headerValueStr = headerValueArr.join('; ');

	app.addHook('onSend', (request, reply, payload, next) => {
		setIf(request, reply) && reply.header(headerKey, headerValueStr);
		next();
	});

	next();
};

module.exports = fp(hpkp, {
	fastify: '^1.0.0',
	name: 'fastify-hpkp'
});
