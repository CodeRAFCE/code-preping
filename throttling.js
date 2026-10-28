//* "Run now, then ignore every call until X ms have passed."

//* Helper to see throttle in action
//#region
// Fires the given fn every 100ms for ~1s (11 calls) - like a user scrolling non-stop
const start = Date.now();
const elapsed = () => `${Date.now() - start}ms`.padStart(6);

const simulateCalls = (throttledFn, label) => {
  let callNo = 1;
  const spam = setInterval(() => {
    throttledFn(`call ${callNo}`);
    // pre-increament ++callNo ->
    if (++callNo > 11) clearInterval(spam);
  }, 100);
  console.log(`--- ${label} ---`);
};

const onScroll = (msg) => {
  console.log(`${elapsed()}  ✅ ran with ${msg}`);
};
//#endregion

//* 1. Basic throttle with timestamps (Date.now)
//#region
// * Remember WHEN we last ran. On every call, check: has enough time passed?
// * Yes -> run & update the time. No -> drop the call.
// * No timers at all, just math.
const throttle = (fn, delay) => {
  let lastRun = 0; // lives in the closure, remembered across calls

  return function (...args) {
    const now = Date.now();

    // First run => now - 0 >= delay
    if (now - lastRun >= delay) {
      lastRun = now; // start a new "locked" window
      fn.apply(this, args);
    }
    // else: still locked, the call is ignored (NOT queued)
  };
};

const myThrottle = (fn, delay) => {
  let lastRun = 0;

  return function (...args) {
    const now = Date.now(); //Running since 1970 so milliseconds is huge

    if (lastRun - now >= delay) {
      lastRun = now;
      fn.apply(this, args);
    }
  };
};
// simulateCalls(throttle(onScroll, 300), "Timestamp throttle");
//#endregion

//* 2. Throttle with a flag + setTimeout
//#region
// * Same idea, different tool: a boolean "door" instead of a timestamp.
// * Run -> close the door -> setTimeout opens the door after delay.
// * While the door is closed, calls are ignored.
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

// * Leading Edge Throttle
// * My Version
const throttleWithTimeoutLeading = (fn, delay) => {
  let canRun = true;

  return function (...args) {
    if (canRun) {
      //* When a function throws an error "throw new Error()"
      //* fn is exited immediately and canRun = false is not executed and throttle is broken here
      //* The fix is to close the door before calling fn
      //* So move the fn at the end
      //   fn.apply(this, args);
      canRun = false;

      // Delay is scheduled
      setTimeout(() => {
        canRun = true; // open the door again "Schedule"
      }, delay);

      fn.apply(this, args);
    }
  };
};

// simulateCalls(throttleWithTimeout(onScroll, 300), "Flag + setTimeout throttle");
//#endregion

//* 3. Throttle with setInterval
//#region
// * Think of setInterval as a "clock" that ticks every delay ms.
// * First call -> run now & start the clock.
// * Calls between ticks -> just remember the LATEST one (overwrite).
// * On each tick -> if someone called, run with the latest args. If nobody called, stop the clock.
// * Bonus: the last call is never lost (this is leading + trailing behaviour).
const throttleWithInterval = (fn, delay) => {
  let intervalId = null;
  let lastArgs = null; // shared, so the tick can see them
  let lastThis = null;

  return function (...args) {
    if (intervalId) {
      // clock already ticking, save this call for the next tick
      lastArgs = args;
      lastThis = this;
      return;
    }

    fn.apply(this, args); // leading: run the first call right away

    intervalId = setInterval(() => {
      if (lastArgs) {
        fn.apply(lastThis, lastArgs); // trailing: run the latest saved call
        lastArgs = lastThis = null;
      } else {
        // a full tick with no calls = user stopped, so stop the clock
        clearInterval(intervalId);
        intervalId = null;
      }
    }, delay);
  };
};

simulateCalls(throttleWithInterval(onScroll, 300), "setInterval throttle");
//#endregion

//* Throttle with Trailing edge
//#region

const trailingEdgeThrottle = (fn, delay) => {
  let timeout, lastArgs, lastThis;

  return function (...args) {
    lastArgs = args;
    lastThis = this;

    if (!timeout) {
      timeout = setTimeout(() => {
        fn.apply(lastThis, lastArgs);
        timeout = null;
      }, delay);
    }
  };
};

//#endregion
