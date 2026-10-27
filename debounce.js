//* Basic debounce with .apply() & understanding debounce without inner function
//#region
let count = 0;
const getData = (name) => {
  console.log(`Fetching data for ${name}...`, count++);
};

const test = () => {
  console.log("Testing with no inner fn");
};

const debounceWithoutInnerFunction = (fn, delay) => {
  let timer;

  console.log(`--- New Function Call ---`);
  console.log(`🔍 Before clearing: timer value is [${timer}]`);

  // This does nothing because timer is always undefined right here!
  clearTimeout(timer);
  // Capture the actual unique ID JavaScript assigns to this background task
  timer = setTimeout(() => {
    console.log(`⏱️ Timer ID ${timer} successfully completed its delay!`);
    fn();
  }, delay);

  console.log(`🚀 Spawned a brand-new background task with ID: ${timer}`);
};

const debounceWithInnerFunction = (fn, delay) => {
  let timer; // Lives inside the closure, persisting across subsequent keypresses

  return function () {
    console.log(`--- New Keypress Call ---`);

    if (timer) {
      console.log(
        `🧹 SUCCESS: Found active background task! Clearing Timer ID: ${timer}`,
      );
      clearTimeout(timer); // Kills the exact running timer from the previous call
    } else {
      console.log(`🔍 First execution or no active timer found.`);
    }

    // Capture the new background task ID and save it in our persistent variable
    timer = setTimeout(() => {
      console.log(
        `⏱️ Timer ID ${timer} safely made it to the end without being cleared!`,
      );
      fn();
      timer = undefined; // Reset tracking once the function successfully runs
    }, delay);

    console.log(`🚀 Spawned a brand-new background task with ID: ${timer}`);
  };
};

const testWithInnerFunction = debounceWithInnerFunction(test, 1000);

// Why do you use a return fn?
// Think about Closures!
// Each time your function is popped out of call stack the timeout variable should be remembered so we can clear the TimerId
const debounce = (fn, delay = 1000) => {
  let timeout;
  // REST OPERATOR - Packing the args
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      // SPREAD OPERATOR - Unpacking the args
      //   fn(...args);
      // To have both args and access to this
      fn.apply(this, args);
    }, delay);
  };
};

// const debounceSearch = debounce(getData, 300);
// debounceSearch("Sam");
//#endregion

//* Adding cancel method to debounce
//#region
// * Debounce with cancel
// * Remember Funtions in JS are Objects

const debounceWithCancel = (fn, delay) => {
  let timeout;

  // inner funtion with a name
  function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  }

  // Functions are objects
  // attach a .cancel to the object
  debounced.cancel = function () {
    clearTimeout(timeout);
    timeout = undefined;
  };

  return debounced;
};

function save(text) {
  console.log("Saved: " + text);
}

const debouncedSave = debounceWithCancel(save, 1000);
debouncedSave("hello");
debouncedSave.cancel(); // nothing prints, the pending call was cancelled

debouncedSave("world"); // after 1s prints: Saved: world
//#endregion

//* Adding flush method to debounce
//#region
// * A common interview follow-up is flush, which runs the pending call immediately instead of waiting.
// * to run a fn() early, flush need the same (this & args) that the timer would have used. Right now they live inside the inner function
// * Use same closure trick as timeout: move them up into the shared scope(this & args).
const debounceWithFlush = (fn, delay) => {
  let timeout;
  let lastArgs; // shared, so flush can see them
  let lastThis;

  function run() {
    const args = lastArgs;
    const context = lastThis;
    timeout = lastArgs = lastThis = undefined;
    fn.apply(context, args);
  }

  // inner funtion with a name
  function debounced(...args) {
    lastArgs = args; // remember the latest call
    lastThis = this;
    clearTimeout(timeout);
    timeout = setTimeout(run, delay);
  }

  // Functions are objects
  // attach a .cancel to the object
  debounced.cancel = function () {
    clearTimeout(timeout);
    timeout = undefined;
  };

  debounced.flush = function () {
    if (timeout === undefined) return;
    // Timer clears before setTimeout
    clearTimeout(timeout);
    run();
  };

  return debounced;
};

function saveWithFlush(text) {
  console.log("Saved: " + text);
}

const debounceSaveWtihFlush = debounceWithFlush(saveWithFlush, 1000);
debounceSaveWtihFlush("hello");
debounceSaveWtihFlush.flush(); // prints immediately: Saved: hello
debounceSaveWtihFlush.flush(); // nothing, no call is pending

debounceSaveWtihFlush("a");
debounceSaveWtihFlush("ab");
debounceSaveWtihFlush.flush(); // prints immediately: Saved: ab (only the latest)

//#endregion

//* Leading Edge debounce - Button spam prevention
//#region
// Leading runs on the first key stroke only leaving the rest to be quiet
// "Run on the first call instead of the last" (leading)

const debounceWithLeading = (fn, delay, immediate = false) => {
  let timeout;
  return function (...args) {
    const callNow = immediate && !timeout; // no timer = frist call of a burst

    if (callNow) fn.apply(this, args); // leading mode: run right now

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null; // quite period over, reset
      if (!immediate) fn.apply(this, args); // trailing mode run at the end
    }, delay);
  };
};

//* For Leading & Trailing you need to remember the last call and save them
//* so that means take advantage of closure
const debounceWithLeadingAndTrailing = (
  fn,
  delay,
  { leading = false, trailing = true } = {},
) => {
  let timeout = null,
    lastArgs = null,
    lastThis = null;

  return function (...args) {
    const callNow = leading && !timeout;

    if (callNow) fn.apply(this, args);
    else {
      lastArgs = args;
      lastThis = this;
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      if (trailing && lastArgs) fn.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
    }, delay);
  };
};

debounceWithLeadingAndTrailing(fn, 500); // trailing only (normal debounce)
debounceWithLeadingAndTrailing(fn, 500, { leading: true, trailing: false }); // leading only (old Step 3)
debounceWithLeadingAndTrailing(fn, 500, { leading: true, trailing: true }); // leading + trailing

//#endregion
