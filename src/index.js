const fp = require('fastify-plugin');

const hpkp = (app, opts, next) => {
	const badArgError = new Error(
		'hpkp must be called with a maxAge, at least two SHA-256s and setIf must be a function if specified'
	);

	if (
		!opts.maxAge ||
		opts.maxAge <= 0 ||
		!opts.sha256s ||
		!Array.isArray(opts.sha256s) ||
		opts.sha256s.length < 2 ||
		(opts.setIf && typeof opts.setIf !== 'function') ||
		(opts.reportOnly && !opts.reportUri)
	) {
		next(badArgError);
		return;
	}

	const hasSetIf = Boolean(opts.setIf);
	const headerKey = opts.reportOnly ? 'Public-Key-Pins-Report-Only' : 'Public-Key-Pins';
	const headerValueArr = opts.sha256s
		.map(sha => `pin-sha256="${sha}"`)
		.concat(`max-age=${Math.round(opts.maxAge)}`);

	(opts.includeSubDomains || opts.includeSubdomains) && headerValueArr.push('includeSubDomains');
	opts.reportUri && headerValueArr.push(`report-uri="${opts.reportUri}"`);

	const headerValueStr = headerValueArr.join('; ');

	app.addHook('onSend', (request, reply, payload, next) => {
		(hasSetIf ? opts.setIf(request, reply) : true) && reply.header(headerKey, headerValueStr);
		next();
	});

	next();
};

module.exports = fp(hpkp, {
	fastify: '^1.0.0',
	name: 'fastify-hpkp'
});
