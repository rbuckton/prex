import "./asyncIterable";
import { AsyncQueue } from "./queue";
import { isPromiseLike, isAsyncIterable, isIterable, isMissing } from "./utils";

const BOUNDARY = Symbol();

/**
 * An asynchronous queue with a bounded endpoint.
 */
export class AsyncBoundedQueue<T> {
    private _queue = new AsyncQueue<T | typeof BOUNDARY>();
    private _state: "open" | "closing" | "closed" = "open";

    /**
     * Initializes a new instance of the AsyncProducerConsumerQueue class.
     *
     * @param iterable An optional iterable of values or promises.
     */
    constructor(iterable?: Iterable<T | PromiseLike<T>>) {
        if (!isMissing(iterable) && !isIterable(iterable)) throw new TypeError("Object not iterable: iterable.");
        if (isIterable(iterable)) {
            for (const value of iterable) {
                this.put(value);
            }
        }
    }

    /**
     * Gets the number of entries in the queue.
     * When positive, indicates the number of entries available to get.
     * When negative, indicates the number of requests waiting to be fulfilled.
     */
    public get size() {
        return this._state === "closing" ? this._queue.size - 1 : this._queue.size;
    }

    /**
     * Adds a value to the end of the queue. If the queue is empty but has a pending
     * dequeue request, the value will be dequeued and the request fulfilled.
     *
     * @param value A value or promise to add to the queue.
     */
    public put(value: T | PromiseLike<T>) {
        if (this._state !== "open") throw new Error("AsyncProducer is done producing values.");
        this._queue.put(value);
    }

    /**
     * Indicates the queue is done adding and that no more items will be added to the queue.
     */
    public end() {
        if (this._state !== "open") return;
        this._state = "closing";
        this._queue.put(BOUNDARY);
    }

    /**
     * Removes and returns a Promise for the first value in the queue. If the queue has
     * ended, returns a Promise for `undefined`. If the queue is empty, returns a Promise
     * for the next value to be added to the queue.
     */
    public async get(): Promise<T | undefined> {
        const result = await this._dequeue();
        return result === BOUNDARY ? undefined : result;
    }

    /**
     * Consumes all items in the queue until the queue ends.
     */
    async * drain(): AsyncIterableIterator<T> {
        let value = await this._dequeue();
        while (value !== BOUNDARY) {
            yield value;
            value = await this._dequeue();
        }
    }

    private async _dequeue() {
        if (this._state === "closed") return BOUNDARY;
        let result: T | typeof BOUNDARY = BOUNDARY;
        try {
            result = await this._queue.get();
        }
        finally {
            if (result === BOUNDARY) {
                this._state = "closed";
            }
        }
        return result;
    }
}