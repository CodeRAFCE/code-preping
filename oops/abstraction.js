//* Abstraction
//? Hiding internal complexity of the data & method And only only expsoing the necessary features for the user to interact

class Car {
  //? public method — the only thing the user needs to know about
  //? internally calls private methods, but the caller never sees that
  startEngine() {
    this.#injectFuel();
    this.#ignite();
    console.log("Engine Started");
  }

  //? private — hidden implementation detail, not part of the public interface
  #injectFuel() {
    console.log("Fuel Injected");
  }

  //? private — same as above, internal step not exposed to the outside
  #ignite() {
    console.log("Engine Ignite");
  }
}

const car = new Car();
car.startEngine(); //? ✅ user only interacts with the public method
//! car.#injectFuel(); => Sytax Error ❌❌❌❌ — private, enforced by the language
