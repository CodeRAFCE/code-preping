"use strict";

//=======================================================================================
//* Class Basics

class AClass {
  constructor() {}

  method() {} //? Action or Behaviour
}

const a = new AClass(); //? created a instance of the class
const b = new AClass(); //? created a instance of the class

//* Both these logs might instantiate the same class but we are creating two different instances
//* Each `new` call allocates a new object at a different memory address
console.log(a);
console.log(b);

//? === compares object references (memory addresses), not contents
//? a and b are two separate objects, like two houses built from the same blueprint
//! so even though they look identical, they live at different memory addresses
console.log(a === b); //? => false

//? If we did: const c = a
//? then c === a would be true, because c and a point to the SAME object in memory

//=======================================================================================
//* this Keyword in Classes

class Car {
  constructor(model) {
    this.model = model;
  }

  printThis() {
    console.log(this);
  }

  printModel() {
    console.log(this.model);
  }
}

console.log(typeof Car); //? => outputs "function"
//? accessing methods we can new Car("BMW").prototype

const bmw = new Car("BMW");

//? this keyword alway refers to the instance of the object create by classes
console.log(bmw.printThis());

const fn = bmw.printThis;
//! this keyword is detached from the object
fn(); //! => undefined (in scrict mode) or global object

//? Regular function detached from object + strict mode → this is undefined
//? Arrow function → this is whatever the enclosing lexical scope's this was — strict mode has no effect on it
const func = () => {
  console.log(this); //? points to the window object or undefined (strict mdoe)
};

func();

//=======================================================================================
//* Class Expressions

//? Class as expressions similar to function expressions
const Vehicle = class {
  constructor() {}

  welcome() {
    console.log("Welcome!");
  }
};

const car = new Vehicle();
car.welcome();

//? We also have named class as expressions
const Company = class Comp {
  constructor() {}
  welcome() {
    console.log("Welcome!");
  }
};

//? How to create instance of the previous class?
//! new Comp()❌ => new Company()✅

const company = new Company();
company.welcome();

//=======================================================================================
//* Class Fields
class Phone {
  //? can access using => this.brand => think of how this works in objects
  brand = "Apple"; //? writing this is equal to writing this.brand inside constructor

  make() {
    console.log(this.brand);
  }
}

const phone = new Phone();
console.log(phone, "This is the Phone Object");
phone.make();

//=======================================================================================
//* Getters & Setters => are the methods used to get the value and set the value of the property
//? These are at the method levels

class Animal {
  constructor(name) {
    //? this.name = triggers the setter below, not a plain assignment
    //? setter runs first (gatekeeper), then stores in this._name on the heap
    this.name = name;
  }

  //? getter: intercepts reads → animal.name triggers this
  //? conventionally named same as the property it exposes (name → obj.name)
  //? uses _name as backing store to avoid recursive call
  //! return this.name ❌ => triggers getter again → infinite loop → stack overflow
  get name() {
    return this._name; //? reads from heap: object { _name: "Tiger" }
  }

  //? setter: intercepts writes → this.name = "x" triggers this
  //? runs BEFORE the value is stored — use it to validate or transform
  set name(value) {
    // example: if (!value) throw new Error("Name cannot be empty");
    this._name = value; //? actual storage on the object in heap memory
  }
}

const animal = new Animal("Tiger");
console.log(animal.name); //? output => Tiger

//=======================================================================================
//* Static Property
//? static => belongs to the CLASS itself, not to any instance
//! access via ClassName.prop, NOT via obj.prop (that returns undefined)

class Circle {
  //? class-level constant — shared, no need to duplicate on every instance
  static pi = 3.14;

  //? static method — utility that doesn't need instance data
  //? this inside a static method refers to the CLASS (Circle), not an instance created by new
  static area(radius) {
    return this.pi * radius * radius; //? this === Circle here
  }

  static printThis(radius) {
    //? in a normal (instance) method => this === the object created by new
    //! in a static method          => this === Circle (the class itself)
    return console.log(this);
  }
}

Circle.pi; //? ✅ 3.14 — accessed on the class
Circle.area(10); //? ✅ 314

const c = new Circle();
//! c.pi     // ❌ undefined — static props are not on the instance
//! c.area() // ❌ TypeError — static methods are not on the instance

//=======================================================================================
//* Static Methods — utility/factory methods on the class itself

class User {
  contructor(name, email) {
    this.name = name;
    this.email = email;
  }

  //? instance method — called on an object, this === the instance
  greet() {
    console.log(`Hi ${this.name}`);
  }

  //? static utility method — validates input without needing an instance
  //! called as User.isValidEmail(...), not user.isValidEmail(...)
  static isValidEmail(email) {
    return email.includes("@") && email.includes(".");
  }

  //? static factory method
  //? ==> design pattern: factory method is a approch throught which you can -
  //? - create different instances based on different value that you supply to them

  // ADD REAL WORLD EXAMPLE ===> "Claude should give"
  //? Real world: think of a "Continue as Guest" button on a checkout page
  //? instead of forcing the caller to know the default guest values every time,
  //? User.createGuest() centralises that logic — one place to update if defaults change
  //? User.createAdmin() ===> // pre-configured admin user
  //? User.fromJSON(data) ===> // creates instance from a JSON object
  //? Date.now() ===> // returns current timestamp (factory-style)
  //? Promise.resolve(value) ===> // creates a resolved promise

  static createGuest() {
    return new User("Guest", "guest@email.com");
  }
}

const user = new User("Seshan", "seshh@gmail.com");
user.greet(); //? output => Hi Seshan

//! ❌ user.isValidEmail("seshh@gmail.com"); ====> you can't access like this
User.isValidEmail("seshh@gmail.com"); //? ✅ valid invoke of the static method output => true

//=======================================================================================
//? Public & Private
//? Public => these fields and methods are accessible from anywhere
//? Private => these fields and methods are accessible only from the inside of the class.
//* Usefull to create => Abstraction, Encapsulation

//? We only want to expose how to operate a WashingMachine
//? How to turn on/off, Put washing powder.
//? The Below Example is a Encapsulation: Restricting direct access to the private data & method
class WashingMachine {
  //public field
  brand;

  //private field
  #powerStatus = false;
  #currentCycle = null;

  constructor(brand) {
    this.brand = brand;
  }

  start(cycle) {
    if (!this.#powerStatus) {
      this.#turnOn();
    }
    this.#currentCycle = cycle;

    console.log("Starting cycle" + cycle);

    // spin, drain, stop
    this.#spin();
    this.#drain();
    this.stop();
  }

  stop() {
    // turn off => machine
    this.#turnOff();
    console.log("Machine stopped");
  }
  //? # is the JavaScript syntax for truly private fields and methods.
  //? They are only accessible inside the class body
  #turnOn() {
    this.#powerStatus = true;
    console.log("Power On");
  }
  #turnOff() {
    this.#powerStatus = false;
    console.log("Power Off");
  }
  #spin() {
    console.log("Spinning...");
  }
  #drain() {
    console.log("Draining...");
  }
}

const lgWasher = new WashingMachine("LG");

// console.log(lgWasher);
lgWasher.start("Quick Wash");
lgWasher.brand;
// lgWasher.#powerStatus;
// lgWasher.#turnOn(); ==> Syntax Error

//=======================================================================================
//* Extending...
//? Inheritance: Allowing a child class to access the the methods and data from parent class
//? keyword => extends

class Human {
  species = "Homo Sapiens";

  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    console.log(`Hi ${this.name}`);
  }

  sleep() {
    console.log(name + "is Sleeping...");
  }
}

class Student extends Human {
  constructor(name, age, grade) {
    //? super => Calls the constructor function of the parent class
    super(name, age);
    this.grade = grade;
  }

  //? Overide a method from the parent class
  //? this is where you bring Polymorphism

  //? Polymorphism => Allowing different objects to respond the same method -
  //? - call in their own unique way based on their specfic context
  greet() {
    console.log(
      `Hi, i'm ${this.name}, ${this.age} years old and studying in ${this.grade}`,
    );
  }

  study() {
    console.log(this.name + "is studying...");
  }
}

class Teacher extends Human {
  constructor(name, age, subject) {
    super(name, age);
    this.subject = subject;
  }

  greet() {
    console.log(
      `Hi, i'm ${this.name}, ${this.age} years old and teaching ${this.subject}`,
    );
  }

  teach() {
    console.log(this.name + "is teaching...");
  }
}

const alice = new Student("Alice", 4, "8th Grade");
alice.greet();
alice.study();

const Bob = new Student("Bob", 5, "9th Grade");
Bob.greet();
Bob.study();
