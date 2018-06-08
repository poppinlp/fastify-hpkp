# fastify-hpkp

[![Build Status][ci-img]][ci-url]
[![Code coverage][cov-img]][cov-url]
[![Code style][lint-img]][lint-url]
[![Dependency Status][dep-img]][dep-url]
[![Dev Dependency Status][dev-dep-img]][dev-dep-url]
[![NPM version][npm-ver-img]][npm-url]
[![NPM downloads][npm-dl-img]][npm-url]
[![NPM license][npm-lc-img]][npm-url]

Fastify plugin to set the Public-Key-Pins header

## Why?

You may know [hpkp](https://github.com/helmetjs/hpkp) as a [hpkp middleware](https://helmetjs.github.io/docs/hpkp/) used in [helmet](https://github.com/helmetjs/helmet). And you could use it as a middleware in fastify also. So why i made this plugin?

You may find the reason in [benchmark result](./benchmarks/benchmark.txt) and wish you like it. :)

## Install

Via npm:

```shell
npm i fastify-hpkp
```

Via yarn:

```shell
yarn add fastify-hpkp
```

## Usage

```js
const fastify = require('fastify');
const fastifyHpkp = require('fastify-hpkp');

const app = fastify();
app.register(fastifyHpkp, {
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  sha256s: ['AbCdEf123=', 'ZyXwVu456='],
  // e.t.c
});

app.listen(3000, err => {
  if (err) throw err;
});
```

## Options

This plugin has the same options as the middleware in helmet. To learn more, you may check out [the spec](https://tools.ietf.org/html/rfc7469) or [MDN doc](https://developer.mozilla.org/en-US/docs/Web/HTTP/Public_Key_Pinning).

### maxAge {number}

__This option is required.__

Set `max-age` in header.

### sha256s {array}

__This option is required.__

Should be a array with at least 2 SHA-256 string(one actually used and another kept as a backup).

### includeSubDomains {boolean}

Set `includeSubDomains` value in header. Default is `false`.

### reportUri {string}

Set `reportUri` value in header. Default is empty.

### reportOnly {boolean}

Set this option to `true` will change the header from `Public-Key-Pins` to `Public-Key-Pins-Report-Only`.

### setIf {function}

This plugin will always set the header. But if you wish to set it conditionally, you could use this.

```js
app.register(fastifyHsts, {
  setIf: (request, reply) => {
    // request is the fastify request instance
    // reply is the fastify reply instance
    // should return a truly value for setting header
  }
});
```

## Changelog


- 0.2.0
  - Add test case
  - Add code coverage
  - Add benchmarks
- 0.1.0:
  - Init version

[ci-img]: https://img.shields.io/travis/poppinlp/fastify-hpkp.svg?style=flat-square
[ci-url]: https://travis-ci.org/poppinlp/fastify-hpkp
[cov-img]: https://img.shields.io/coveralls/poppinlp/fastify-hpkp.svg?style=flat-square
[cov-url]: https://coveralls.io/github/poppinlp/fastify-hpkp?branch=master
[lint-img]: https://img.shields.io/badge/code%20style-handsome-brightgreen.svg?style=flat-square
[lint-url]: https://github.com/poppinlp/eslint-config-handsome
[dep-img]: https://img.shields.io/david/poppinlp/fastify-hpkp.svg?style=flat-square
[dep-url]: https://david-dm.org/poppinlp/fastify-hpkp
[dev-dep-img]: https://img.shields.io/david/dev/poppinlp/fastify-hpkp.svg?style=flat-square
[dev-dep-url]: https://david-dm.org/poppinlp/fastify-hpkp#info=devDependencies
[npm-ver-img]: https://img.shields.io/npm/v/fastify-hpkp.svg?style=flat-square
[npm-dl-img]: https://img.shields.io/npm/dm/fastify-hpkp.svg?style=flat-square
[npm-lc-img]: https://img.shields.io/npm/l/fastify-hpkp.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/fastify-hpkp
