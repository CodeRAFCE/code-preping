# Throttling

A technique that ensures a function is called **at most once** within a specified time window, no matter how many times it's triggered.

Unlike debouncing (which waits for a pause), throttling **guarantees** the function runs at regular intervals during continuous events.

## 🎯 Say This in the Interview

> "Throttle runs a function **at most once every X ms**. Calls during the wait are **dropped, not queued**. Debounce waits for the user to stop; throttle runs at a steady rate while they're active."

## Debouncing vs Throttling

| Technique      | Behavior                                            |
| -------------- | --------------------------------------------------- |
| **Debouncing** | Waits for the user to **stop**, then fires **once** |
| **Throttling** | Fires at a **steady rate** while the user is active |

## Timeline (throttle 1000ms)

```
time (ms):   0    200   400   800   1000  1200  1500  2100
calls:       C1   C2    C3    C4          C5    C6    C7
runs?        ✅   ❌    ❌    ❌          ✅    ❌    ✅
             └──── locked 1000ms ────┘    └─ locked ─┘
```

- **C1** runs right away and starts a 1000ms lock.
- **C2, C3, C4** arrive while it's locked, so they're ignored. They don't wait their turn.
- **C5** arrives after the lock ends, so it runs and starts a new lock.
- **C6** is ignored, and **C7** runs.

## Code to Know Cold

```js
const throttle = (fn, delay) => {
  let lastRun = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastRun >= delay) {
      lastRun = now; // lock FIRST
      fn.apply(this, args); // then run
    }
  };
};
```

# Code with setTimeout

```js
const throttleWithTimeout = (fn, delay) => {
  let isWaiting = false;

  return function (...args) {
    if (isWaiting) return; // door closed, drop the call

    fn.apply(this, args);
    isWaiting = true; // close the door

    setTimeout(() => {
      isWaiting = false; // open the door again
    }, delay);
  };
};
```

## Why Questions They'll Ask

| Question                            | Answer                                                   |
| ----------------------------------- | -------------------------------------------------------- |
| Why return a function?              | **Closure**: `lastRun` must survive between calls        |
| Why `...args`?                      | Collects whatever the caller passes, to forward to `fn`  |
| Why `.apply(this, args)`?           | Keeps the caller's `this` and passes all args through    |
| Why does the first call always run? | `lastRun = 0`, so `now - 0` is huge                      |
| Why lock before calling `fn`?       | If `fn` throws or calls itself, the throttle still holds |
| Why `function` inside, not arrow?   | Arrow functions don't have their own `this`              |

## The One-Line Difference

```js
// Throttle: update only when fn RUNS → window counts from last run
if (now - lastRun >= delay) {
  lastRun = now;
  fn();
}

// Debounce (leading): update on EVERY call → window counts from last call
if (now - lastCall >= delay) fn();
lastCall = now;
```

## Common Follow-ups

- **Last call is dropped** → fix with a **trailing** option (save last `args`/`this`, run them when the window ends)
- **Leading / trailing options** → same idea as debounce `{ leading, trailing }`
- **`cancel()`** → clear timer and reset state (functions are objects)
- **Other ways?** → timestamps, flag + `setTimeout`, `setInterval`
- **Bonus:** `requestAnimationFrame` is a natural throttle for visual updates (about once per frame)

## When to Use Throttling

- Window resize / scroll event handlers (update layout at 60fps max)
- Mouse move events (update position at 30fps max)
- Game input loops
- Form submit buttons (prevent double-submit; first click runs, rest ignored)
- Any continuous event where some regularity is needed

## When to Use Debouncing

- Search inputs (fire only after typing stops)
- Autosave (save once the user pauses)
- Any "wait for idle" scenario

> ⚠️ **Gotcha:** For double-submit prevention, a normal (trailing) debounce makes the button wait until clicking stops, which feels broken. Use **throttle** or a **leading** debounce instead.
