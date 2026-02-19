

---

# ✅ JavaScript OOPs – Class 4

## Closures (Master Notes)

---

## Agenda of the Lecture

### What we will cover today

1. **Lexical Environment & Scope** – Foundation for understanding closures
2. **What is a Closure?** – Definition and core intuition
3. **How Closures Work** – Step-by-step execution
4. **Closure Chains** – Nested functions and scope chain
5. **Practical Use Cases** – Counter, memoization, private data
6. **Closures in Loops** – Classic interview trap
7. **Memory Considerations** – When closures can cause leaks
8. **Common Patterns & Pitfalls**

> 💡 *Goal of this class: You should be able to explain closures, predict their behavior, and use them for encapsulation and optimization.*

---

## 1. Lexical Environment & Scope

### What is Lexical Environment?

Every time a function runs, JavaScript creates a **Lexical Environment** (also called **Execution Context**). It contains:

1. **Environment Record** – All local variables, parameters, function declarations
2. **Reference to Outer Environment** – A link to the lexical environment where the function was **defined** (not where it was called)

### Lexical = "Where It Was Written"

> 🧠 **Lexical** means "related to the source code" or "where it was written." A function's scope is determined by **where it is defined** in the code, not where it is called.

```js
function outer() {
  let b = 20;
  let c = 50;

  function inner() {
    console.log(b);  // inner was DEFINED inside outer, so it can access b
  }

  return inner;
}

let fn = outer();
fn();  // Called in global scope, but still accesses b from outer!
```

`inner` was **defined** inside `outer`, so its "outer environment" is `outer`'s lexical environment. When `inner` runs (even from global scope), it can still access `b` and `c`.

---

### Scope Chain

When a variable is used, JavaScript looks for it in this order:

1. **Current function's** lexical environment
2. **Outer function's** lexical environment (where current was defined)
3. **That function's outer** environment
4. … until **global scope**
5. If not found → **ReferenceError**

```
inner()  →  looks for b
    →  not in inner
    →  look in outer (where inner was defined)
    →  found b = 20
```

---

## 2. What is a Closure?

### Definition

> 🧠 **A closure is a function that "remembers" the variables from the scope where it was created, even after that outer function has finished executing.**

### The Key Insight

Normally, when a function returns, its local variables are garbage collected. But if the returned function **still references** those variables, JavaScript keeps them alive. That "remembered" environment is the closure.

### Simple Example

```js
function createCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

let c1 = createCounter();
let c2 = createCounter();

console.log(c1());  // 1
console.log(c1());  // 2
console.log(c2());  // 1
```

**What's happening:**
- `createCounter()` runs, creates `count = 0`, returns a function
- That returned function **closes over** `count`
- When `c1()` is called, it accesses and modifies the `count` from its closure
- `c1` and `c2` each have their **own** `count` (separate closures)

---

### Another Way to Say It

> **Closure = Function + Lexical Environment it was created in**

The function "carries" its birth environment with it wherever it goes.

---

## 3. How Closures Work – Step-by-Step

### Example: Nested Closures

```js
function outer() {
  let b = 20;
  let c = 50;

  function test() {
    console.log(c);
  }

  return function inner() {
    let a = 10;
    return function inner2() {
      console.log(a);
      console.log(b);
      test();
    };
  };
}

let in1 = outer();
let in2 = in1();
in2();
```

### Execution Flow

1. **`outer()`** is called  
   - Creates: `b = 20`, `c = 50`, `test`  
   - Returns `inner` (which closes over `b`, `c`, `test`)

2. **`in1()`** (i.e., `inner()`) is called  
   - Creates: `a = 10`  
   - Returns `inner2` (which closes over `a`, and via `inner`'s scope → `b`, `c`, `test`)

3. **`in2()`** (i.e., `inner2()`) is called  
   - Looks for `a` → in `inner`'s scope → **10**  
   - Looks for `b` → in `outer`'s scope → **20**  
   - Calls `test()` → `test` looks for `c` in `outer` → **50**

**Output:**
```
10
20
50
```

### Closure Chain Diagram

```
inner2  →  closes over outer
    ├── a (from inner)
    ├── b (from outer)
    └── test (from outer)
            └── c (from outer)
```

---

## 4. Closure Chains – Nested Functions

### Rule: Inner Functions Can Access Outer Variables

Every nested function has access to its outer scope chain:

```js
function level1() {
  let x = 1;

  function level2() {
    let y = 2;

    function level3() {
      let z = 3;
      console.log(x, y, z);  // 1 2 3
    }

    return level3;
  }

  return level2;
}

let l2 = level1();
let l3 = l2();
l3();  // 1 2 3
```

`level3` can access `x`, `y`, and `z` because they're all in its scope chain.

---

## 5. Practical Use Cases

### Use Case 1: Counter (Private State)

```js
function createCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

let c1 = createCounter();
let c2 = createCounter();

console.log(c1());  // 1
console.log(c1());  // 2
console.log(c2());  // 1
```

**Why it works:**  
- `count` is in `createCounter`'s scope  
- The returned function closes over `count`  
- Each call to `createCounter()` creates a new `count` and a new closure

**Use case:** Private state, event handlers, incremental IDs

---

### Use Case 2: Memoization (Caching)

```js
function MemoizedAdd() {
  let cache = {};

  return function (n) {
    if (cache[n]) return cache[n];

    cache[n] = n + n;
    return cache[n];
  };
}

const add = MemoizedAdd();
console.log(add(5));   // 10 (computed)
console.log(add(6));   // 12 (computed)
console.log(add(6));   // 12 (from cache!)
```

**Why it works:**  
- `cache` is in `MemoizedAdd`'s scope  
- The returned function closes over `cache`  
- Repeated calls with the same `n` use the cached result

**Use case:** Expensive computations, API responses, recursive functions (e.g., Fibonacci)

---

### Use Case 3: Private Data (Encapsulation)

```js
function createBankAccount(balance) {
  let _balance = balance;  // Private - not accessible from outside

  return {
    deposit: function (amount) {
      _balance += amount;
      return _balance;
    },
    withdraw: function (amount) {
      _balance -= amount;
      return _balance;
    },
    checkBalance: function () {
      return _balance;
    }
  };
}

let acc = createBankAccount(1000);
console.log(acc.checkBalance());   // 1000
acc.deposit(500);
console.log(acc.checkBalance());   // 1500
acc.withdraw(200);
console.log(acc.checkBalance());   // 1300
// acc._balance  // undefined - can't access directly!
```

**Using with Constructor (Class-like):**

```js
function BankAccount(balance) {
  let _balance = balance;  // Private - closure

  function showDetails() {
    return _balance;
  }

  this.deposit = function (amount) {
    _balance += amount;
    return _balance;
  };

  this.withdraw = function (amount) {
    _balance -= amount;
    return _balance;
  };

  this.checkBalance = function () {
    return showDetails();
  };
}

let acc = new BankAccount(1000);
console.log(acc.checkBalance());   // 1000
acc.deposit(500);
console.log(acc.checkBalance());   // 1500
// acc._balance  // undefined
// acc.showDetails()  // undefined - not exposed
```

**Note:** In the original `privateClosures.js`, `deposit` and `withdraw` used `amount` without it being a parameter. The fix is to add `amount` as a parameter.

---

## 6. Closures in Loops – Classic Interview Trap

### The Problem

```js
for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, 1000);
}
```

**Output (after 1 second):**
```
3
3
3
```

**Why?**  
- `var` is function-scoped; there's only one `i`  
- All three callbacks share the same `i`  
- When they run (after 1s), the loop has finished and `i` is 3

---

### Fix 1: Use `let` (Block Scope)

```js
for (let i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, 1000);
}
```

**Output:** `0`, `1`, `2`

**Why?**  
- `let` creates a new `i` for each iteration  
- Each callback closes over its own `i`

---

### Fix 2: IIFE (Immediately Invoked Function Expression)

```js
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(function () {
      console.log(j);
    }, 1000);
  })(i);
}
```

**Output:** `0`, `1`, `2`

**Why?**  
- IIFE creates a new scope for each iteration  
- `j` is a copy of `i` at that moment  
- Each callback closes over its own `j`

---

### Fix 3: Pass `i` as Argument to `setTimeout`

```js
for (var i = 0; i < 3; i++) {
  setTimeout(function (j) {
    console.log(j);
  }, 1000, i);
}
```

**Output:** `0`, `1`, `2`

**Why?**  
- `setTimeout` passes extra args to the callback  
- `i` is passed by value at call time

---

## 7. Memory Considerations

### Closures Keep References Alive

Variables in a closure are **not** garbage collected as long as the closure exists:

```js
function createHuge() {
  let bigData = new Array(1000000).fill('x');  // 1 million items

  return function () {
    return bigData.length;
  };
}

let fn = createHuge();
// bigData is still in memory! fn holds a reference via closure
```

**Implication:** If you no longer need the closure, set it to `null` so the closure (and its captured variables) can be garbage collected.

---

### Avoiding Memory Leaks

```js
function createHandler() {
  let data = getLargeData();

  return function handler() {
    use(data);
  };
}

let handler = createHandler();
// ... use handler ...
handler = null;  // Allow closure and data to be GC'd
```

---

## 8. Common Patterns & Pitfalls

### Pattern: Module / Module Revealing Pattern

```js
function createModule() {
  let privateVar = 0;

  function privateFn() {
    return privateVar * 2;
  }

  return {
    getValue: function () {
      return privateVar;
    },
    setValue: function (v) {
      privateVar = v;
    },
    double: function () {
      return privateFn();
    }
  };
}
```

---

### Pitfall: Closure Over Loop Variable (with `var`)

```js
var funcs = [];
for (var i = 0; i < 3; i++) {
  funcs.push(function () { return i; });
}
console.log(funcs[0]());  // 3
console.log(funcs[1]());  // 3
console.log(funcs[2]());  // 3
```

**Fix:** Use `let` or IIFE.

---

### Pitfall: Stale Closure in React

```js
// In React, if you use state in a closure without proper dependencies,
// you might get stale values. Use useEffect dependencies or useRef.
```

---

## 9. Interview Cheat Sheet

| Concept | Key Point |
|---------|-----------|
| Closure | Function + lexical environment it was created in |
| Lexical | Scope determined by where function is **defined** |
| Scope chain | Current scope → outer scope → … → global |
| Memory | Closure keeps references alive until closure is released |
| Loop + closure | Use `let` or IIFE to avoid `var` trap |
| Private data | Closure over variable in outer function |

---

## 10. Final Takeaways

1. **Closure** = Function that remembers its birth scope
2. **Lexical** = Scope from where the function was written
3. **Use cases** = Counter, memoization, private data, module pattern
4. **Loop trap** = `var` + closure → all share same variable; use `let` or IIFE
5. **Memory** = Closures keep variables alive; null out when done

---

## Related Interview Questions

### Basic Level

**Q1. What is a closure in JavaScript?**  
A closure is a function that retains access to variables from its outer (lexical) scope even after that outer function has finished executing.

**Q2. What is lexical scope?**  
Lexical scope means the scope of a variable is determined by where the code is written in the source. A function can access variables from the scope where it was defined.

**Q3. Give an example of a closure.**  
```js
function outer() {
  let x = 10;
  return function inner() {
    console.log(x);
  };
}
let fn = outer();
fn();  // 10
```

**Q4. What is the difference between closure and scope?**  
Scope is the visibility of variables. A closure is a function that "closes over" and captures variables from an outer scope, keeping them accessible even after the outer function returns.

### Intermediate Level

**Q5. How can closures be used for private variables?**  
By declaring a variable in an outer function and only exposing methods that read or modify it. The variable is never returned or attached to the returned object, so it stays private.

**Q6. What is memoization? How do closures help?**  
Memoization is caching the results of expensive function calls. A closure can hold a `cache` object that persists across calls, so repeated inputs return cached results without recomputation.

**Q7. Why does `for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 1000); }` print 3 three times?**  
`var` is function-scoped, so there's one `i`. All three callbacks share it and run after the loop ends, when `i` is 3.

**Q8. How do closures affect memory?**  
Closures keep references to their outer variables. As long as the closure exists, those variables cannot be garbage collected, which can cause memory leaks if not managed.

### Advanced Level

**Q9. Implement a function that only runs once.**  
```js
function once(fn) {
  let called = false;
  return function (...args) {
    if (!called) {
      called = true;
      return fn.apply(this, args);
    }
  };
}
```

**Q10. What is the difference between `var` and `let` in loop closures?**  
`var` is function-scoped, so there's one `i` for the whole loop. `let` is block-scoped, so each iteration gets a new `i` that closures can capture correctly.

---

## Additional Interview Problems (Extra Practice)

### Problem 1: Create a Multiplier Factory

```js
// Create a function multiply(a) that returns a function multiplyBy(b) 
// that returns a * b.

function multiply(a) {
  return function (b) {
    return a * b;
  };
}

const multiplyBy5 = multiply(5);
console.log(multiplyBy5(3));  // 15
console.log(multiplyBy5(10)); // 50
```

---

### Problem 2: Create a Once Function

```js
// Implement a function that only allows the passed function to run once.
// Subsequent calls should return the first result.

function once(fn) {
  let result;
  let called = false;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

const initialize = once(() => {
  console.log("Initialized!");
  return 42;
});
initialize();  // "Initialized!" + returns 42
initialize();  // No log, returns 42
initialize();  // No log, returns 42
```

---

### Problem 3: Memoized Fibonacci

```js
// Implement a memoized version of Fibonacci that caches results.

function memoizedFibonacci() {
  let cache = {};

  return function fib(n) {
    if (n <= 1) return n;
    if (cache[n]) return cache[n];
    cache[n] = fib(n - 1) + fib(n - 2);
    return cache[n];
  };
}

const fib = memoizedFibonacci();
console.log(fib(40));  // Fast! (uses cache)
```

---

### Problem 4: Create a Rate Limiter

```js
// Create a function that limits how often another function can be called.
// Example: at most once per 1000ms.

function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}

const log = throttle(() => console.log("Called!"), 1000);
log();  // "Called!"
log();  // (nothing)
log();  // (nothing)
setTimeout(log, 1001);  // "Called!"
```

---

### Problem 5: Closure in Loop – Predict Output

```js
function createFunctions() {
  var result = [];
  for (var i = 0; i < 3; i++) {
    result[i] = function () {
      return i;
    };
  }
  return result;
}

var funcs = createFunctions();
console.log(funcs[0]());  // ?
console.log(funcs[1]());  // ?
console.log(funcs[2]());  // ?
```

**Answer:** All print `3`. Fix: use `let i` or IIFE with `(function(j) { ... })(i)`.

---

### Problem 6: Closure Chain – Predict Output

```js
function outer() {
  let x = 1;
  return function inner() {
    let y = 2;
    return function innerMost() {
      console.log(x, y);
    };
  };
}

let inner = outer();
let innerMost = inner();
innerMost();  // ?
```

**Answer:** `1 2`. Both `x` and `y` are in the scope chain of `innerMost`.

---

### Problem 7: Private Counter with Increment and Decrement

```js
// Create a counter with increment(), decrement(), and getCount().
// count should be private.

function createCounter(initial = 0) {
  let count = initial;
  return {
    increment: function () {
      return ++count;
    },
    decrement: function () {
      return --count;
    },
    getCount: function () {
      return count;
    }
  };
}

const counter = createCounter(10);
counter.increment();  // 11
counter.increment();  // 12
counter.decrement();  // 11
counter.getCount();   // 11
```

---

### Problem 8: Debounce Function

```js
// Implement debounce: fn runs only after `delay` ms of no calls.

function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

const search = debounce((term) => console.log("Searching:", term), 300);
search("a");
search("ab");
search("abc");  // Only this runs after 300ms: "Searching: abc"
```

---

### Problem 9: Predict Output

```js
let count = 0;
(function outer() {
  if (count === 0) {
    let count = 1;
    console.log(count);
  }
  console.log(count);
})();
```

**Answer:**  
- First `console.log`: `1` (from inner `let count`)  
- Second `console.log`: `0` (from outer `count` – the IIFE's outer scope is global)

---

### Problem 10: Create a Secret Keeper

```js
// Create a function that stores a secret. Only the returned function can reveal it.
// reveal() should return the secret; there's no way to set it from outside.

function createSecret(secret) {
  return {
    reveal: function () {
      return secret;
    }
  };
}

const keeper = createSecret("my password");
console.log(keeper.reveal());  // "my password"
// No way to access or modify secret directly
```

---

### Problem 11: Closure with `setTimeout` – Fix the Bug

```js
// This code is supposed to print 0, 1, 2, 3, 4 with 1 second delay each.
// Fix it.

for (var i = 0; i < 5; i++) {
  setTimeout(function () {
    console.log(i);
  }, i * 1000);
}
```

**Fix 1 (let):**
```js
for (let i = 0; i < 5; i++) {
  setTimeout(function () {
    console.log(i);
  }, i * 1000);
}
```

**Fix 2 (IIFE):**
```js
for (var i = 0; i < 5; i++) {
  (function (j) {
    setTimeout(function () {
      console.log(j);
    }, j * 1000);
  })(i);
}
```

---

### Problem 12: Implement `curry`

```js
// curry(fn) should allow calling fn as: fn(a)(b)(c) instead of fn(a, b, c)

function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

const sum = (a, b, c) => a + b + c;
const curriedSum = curry(sum);
console.log(curriedSum(1)(2)(3));  // 6
console.log(curriedSum(1, 2)(3));  // 6
```

---

## End of Class 4 Notes
