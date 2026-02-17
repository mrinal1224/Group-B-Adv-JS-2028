class Pizaa {
  constructor(size, toppings, preference, crust) {
    this.size = size;
    this.toppings = toppings;
    this.preference = preference;
    this.crust = crust;
  }


  serve() {
    console.log(`This is a ${this.size} Pizza `);
  }
}

class StuffedCrustPizaa extends Pizaa {
  constructor( toppings, preference, crust, stuffing) {
    super(undefined, toppings, preference, crust);
    this.stuffing = stuffing;
    delete this.size
  }
}

const order1 = new Pizaa("Medium", ["Tomato , Cheese"], "Veg", "Thin");

const order2 = new StuffedCrustPizaa(
  ["mushrooms", "cheese"],
  "Veg",
  "Thick",
  "Mozarella"
);

console.log(order1);

console.log(order2);

order1.serve();

// Classcial Inhertance in JS (prototypal)
