const fetchUsers = new Promise((resolve, reject) => {
  const success = true;
  setTimeout(() => {
    if (success) {
      resolve("Users fetched!");
    } else {
      reject("ERROR: Failed to Fetch users");
    }
  }, 1000);
});

const fetchPosts = new Promise((resolve, reject) => {
  const success = true;
  setTimeout(() => {
    if (success) {
      resolve("Posts fetched!");
    } else {
      reject("ERROR: Failed to Fetch posts");
    }
  }, 1000);
});

const fetchLikes = new Promise((resolve, reject) => {
  const success = true;
  setTimeout(() => {
    if (success) {
      resolve("Likes fetched!");
    } else {
      reject("ERROR: Failed to Fetch likes");
    }
  }, 1000);
});

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
