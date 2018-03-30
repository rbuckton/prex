<!--
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
-->

# Scheduling
[Back to Index](index.md)

### Table of Contents
* [Class: AsyncQueue](#class-asyncqueue)
  * [new AsyncQueue(iterable?)](#new-asyncqueueiterable)
  * [queue.size](#queuesize)
  * [queue.put(value)](#queueputvalue)
  * [queue.get()](#queueget)
* [Class: AsyncBoundedQueue](#class-asyncboundedqueue)
  * [new AsyncBoundedQueue(iterable?)](#new-asyncboundedqueueiterable)
  * [queue.size](#queuesize)
  * [queue.put(value)](#queueputvalue)
  * [queue.end()](#queueend)
  * [queue.get()](#queueget)
  * [queue.drain()](#queuedrain)
* [Class: AsyncStack](#class-asyncstack)
  * [new AsyncStack(iterable?)](#new-asyncstackiterable)
  * [stack.size](#stacksize)
  * [stack.push(value)](#stackpushvalue)
  * [stack.pop()](#stackpop)
* [Function: delay(msec, value?)](#function-delaymsec-value)
* [Function: delay(token, msec, value?)](#function-delaytoken-msec-value)

# Class: AsyncQueue
An asynchronous queue.

### Syntax
```ts
export declare class AsyncQueue<T> {
    constructor(iterable?: Iterable<T | PromiseLike<T>>);
    put(value: T | PromiseLike<T>): void;
    get(): Promise<T>;
}
```

## new AsyncQueue(iterable?)
Initializes a new instance of the AsyncQueue class.
* `iterable` [&lt;Iterable&gt;][Iterable] An optional iterable of values or promises.

## queue.size
Gets the number of entries in the queue.
When positive, indicates the number of entries available to get.
When negative, indicates the number of requests waiting to be fulfilled.

## queue.put(value)
Adds a value to the end of the queue. If the queue is empty but has a pending
dequeue request, the value will be dequeued and the request fulfilled.
* `value` &lt;`any`&gt; A value or promise to add to the queue.

## queue.get()
Removes and returns a Promise for the first value in the queue. If the queue is empty,
returns a Promise for the next value to be added to the queue.
* Returns: [&lt;Promise&gt;][Promise]

# Class: AsyncBoundedQueue
An asynchronous queue with a bounded endpoint.

### Syntax
```ts
export declare class AsyncBoundedQueue<T> {
    constructor(iterable?: Iterable<T | PromiseLike<T>>);
    put(value: T | PromiseLike<T>): void;
    end(): void;
    get(): Promise<T | undefined>;
    drain(): AsyncIterableIterator<T>;
}
```

## new AsyncBoundedQueue(iterable?)
Initializes a new instance of the AsyncBoundedQueue class.
* `iterable` [&lt;Iterable&gt;][Iterable] An optional iterable of values or promises.

## queue.size
Gets the number of entries in the queue.
When positive, indicates the number of entries available to get.
When negative, indicates the number of requests waiting to be fulfilled.

## queue.put(value)
Adds a value to the end of the queue. If the queue is empty but has a pending
dequeue request, the value will be dequeued and the request fulfilled.
* `value` &lt;`any`&gt; A value or promise to add to the queue.

## queue.end()
Indicates the queue is done adding and that no more items will be added to the queue.

## queue.get()
Removes and returns a Promise for the first value in the queue. If the queue has
ended, returns a Promise for `undefined`. If the queue is empty, returns a Promise 
for the next value to be added to the queue.
* Returns: [&lt;Promise&gt;][Promise]

## queue.drain()
Consumes all items in the queue until the queue ends.

# Class: AsyncStack
An asynchronous stack.

### Syntax
```ts
export declare class AsyncStack<T> {
    constructor(iterable?: Iterable<T | PromiseLike<T>>);
    push(value: T | PromiseLike<T>): void;
    pop(): Promise<T>;
}
```

## new AsyncStack(iterable?)
Initializes a new instance of the AsyncStack class.
* `iterable` [&lt;Iterable&gt;][Iterable] An optional iterable of values or promises.

## stack.size
Gets the number of entries in the stack.
When positive, indicates the number of entries available to get.
When negative, indicates the number of requests waiting to be fulfilled.

## stack.push(value)
Adds a value to the top of the stack. If the stack is empty but has a pending
pop request, the value will be popped and the request fulfilled.
* `value` &lt;`any`&gt; A value or promise to add to the stack.

## stack.pop()
Removes and returns a Promise for the top value of the stack. If the stack is empty,
returns a Promise for the next value to be pushed on to the stack.
* Returns: [&lt;Promise&gt;][Promise]

# Function: delay(msec, value?)
Waits the specified number of milliseconds before resolving with the provided value.
* `msec` [&lt;Number&gt;][Number] The number of milliseconds to delay.
* `value` &lt;`any`&gt; The resolution value for the promise.
* Returns: [&lt;Promise&gt;][Promise]

### Syntax
```ts
export declare function delay(msec: number): Promise<void>;
export declare function delay<T>(msec: number, value?: T | PromiseLike<T>): Promise<T>;
```

# Function: delay(token, msec, value?)
Waits the specified number of milliseconds before resolving with the provided value.
* `token` [&lt;CancellationToken&gt;][CancellationToken] A CancellationToken.
* `msec` [&lt;Number&gt;][Number] The number of milliseconds to delay.
* `value` &lt;`any`&gt; The resolution value for the promise.
* Returns: [&lt;Promise&gt;][Promise]

### Syntax
```ts
export declare function delay(token: CancellationToken, msec: number): Promise<void>;
export declare function delay<T>(token: CancellationToken, msec: number, value?: T | PromiseLike<T>): Promise<T>;
```

[Number]: http://ecma-international.org/ecma-262/6.0/index.html#sec-number-constructor
[Promise]: http://ecma-international.org/ecma-262/6.0/index.html#sec-promise-constructor
[Iterable]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.iterator
[CancellationToken]: ./cancellation.md#class-cancellationtoken
