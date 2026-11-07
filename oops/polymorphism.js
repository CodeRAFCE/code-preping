//* Polymorphism
//? Definition => Methods behave differently based on object type

class Car {
  drive() {
    console.log("Driving on fuel...");
  }
}

//? ElectricCar overrides the drive() method from Car
//? same method name, different behaviour — that's polymorphism
class ElectricCar extends Car {
  drive() {
    console.log("Driving on electricity...");
  }
}

//? both objects respond to drive(), but each behaves differently
//? the caller doesn't need to know which type it is — just call drive()
const myCars = [new Car(), new ElectricCar()];
myCars.forEach((car) => car.drive());
//? output:
//? Driving on fuel...
//? Driving on electricity...

//
