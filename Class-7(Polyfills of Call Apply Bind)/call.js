// console.log(globalThis);

let person1 = {
  name: "Adam",
  greet(city, country) {
    console.log(this.name + " " + city + " " + country);
  }
};

// greet.call(person2, "Mumbai", "India");

// There is no Native implementaion of call

// Polyfill for the call Method

let person2 = {
  name: "Steve",
};



Function.prototype.myCall = function (context, ...args) {
  // Edge Cases

  // context is null or undefined
  context = context || globalThis;

  // this - greet
  // person2 -> tempFn -> greet
  // person2.greet(...args)
  context.tempFn = this;
  const result = context.tempFn(...args);
  delete context.tempFn;
  return result;
};

person1.greet.myCall(person2, "Bengaluru", "India");
