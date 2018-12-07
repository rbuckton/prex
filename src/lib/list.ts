/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { isMissing, isIterable, isInstance, isFunction } from "./utils";

export class LinkedListNode<T> {
    /*@internal*/ _list: LinkedList<T> | undefined = undefined;
    /*@internal*/ _previous: LinkedListNode<T> | undefined = undefined;
    /*@internal*/ _next: LinkedListNode<T> | undefined = undefined;

    public value: T | undefined;

    constructor(value?: T) {
        this.value = value;
    }

    public get list(): LinkedList<T> | undefined {
        return this._list;
    }

    public get previous(): LinkedListNode<T> | undefined {
        if (this._previous && this._list && this !== this._list.first) {
            return this._previous;
        }

        return undefined;
    }

    public get next(): LinkedListNode<T> | undefined {
        if (this._next && this._list && this._next !== this._list.first) {
            return this._next;
        }

        return undefined;
    }
}

const enum Position {
    before,
    after
}

export class LinkedList<T> {
    private _head: LinkedListNode<T> | undefined = undefined;
    private _size: number = 0;

    public constructor(iterable?: Iterable<T>) {
        if (!isIterable(iterable, /*optional*/ true)) throw new TypeError("Object not iterable: iterable.");
        if (!isMissing(iterable)) {
            for (const value of iterable) {
                this.push(value);
            }
        }
    }

    public get first(): LinkedListNode<T> | undefined {
        return this._head;
    }

    public get last(): LinkedListNode<T> | undefined {
        if (this._head) {
            return this._head._previous;
        }

        return undefined;
    }

    public get size(): number {
        return this._size;
    }

    public * values() {
        for (const node of this.nodes()) {
            yield node.value;
        }
    }

    public * nodes() {
        let node: LinkedListNode<T>;
        let next = this.first;
        while (next !== undefined) {
            node = next;
            next = node.next;
            yield node;
        }
    }

    public * drain() {
        for (const node of this.nodes()) {
            this.deleteNode(node);
            yield node.value;
        }
    }

    public find(value: T): LinkedListNode<T> | undefined {
        for (let node = this.first; node; node = node.next) {
            if (sameValue(node.value, value)) {
                return node;
            }
        }

        return undefined;
    }

    public findLast(value: T): LinkedListNode<T> | undefined {
        for (let node = this.last; node; node = node.previous) {
            if (sameValue(node.value, value)) {
                return node;
            }
        }

        return undefined;
    }

    public has(value: T): boolean {
        return this.find(value) !== undefined;
    }

    public insertBefore(node: LinkedListNode<T>, value: T): LinkedListNode<T> {
        if (!isInstance(node, LinkedListNode, /*optional*/ true)) throw new TypeError("LinkedListNode expected: node");
        if (!isMissing(node) && node.list !== this) throw new Error("Wrong list.");
        return this._insertNode(node, new LinkedListNode(value), Position.before);
    }

    public insertNodeBefore(node: LinkedListNode<T>, newNode: LinkedListNode<T>): void {
        if (!isInstance(node, LinkedListNode, /*optional*/ true)) throw new TypeError("LinkedListNode expected: node");
        if (!isInstance(newNode, LinkedListNode)) throw new TypeError("LinkedListNode expected: newNode");
        if (!isMissing(node) && node.list !== this) throw new Error("Wrong list.");
        if (!isMissing(newNode.list)) throw new Error("Node is already attached to a list.");
        this._insertNode(node, newNode, Position.before);
    }

    public insertAfter(node: LinkedListNode<T>, value: T): LinkedListNode<T> {
        if (!isInstance(node, LinkedListNode, /*optional*/ true)) throw new TypeError("LinkedListNode expected: node");
        if (!isMissing(node) && node.list !== this) throw new Error("Wrong list.");
        return this._insertNode(node, new LinkedListNode(value), Position.after);
    }

    public insertNodeAfter(node: LinkedListNode<T>, newNode: LinkedListNode<T>): void {
        if (!isInstance(node, LinkedListNode, /*optional*/ true)) throw new TypeError("LinkedListNode expected: node");
        if (!isInstance(newNode, LinkedListNode)) throw new TypeError("LinkedListNode expected: newNode");
        if (!isMissing(node) && node.list !== this) throw new Error("Wrong list.");
        if (!isMissing(newNode.list)) throw new Error("Node is already attached to a list.");
        this._insertNode(node, newNode, Position.after);
    }

    public push(value?: T): LinkedListNode<T> {
        return this._insertNode(undefined, new LinkedListNode(value), Position.after);
    }

    public pushNode(newNode: LinkedListNode<T>): void {
        if (!isInstance(newNode, LinkedListNode)) throw new TypeError("LinkedListNode expected: newNode");
        if (!isMissing(newNode.list)) throw new Error("Node is already attached to a list.");
        this._insertNode(undefined, newNode, Position.after);
    }

    public pop(): T | undefined {
        let node = this.popNode();
        return node ? node.value : undefined;
    }

    public popNode(): LinkedListNode<T> | undefined {
        let node = this.last;
        if (this.deleteNode(node)) {
            return node;
        }
    }

    public shift(): T | undefined {
        let node = this.shiftNode();
        return node ? node.value : undefined;
    }

    public shiftNode(): LinkedListNode<T> | undefined {
        let node = this.first;
        if (this.deleteNode(node)) {
            return node;
        }
    }

    public unshift(value?: T): LinkedListNode<T> {
        return this._insertNode(undefined, new LinkedListNode(value), Position.before);
    }

    public unshiftNode(newNode: LinkedListNode<T>): void {
        if (!isInstance(newNode, LinkedListNode)) throw new TypeError("LinkedListNode expected: newNode");
        if (!isMissing(newNode.list)) throw new Error("Node is already attached to a list.");
        this._insertNode(undefined, newNode, Position.before);
    }

    public delete(value: T): boolean {
        return this.deleteNode(this.find(value));
    }

    public deleteNode(node: LinkedListNode<T> | undefined): boolean {
        if (isMissing(node) || node.list !== this) {
            return false;
        }

        return this._deleteNode(node);
    }

    public deleteAll(predicate: (value: T, node: LinkedListNode<T>, list: LinkedList<T>) => boolean, thisArg?: any) {
        if (!isFunction(predicate)) throw new TypeError("Function expected: predicate");
        let count = 0;
        let node = this.first;
        while (node) {
            let next = node.next;
            if (predicate.call(thisArg, node.value!, node, this) && node.list === this) {
                this._deleteNode(node);
                ++count;
            }

            node = next;
        }

        return count;
    }

    public clear(): void {
        while (this.size > 0) {
            this.deleteNode(this.last);
        }
    }

    public forEach(callback: (value: T, node: LinkedListNode<T>, list: LinkedList<T>) => void, thisArg?: any) {
        if (!isFunction(callback)) throw new TypeError("Function expected: predicate");
        for (const node of this.nodes()) {
            callback.call(thisArg, node.value!, node, this);
        }
    }

    private _deleteNode(node: LinkedListNode<T>): boolean {
        if (node._next === node) {
            this._head = undefined;
        }
        else {
            node._next!._previous = node._previous;
            node._previous!._next = node._next;
            if (this._head === node) {
                this._head = node._next;
            }
        }

        node._list = undefined;
        node._next = undefined;
        node._previous = undefined;
        this._size--;
        return true;
    }

    private _insertNode(adjacentNode: LinkedListNode<T> | undefined, newNode: LinkedListNode<T>, position: Position) {
        newNode._list = this;
        if (this._head === undefined) {
            newNode._next = newNode;
            newNode._previous = newNode;
            this._head = newNode;
        }
        else {
            switch (position) {
                case Position.before:
                    if (adjacentNode === undefined) {
                        adjacentNode = this._head;
                        this._head = newNode;
                    }
                    else if (adjacentNode === this._head) {
                        this._head = newNode;
                    }

                    newNode._next = adjacentNode;
                    newNode._previous = adjacentNode._previous;
                    adjacentNode._previous!._next = newNode;
                    adjacentNode._previous = newNode;
                    break;

                case Position.after:
                    if (adjacentNode === undefined) {
                        adjacentNode = this._head._previous!;
                    }

                    newNode._previous = adjacentNode;
                    newNode._next = adjacentNode._next;
                    adjacentNode._next!._previous = newNode;
                    adjacentNode._next = newNode;
                    break;
            }
        }

        this._size++;
        return newNode;
    }
}

export interface LinkedList<T> {
    [Symbol.iterator](): Iterator<T>;
}

LinkedList.prototype[Symbol.iterator] = LinkedList.prototype.values;

function sameValue(x: any, y: any) {
    return (x === y) ? (x !== 0 || 1 / x === 1 / y) : (x !== x && y !== y);
}