// ============================================================
// PROTOTYPES & PROTOTYPE CHAIN
// ============================================================
//
// PROTOTYPE:
//   Every JavaScript object has an internal link to another object
//   called its "prototype". When you access a property or method on
//   an object and it doesn't exist directly on that object, JS looks
//   UP the prototype chain until it finds it (or hits null at the top).
//
// PROTOTYPE CHAIN:
//   object → object.__proto__ → Object.prototype → null
//   Array  → Array.prototype  → Object.prototype → null
//   Function → Function.prototype → Object.prototype → null
//
// __proto__ (dunder proto):
//   The actual internal link that points to the prototype.
//   It IS the prototype chain link itself.
//   NEVER use __proto__ in real code — it's deprecated and slow.
//   Use Object.create(), Object.getPrototypeOf(), or class syntax instead.
//
// Why avoid __proto__?
//   - Directly mutating it changes the object's prototype chain at runtime.
//   - All JS engines optimize object shapes at creation time.
//     Mutating __proto__ after creation breaks those optimizations.
//   - It can create prototype pollution security vulnerabilities.
//
// CORRECT ALTERNATIVES:
//   Object.create(proto)         — create an object with a specific prototype
//   Object.getPrototypeOf(obj)   — read the prototype (read-only, safe)
//   class / extends              — syntactic sugar over prototypal inheritance
// ============================================================

// Never do .__proto__

const dummyArray = [1, 2, 3, 4, 5]
// dummyArray has access to: .push, .pop, .map, .filter, etc.
// These don't live on dummyArray directly — they live on Array.prototype.
// JS finds them by walking: dummyArray → Array.prototype → Object.prototype → null

let dummyObject = {
    name: "John",
    age: 30,
    job: function () {
        console.log("I am a developer")
    }
}

let dummyObject2 = {
    name: "Jane",
}

const functionExample = function () {
    console.log("I am a function")
}

// -------------------------------------------------------
// BAD PRACTICE — __proto__ mutation (do not do this)
// -------------------------------------------------------
// This sets dummyObject2's prototype to dummyObject.
// Now dummyObject2 inherits all properties from dummyObject via the chain.
//
// WORKFLOW:
//   console.log(dummyObject2.age)
//   → JS looks for 'age' on dummyObject2 directly → NOT found
//   → JS follows __proto__ to dummyObject → FOUND → returns 30
//   → Output: 30
//
// This is how prototype inheritance works, but doing it via __proto__
// mutation is the WRONG way. Always set up inheritance at object creation.

// This is a bad practice, don't do it in real world.
// Never do this
dummyObject2.__proto__ = dummyObject
console.log(dummyObject2.__proto__)     // logs dummyObject (the prototype)
console.log(dummyObject2.age)           // 30 — inherited via prototype chain
