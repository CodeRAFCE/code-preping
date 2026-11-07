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

//==========================================================================
//==========================================================================
//* Definitin:  Group related properties  and methods and restrict direct access to internal data.

class Car {
  //? private — outside code cannot read or write #speed directly
  #speed = 0;

  //? controlled write — speed can only increase via accelerate(), not arbitrary assignment
  accelerate() {
    this.#speed += 20;
  }

  //? controlled write — speed can only decrease via brake()
  brake() {
    this.#speed -= 10;
  }

  //? controlled read — exposes #speed as read-only via a getter
  //? outside code can read car.speed but cannot do car.speed = 999
  get speed() {
    return this.#speed;
  }
}

const car = new Car();
car.accelerate();
console.log(car.speed); //? ✅ reads via getter => 20
//! car.#speed = 999;   // ❌ SyntaxError — private field, no direct access

//
