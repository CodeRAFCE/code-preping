// ============================================================
// FUNCTION CURRYING & PARTIAL APPLICATION
// ============================================================
//
// CURRYING:
//   Currying is a functional programming technique where a function
//   that takes multiple arguments is transformed into a sequence of
//   functions each taking a single argument.
//   f(a, b, c)  →  f(a)(b)(c)
//
//   WHY USE IT?
//   - Creates reusable, pre-configured functions (specialization)
//   - Enables function composition
//   - Avoids passing the same argument repeatedly
//
// PARTIAL APPLICATION:
//   Pre-filling some arguments of a function, returning a new function
//   that accepts the remaining arguments. Unlike currying, partial
//   application doesn't require one argument per call.
//   f(a, b, c) partially applied with 'a' → f(b, c)
//
// KEY DIFFERENCE:
//   Currying  → always produces unary (single-arg) functions
//   Partial   → fixes some args, remaining args can be multiple
// ============================================================

// -------------------------------------------------------
// PARTIAL APPLICATION using .bind()
// -------------------------------------------------------
// Function.prototype.bind(thisArg, ...presetArgs)
// When called with preset args, it returns a new function with
// those args already "baked in". This is partial application.

const multiply = (a, b) => {
    return console.log(a * b)
}

// 'multiplyByTwo' is a specialized version of 'multiply' with 'a' pre-set to 2.
// Now we only need to supply 'b' when calling it.
const multiplyByTwo = multiply.bind(this, 2);
multiplyByTwo(5)   // 2 * 5 = 10

const multiplyByThree = multiply.bind(this, 3);
multiplyByThree(10) // 3 * 10 = 30

// -------------------------------------------------------
// CURRYING WITH CLOSURES
// -------------------------------------------------------
// A closure is when an inner function "remembers" variables from
// its outer function's scope even after the outer function has returned.
// Currying relies on closures — each nested function closes over the
// arguments from the outer function.

function add(a) {
    // Inner function closes over 'a' from the outer scope.
    return function (b) {
        return console.log(a + b)
    }
}

add(5)(2)   // 7 — called immediately with both arguments

// Can be split into two steps — this shows the specialization benefit:
// add(5) returns a new function with 'a' already set to 5.
const add1 = add(5);
add1(2)  // 7

// -------------------------------------------------------
// CURRYING WITH ARROW FUNCTIONS
// -------------------------------------------------------
// Arrow functions make curried syntax very concise.
// a => b => expression  is the same as function(a){ return function(b){ return expression } }

const subtract = a => b => console.log(a - b)
subtract(5)(2)  // 3

// -------------------------------------------------------
// REAL WORLD EXAMPLE: Currying + Promises + Async Delay
// -------------------------------------------------------
// CONCEPT: evaluate(fn)(data)
//   - First call 'evaluate(fn)' returns a function that waits 2s before
//     applying 'fn' to its argument. This is currying + async.
// PROMISE: An object representing the eventual completion (or failure)
//   of an async operation. Created with new Promise((resolve, reject) => {})
// SETTIMEOUT: Schedules a callback to run after a specified delay (ms).

const evaluate = (sum) => {
    return function (obj) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(sum(obj))   // after 2s, compute and resolve
            }, 2000)
        })
    }
}

// sum() iterates over all values of an object using for...in and accumulates total.
// for...in loops over the enumerable property KEYS of an object.
const sum = (obj) => {
    let total = 0
    for (let key in obj) {
        total += obj[key]   // obj[key] dynamically accesses property by name
    }
    console.log(total)
    return total
}

// Workflow:
// 1. evaluate(sum)  → returns a function waiting for 'obj'
// 2. (obj)          → that returned function is called with obj
// 3. Inside, a Promise is created and setTimeout delays the sum by 2000ms
// 4. After 2s, sum(obj) is called: 2+4+6+8+10 = 30, then resolved
const obj = { a: 2, b: 4, c: 6, d: 8, e: 10 }
evaluate(sum)(obj)  // logs 30 after 2 seconds

// -------------------------------------------------------
// REAL WORLD EXAMPLE: Curried Search / Filter
// -------------------------------------------------------
// Array.prototype.filter(predicate) — returns a new array with only
// the elements for which 'predicate(element)' returns true.
//
// 'search' is a curried predicate factory:
//   search("John")  → returns a function  item => item.name === "John"
//   That returned function is the actual predicate passed to .filter()

const users = [
    { name: "John", age: 30, id: 1 },
    { name: "Jane", age: 25, id: 2 },
    { name: "Bob", age: 24, id: 3 },
    { name: "Alice", age: 45, id: 4 },
    { name: "Charlie", age: 70, id: 5 },
]

const search = name => item => item.name === name

// Workflow:
// searchBy(users, "John")
//   → users.filter(search("John"))
//   → users.filter(item => item.name === "John")
//   → [{ name: "John", age: 30, id: 1 }]
const searchBy = (users, name) => users.filter(search(name))
console.log(searchBy(users, "John"))

// -------------------------------------------------------
// GENERIC curry() IMPLEMENTATION
// -------------------------------------------------------
// Converts ANY multi-arg function f(a,b,c) → f(a)(b)(c)
//
// HOW IT WORKS:
//   fn.length  → the number of declared parameters (arity) of the function
//   ...args    → rest parameter — collects all passed args into an array
//   If enough args have been collected (args.length >= fn.length),
//   call the original fn with all args.
//   Otherwise, return a new function that collects MORE args and
//   calls 'curriedFunc' recursively with the combined args.

function curry(fn) {
    console.log("fn", fn);
    return function curriedFunc(...args) {
        if (args.length >= fn.length) return fn(...args)    // enough args → call original
        else return function (...nextArgs) {
            return curriedFunc(...args, ...nextArgs)         // not enough → collect more (recursive)
        }
    }
}

const addition = (a, b, c) => a + b + c;

// Workflow:
// curry(addition) → returns curriedFunc
// totalSum(1)     → args=[1], fn.length=3, not enough → returns new function
// (2)             → args=[1,2], still not enough → returns new function
// (3)             → args=[1,2,3], now enough → calls addition(1,2,3) = 6
const totalSum = curry(addition)
console.log(totalSum(1)(2)(3))  // 6

// -------------------------------------------------------
// CURRYING VS PARTIAL APPLICATION — Side-by-Side
// -------------------------------------------------------
// addy(a)(b, c) — this is PARTIAL APPLICATION, not pure currying,
// because the second call still accepts two arguments (b, c) at once.
// Pure currying would require addy(a)(b)(c).

function addy(a) {
    return function (b, c) {   // accepts 2 args — partial application, not currying
        return a + b + c
    }
}

const total = addy(1);
total(2, 4)    // 7
addy(1)(2, 4)  // 7 — same result, inline form

// -------------------------------------------------------
// INTERVIEW QUESTION: Infinite Currying
// sum(1)(2)(3)(4)() → returns sum of all arguments
// -------------------------------------------------------

// Naive approach: rest params — NOT infinite currying
// sum1(1, 2, 3, 4, 5) works but all args must be given at once.
function sum1(...nums) {
    return nums.reduce((acc, curr) => acc + curr, 0)
}
console.log(sum1(1, 2, 3, 4, 5))  // 15

// PROPER Infinite Currying using RECURSION + ACCUMULATOR PATTERN:
// KEY INSIGHT: Each call returns ANOTHER function (not a value),
// allowing chaining indefinitely. The chain only terminates when
// the inner function is called with NO argument (b === undefined).
//
// HOW IT WORKS:
//   sum2(1)     → a=1,  returns inner function
//   (2)         → b=2,  calls sum2(1+2) = sum2(3), returns inner function
//   (3)         → b=3,  calls sum2(3+3) = sum2(6), returns inner function
//   (4)         → b=4,  calls sum2(6+4) = sum2(10), returns inner function
//   ()          → b=undefined, base case hit → returns a (which is 10)
//
// RECURSION: A function calling itself. Here sum2 calls sum2(a+b),
// carrying the running total forward in each recursive call.

function sum2(a) {
    console.log("a", a);
    return function (b) {
        console.log("b", b);
        if (b === undefined) return a       // base case: terminate and return total
        return sum2(a + b)                  // recursive case: carry running total
    }
}

console.log("Infinite Currying", sum2(1)(2)(3)(4)());  // 10
