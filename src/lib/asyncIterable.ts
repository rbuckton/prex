export {};

declare global {
    interface AsyncIterable<T> { }
    interface AsyncIterableIterator<T> extends AsyncIterable<T> { }
    interface AsyncIterator<T> { }
}

if (typeof Symbol === "function" && !(<any>Symbol).asyncIterator) {
    (<any>Symbol).asyncIterator = Symbol.for("Symbol.asyncIterator");
}