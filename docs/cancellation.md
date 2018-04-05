<!--
Copyright (c) Microsoft Corporation.  
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
-->

# Cancellation
[Back to Index](index.md)

### Table of Contents
* [Class: CancellationTokenSource](#class-cancellationtokensource)
  * [new CancellationTokenSource(linkedTokens?)](#new-cancellationtokensourcelinkedtokens)
  * [source.token](#sourcetoken)
  * [source.cancel()](#sourcecancel)
  * [source.close()](#sourceclose)
* [Class: CancellationToken](#class-cancellationtoken)
  * [new CancellationToken(canceled?)](#new-cancellationtokencanceled)
  * [CancellationToken.none](#cancellationtokennone)
  * [CancellationToken.canceled](#cancellationtokencanceled)
  * [CancellationToken.from(token)](#cancellationtokenfromtoken)
  * [CancellationToken.race(tokens)](#cancellationtokenracetokens)
  * [CancellationToken.all(tokens)](#cancellationtokenalltokens)
  * [token.cancellationRequested](#tokencancellationrequested)
  * [token.canBeCanceled](#tokencanbecanceled)
  * [token.throwIfCancellationRequested()](#tokenthrowifcancellationrequested)
  * [token.register(callback)](#tokenregistercallback)
* [Class: CancelError](#class-cancelerror)
  * [new CancelError(message?)](#new-cancelerrormessage)
* [Interface: CancellationTokenRegistration](#interface-cancellationtokenregistration)
  * [registration.unregister()](#registrationunregister)
* [Class: CancellationTokenCountdown](#class-cancellationtokencountdown)
  * [new CancellationTokenCountdown(iterable?)](#new-cancellationtokencountdowniterable)
  * [countdown.addedCount](#countdownaddedcount)
  * [countdown.remainingCount](#countdownremainingcount)
  * [countdown.token](#countdowntoken)
  * [countdown.add(token)](#countdownaddtoken)
* [Interface: VSCodeCancellationTokenLike](#interface-vscodecancellationtokenlike)
* [Interface: AbortSignalLike](#interface-abortsignallike)

# Class: CancellationTokenSource
Signals a [CancellationToken](#class-cancellationtoken) that it should be canceled.

### Syntax
```ts
export declare class CancellationTokenSource {
    constructor(linkedTokens?: Iterable<CancellationToken>);
    readonly token: CancellationToken;
    cancel(): Promise<void>;
    close(): void;
}
```

## new CancellationTokenSource(linkedTokens?)
Initializes a new instance of a CancellationTokenSource.
* `linkedTokens` [&lt;Iterable&gt;][Iterable] An optional iterable of tokens to which to link this source.

By supplying a set of linked tokens, you can model a complex cancellation graph that allows you to signal 
cancellation to various subsets of a more complex asynchronous operation. For example, you can create a 
cancellation hierarchy where a root `CancellationTokenSource` can be used to signal cancellation for all
asynchronous operations (such as when signing out of an application), with linked `CancellationTokenSource` 
children used to signal cancellation for subsets such as fetching pages of asynchronous data or stopping
long-running background operations in a Web Worker. You can also create a `CancellationTokenSource` that
is attached to multiple existing tokens, allowing you to aggregate multiple cancellation signals into
a single token.

## source.token
Gets a CancellationToken linked to this source.
* Returns: [&lt;CancellationToken&gt;](#class-cancellationtoken)

## source.cancel()
Cancels the source, returning a Promise that is settled when cancellation has completed.
Any registered callbacks are executed in a later turn. If any callback raises an exception,
the first such exception can be observed by awaiting the return value of this method.
* Returns: [&lt;Promise&gt;](http://ecma-international.org/ecma-262/6.0/index.html#sec-promise-constructor)
  A promise that resolves after all registered callbacks have been executed.
  If any callback raised an exception, the promise will be rejected with the first exception thrown.

## source.close()
Closes the source, preventing the possibility of future cancellation.

# Class: CancellationToken
Propagates notifications that operations should be canceled.

### Syntax
```ts
export declare class CancellationToken {
    constructor(canceled?: boolean);
    static readonly none: CancellationToken;
    static readonly canceled: CancellationToken;
    static from(token: CancellationToken | VSCodeCancellationTokenLike | AbortSignalLike): CancellationToken;
    static race(tokens: Iterable<CancellationToken>): CancellationToken;
    static all(tokens: Iterable<CancellationToken>): CancellationToken;
    readonly cancellationRequested: boolean;
    readonly canBeCanceled: boolean;
    throwIfCancellationRequested(): void;
    register(callback: () => void): CancellationTokenRegistration;
}
```

## new CancellationToken(canceled?)
Initializes a new instance of a CancellationToken.
* `canceled` [&lt;Boolean&gt;][Boolean] An optional value indicating whether the token is canceled.

## CancellationToken.none
Gets a token which will never be canceled.
* Returns: [&lt;CancellationToken&gt;](#class-cancellationtoken)

## CancellationToken.canceled
Gets a token that is already canceled.
* Returns: [&lt;CancellationToken&gt;](#class-cancellationtoken)

## CancellationToken.from(token)
Adapts a CancellationToken-like primitive from a different library.
* `token` &lt;`any`&gt; A foreign token to adapt.
* Returns: [&lt;CancellationToken&gt;](#class-cancellationtoken)

## CancellationToken.race(tokens)
Returns a CancellationToken that becomes canceled when **any** of the provided tokens are canceled.
* `tokens` [&lt;Iterable&gt;][Iterable] An iterable of tokens.
* Returns: [&lt;CancellationToken&gt;](#class-cancellationtoken)

## CancellationToken.all(tokens)
Returns a CancellationToken that becomes canceled when **all** of the provided tokens are canceled.
* `tokens` [&lt;Iterable&gt;][Iterable] An iterable of tokens.
* Returns: [&lt;CancellationToken&gt;](#class-cancellationtoken)

## token.cancellationRequested
Gets a value indicating whether cancellation has been requested.
* Returns: [&lt;Boolean&gt;][Boolean]

## token.canBeCanceled
Gets a value indicating whether the underlying source can be canceled.
* Returns: [&lt;Boolean&gt;][Boolean]

## token.throwIfCancellationRequested()
Throws a [CancelError](#class-cancelerror) if cancellation has been requested.

## token.register(callback)
Registers a callback to execute when cancellation is requested.
* `callback` [&lt;Function&gt;][Boolean] The callback to register.
* Returns: [&lt;CancellationTokenRegistration&gt;](#class-cancellationtokenregistration)

# Class: CancelError
An error thrown when an operation is canceled.

### Inheritance hierarchy
* [Error][Error]
  * CancelError

### Syntax
```ts
export declare class CancelError Extends Error {
    constructor(message?: string);
}
```

## new CancelError(message?)
Initializes a new instance of the CancelError class.
* `message` [&lt;String&gt;][String] An optional message for the error.

# Interface: CancellationTokenRegistration
An object used to unregister a callback registered to a CancellationToken.

### Syntax
```ts
export interface CancellationTokenRegistration {
    unregister(): void;
}
```

## registration.unregister()
Unregisters the callback.

# Class: CancellationTokenCountdown
An object that provides a CancellationToken that becomes cancelled when **all** of its
containing tokens are canceled. This is similar to `CancellationToken.all`, except that you are
able to add additional tokens.

### Syntax
```ts
export declare class CancellationTokenCountdown {
    constructor(iterable?: Iterable<CancellationToken>);
    readonly addedCount: number;
    readonly remainingCount: number;
    readonly token: CancellationToken;
    add(token: CancellationToken): this;
}
```

## new CancellationTokenCountdown(iterable?)
Initializes a new instance of the CancellationTokenCountdown class.
* `iterable` [&lt;Iterable&gt;][Iterable] An optional iterable of tokens to add to the countdown.

## countdown.addedCount
Gets the number of tokens added to the countdown.
* Returns: [&lt;Number&gt;][Number]

## countdown.remainingCount
Gets the number of tokens that have not yet been canceled.
* Returns: [&lt;Number&gt;][Number]

## countdown.token
Gets the CancellationToken for the countdown.
* Returns: [&lt;CancellationToken&gt;](#class-cancellationtoken)

## countdown.add(token)
Adds a CancellationToken to the countdown.
* Returns: [&lt;CancellationTokenCountdown&gt;](#class-cancellationtokencountdown)

# Interface: VSCodeCancellationTokenLike
Describes a foreign cancellation primitive similar to the one provided by `vscode` for extensions.

### Syntax
```ts
export interface VSCodeCancellationTokenLike {
    readonly isCancellationRequested: boolean;
    onCancellationRequested(listener: () => any): { dispose(): any; };
}
```

# Interface: AbortSignalLike
Describes a foreign cancellation primitive similar to the one used by the DOM.

### Syntax
```ts
export interface AbortSignalLike {
    readonly aborted: boolean;
    addEventListener(type: "abort", callback: () => any): any;
}
```

[String]: http://ecma-international.org/ecma-262/6.0/index.html#sec-string-constructor
[Boolean]: http://ecma-international.org/ecma-262/6.0/index.html#sec-boolean-constructor
[Number]: http://ecma-international.org/ecma-262/6.0/index.html#sec-number-constructor
[Function]: http://ecma-international.org/ecma-262/6.0/index.html#sec-function-constructor
[Error]: http://ecma-international.org/ecma-262/6.0/index.html#sec-error-constructor
[Promise]: http://ecma-international.org/ecma-262/6.0/index.html#sec-promise-constructor
[Iterable]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.iterator
