function savefn(name) {
  console.log("My name is", name);
}

const debounce = (fn, delay, { leading = false, trailing = true } = {}) => {
  let timer, lastArgs, lastThis, value;

  function debounced(...args) {
    const callNow = leading && !timer;

    if (callNow) {
      value = fn.apply(this, args);
    } else {
      lastArgs = args;
      lastThis = this;
    }

    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;

      if (trailing && lastArgs) value = fn.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
    }, delay);

    return value;
  }

  debounced.cancel = () => {
    clearTimeout(timer);
    timer = lastArgs = lastThis = null;
  };

  debounced.flush = () => {
    if (timer === undefined) return;
    clearTimeout(timer);
    timer = undefined;

    if (!lastArgs) return;
    value = fn.apply(lastThis, lastArgs);
    lastArgs = lastThis = null;
    return value;
  };

  return debounced;
};

// const user = {
//   name: "Sam",
//   save: debounce(saveWithDebounce, 1000),
// };

// const debounceFn = debounce(savefn, 500, { leading: true });

// // JS doesn't wait timer to finish
// debounceFn("se"); // -> Leading call timer = false so callNow is true because of !timer | 0ms lastArgs & lastThis = null

// debounceFn("sh"); // -> 100ms timer = true so callNow is false you lastArgs will be "sh" and clearTimout() will remove prev timer that was created during the first call
// debounceFn("an"); // -> 300ms timer = true & callNow = false and lastArgs = "an" so sh is skipped and after 500ms your se and an is printed

console.log(
  "==================================================================",
);
// const d = debounce(savefn, 500, { leading: true });
// d("a");
// d.flush(); // Pretend timer is done
// d("b"); // b will be lead again
// d("c"); // skipped
// d("f");
// d.flush(); // expect: b (leading), c (flushed)

// d("B");
// d("C");
// d.flush();
// d("X");
// B -> 0ms C -> 0ms

const double = (n) => n * 2;
const d = debounce(double, 500);

// this prints undefined unless you return a value when a function return something

//* because the value is in a timer of 500ms yet to be executed JS doesn't wait for the timer.
//* the first log prints undefined
console.log(d(5)); // A => undefined
//* once the 500ms passed your scope remembers the value and executes the d(5) and prints 10
//* So d(7) = 14 doesn't have anyone to receive a value
//* this is a bug even in loadash solution is to use a promise to wait for the result to come
setTimeout(() => console.log(d(7)), 1000); // B
