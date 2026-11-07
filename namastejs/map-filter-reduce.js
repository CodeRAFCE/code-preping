const users = [
  { name: "Alex", age: 25, active: true },
  { name: "John", age: 17, active: false },
  { name: "Sara", age: 30, active: true },
];

//Using filter and map together
// — get the names of all active users who are 18 or older.

const data = users.filter((user) => user.age >= 18 && user.active === true);
const mappedData = data.map((user) => user.name);
console.log(mappedData);

const reducedVersion = users.reduce((acc, curr) => {
  if (curr.age >= 18 && curr.active === true) {
    acc.push(curr.name);
  }
  return acc;
}, []);

console.log(reducedVersion);

const grouped = users.reduce(
  (acc, curr) => {
    const key = curr.active;
    const age = curr.age;

    // Bracket Notation for accessing the key in the
    // object assigning a new value for the Key
    if (!acc[key]) acc[key] = { names: [], totalAge: 0 };

    // since the acc[key] we initialized as an [] as the value
    // we can push the required data inside.
    acc[key].names.push(curr.name);
    acc[key].totalAge += age;

    if (curr.active === true) {
      acc.totalAge += age;
    }

    // Alway return
    return acc;
  },
  { totalAge: 0 },
);

console.log(grouped);

const totalAge = users.reduce((acc, curr) => {
  const age = curr.age;
  if (curr.active === true) {
    acc += age;
  }
  return acc;
}, 0);

console.log(totalAge);

const orders = [
  { id: 1, product: "laptop", category: "electronics", price: 999, qty: 2 },
  { id: 2, product: "phone", category: "electronics", price: 499, qty: 1 },
  { id: 3, product: "shirt", category: "clothing", price: 29, qty: 5 },
  { id: 4, product: "pants", category: "clothing", price: 49, qty: 3 },
  { id: 5, product: "tablet", category: "electronics", price: 299, qty: 1 },
];

/**
 * Desired output
 * {
 *  electronics: { totalRevenue: 2796, itemCount: 3 },
 *  clothing: { totalRevenue: 292, itemCount: 2 }
 * }
 */

const categories = orders.reduce((acc, curr) => {
  const key = curr.category;

  if (!acc[key]) acc[key] = { totalRevenue: 0, itemCount: 0 };

  const totalRevenue = curr.price * curr.qty;
  acc[key].itemCount++;
  acc[key].totalRevenue += totalRevenue;
  console.log(acc[key], key);

  return acc;
}, {});
r
structuredClone();

console.log(categories);

const underAge = users.some((u) => u.age < 18);
const checkStatus = users.every((u) => u.active === true);
const firstActiveUser = users.find((u) => u.active === true);

const arr = [10, 20, 30, 40, 50];

const sliced = arr.slice(1, 3);
const spliced = arr.splice(1, 2);

console.log(sliced); // [20, 30] because we are setting starting from index 1 and everything in between till 3 but don't include 3rd index we are returning a new
console.log(spliced); // [10, 40, 50] ? here the the arr is mutated and returns the spliced array. From index 1 we are deleting 2 items.
console.log(arr); // [10, 40, 50] since spliced is mutated the arr the spliced value
