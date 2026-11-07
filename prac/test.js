const debounce = (fn, delay, { leading = true, trailing = true } = {}) => {
  let timer, lastArgs, lastThis;
  return function (...args) {
    const callNow = leading && !timer;

    if (callNow) {
      fn.apply(this, args);
    } else {
      lastArgs = args;
      lastThis = this;
    }

    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      //   if (!leading) fn.apply(this, args);
      if (trailing && lastArgs) fn.apply(lastThis, lastArgs);
      lastArgs = lastThis = undefined;
    }, delay);
  };
};

const log = (num) => console.log("Testing debounce...", num);

const d = debounce(log, 1000);

d(1);
d(2);
d(3);
setTimeout(() => d(4), 2000); //

