//* Composition
//? Definition => use of other classes to build functionality

//? Composition vs Inheritance:
//? Inheritance  => ElectricCar IS-A Car (extends)
//? Composition  => Car HAS-A Engine (contains an instance of another class)
//? Prefer composition when the relationship is "has a" not "is a"

class Engine {
  start() {
    console.log("Engine Started");
  }
}

class Car {
  constructor() {
    this.engine = new Engine(); //? Composing — Car owns an Engine instance
    //? Car delegates engine behaviour to the Engine class instead of inheriting it
  }

  startCar() {
    this.engine.start(); //? delegating to the composed Engine object
    console.log("Driving...");
  }
}

const car = new Car();
car.startCar();
