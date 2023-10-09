# aggregate-error-ponyfill

[![Build Status][ci-img]][ci]
[![BrowserStack Status][browserstack-img]][browserstack]

[`AggregateError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)
[ponyfill](https://ponyfill.com).

> The `AggregateError` object represents an error when several errors need to be
> wrapped in a single error. It is thrown when multiple errors need to be
> reported by an operation, for example by `Promise.any()`, when all promises
> passed to it reject.

## Install

```sh
npm install aggregate-error-ponyfill --save
```

## Usage

```js
import AggregateError from 'aggregate-error-ponyfill';

(async () => {
	try {
		await Promise.any([Promise.reject(new Error('some error'))]);
	} catch (e) {
		console.log(e instanceof AggregateError); // true
		console.log(e.message); // "All Promises rejected"
		console.log(e.name); // "AggregateError"
		console.log(e.errors); // [ Error: "some error" ]
	}
})();

try {
	throw new AggregateError([new Error('some error')], 'Hello');
} catch (e) {
	console.log(e instanceof AggregateError); // true
	console.log(e.message); // "Hello"
	console.log(e.name); // "AggregateError"
	console.log(e.errors); // [ Error: "some error" ]
}
```

You can **use named export `preferNative` if you wish to use native
implementation if it’s available**. In all other cases, ponyfill will be used.
Beware of
[caveats](https://github.com/sindresorhus/ponyfill#user-content-ponyfill:~:text=Ponyfills%20should%20never%20use%20the%20native,between%20environments%2C%20which%20can%20cause%20bugs.)!

## API

### AggregateError(errors[, message])

Returns: `AggregateError`

Method description.

#### errors

Type: `Iterable`

An iterable of errors, may not actually be `Error` instances.

#### message

Type: `string`

An optional human-readable description of the aggregate error.

## Browser support

Tested in IE11+ and all modern browsers.

It works in older IE versions such as IE9, but you can’t test for
`instanceof AggregateError` due to
[proper subclassing of native classes](https://babeljs.io/docs/en/caveats/#classes).

## Test

Test suite is taken and modified from
[`es-shims/AggregateError`](https://github.com/es-shims/AggregateError/blob/main/test/tests.js)
polyfill.

For automated tests, run `npm run test:automated` (append `:watch` for watcher
support).

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)

<!-- prettier-ignore-start -->

[ci]: https://travis-ci.com/niksy/aggregate-error-ponyfill
[ci-img]: https://travis-ci.com/niksy/aggregate-error-ponyfill.svg?branch=master
[browserstack]: https://www.browserstack.com/
[browserstack-img]: https://www.browserstack.com/automate/badge.svg?badge_key=MnlLM05YZTZTOWlVcHNiUjh0WCtnN1RraklaQ3ZkN0VsVStOSisza3ZwYz0tLXFyT0RBTklSaklVZlI3WHJNc3VWQlE9PQ==--f14238d77ebc29dc4dea435f3e3ab0ce47bb40c2

<!-- prettier-ignore-end -->
