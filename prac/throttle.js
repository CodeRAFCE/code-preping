const save = (value) => console.log("saved", value);

const throttle = (fn, delay) => {
  let canRun = false;
  let lastArgs, lastThis;

  function startCoolDown() {
    setTimeout(() => {
      if (lastArgs) {
        fn.apply(lastThis, lastArgs);
        lastArgs = lastThis = null;
        startCoolDown();
      } else {
        canRun = false;
      }
    }, delay);
  }

  return function (...args) {
    if (canRun) {
      lastArgs = args;
      lastThis = this;
      return;
    }

    canRun = true;
    fn.apply(this, args);
    startCoolDown();
  };
};

const t = throttle(save, 1000);
// t(0); //canRun will be true untill 1000ms has passed
// setTimeout(() => t(300), 200); // saves 300 as lastArgs lead fn does not run and exits the inner fn
// setTimeout(() => t(800), 500); // saves 800 as lastArgs lead fn does not run again - once the remaining 500ms is passed it will print the lastArgs = 800

// With CoolDown
t(0); //  0ms prints immediatly,canRun is true & lastArgs is undefined else runs with canRun = false which opens the gate
setTimeout(() => t(800), 500); //
setTimeout(() => t(900), 1050);

/**
 * * OUTPUT
 * saved 0
 *
 */
