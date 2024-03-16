# RxJS Error Handling Library

This library provides RxJS operators that allow you to easily handle errors in your streams.

It is inspired by the [Result](https://doc.rust-lang.org/std/result/) type in Rust, which is a type that can either be a success value or an error value. Further similarity exists with NgRx's Actions, which act as identifiable wrappers for values and can be sent along a single Observable stream.

## Installation

You can install this library using npm:

```shell
npm install rxjs-errors
```

## Usage

Import the necessary functions from the library:

```typescript
import { handleError, unwrapSuccess, unwrapError } from 'rxjs-errors';
```

### `handleError()`

The `handleError()` function is an RxJS operator that maps the result of an Observable which can error to either a `SuccessWrapper` object, which will contain the value, or to an `ErrorWrapper` object, which will contain the error, if it occurs. Both wrapper objects will be passed on as values, eliminating the error event from the stream. This allows for simple error handling by splitting the stream into an error stream and a success stream, with minimal boilerplate.

```typescript
import { throwError, of } from 'rxjs';
import { handleError, unwrapSuccess, unwrapError } from 'rxjs-errors';

const myStream$ = of('some value').pipe(
    handleError(),
);

myStream$.subscribe(
    value => console.log(value), // { type: 'SuccessWrapper', value: 'some value' }
    error => console.log(error), // never called
);

const myErrorStream$ = throwError('an error').pipe(
    handleError(),
);

myErrorStream$.subscribe(
    value => console.log(value), // { type: 'ErrorWrapper', error: 'an error' }
    error => console.log(error), // never called 
);
```

### `unwrapSuccess()`

The `unwrapSuccess()` function is an RxJS operator that unpacks success (`next`) values that have previously been wrapped by the `handleError()` operator. This filters out success values from the stream to define the "happy path" for successfully executed operations.

```typescript
import { of } from 'rxjs';
import { handleError, unwrapSuccess, unwrapError } from 'rxjs-errors';

const myStream$ = of('some value').pipe(
    handleError(),
    unwrapSuccess(),
);

myStream$.subscribe(
    value => console.log(value), // 'some value'
);
```

### `unwrapError()`

The `unwrapError()` function is an RxJS operator that unpacks error values that have previously been wrapped by the `handleError()` operator. This filters out error values from the stream to define the "error path" for failed operations.

```typescript
import { throwError } from 'rxjs';
import { handleError, unwrapSuccess, unwrapError } from 'rxjs-errors';

const myErrorStream$ = throwError('an error').pipe(
    handleError(),
    unwrapError(),
);

myErrorStream$.subscribe(
    errorValue => console.log(errorValue), // 'an error'
);
```

### Example
Bear in mind that Observable streams complete as they error. It is therefore very important to use the `handleError()` operator inside nested pipes when the stream is meant to "survive" errors.

Example using Angular's http client:
```typescript
const makeHttpRequest$$ = new Subject<void>();

// handles error too late, stream completes
const httpResultWrong$ = makeHttpRequest$$.pipe(
    switchMap(() => this.http.get('some url')),
    handleError()
);

// handles error in time, stream does not complete
const httpResultRight$ = makeHttpRequest$$.pipe(
    switchMap(() => this.http.get('some url').pipe(
        handleError(),
    ))
);

const httpSuccess$ = httpResultRight$.pipe(
    unwrapSuccess(),
);

const httpError$ = httpResultRight$.pipe(
    unwrapError(),
);
```

## Types

This library defines the following types:

### `SuccessWrapper<T>`

A wrapper object that indicates that the contained value stems from a successfully executed operation.

```typescript
interface SuccessWrapper<T> {
    type: "SuccessWrapper";
    value: T;
}
```

### `ErrorWrapper`

A wrapper object that indicates that the contained value stems from a failed operation.

```typescript
interface ErrorWrapper {
    type: "ErrorWrapper";
    error: unknown;
}
```

## Contributing

This library is open source, and contributions are welcome. Please create an issue or pull request if you would like to contribute.
