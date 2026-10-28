const fetchUsers = new Promise((resolve, reject) => {
  const success = true;
  setTimeout(() => {
    if (success) {
      resolve("Users fetched!");
    } else {
      reject("ERROR: Failed to Fetch users");
    }
  }, 3000);
});

const fetchPosts = new Promise((resolve, reject) => {
  const success = true;
  setTimeout(() => {
    if (success) {
      resolve("Posts fetched!");
    } else {
      reject("ERROR: Failed to Fetch posts");
    }
  }, 2000);
});

const fetchLikes = new Promise((resolve, reject) => {
  const success = true;
  setTimeout(() => {
    if (success) {
      resolve("Likes fetched!");
    } else {
      reject("ERROR: Failed to Fetch likes");
    }
  }, 5000);
});

//* Basic Usage on Promise.all()
//#region
//* Each fetch is a Object since we use new Promise() that is Instantiated
//* Destructuring users, likes, posts should be order which we passed in .all()
//* It will return an ERROR when the First promise that fails from the array
//* Even after one fails, the other promises aren't cancelled. Their results are just ignored.
Promise.all([fetchUsers, fetchLikes, fetchPosts])
  .then(([users, likes, posts]) => {
    console.log("Fetched Users Data", users);
    console.log("Fetched Likes Data", likes);
    console.log("Fetched Posts Data", posts);
  })
  .catch((err) => console.error("The First Promise that failed", err));

//* ASYNC/AWAIT style
const fetchAll = async () => {
  try {
    const [users, likes, posts] = await Promise.all([
      fetchUsers,
      fetchLikes,
      fetchPosts,
    ]);

    console.log("Fetched Users Data", users);
    console.log("Fetched Likes Data", likes);
    console.log("Fetched Posts Data", posts);
  } catch (error) {
    console.error("The First Promise that failed", error);
  }
};
//#endregion

//* Polyfill of Promise.all()
//#region
//* This code reveals how promise is
//* In reality Promise.all() returns a Promise
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    //* Accepts any iterables not just arrays
    //* This line turns whatever you were given into a normal array so the rest of the code can rely on .length and .forEach.
    //* Array.from() is a static JavaScript method that creates a new, shallow-copied Array
    //* transform structures like strings, sets, maps, and DOM NodeLists into standard arrays
    const list = Array.from(promises); // Transforms into standard array
    const results = []; //storing the resolved results
    let done = 0; //* Why Counter?
    //* Beacuse an array [<empty>, <empty>, "value"] the length is still 3
    //* So we use counter to track when it's done

    if (list.length === 0) return resolve(results); // Return emtpy array in case items are empty

    list.forEach((item, i) => {
      Promise.resolve(item).then((value) => {
        //* storing by postion will maintain the order
        //* Mistake is not use .push() which push the first promise which is resolved to the result
        results[i] = value; // Store by position, not by finish line

        done++;
        if (done === list.length) resolve(results);
      }, reject);
    });
  });
}

/**

    The four things interviewers check
    These are what actually get tested, so here’s each in simple terms.

    1. Order comes from the index, not finishing time. If the second promise finishes first, its result still goes in slot 2. That’s why we use results[i] = value instead of results.push(value). Using push is the most common mistake.
    2. Count finished promises with a counter, not results.length. This one is sneaky. If promise #3 finishes first, results[2] = value makes the array’s length 3 even though only one promise is done. JavaScript fills the empty slots with holes. So you need a separate done counter.
    3. Empty input resolves right away. With an empty array, forEach never runs, so nothing would ever call resolve, and the promise would hang forever. The early return resolve([]) handles that.
    4. Plain values are allowed. Promise.all([1, fetchUser()]) is valid. Wrapping each item in Promise.resolve(item) turns plain values into already-resolved promises, so everything is handled the same way.

    Bonus: passing reject directly as the error handler gives you fail-fast behavior for free. Calling reject again later does nothing, because a promise can only settle once.

*/

//#endregion

//* Basic Usage on Promise.allSettle()
//#region
//* .then().catch() version
//* It is a patient version of Promise.all()
//* it waits for every promise to finish, whether it succeeds or fails and nevers rejects you get back a report for each

/**
 * * Each entry in the results looks like one of these:
 * * { status: "fulfilled", value: ... }   // it succeeded
 * * { status: "rejected",  reason: ... }  // it failed
 */

Promise.allSettled([fetchUsers, fetchPosts, fetchLikes])
  .then(([users, posts, likes]) => {
    console.log("Users Fetched", users);
    console.log("Posts Fetched", posts);
    console.log("Likes Fetched", likes);
  })
  .catch((err) => console.error("ERROR: Failed to fetch all", err));

//* ASYNC/AWAIT version
const fetchAllSettled = async () => {
  try {
    const results = await Promise.allSettled([
      fetchUsers,
      fetchPosts,
      fetchLikes,
    ]);

    results.forEach((r) => {
      if (r.status === "fulfilled") console.log("SUCCESS:", r.value);
      else console.log("ERROR:", r.reason);
    });
  } catch (error) {
    console.error("ERROR: Failed to fetch all", error);
  }
};
//#endregion

//* Polyfill of Promise.allSettled()
//#region
function promiseAllSetteled(promises) {
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
          if (done === list.length) return resolve(results);
        });
    });
  });
}

//#endregion

//* Basic Usage on Promise.race()
