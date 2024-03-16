import {catchError, filter, map, Observable, of, pipe, UnaryFunction} from 'rxjs';

/**
 * A wrapper object that indicates that the contained value
 * stems from a successfully executed operation.
 */
export interface SuccessWrapper<T> {
    type: "SuccessWrapper";
    value: T;
}

/**
 * A wrapper object that indicates that the contained value
 * stems from a failed operation.
 */
export interface ErrorWrapper {
    type: "ErrorWrapper";
    error: unknown;
}

export type ResultWrapper<T> = SuccessWrapper<T> | ErrorWrapper;

function wrapSuccess<T>(value: T): SuccessWrapper<T> {
    return {
        type: "SuccessWrapper",
        value
    };
}

function wrapError(error: unknown): ErrorWrapper {
    return {
        type: "ErrorWrapper",
        error
    };
}

/**
 * Maps the result of an Observable which can error to either
 * a success wrapper object, which will contain the value, or to an
 * error wrapper object, which will contain the error, if it occurs.
 *
 * Both wrapper objects will be passed on as values, elimininating the error
 * event from the stream.
 *
 * Later on, success values and errors can be unwrapped using `unwrapSuccess`
 * and `unwrapError`. `unwrapSuccess` will filter the stream for success values,
 * and map to the contained value. `unwrapError` will filter the stream for
 * error values, and unpack the contained error.
 *
 * This allows for simple error handling by splitting the stream into an
 * error stream and a success stream, with minimal boilerplate.
 *
 * @returns an RxJS operator that wraps values and errors
 */
export function handleError<T>(): UnaryFunction<Observable<T>, Observable<ResultWrapper<T>>> {
    return pipe(
        map((value: T) => wrapSuccess(value)),
        catchError((error: unknown) => of(wrapError(error)))
    );
}

/**
 * Unpacks success (`next`) values that have previously been wrapped by the `handleError` operator.
 *
 * This filters out success values from the stream to define the "happy path" for
 * successfully executed operations.
 *
 * @returns an RxJS operator that unpacks success (`next`) values
 */
export function unwrapSuccess<T>() {
    return pipe(
        filter((wrapper: SuccessWrapper<T> | ErrorWrapper): wrapper is SuccessWrapper<T> =>
            wrapper.type === "SuccessWrapper"
        ),
        map(wrapper => wrapper.value)
    );
}

/**
 * Unpacks `error` values that have previously been wrapped by the `handleError` operator.
 *
 * This filters out error values from the stream to define the "error path" for
 * failed operations.
 *
 * @returns an RxJS operator that unpacks `error` values
 */
export function unwrapError<T>() {
    return pipe(
        filter((wrapper: SuccessWrapper<T> | ErrorWrapper): wrapper is ErrorWrapper =>
            wrapper.type === "ErrorWrapper"
        ),
        map(wrapper => wrapper.error)
    );
}
