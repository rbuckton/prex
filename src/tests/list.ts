/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Licensed under the Apache License, Version 2.0.

See LICENSE file in the project root for details.
***************************************************************************** */

import { assert } from "chai";
import { LinkedList, LinkedListNode } from "../lib/list";

describe("linked-list", () => {
    describe("node", () => {
        it("ctor", () => {
            const node = new LinkedListNode(1);
            assert.strictEqual(node.value, 1);
            assert.strictEqual(node.list, undefined);
            assert.strictEqual(node.previous, undefined);
            assert.strictEqual(node.next, undefined);
        });
        describe("in list", () => {
            it("only", () => {
                const node = new LinkedListNode(1);
                const list = new LinkedList();
                list.pushNode(node);
                assert.strictEqual(node.list, list);
                assert.strictEqual(node.previous, undefined);
                assert.strictEqual(node.next, undefined);
            });
            it("two", () => {
                const nodeOne = new LinkedListNode(1);
                const nodeTwo = new LinkedListNode(2);
                const list = new LinkedList();
                list.pushNode(nodeOne);
                list.pushNode(nodeTwo);
                assert.strictEqual(nodeOne.list, list);
                assert.strictEqual(nodeOne.previous, undefined);
                assert.strictEqual(nodeOne.next, nodeTwo);
                assert.strictEqual(nodeTwo.list, list);
                assert.strictEqual(nodeTwo.previous, nodeOne);
                assert.strictEqual(nodeTwo.next, undefined);
            });
        });
    });
    describe("list", () => {
        describe("ctor", () => {
            it("simple", () => {
                const list = new LinkedList();
                assert.strictEqual(list.size, 0);
                assert.strictEqual(list.first, undefined);
                assert.strictEqual(list.last, undefined);
            });
            it("iterable", () => {
                const list = new LinkedList([1]);
                assert.strictEqual(list.size, 1);
                assert.strictEqual(list.first, list.last);
                assert.strictEqual(list.first.value, 1);
            });
            it("throws if iterable not Iterable", () => {
                assert.throws(() => new LinkedList(<any>{}), TypeError);
            });
        });
        describe("insertBefore", () => {
            it("correct", () => {
                const list = new LinkedList([1]);
                const node = list.insertBefore(list.first, 2);
                assert.strictEqual(list.size, 2);
                assert.strictEqual(list.first, node);
                assert.notStrictEqual(list.first, list.last);
                assert.strictEqual(node.value, 2);
            });
            it("throws if node not LinkedListNode", () => {
                const list = new LinkedList();
                assert.throws(() => list.insertBefore(<any>{}, 1));
            });
            it("throws if node from other list", () => {
                const list1 = new LinkedList([1]);
                const list2 = new LinkedList();
                assert.throws(() => list2.insertBefore(list1.first, 1));
            });
        });
        describe("insertNodeBefore", () => {
            it("before undefined when empty", () => {
                const list = new LinkedList();
                const node = new LinkedListNode(1);
                list.insertNodeBefore(undefined, node);
                assert.strictEqual(list.size, 1);
                assert.strictEqual(list.first, node);
                assert.strictEqual(list.last, node);
            });
            it("before undefined when not empty", () => {
                const list = new LinkedList([2]);
                const node = new LinkedListNode(1);
                list.insertNodeBefore(undefined, node);
                assert.strictEqual(list.size, 2);
                assert.strictEqual(list.first, node);
                assert.notStrictEqual(list.last, node);
            });
            it("before first", () => {
                const list = new LinkedList([1, 2]);
                const node = new LinkedListNode(3);
                list.insertNodeBefore(list.first, node);
                assert.strictEqual(list.size, 3);
                assert.strictEqual(list.first, node);
                assert.notStrictEqual(list.last, node);
            });
            it("before last", () => {
                const list = new LinkedList([1, 2]);
                const node = new LinkedListNode(3);
                list.insertNodeBefore(list.last, node);
                assert.strictEqual(list.size, 3);
                assert.notStrictEqual(list.first, node);
                assert.notStrictEqual(list.last, node);
                assert.strictEqual(list.first.next, node);
            });
            it("throws if node not LinkedListNode", () => {
                const list = new LinkedList();
                const newNode = new LinkedListNode(1);
                assert.throws(() => list.insertNodeBefore(<any>{}, newNode));
            });
            it("throws if node from other list", () => {
                const list1 = new LinkedList([1]);
                const list2 = new LinkedList();
                const newNode = new LinkedListNode(1);
                assert.throws(() => list2.insertNodeBefore(list1.first, newNode));
            });
            it("throws if newNode not LinkedListNode", () => {
                const list = new LinkedList();
                assert.throws(() => list.insertNodeBefore(undefined, <any>{}));
            });
            it("throws if newNode from other list", () => {
                const list1 = new LinkedList([1]);
                const list2 = new LinkedList();
                assert.throws(() => list2.insertNodeBefore(undefined, list1.first));
            });
        });
        describe("insertAfter", () => {
            it("correct", () => {
                const list = new LinkedList([1]);
                const node = list.insertAfter(list.first, 2);
                assert.strictEqual(list.size, 2);
                assert.strictEqual(list.last, node);
                assert.notStrictEqual(list.first, list.last);
                assert.strictEqual(node.value, 2);
            });
            it("throws if node not LinkedListNode", () => {
                const list = new LinkedList();
                assert.throws(() => list.insertAfter(<any>{}, 1));
            });
            it("throws if node from other list", () => {
                const list1 = new LinkedList([1]);
                const list2 = new LinkedList();
                assert.throws(() => list2.insertAfter(list1.first, 1));
            });
        });
        describe("insertNodeAfter", () => {
            it("after undefined when empty", () => {
                const list = new LinkedList();
                const node = new LinkedListNode(1);
                list.insertNodeAfter(undefined, node);
                assert.strictEqual(list.size, 1);
                assert.strictEqual(list.first, node);
                assert.strictEqual(list.last, node);
            });
            it("after undefined when not empty", () => {
                const list = new LinkedList([2]);
                const node = new LinkedListNode(1);
                list.insertNodeAfter(undefined, node);
                assert.strictEqual(list.size, 2);
                assert.notStrictEqual(list.first, node);
                assert.strictEqual(list.last, node);
            });
            it("after first", () => {
                const list = new LinkedList([1, 2]);
                const node = new LinkedListNode(3);
                list.insertNodeAfter(list.first, node);
                assert.strictEqual(list.size, 3);
                assert.notStrictEqual(list.first, node);
                assert.notStrictEqual(list.last, node);
                assert.strictEqual(list.first.next, node);
            });
            it("after last", () => {
                const list = new LinkedList([1, 2]);
                const node = new LinkedListNode(3);
                list.insertNodeAfter(list.last, node);
                assert.strictEqual(list.size, 3);
                assert.notStrictEqual(list.first, node);
                assert.strictEqual(list.last, node);
            });
            it("throws if node not LinkedListNode", () => {
                const list = new LinkedList();
                const newNode = new LinkedListNode(1);
                assert.throws(() => list.insertNodeAfter(<any>{}, newNode));
            });
            it("throws if node from other list", () => {
                const list1 = new LinkedList([1]);
                const list2 = new LinkedList();
                const newNode = new LinkedListNode(1);
                assert.throws(() => list2.insertNodeAfter(list1.first, newNode));
            });
            it("throws if newNode not LinkedListNode", () => {
                const list = new LinkedList();
                assert.throws(() => list.insertNodeAfter(undefined, <any>{}));
            });
            it("throws if newNode from other list", () => {
                const list1 = new LinkedList([1]);
                const list2 = new LinkedList();
                assert.throws(() => list2.insertNodeAfter(undefined, list1.first));
            });
        });
        describe("has", () => {
            it("normal value", () => {
                const list = new LinkedList([1, 2, 3]);
                const hasOne = list.has(1);
                const hasFour = list.has(4);
                assert.isTrue(hasOne);
                assert.isFalse(hasFour);
            });
            it("NaN", () => {
                const list = new LinkedList([1, NaN, 3]);
                const hasNaN = list.has(NaN);
                assert.isTrue(hasNaN);
            });
            it("-0", () => {
                const list = new LinkedList([1, (0/-1), 3]);
                const hasMinusZero = list.has((0/-1));
                const hasZero = list.has(0);
                assert.isTrue(hasMinusZero);
                assert.isFalse(hasZero);
            });
        });
        it("find", () => {
            const list = new LinkedList([2, 1, 2, 3]);
            const foundTwo = list.find(2);
            const foundFour = list.find(4);
            assert.isDefined(foundTwo);
            assert.strictEqual(foundTwo.value, 2);
            assert.strictEqual(foundTwo, list.first);
            assert.isUndefined(foundFour);
        });
        it("findLast", () => {
            const list = new LinkedList([3, 1, 2, 3]);
            const foundThree = list.findLast(3);
            const foundFour = list.findLast(4);
            assert.isDefined(foundThree);
            assert.strictEqual(foundThree.value, 3);
            assert.strictEqual(foundThree, list.last);
            assert.isUndefined(foundFour);
        });
        it("push", () => {
            const list = new LinkedList();
            const nodeOne = list.push(1);
            const nodeTwo = list.push(2);
            assert.strictEqual(list.size, 2);
            assert.strictEqual(nodeOne, list.first);
            assert.strictEqual(nodeTwo, list.last);
            assert.strictEqual(nodeOne.value, 1);
            assert.strictEqual(nodeTwo.value, 2);
        });
        describe("pushNode", () => {
            it("correct", () => {
                const list = new LinkedList();
                const first = new LinkedListNode(1);
                const second = new LinkedListNode(2);
                list.pushNode(first);
                list.pushNode(second);
                assert.strictEqual(list.size, 2);
                assert.strictEqual(list.first, first);
                assert.strictEqual(list.last, second);
            });
            it("throws if node not LinkedListNode", () => {
                const list = new LinkedList();
                assert.throws(() => list.pushNode(<any>{}));
            });
            it("throws if node from other list", () => {
                const list1 = new LinkedList([1]);
                const list2 = new LinkedList();
                assert.throws(() => list2.pushNode(list1.first));
            });
        });
        it("pop", () => {
            const list = new LinkedList([1, 2]);
            const first = list.pop();
            const second = list.pop();
            const third = list.pop();
            assert.strictEqual(list.size, 0);
            assert.strictEqual(first, 2);
            assert.strictEqual(second, 1);
            assert.strictEqual(third, undefined);
            assert.strictEqual(list.first, undefined);
            assert.strictEqual(list.last, undefined);
        });
        it("popNode", () => {
            const list = new LinkedList([1, 2]);
            const first = list.popNode();
            const second = list.popNode();
            const third = list.popNode();
            assert.strictEqual(list.size, 0);
            assert.strictEqual(first.value, 2);
            assert.strictEqual(second.value, 1);
            assert.strictEqual(third, undefined);
            assert.strictEqual(list.first, undefined);
            assert.strictEqual(list.last, undefined);
        });
        it("shift", () => {
            const list = new LinkedList([1, 2]);
            const first = list.shift();
            const second = list.shift();
            const third = list.shift();
            assert.strictEqual(list.size, 0);
            assert.strictEqual(first, 1);
            assert.strictEqual(second, 2);
            assert.strictEqual(third, undefined);
            assert.strictEqual(list.first, undefined);
            assert.strictEqual(list.last, undefined);
        });
        it("shiftNode", () => {
            const list = new LinkedList([1, 2]);
            const first = list.shiftNode();
            const second = list.shiftNode();
            const third = list.shiftNode();
            assert.strictEqual(list.size, 0);
            assert.strictEqual(first.value, 1);
            assert.strictEqual(second.value, 2);
            assert.strictEqual(third, undefined);
            assert.strictEqual(list.first, undefined);
            assert.strictEqual(list.last, undefined);
        });
        it("unshift", () => {
            const list = new LinkedList();
            const first = list.unshift(1);
            const second = list.unshift(2);
            assert.strictEqual(list.size, 2);
            assert.strictEqual(first, list.last);
            assert.strictEqual(second, list.first);
            assert.strictEqual(first.value, 1);
            assert.strictEqual(second.value, 2);
        });
        describe("unshiftNode", () => {
            it("correct", () => {
                const list = new LinkedList();
                const first = new LinkedListNode(1);
                const second = new LinkedListNode(2);
                list.unshiftNode(first);
                list.unshiftNode(second);
                assert.strictEqual(list.size, 2);
                assert.strictEqual(list.first, second);
                assert.strictEqual(list.last, first);
            });
            it("throws if node not LinkedListNode", () => {
                const list = new LinkedList();
                assert.throws(() => list.unshiftNode(<any>{}));
            });
            it("throws if node from other list", () => {
                const list1 = new LinkedList([1]);
                const list2 = new LinkedList();
                assert.throws(() => list2.unshiftNode(list1.first));
            });
        });
        describe("delete", () => {
            it("when present", () => {
                const list = new LinkedList([1, 2]);
                const wasDeleted = list.delete(1);
                assert.isTrue(wasDeleted);
                assert.strictEqual(list.size, 1);
            });
            it("when not present", () => {
                const list = new LinkedList([1, 2]);
                const wasDeleted = list.delete(4);
                assert.isFalse(wasDeleted);
                assert.strictEqual(list.size, 2);
            });
            it("twice", () => {
                const list = new LinkedList([1, 2]);
                list.delete(1);
                const wasDeletedAgain = list.delete(1);
                assert.isFalse(wasDeletedAgain);
                assert.strictEqual(list.size, 1);
            });
        });
        describe("deleteNode", () => {
            it("when present", () => {
                const list = new LinkedList([1, 2]);
                const node = list.first;
                const wasDeleted = list.deleteNode(node);
                assert.isTrue(wasDeleted);
                assert.strictEqual(list.size, 1);
                assert.strictEqual(node.list, undefined);
                assert.strictEqual(node.previous, undefined);
                assert.strictEqual(node.next, undefined);
            });
            it("when not present", () => {
                const list = new LinkedList([1, 2]);
                const node = new LinkedListNode(4);
                const wasDeleted = list.deleteNode(node);
                assert.isFalse(wasDeleted);
                assert.strictEqual(list.size, 2);
            });
            it("when from other list", () => {
                const other = new LinkedList([1]);
                const list = new LinkedList([1, 2]);
                const wasDeleted = list.deleteNode(other.first);
                assert.isFalse(wasDeleted);
                assert.strictEqual(list.size, 2);
            });
            it("twice", () => {
                const list = new LinkedList([1, 2]);
                const node = list.first;
                list.deleteNode(node);
                const wasDeletedAgain = list.deleteNode(node);
                assert.isFalse(wasDeletedAgain);
                assert.strictEqual(list.size, 1);
            });
        });
        describe("deleteAll", () => {
            it("when one", () => {
                const list = new LinkedList([1, 2, 3]);
                const count = list.deleteAll(value => value === 2);
                assert.strictEqual(count, 1);
                assert.strictEqual(list.size, 2);
            });
            it("when many", () => {
                const list = new LinkedList([1, 2, 3]);
                const count = list.deleteAll(value => value !== 2);
                assert.strictEqual(count, 2);
                assert.strictEqual(list.size, 1);
            });
            it("when none", () => {
                const list = new LinkedList([1, 2, 3]);
                const count = list.deleteAll(value => value === 4);
                assert.strictEqual(count, 0);
                assert.strictEqual(list.size, 3);
            });
            it("callback arguments", () => {
                const list = new LinkedList<number>();
                const first = list.push(1);
                const second = list.push(2);
                const thisArg = {};
                const calls: [number, LinkedListNode<number>, LinkedList<number>, {}][] = [];
                list.deleteAll(function (value, node, list) {
                    calls.push([value, node, list, this]);
                    return false;
                }, thisArg);
                assert.deepEqual(calls, [
                    [1, first, list, thisArg],
                    [2, second, list, thisArg]
                ]);
            });
            it("throws if predicate not function", () => {
                const list = new LinkedList([1, 2, 3]);
                assert.throws(() => list.deleteAll(undefined), TypeError);
            });
        });
        it("clear", () => {
            const list = new LinkedList<number>();
            const first = list.push(1);
            const second = list.push(2);
            list.clear();
            assert.strictEqual(list.size, 0);
            assert.strictEqual(list.first, undefined);
            assert.strictEqual(list.last, undefined);
            assert.strictEqual(first.list, undefined);
            assert.strictEqual(first.previous, undefined);
            assert.strictEqual(first.next, undefined);
            assert.strictEqual(second.list, undefined);
            assert.strictEqual(second.previous, undefined);
            assert.strictEqual(second.next, undefined);
        });
        describe("forEach", () => {
            it("when none", () => {
                const list = new LinkedList<number>();
                const thisArg = {};
                const calls: [number, LinkedListNode<number>, LinkedList<number>, {}][] = [];
                list.forEach(function (value, node, list) {
                    calls.push([value, node, list, this]);
                }, thisArg);
                assert.deepEqual(calls, [
                ]);
            });
            it("when one", () => {
                const list = new LinkedList<number>();
                const node = list.push(1);
                const thisArg = {};
                const calls: [number, LinkedListNode<number>, LinkedList<number>, {}][] = [];
                list.forEach(function (value, node, list) {
                    calls.push([value, node, list, this]);
                }, thisArg);
                assert.deepEqual(calls, [
                    [1, node, list, thisArg]
                ]);
            });
            it("when many", () => {
                const list = new LinkedList<number>();
                const first = list.push(1);
                const second = list.push(2);
                const thisArg = {};
                const calls: [number, LinkedListNode<number>, LinkedList<number>, {}][] = [];
                list.forEach(function (value, node, list) {
                    calls.push([value, node, list, this]);
                }, thisArg);
                assert.deepEqual(calls, [
                    [1, first, list, thisArg],
                    [2, second, list, thisArg]
                ]);
            });
            it("thows if callback not function", () => {
                const list = new LinkedList([1]);
                assert.throws(() => list.forEach(undefined), TypeError);
            });
        });
    });
});