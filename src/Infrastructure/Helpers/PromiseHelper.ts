/**
 * Resolves promises sequentially. Also adds the option to execute a function after the promise is resolved.
 *
 * @param {Array<() => Promise<T>>} factories       An array of functions that return a promise.
 * @param {(item?: T, index?: number) => Promise<void>} resolve         An extra (async) function to be resolved after every use.
 * @returns {T[]}       Returns a typed array of promise results.
 */
export function seqPromiseResolver<T>(
    factories: Array<(() => Promise<T>)>, // Safe factory typing: Must be an array of promise factories.
    resolve?: (item?: T, index?: number) => Promise<void>) // Optional extra function on resolve
    : Promise<T[]> {
    const arr: T[] = [];
    if (!resolve) {
        resolve = () => Promise.resolve();
    }
    // We loop over the array, starting a new promise after the other one resolves.
    const last = factories.reduce((prom, factory, index) => {
        return prom
            .then((x: T) => {
            arr.push(x);
            return resolve(x, index).then(() =>  factory());
            })
            // Should there be an error, we continue with the next promise.
            .catch(() => factory());
    }, new Promise((res) => res()));

    // We still need to resolve the last function. This also indicates the end of the chain.
    return last.then((x: T) => {
        arr.push(x);
        // We filter out the extra undefined in the array, introduced by the extra promise introduced by reduce.
        return resolve(x, factories.length - 1).then(() => arr.slice(1));
    });
}