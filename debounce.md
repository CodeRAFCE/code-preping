# Debouncing

A technique to limit how often a function fires when triggered by rapid/repeated events `(keystrokes, scroll, resize, clicks)`. The function only fires AFTER the user has STOPPED triggering the event for a specified delay period.

Every new trigger RESETS the timer — only the LAST trigger in a burst actually executes the function.

`ANALOGY:` An elevator door. The door only closes AFTER no one has pressed the button for N seconds. Every new press resets the timer.

## 🎯 Say This in the Interview

> "Debounce delays a function until the calls **stop** for X ms. Every new call **resets the timer**, so only the **last** call in a burst runs. Throttle is different: it runs at a steady rate while calls keep coming."

## Code to Know Cold

```js
const debounce = (fn, delay) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout); // cancel the previous timer
    timeout = setTimeout(() => fn.apply(this, args), delay); // start a fresh one
  };
};
```

## Why Questions They'll Ask

| Question                                   | Answer                                                                     |
| ------------------------------------------ | -------------------------------------------------------------------------- |
| Why return a function?                     | **Closure**: one shared `timeout` that every call can clear (see §1)       |
| Why `...args`?                             | Collects whatever the caller passes, to forward to `fn`                    |
| Why `.apply(this, args)`?                  | Keeps the caller's `this` and passes all args through (see §2)             |
| Why an ARROW fn inside `setTimeout`?       | No own `this`, so it uses the inner function's `this` (see §2)             |
| Why `function` (not arrow) for the inner?  | It needs its OWN `this`, the caller's                                      |
| Why `clearTimeout` before `setTimeout`?    | Kills the previous pending call, so only the latest survives               |
| Is `clearTimeout(undefined)` a problem?    | No, it safely does nothing (first call)                                    |
| Can you debounce with `Date.now` only?     | Only **leading**. Trailing needs a timer to wake up after the quiet period |

WHEN TO USE:

- Search input (wait for the user to stop typing before calling API)
- Form validation (validate only after the user pauses)
- Window resize handlers (calculate layout only once resizing stops)

KEY TOOLS:

- setTimeout(fn, delay) — schedules fn to run after delay ms
- clearTimeout(id) — cancels a previously scheduled setTimeout
- fn.apply(context, args) — calls fn with specific 'this' and arguments array

---

## 1. WHY DEBOUNCE RETURNS A FUNCTION

`debounce` does not run anything itself. It BUILDS a function and hands it back. The returned function is the one you call on every keystroke.

```js
const debouncedSearch = debounce(search, 1000); // debounce runs ONCE
input.addEventListener("input", debouncedSearch); // inner fn runs MANY times
```

`KEY IDEA:` Because `debounce` runs only once, there is only ONE `timeout` variable. The returned function remembers it (CLOSURE), so every keystroke shares the SAME timer and can cancel the previous one.

WITHOUT A RETURNED FUNCTION:

```js
const debounce = (fn, delay) => {
  let timeout; // brand-new variable on EVERY call
  clearTimeout(timeout); // undefined → cancels nothing
  timeout = setTimeout(fn, delay);
};
```

Typing `h` → `e` → `y`:

| Keystroke | What happens                                                |
| --------- | ----------------------------------------------------------- |
| `h`       | new `timeout` (undefined) → clears nothing → starts Timer A |
| `e`       | ANOTHER new `timeout` → clears nothing → starts Timer B     |
| `y`       | ANOTHER new `timeout` → clears nothing → starts Timer C     |

All 3 timers fire → `fn` runs 3 times → NO debouncing.

- Each call is pushed on the call stack, starts a timer, then is popped off.
- When it is popped, its `timeout` variable is gone, so nobody remembers the timer ID.
- Timers do NOT live on the call stack. `setTimeout` hands them to the browser/Node. When done, the callback goes to the TASK QUEUE, and the event loop moves it onto the call stack once it is empty.

WITH A RETURNED FUNCTION:

| Keystroke | What happens                                 |
| --------- | -------------------------------------------- |
| `h`       | starts Timer A, saves ID in shared `timeout` |
| `e`       | CANCELS A → starts Timer B                   |
| `y`       | CANCELS B → starts Timer C                   |

Only Timer C fires → `fn` runs ONCE.

---

## 2. PASSING ARGS AND `this` THROUGH

You never call `fn` directly. You call the INNER function, and the inner function calls `fn` later. Whatever goes INTO the inner function must be PASSED ON to `fn`, or it is lost.

Two things get passed into any function call:

1. ARGUMENTS → `greet("Sam")` — `"Sam"` is the argument
2. `this` → `user.sayHi()` — `this` is `user`

`ANALOGY:` A receptionist (inner fn) receives a package (`event`) for the boss (`fn`). If the receptionist has no hands (`function ()`), the package drops on the floor and the boss gets nothing.

THREE VERSIONS:

```js
// V1 — drops args AND this
return function () {
  clearTimeout(timeout);
  timeout = setTimeout(() => fn(), delay);
};

// V2 — passes args, drops this
return function (...args) {
  clearTimeout(timeout);
  timeout = setTimeout(() => fn(...args), delay);
};

// V3 — passes args AND this ✅ (write this one in interviews)
return function (...args) {
  clearTimeout(timeout);
  timeout = setTimeout(() => fn.apply(this, args), delay);
};
```

| Version | Passes args? | Passes `this`? | Line that calls `fn`   |
| ------- | ------------ | -------------- | ---------------------- |
| V1      | ❌           | ❌             | `fn()`                 |
| V2      | ✅           | ❌             | `fn(...args)`          |
| V3      | ✅           | ✅             | `fn.apply(this, args)` |

V3 covers V2 as well. If `fn` does not use `this`, nothing breaks.

EXAMPLES:

```js
function greet(name) {
  console.log("Hello " + name);
}

debounceV1(greet, 500)("Sam"); // Hello undefined ❌
debounceV2(greet, 500)("Sam"); // Hello Sam ✅

function sayHi() {
  console.log("Hi, I'm " + this.name);
}

const user = {
  name: "Sam",
  sayHiV2: debounceV2(sayHi, 500),
  sayHiV3: debounceV3(sayHi, 500),
};

user.sayHiV2(); // Hi, I'm undefined ❌  (fn(...args) is a plain call)
user.sayHiV3(); // Hi, I'm Sam ✅        (apply sets this = user)
```

WHY `this` STILL WORKS INSIDE setTimeout:

- The callback is an ARROW function. Arrow functions have NO `this` of their own.
- They use the `this` of the surrounding scope (lexical) → the inner function's `this`.
- A regular `function () {}` there would get its own `this` and lose it again.

---

## 3. `this` IN A PLAIN CALL

A plain call (nothing before the dot, e.g. `debounced()`):

| Mode            | `this` is                               |
| --------------- | --------------------------------------- |
| Strict mode     | `undefined` → `this.name` CRASHES       |
| Non-strict mode | global object (`window` / `globalThis`) |

- ES modules (`import`/`export`) and `class` bodies are AUTOMATICALLY strict.
- V3 does not create `this`. It passes along whatever `this` the inner function received:

```js
user.sayHiV3(); // this = user
debounced(); // this = undefined / global
button.addEventListener("click", debounced); // this = button
```

---

## 4. apply vs call

Both call `fn` with a chosen `this`. The difference is how arguments are passed.

```js
const args = ["Sam", 25];

fn.apply(this, args); // takes an ARRAY, unpacks it → fn("Sam", 25)
fn.call(this, "Sam", 25); // takes args ONE BY ONE
fn.call(this, ...args); // same thing using spread
```

`MEMORY TRICK:` **A**pply takes an **A**rray.

---

## 5. THE OLD (ES5) STYLE YOU WILL SEE ONLINE

```js
return function () {
  var context = this; // save caller's this
  var args = arguments; // save caller's arguments
  clearTimeout(timer);
  timer = setTimeout(function () {
    // regular function, NOT arrow
    fn.apply(context, args);
  }, delay);
};
```

- Before ES6 there were no arrow functions and no `...args`.
- A regular `function () {}` gets its OWN `this` and `arguments`, so they HAD to be saved in variables first.
- With an arrow function inside setTimeout, saving them is not needed, but devs still do it out of habit, for clarity, or for safety.

| `arguments`                   | `...args`      |
| ----------------------------- | -------------- |
| Old (ES5)                     | Modern (ES6+)  |
| Array-LIKE (no `.map`)        | Real array     |
| Arrow functions don't have it | Works anywhere |

Both work with `apply`. Be ready to explain WHY `context` was saved.

---

## 6. CANCEL AND FLUSH

Functions are objects, so you can attach methods to the returned function. Both methods are created inside `debounce`, so they share the SAME `timeout` (closure).

```js
const debounce = (fn, delay = 1000) => {
  let timeout;
  let lastArgs; // shared, so flush can see them
  let lastThis;

  function run() {
    const args = lastArgs;
    const context = lastThis;
    timeout = lastArgs = lastThis = undefined; // reset BEFORE calling → can't run twice
    fn.apply(context, args);
  }

  function debounced(...args) {
    lastArgs = args; // remember the latest call
    lastThis = this;
    clearTimeout(timeout);
    timeout = setTimeout(run, delay);
  }

  debounced.cancel = function () {
    clearTimeout(timeout);
    timeout = lastArgs = lastThis = undefined;
  };

  debounced.flush = function () {
    if (timeout === undefined) return; // nothing waiting
    clearTimeout(timeout);
    run(); // run it NOW
  };

  return debounced;
};
```

```
debounce(fn, delay)
  ├── timeout, lastArgs, lastThis   ← shared
  ├── debounced()  saves args/this, starts timer
  ├── cancel()     throws pending call away
  └── flush()      runs pending call now
```

CANCEL vs FLUSH — both clear out the pending call, but differently:

| Method     | Pending call            | Plain English |
| ---------- | ----------------------- | ------------- |
| `cancel()` | thrown away, never runs | "never run"   |
| `flush()`  | runs immediately        | "run now"     |

FLUSH IN ONE LINE: With a 2s delay, typing `hey` waits 2s before `fn("hey")` runs. `flush()` skips the remaining wait and runs it NOW. It runs at most once, and only if something is waiting.

- Flush does NOT bring back skipped keystrokes. It only skips the wait for the call currently pending.
- After flush, the timer does not fire again → `fn` runs once, not twice.

WHEN TO USE:

- `cancel` → user navigates away; React component unmounts (cleanup)
- `flush` → user clicks Search / presses Enter; form Submit (save last keystrokes first); tab closing

```js
searchButton.addEventListener("click", () => debouncedSearch.flush());

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") debouncedSearch.flush();
});
```

WHY "FLUSH"?

- Borrowed from BUFFERS: work collects, then gets sent out later. Flushing = push out what is waiting RIGHT NOW (`fflush(stdout)`, `stream.flush()`).
- Like flushing a pipe: contents are SENT ON, not deleted.
- Name comes from Lodash (`_.debounce`), which also has `pending()` → `true` if a call is waiting.

| Name                 | Meaning                                |
| -------------------- | -------------------------------------- |
| `flush`              | run the pending call now (most common) |
| `runNow` / `callNow` | same, more descriptive                 |
| `trigger` / `fire`   | same idea, some event libraries        |
| `drain`              | queues: process EVERYTHING waiting     |

---

## 7. TRAILING vs LEADING (DON'T CONFUSE WITH FLUSH)

- DEFAULT (TRAILING): only the LAST call runs, after the pause. Typing `hey` → `h` and `e` skipped, `fn("hey")` runs once.
- `{ leading: true }` / `immediate`: runs on the FIRST call, then ignores calls until things go quiet.
- `flush()` is something YOU call manually. `leading` is a SETTING.

```js
const debounce = (fn, delay, { leading = false, trailing = true } = {}) => {
  let timeout = null;
  let lastArgs = null;
  let lastThis = null;

  return function (...args) {
    const callNow = leading && !timeout; // no timer = first call of a burst

    if (callNow) fn.apply(this, args);
    else {
      lastArgs = args; // save for the trailing run
      lastThis = this;
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null; // quiet period over, reset
      if (trailing && lastArgs) fn.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
    }, delay);
  };
};
```

| Options                              | Typing `hey`                             |
| ------------------------------------ | ---------------------------------------- |
| `{ trailing: true }` (default)       | runs once with `"hey"` after the pause   |
| `{ leading: true, trailing: false }` | runs once with `"h"` immediately         |
| `{ leading: true, trailing: true }`  | runs with `"h"` now AND `"hey"` at end   |

`GOTCHA:` With both on, a SINGLE call must not run twice. That is why the leading call does NOT save `lastArgs` → nothing for the trailing run.

---

## 8. COMMON FOLLOW-UPS & GOTCHAS

- **Add `cancel` / `flush`** → see §6
- **Add leading / trailing options** → see §7
- **Return a Promise** → resolve with `fn`'s result when the trailing call runs (rare, senior rounds)
- **Debounce vs throttle with constant input** → debounce NEVER fires while input keeps coming; throttle fires every X ms
- **Double-submit buttons** → a normal (trailing) debounce makes the button wait until clicking stops, which feels broken. Use **leading** debounce or **throttle**
- **React** → creating `debounce(...)` inside the component body makes a NEW debounced fn (new `timeout`) on every render, so nothing gets debounced. Wrap it in `useMemo` / `useRef`, and `cancel()` on unmount
- **Lodash** → `_.debounce(fn, wait, { leading, trailing, maxWait })`. `maxWait` forces a run at least every X ms, which turns it into a throttle (`_.throttle` is built this way)

---

## 9. TRY IT

Open `debounce-demo.html` in a browser (2s delay, live log):

1. Type `hey` fast, wait → `fn` runs once with `"hey"`
2. Type `he`, click Flush, type `y` → runs `"he"` instantly, then `"hey"` 2s later
3. Type `hey`, click Cancel → `fn` never runs
4. Click Flush with nothing pending → "nothing pending"
