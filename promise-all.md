# Promise.all()

Takes an array of promises, runs them **at the same time**, and waits for **all** of them to succeed. Returns ONE promise that resolves with an **array of results**, or rejects as soon as **any one** fails.

`ANALOGY:` Ordering food for a group. You wait until EVERY dish is ready before serving. If the kitchen says one dish failed, the whole order is cancelled.

## 🎯 Say This in the Interview

> "`Promise.all` runs promises **in parallel** and resolves with their results **in the original order**. It's **fail-fast**: if any promise rejects, it rejects immediately with that first error. Total time = the **slowest** promise, not the sum."

## Timeline

```
fetchUsers  ──────1s──────✅
fetchLikes  ──────1s──────✅      → .then([users, likes, posts]) after ~1s total
fetchPosts  ──────1s──────✅         (parallel, NOT 3s)
```

---

## 1. Basic Usage

```js
const fetchUsers = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve("Users fetched!"), 1000);
  });

// .then style
Promise.all([fetchUsers(), fetchLikes(), fetchPosts()])
  .then(([users, likes, posts]) => {
    console.log(users, likes, posts);
  })
  .catch((err) => console.error("First promise that failed:", err));

// async/await style ✅ (most common in real code)
const loadPage = async () => {
  try {
    const [users, likes, posts] = await Promise.all([
      fetchUsers(),
      fetchLikes(),
      fetchPosts(),
    ]);
    console.log(users, likes, posts);
  } catch (err) {
    console.error("First promise that failed:", err);
  }
};
```

---

## 2. The Three Rules

| Rule                       | What it means                                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **1. Order is kept**       | Results come back in **array order**, NOT finish order. That's why `[users, likes, posts]` works                     |
| **2. Fail-fast**           | If **any** promise rejects, `Promise.all` rejects **immediately** with that first error. Successful results are lost |
| **3. Others keep running** | After a failure, the other promises are **NOT cancelled**. Their results are just ignored                            |

ORDER EXAMPLE: users 3s, likes 1s, posts 2s

```
finish order:  likes (1s) → posts (2s) → users (3s)
result order:  [users, likes, posts]   ← same as input array
total time:    ~3s (the slowest)
```

FAIL-FAST EXAMPLE: posts rejects at 1s, users succeeds at 3s

```
1s  → posts rejects → .catch runs immediately with posts' error
3s  → users still resolves, but nobody is listening
```

---

## 3. GOTCHA: Promise vs Function That Returns a Promise

```js
// ❌ This is a PROMISE (an object). It starts running RIGHT NOW.
const fetchUsers = new Promise((resolve) => { ... });
fetchUsers(); // TypeError: fetchUsers is not a function

// ✅ This is a FUNCTION. Nothing runs until you call it.
const fetchUsers = () => new Promise((resolve) => { ... });
fetchUsers(); // starts now
```

`KEY IDEA:` A promise starts executing **the moment it's created**, not when you `.then` or `await` it. Wrapping it in a function lets YOU decide when it starts. Real APIs work this way: `fetch(url)` is a function you call.

`ALSO:` The `TypeError` above is thrown while BUILDING the array, before `Promise.all` even runs, so `.catch` can't catch it. `.catch` only catches a **rejected promise**.

---

## 4. Write Your Own Promise.all (Polyfill) ⭐

This is the #1 follow-up. Know it cold.

```js
const promiseAll = (promises) => {
  return new Promise((resolve, reject) => {
    const list = Array.from(promises);
    const results = [];
    let completed = 0;

    if (promises.length === 0) return resolve([]); // empty array → resolve right away

    list.forEach((promise, index) => {
      Promise.resolve(promise) // handles plain values too, e.g. promiseAll([1, p])
        .then((value) => {
          results[index] = value; // save by INDEX, keeps original order
          completed++;
          if (completed === list.length) resolve(results); // all done
        })
        .catch(reject); // first failure rejects the whole thing
    });
  });
};

/**

    The four things interviewers check
    These are what actually get tested, so here’s each in simple terms.

    1. Order comes from the index, not finishing time. If the second promise finishes first, its result still goes in slot 2. That’s why we use results[i] = value instead of results.push(value). Using push is the most common mistake.
    2. Count finished promises with a counter, not results.length. This one is sneaky. If promise #3 finishes first, results[2] = value makes the array’s length 3 even though only one promise is done. JavaScript fills the empty slots with holes. So you need a separate done counter.
    3. Empty input resolves right away. With an empty array, forEach never runs, so nothing would ever call resolve, and the promise would hang forever. The early return resolve([]) handles that.
    4. Plain values are allowed. Promise.all([1, fetchUser()]) is valid. Wrapping each item in Promise.resolve(item) turns plain values into already-resolved promises, so everything is handled the same way.

    Bonus: passing reject directly as the error handler gives you fail-fast behavior for free. Calling reject again later does nothing, because a promise can only settle once.

*/
```

### Why Questions on the Polyfill

| Question                                         | Answer                                                                                                    |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Why return `new Promise`?                        | `Promise.all` returns ONE promise that the caller can `.then` / `await`                                   |
| Why `results[index] = value`, not `push`?        | `push` saves in **finish** order. Index keeps the **input** order                                         |
| Why a `completed` counter, not `results.length`? | `results[2] = x` on an empty array makes `length` 3 even though only 1 finished                           |
| Why `Promise.resolve(promise)`?                  | Input can contain plain values (`[1, 2, p]`). `Promise.resolve` wraps them so `.then` works on everything |
| Why handle the empty array?                      | `forEach` never runs → `resolve` is never called → promise hangs forever                                  |
| Can `reject` be called multiple times?           | Yes, but a promise only settles ONCE. Extra `resolve` / `reject` calls are ignored                        |

---

## 5. The Promise Combinators (Compare & Contrast)

| Method                   | Resolves when                 | Rejects when                | Use it for                              |
| ------------------------ | ----------------------------- | --------------------------- | --------------------------------------- |
| **`Promise.all`**        | ALL succeed → array of values | ANY fails (fail-fast)       | Need every result (page needs all data) |
| **`Promise.allSettled`** | ALL finish (success OR fail)  | Never                       | Want every outcome, even failures       |
| **`Promise.race`**       | FIRST to settle succeeds      | FIRST to settle fails       | Timeouts                                |
| **`Promise.any`**        | FIRST to succeed              | ALL fail (`AggregateError`) | Fastest of several mirrors / servers    |

`allSettled` result shape:

```js
[
  { status: "fulfilled", value: "Users fetched!" },
  { status: "rejected", reason: "ERROR: Failed to Fetch posts" },
];
```

`MEMORY TRICK:`

- **all** → all or nothing
- **allSettled** → everyone reports back
- **race** → first to finish (win OR lose)
- **any** → first to WIN

---

## 6. Promise.allSettled() Deep Dive ⭐

Waits for **every** promise to finish, whether it succeeds or fails. It **never rejects**. You always get back an array of `{ status, value }` or `{ status, reason }` objects.

`ANALOGY:` A teacher collecting exam papers. They wait for every student to hand in, pass or fail, then look at all the results together. One failing student doesn't end the exam for everyone.

### 🎯 Say This in the Interview

> "`Promise.allSettled` runs promises **in parallel** and waits for **all of them to settle**. It **never rejects**. Each result is an object: `{ status: 'fulfilled', value }` or `{ status: 'rejected', reason }`, in the **original order**. I use it when the tasks are **independent** and one failure shouldn't throw away the others."

### all vs allSettled

| Question                     | `Promise.all`                 | `Promise.allSettled`                         |
| ---------------------------- | ----------------------------- | -------------------------------------------- |
| One promise fails?           | Rejects immediately           | Keeps waiting for the rest                   |
| Does it ever reject?         | Yes                           | **Never** (except bad input, e.g. not iterable) |
| What you get back            | `[value, value, value]`       | `[{ status, value }, { status, reason }, ...]` |
| Total time                   | Slowest, or first failure     | Always the slowest                           |
| Use it when                  | You need **every** result     | Tasks are **independent**, partial results are OK |

`REAL EXAMPLES:` a dashboard loading widgets (one broken widget shouldn't blank the page), sending notifications to many users, uploading several files and reporting which ones failed.

### Usage: Splitting Successes and Failures

```js
const results = await Promise.allSettled([fetchUsers(), fetchLikes(), fetchPosts()]);

const successes = results
  .filter((r) => r.status === "fulfilled")
  .map((r) => r.value);

const failures = results
  .filter((r) => r.status === "rejected")
  .map((r) => r.reason);

console.log(`${successes.length} ok, ${failures.length} failed`);
```

### Write Your Own (Polyfill)

Same skeleton as `promiseAll`, with two changes:

1. **No `reject`.** Failures are stored as results, not passed on.
2. **Both outcomes count as "done".** That's why the counter goes in `.finally`.

```js
function promiseAllSettled(promises) {
  return new Promise((resolve) => {
    const list = Array.from(promises);
    const results = [];
    let done = 0;

    if (list.length === 0) return resolve(results);

    list.forEach((promise, i) => {
      Promise.resolve(promise)
        .then(
          (value) => (results[i] = { status: "fulfilled", value }),
          (reason) => (results[i] = { status: "rejected", reason }),
        )
        .finally(() => {
          done++;
          if (done === list.length) resolve(results);
        });
    });
  });
}
```

**Short version, built on `Promise.all`** (a good follow-up answer):

```js
const promiseAllSettled = (promises) =>
  Promise.all(
    Array.from(promises, (p) =>
      Promise.resolve(p).then(
        (value) => ({ status: "fulfilled", value }),
        (reason) => ({ status: "rejected", reason }),
      ),
    ),
  );
```

`WHY IT WORKS:` each promise is turned into one that **always fulfills** with a status object. `Promise.all` never sees a rejection, so it never fails fast.

### Why Questions on the allSettled Polyfill

| Question                                                  | Answer                                                                                                     |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Why does the inner Promise only take `resolve`?           | `allSettled` never rejects, so `reject` is never needed                                                     |
| Why `.then(onFulfilled, onRejected)` instead of `.catch`? | Both handlers sit at the same level, so you know which one ran. `.then().catch()` would also catch an error thrown **inside** the success handler |
| Why put `done++` in `.finally`?                           | `.finally` runs for **both** outcomes, so you don't repeat the counter code in two places                  |
| Why `value` for success but `reason` for failure?         | That's the spec. Interviewers notice if you use `error` or `value` for both                                |
| Is `"fulfilled"` spelled right?                           | Double check: **f-u-l-f-i-l-l-e-d**. A typo means `r.status === "fulfilled"` checks silently fail         |

### allSettled Gotchas

- **`try/catch` won't catch the failures.** `await Promise.allSettled(...)` doesn't throw when a promise fails. You must check `status` yourself
- **No fail-fast.** If one request fails at 100ms and another takes 10s, you still wait 10s
- **Not cancelled either.** Like `Promise.all`, it doesn't stop any promise. It just waits
- **Order is kept.** Results follow the input order, not the finish order (same as `Promise.all`)
- **Empty array** → resolves right away with `[]`
- **Newer feature (ES2020).** Very old browsers need a polyfill, which is exactly why interviewers ask you to write one

---

## 7. Promise.race() Deep Dive ⭐

Runs promises **at the same time** and settles with whichever one **settles first**, success OR failure. Everything else is ignored.

`ANALOGY:` A real race. The first runner across the line decides the result. If the first runner trips and falls (rejects), the race is lost, even if the others would have finished fine.

### 🎯 Say This in the Interview

> "`Promise.race` returns a promise that settles **the same way as the first input promise to settle**. If the first one fulfills, race fulfills with that value. If the first one rejects, race rejects with that reason. The classic use is a **timeout**: race the real request against a timer that rejects."

### Timeline

```
fetchUsers  ──────────3s──────────✅
fetchLikes  ────1s────✅                → .then("likes value") at ~1s
fetchPosts  ──────2s──────❌               (users and posts are ignored)
```

If `fetchPosts` failed at **0.5s** instead, race would **reject** at 0.5s, even though likes succeeds later.

### race vs any (most common mix-up)

| Question                       | `Promise.race`                    | `Promise.any`                               |
| ------------------------------ | --------------------------------- | ------------------------------------------- |
| Settles on                     | First to **settle** (win OR lose) | First to **fulfill** (win only)             |
| First promise rejects?         | race **rejects**                  | Ignored, keeps waiting for a success        |
| When does it reject?           | When the first settler rejects    | Only when **all** reject (`AggregateError`) |
| Use it for                     | Timeouts                          | Fastest working server / mirror             |

### The Classic Use: Timeout

```js
const timeout = (ms) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms),
  );

try {
  const users = await Promise.race([fetchUsers(), timeout(2000)]);
  console.log(users);
} catch (err) {
  console.error(err.message); // "Timed out after 2000ms" if fetch was too slow
}
```

`NOTE:` the timeout only stops **you from waiting**. The real request keeps running in the background. To truly cancel a `fetch`, use an `AbortController`.

### Write Your Own (Polyfill)

The shortest polyfill of the bunch. No results array, no counter, no index.

```js
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    Array.from(promises).forEach((promise) =>
      Promise.resolve(promise).then(resolve, reject),
    );
  });
}
```

`WHY IT WORKS:` every promise is wired to the **same** `resolve` and `reject`. The first one to call either wins. Every later call is ignored, because a promise can only settle **once**.

### Why Questions on the race Polyfill

| Question                                     | Answer                                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Why no results array or counter?             | race only cares about ONE result, the first. Nothing to collect, nothing to count                     |
| How do the "losers" get ignored?             | They still call `resolve` / `reject`, but the promise is already settled, so those calls do nothing   |
| Why `Promise.resolve(promise)`?              | Same as before: handles plain values like `promiseRace([1, p])`                                        |
| Why `.then(resolve, reject)`?                | Passes the value or reason straight through. No need for `(v) => resolve(v)` wrappers                  |
| What about an empty array?                   | **No early return on purpose.** The spec says `Promise.race([])` stays **pending forever**            |

### race Gotchas

- **Empty array hangs forever.** `Promise.race([])` never settles. This is the opposite of `all` / `allSettled`, which resolve with `[]`
- **A fast failure beats a slow success.** If you want the first *success*, use `Promise.any`
- **Losers are not cancelled.** They keep running, their results are just thrown away
- **Plain values win instantly.** `Promise.race([1, slowPromise])` resolves with `1`, because a plain value is already resolved
- **Already-settled promises:** if two inputs are already settled, the one **earlier in the array** wins, because `forEach` attaches handlers in order

---

## 8. Common Follow-ups & Gotchas

- **Sequential vs parallel** → `await a(); await b(); await c();` takes 1s + 1s + 1s = **3s**. `await Promise.all([a(), b(), c()])` takes **1s**. Only use sequential when one call needs the result of another
- **"I want partial results even if one fails"** → use `Promise.allSettled`
- **Timeout for Promise.all** → `Promise.race([Promise.all([...]), timeout(5000)])`
- **Concurrency limit** → `Promise.all` starts EVERYTHING at once. 1000 requests = 1000 at once. Senior follow-up: "limit to 3 at a time" (a promise pool)
- **Empty array** → `Promise.all([])` resolves immediately with `[]`
- **Non-promise values** → `Promise.all([1, "a", p])` works; plain values are treated as already resolved
- **Error shape** → `.catch` gets the **first** rejection reason only, not all errors

---

## 9. Quick Self-Test (try in `promise-all.js`)

1. All `success = true` → logs all three after ~1s
2. Set `success = false` in `fetchPosts` → only the error logs, no data
3. Delays users 3s / likes 1s / posts 2s → output order still users, likes, posts; takes ~3s
4. Two failures with different delays → only the **first to fail** reaches `.catch`
5. Swap `Promise.all` for `Promise.allSettled` with one failure → see every result with `status`
6. Make **all three** fail with `allSettled` → `.catch` / `try-catch` still doesn't run; every result is `"rejected"`
7. Run your `promiseAllSetteled` and the built-in side by side on the same input → the output should match exactly
8. `Promise.race` with likes 1s ✅, posts 2s ❌ → resolves with likes' value at ~1s
9. Same race, but make posts fail at 0.5s → race **rejects** with posts' error, even though likes succeeds later
10. `Promise.race([])` → nothing ever logs (it stays pending forever)
