// ============================================================
// POLYFILLS — call, bind (and a skeleton for call)
// ============================================================
//
// POLYFILL:
//   A piece of code that replicates a native browser/JS feature for
//   environments where it doesn't exist yet, or as a learning exercise
//   to deeply understand how the native feature works under the hood.
//
// 'this' KEYWORD:
//   Inside a regular function, 'this' refers to the object that called
//   the function. Arrow functions do NOT have their own 'this' — they
//   inherit it from the surrounding lexical scope.
//
// call() — invokes a function immediately with a specified 'this' and arguments
//   fn.call(thisArg, arg1, arg2, ...)
//
// apply() — same as call() but arguments are passed as an array
//   fn.apply(thisArg, [arg1, arg2, ...])
//
// bind() — does NOT invoke immediately. Returns a NEW function with
//   'this' and optional args pre-set. Call the returned function later.
//   const boundFn = fn.bind(thisArg, ...preArgs)
//   boundFn(...laterArgs)
// ============================================================

let person = {
    firstname: "John",
    lastname: "Doe",
}

// printFullName uses 'this.firstname' and 'this.lastname'.
// 'this' depends on HOW the function is called.
let printFullName = function () {
    console.log(this.firstname + " " + this.lastname);
}

// .call(person) — sets 'this' to 'person' and invokes immediately
// Output: "John Doe"
printFullName.call(person);

// .bind(person) — sets 'this' to 'person' and returns a new function.
// That new function must be called separately.
const printfullName1 = printFullName.bind(person)
printfullName1();   // Output: "John Doe"

// -------------------------------------------------------
// POLYFILL for bind() — customBind
// -------------------------------------------------------
// We extend Function.prototype so that ALL functions get this method,
// exactly like the native .bind() method is available on all functions.
//
// CLOSURE is the key mechanism here:
//   'fn' and 'thisArg' and 'preArgs' are captured in the closure
//   and remembered when the returned function is later called.
//
// TWO-PHASE ARGUMENT COLLECTION (same as native bind):
//   Phase 1 (bind time):  preArgs  — args passed to customBind itself
//   Phase 2 (call time):  postArgs — args passed when the bound fn is called
//   Final call: fn.call(thisArg, ...preArgs, ...postArgs)
//
// WORKFLOW:
//   printFullName.customBind(person)
//     → 'fn' = printFullName,  thisArg = person,  preArgs = []
//     → returns a new function
//   printfullName2()
//     → calls fn.call(person, ...[]) = printFullName.call(person)
//     → logs "John Doe"

/**
 * customBind - A polyfill for the native Function.prototype.bind method.
 *
 * @param {Object} thisArg - The object to be used as 'this' context.
 * @param {...any} preArgs - Initial arguments to be passed to the function.
 * @returns {Function} - A new function that, when called, has its 'this' keyword set to the provided value.
 */
Function.prototype.customBind = function (thisArg, ...preArgs) {
    // 'this' here is the function customBind was called ON (printFullName).
    // We save it as 'fn' because inside the returned function,
    // 'this' will refer to something else entirely.
    const fn = this;

    // Return a closure. When this function is later invoked,
    // it will merge preArgs (from bind time) + postArgs (from call time).
    return function (...postArgs) {
        // .call() sets 'this' to thisArg and spreads all args in order.
        fn.call(thisArg, ...preArgs, ...postArgs);
    }
}

const printfullName2 = printFullName.customBind(person)
printfullName2();   // Output: "John Doe"

// -------------------------------------------------------
// POLYFILL SKELETON for call() — customCall
// -------------------------------------------------------
// Native .call(thisArg, ...args) immediately invokes the function
// with 'this' set to thisArg.
//
// One common implementation strategy:
//   1. Temporarily attach 'fn' as a property on thisArg
//   2. Call it via thisArg.fn(...args)  — now 'this' inside fn IS thisArg
//   3. Delete the temporary property from thisArg
//   4. Return the result
//
// NOTE: The implementation body is intentionally left incomplete
// below as a practice exercise.

/**
 * customCall - A polyfill for the native Function.prototype.call method.
 *
 * @param {Object} thisArg - The object to be used as 'this' context.
 * @param {...any} args - Arguments to be passed to the function.
 * @returns {void} - The function is executed directly.
 */
Function.prototype.customCall = function (thisArg, ...args) {
    // 'this' = the function customCall was called on (printFullName)
    const fn = this;

    // Implementation left as exercise:
    // thisArg._tempFn = fn;
    // thisArg._tempFn(...args);
    // delete thisArg._tempFn;
}

// NOTE: customCall is incomplete — printfullName3() will throw as-is.
const printfullName3 = printFullName.customCall(person)
// printfullName3(); // would error — body not implemented
