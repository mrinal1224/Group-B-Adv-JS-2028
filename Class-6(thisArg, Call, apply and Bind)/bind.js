let button = document.getElementById("showName");
console.log;

function greet(city, country) {
  console.log("Hello " + this.name + " " + city + " " + country);
}

const user = {
  name: "steve",
};

const greetUser = greet.bind(user, 'Mumbai' , );

console.log(greetUser);


button.addEventListener("click", greetUser);


// Polyfills for call apply and Bind
