# fastify-hpkp

[![Code style][lint-img]][lint-url]
[![Dependency Status][dep-img]][dep-url]
[![Dev Dependency Status][dev-dep-img]][dev-dep-url]
[![NPM version][npm-ver-img]][npm-url]
[![NPM downloads][npm-dl-img]][npm-url]
[![NPM license][npm-lc-img]][npm-url]

Fastify plugin to set the Public-Key-Pins header

## Why?

You may know [hpkp](https://github.com/helmetjs/hpkp) as a [hpkp middleware](https://helmetjs.github.io/docs/hpkp/) used in [helmet](https://github.com/helmetjs/helmet). And you could use it as a middleware in fastify also. So why i made this plugin?

Benchmark with no plugin:

```txt
Running 20s test @ http://127.0.0.1:10290/pudge/rest/v0/benchmark
1000 connections

Stat         Avg     Stdev   Max
Latency (ms) 32.37   8.9     1139.09
Req/Sec      30444   1051.31 31048
Bytes/Sec    4.53 MB 170 kB  4.63 MB

609k requests in 20s, 90.7 MB read
```

Benchmark with hpkp as middleware:

```txt
Running 20s test @ http://127.0.0.1:10290/pudge/rest/v0/benchmark
1000 connections

Stat         Avg     Stdev   Max
Latency (ms) 30.71   200.77  9990.66
Req/Sec      25974.4 1729.07 26793
Bytes/Sec    6.03 MB 402 kB  6.16 MB

519k requests in 20s, 119 MB read
```

Benchmark with this plugin:

```txt
Running 20s test @ http://127.0.0.1:10290/pudge/rest/v0/benchmark
1000 connections

Stat         Avg     Stdev  Max
Latency (ms) 33.8    8.71   951.46
Req/Sec      29179.2 974.7  29697
Bytes/Sec    6.65 MB 238 kB 6.83 MB

584k requests in 20s, 134 MB read
```

So that's the reason and wish you like it. :)

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

- 0.1.0: Init version

## Todo

- Add test case
- Add ci
- Add benchmark scripts

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
