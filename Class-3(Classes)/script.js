class Pizaa {
  constructor(size, toppings, preference, crust) {
    this.size = size;
    this.toppings = toppings;
    this.preference = preference;
    this.crust = crust;
  }

  serve() {
    console.log(`This is a ${this.size} Pizza from parent `);
  }
}

class StuffedCrustPizaa extends Pizaa {
  constructor(size, toppings, preference, crust, stuffing) {
    super(size, toppings, preference, crust);
    this.stuffing = stuffing;
  }

  test() {
    console.log("test");
  }

  describe() {
    super.serve();
  }
}

const order1 = new Pizaa("Medium", ["Tomato , Cheese"], "Veg", "Thin");
console.log(order1);

const order2 = new StuffedCrustPizaa(
  "small",
  ["mushrooms", "cheese"],
  "Veg",
  "Thick",
  "Mozarella"
);

console.log(order2);

order1.serve();
order2.describe();

// Classcial Inhertance in JS (prototypal)
