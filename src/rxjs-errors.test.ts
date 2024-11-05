import {map, of, switchMap} from 'rxjs';
import {handleError, unwrapError, unwrapSuccess} from './rxjs-errors.js';
import {TestScheduler} from 'rxjs/internal/testing/TestScheduler';

let testScheduler: TestScheduler;

beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
    });
});
describe("The RxJS error handling API", () => {
    it('should split observable streams into value and error streams', () => {
        testScheduler.run(helpers => {
            const {cold, expectObservable} = helpers;
            const in$ = cold("0123456789|").pipe(
                switchMap(value => of(value).pipe(
                    map(value => {
                        if (+value % 3 === 0) {
                            throw value;
                        }
                        return value;
                    }),
                    handleError()
                ))
            );
            const values$ = in$.pipe(unwrapSuccess());
            const errors$ = in$.pipe(unwrapError());

            expectObservable(values$).toBe("-12-45-78-|");
            expectObservable(errors$).toBe("0--3--6--9|");
        });
    });
});
