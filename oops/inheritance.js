//* Inheritance
//* Child classes inherit the properties and methods from the parent class
//? Use `extends` to create a child class from a parent class
//? Child gets all public methods and properties of the parent automatically

class Car {
  constructor(make, model) {
    this.make = make;
    this.model = model;
  }

  drive() {
    console.log("driving...");
  }
}

//? ElectricCar IS-A Car — inherits drive(), make, model from Car
//? and adds its own batteryLevel property and charge() method
class ElectricCar extends Car {
  constructor(make, model, batteryLevel) {
    //? super() must be called before using `this` in a child constructor
    //? it runs the parent (Car) constructor to set up make and model
    super(make, model);
    this.batteryLevel = batteryLevel;
  }

  //? new method — only available on ElectricCar, not on Car
  charge() {
    console.log("charging...");
  }
}

const car = new ElectricCar("Tesla", "Model S", 90);
car.drive();  //? ✅ inherited from Car
car.charge(); //? ✅ defined on ElectricCar
console.log(car.make, car.model, car.batteryLevel);
