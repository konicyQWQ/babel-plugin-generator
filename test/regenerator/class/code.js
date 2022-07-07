/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let strictEqual = (a, b) => expect(a).toStrictEqual(b);
var shared = require("../shared.js");
var check = shared.check;

describe("class methods", function () {
    test("should work if the generator is a class method", function () {
        class Foo {
            *gen(x) {
                yield x;
            }
        }

        check(new Foo().gen("boom"), ["boom"]);
    });

    test("should work if the generator is a computed class method", function () {
        var fnName = "gen";
        class Foo {
            *[fnName](x) {
                yield x;
            }
        }

        check(new Foo().gen("boom"), ["boom"]);
    });

    test("should work with this", function () {
        class A {
            *gen() { yield this }
        }

        const a = new A;
        check(a.gen(), [a]);
    })

    test("should work with super", function () {
        class A {
            *gen() { yield 1 }
        }

        class B extends A {
            *gen() { yield super.gen; }
        }

        check(new B().gen(), [A.prototype.gen]);
    });

    test("should work with arguments", function () {
        class A {
            *gen() { yield arguments }
        }

        const args = new A().gen(1, 2, 3).next().value;
        strictEqual(args.length, 3);
        strictEqual(args[0], 1);
        strictEqual(args[1], 2);
        strictEqual(args[2], 3)
    });

    test("should allow yield as super expression", function () {
        function* gen() {
            return class extends (yield) { }
        }

        class B { }

        const it = gen();
        it.next();
        const res = it.next(B).value;

        expect(new res instanceof B).toBeTruthy();
    });

    test("should allow yield as super expression with argument", function () {
        function* gen() {
            return class extends (yield 123) { }
        }

        class B { }

        const it = gen();
        strictEqual(it.next(), { value: 123, done: false });
        const res = it.next(B).value;

        expect(new res instanceof B).toBeTruthy();
    });

    test("should allow yield as computed key", function () {
        if (class { }.toString().indexOf("class") !== 0) {
            return;
            // The class transform is broken:
            // https://github.com/babel/babel/issues/8300
        }

        function* gen() {
            return class {
                [yield]() { return 1 }
                [yield]() { return 2 }
            }
        }

        const it = gen();
        it.next();
        it.next("one");
        const res = it.next("two").value;

        strictEqual(new res().one(), 1);
        strictEqual(new res().two(), 2);
    });
});
