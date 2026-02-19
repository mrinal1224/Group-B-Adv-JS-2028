

---

# ✅ JavaScript OOPs – Class 4

## Closures: Fundamentals, Applications & Real-World Usage (Master Notes)

---

## Agenda of the Lecture

### What we will cover today

1. **Lexical Environment & Scope** – Foundation of closures
2. **What is a Closure?** – Definition and mechanics
3. **Basic Applications** – Counter, memoization, private variables
4. **Applications in React** – useState, useEffect, hooks, stale closures
5. **Applications in Redux** – createStore and state encapsulation
6. **Applications in Zustand** – Store creation and closure pattern
7. **Applications in Express** – Middleware and the `next` function
8. **Interview Questions** – Common closure-related questions

> 💡 *Goal of this class: You should understand closures deeply and recognize how they power React, Redux, Zustand, and Express.*

---

## 1. Lexical Environment & Scope

### What is Lexical Scope?

**Lexical scope** (also called **static scope**) means that the scope of a variable is determined by **where the code is written** in the source code, not by when or where it is executed.

```js
function outer() {
  let b = 20;
  let c = 50;

  function test() {
    console.log(c);  // test can access c from outer
  }

  return function inner() {
    let a = 10;
    return function inner2() {
      console.log(a);   // inner2 can access a from inner
      console.log(b);   // inner2 can access b from outer
      test();           // inner2 can call test, which accesses c
    };
  };
}

let in1 = outer();
let in2 = in1();
in2();  // Logs: 10, 20, and (from test) 50
```

### Scope Chain

When a function runs, it looks for variables in this order:
1. Its **own** scope (local variables)
2. Its **parent** function's scope
3. The **grandparent** scope
4. ... until **global** scope

This chain is established at **write time** (lexically), not at runtime.

---

## 2. What is a Closure?

### Definition

> 🧠 **A closure is a function that "remembers" the variables from its outer (enclosing) scope, even after that outer function has finished executing.**

In other words: A closure = **function + its lexical environment** (the environment where it was created).

### How It Works

1. When a function is **defined** inside another function, it captures a **reference** to the outer function's variables.
2. When the outer function **returns**, its execution context would normally be garbage-collected.
3. But because the inner function **holds a reference** to those variables, they stay in memory.
4. The inner function can **access and use** those variables whenever it runs.

### Simple Example

```js
function createCounter() {
  let count = 0;  // This variable is "closed over"

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

- `c1` and `c2` each get their **own** closure with their **own** `count`.
- `count` is **private** – no way to access it from outside except through the returned function.

---

## 3. Basic Applications of Closures

### Application 1: Counter / Stateful Functions

**Use case:** Create functions that maintain internal state across calls.

```js
function createCounter() {
  let count = 0;
  return function () {
    count++;
    return count;
  };
}

let counter = createCounter();
counter();  // 1
counter();  // 2
counter();  // 3
```

**Why closure?** `count` persists between calls because the returned function closes over it.

---

### Application 2: Memoization (Caching)

**Use case:** Cache expensive computation results to avoid recomputation.

```js
function MemoizedAdd() {
  let cache = {};  // Private cache, closed over

  return function (n) {
    if (cache[n]) return cache[n];
    cache[n] = n + n;
    return cache[n];
  };
}

const add = MemoizedAdd();
console.log(add(5));   // 10 (computed)
console.log(add(6));   // 12 (computed)
console.log(add(6));  // 12 (from cache – no recomputation!)
```

**Why closure?** `cache` is private and persists across calls. Only the returned function can read/write it.

---

### Application 3: Private Variables (Data Encapsulation)

**Use case:** Hide internal state; expose only a controlled API.

```js
function createBankAccount(balance) {
  let _balance = balance;  // Private – not accessible from outside

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
acc.deposit(500);       // 1500
acc.checkBalance();     // 1500
console.log(acc._balance);  // undefined – cannot access directly!
```

**Why closure?** `_balance` is only accessible through the returned methods. No one can modify it directly.

---

### Application 4: Function Factories

**Use case:** Create specialized functions with pre-configured values.

```js
function createMultiplier(factor) {
  return function (n) {
    return n * factor;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

double(5);   // 10
triple(5);   // 15
```

**Why closure?** Each returned function remembers its own `factor`.

---

### Application 5: Partial Application / Currying

**Use case:** Fix some arguments and return a function that takes the rest.

```js
function greet(greeting) {
  return function (name) {
    return `${greeting}, ${name}!`;
  };
}

const sayHello = greet("Hello");
sayHello("Alice");  // "Hello, Alice!"
sayHello("Bob");    // "Hello, Bob!"
```

**Why closure?** `greeting` is captured and reused.

---

## 4. Applications in React

### How React Uses Closures

React's **functional components** and **hooks** rely heavily on closures. Every component is a function, and hooks + event handlers form closures over the component's scope.

---

### useState – State Persistence

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);  // handleClick closes over count
  };

  return <button onClick={handleClick}>Count: {count}</button>;
}
```

**Closure in action:**
- `handleClick` is a closure over `count` and `setCount`.
- When the user clicks, `handleClick` runs with the `count` value from the render when it was created.
- React re-renders, creating a new `handleClick` with the updated `count`.

---

### useEffect – Side Effects with Captured Values

```jsx
function Example() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(result => setData(result));
    // This effect closes over setData (and data if used)
  }, []);  // Empty deps = run once

  return <div>{data}</div>;
}
```

**Closure in action:**
- The effect callback closes over `setData` and any other variables from the component.
- The dependency array `[]` tells React when to re-run the effect and thus when to create a new closure.

---

### The Stale Closure Problem (Important!)

**What is it?** A closure can capture an **outdated** value if it's not recreated when that value changes.

```jsx
function BuggyCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);  // ❌ Always uses count from first render!
    }, 1000);
    return () => clearInterval(id);
  }, []);  // Empty deps – effect runs once, closure never updates

  return <div>{count}</div>;  // Will show 1 and stop!
}
```

**Why?** The `setInterval` callback closes over `count` from the **first render**. It never sees the updated `count`.

**Fix – use functional update:**
```jsx
setCount(prevCount => prevCount + 1);  // ✅ Always gets latest
```

**Fix – add dependency:**
```jsx
useEffect(() => {
  const id = setInterval(() => setCount(c => c + 1), 1000);
  return () => clearInterval(id);
}, []);
```

---

### Custom Hooks – Reusable Closures

```jsx
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  return { count, increment, decrement };
}

function MyComponent() {
  const { count, increment } = useCounter(0);
  // Each component gets its own closure with its own state
  return <button onClick={increment}>{count}</button>;
}
```

**Closure in action:** Each call to `useCounter` creates a new closure with its own `count` and `setCount`.

---

### Event Handlers

```jsx
function List() {
  const [items, setItems] = useState([]);

  const addItem = () => {
    setItems([...items, 'new']);  // Closure over items
  };

  return items.map((item, i) => (
    <div key={i}>
      {item}
      <button onClick={addItem}>Add</button>  {/* addItem closes over items */}
    </div>
  ));
}
```

**Closure in action:** `addItem` closes over `items`. When called, it uses the `items` from the render when that `addItem` was created.

---

## 5. Applications in Redux

### createStore – State Encapsulation via Closure

Redux's `createStore` uses a closure to keep the **state private** and only allow changes through `dispatch`.

**Simplified implementation:**

```js
function createStore(reducer) {
  let state;           // Private – closed over
  let listeners = [];  // Private – closed over

  const getState = () => state;

  const dispatch = (action) => {
    state = reducer(state, action);
    listeners.forEach(listener => listener());
  };

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  };

  dispatch({ type: '@@INIT' });  // Initialize state

  return { getState, dispatch, subscribe };
}
```

**Closure in action:**
- `state` and `listeners` live in the closure of `createStore`.
- They are **not** accessible from outside.
- `getState`, `dispatch`, and `subscribe` are the only way to interact with the store.
- This is the same pattern as the BankAccount example – private state + public API.

---

### Redux Thunk – Async Actions

```js
const fetchUser = (id) => (dispatch, getState) => {
  // This thunk is a closure over dispatch and getState
  fetch(`/api/users/${id}`)
    .then(res => res.json())
    .then(user => dispatch({ type: 'USER_LOADED', user }));
};
```

**Closure in action:** The thunk closes over `dispatch` and `getState`, which are provided by the middleware when the thunk runs.

---

## 6. Applications in Zustand

### createStore – Lightweight State with Closures

Zustand creates stores using a closure pattern similar to Redux but simpler.

**Conceptual structure:**

```js
function createStore(createState) {
  let state;  // Private – closed over
  const listeners = new Set();

  const setState = (partial) => {
    state = { ...state, ...partial };
    listeners.forEach(l => l());
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  state = createState(setState, getState, { setState, getState, subscribe });

  return { setState, getState, subscribe };
}
```

**Usage:**
```js
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

**Closure in action:**
- The store's `state` is held in a closure.
- `set`, `get`, and the store API are the only way to read/update state.
- Each store instance has its own closure with its own state.

---

## 7. Applications in Express

### Middleware – The `next` Function as a Closure

Express middleware receives `(req, res, next)`. The `next` function is a **closure** that knows the rest of the middleware stack.

**How it works conceptually:**

```js
// Simplified Express-like middleware runner
function runMiddlewareStack(middlewares, req, res) {
  let index = 0;

  function next(err) {
    if (err) {
      // Error handling path
      return;
    }
    const middleware = middlewares[index++];
    if (middleware) {
      middleware(req, res, next);  // next is passed – closure over index & middlewares
    }
  }

  next();
}
```

**Closure in action:**
- `next` closes over `index` and `middlewares`.
- Each time `next()` is called, it moves to the next middleware.
- The middleware doesn't need to know the full stack – it just calls `next()` to continue.

---

### Real Express Example

```js
app.use((req, res, next) => {
  console.log('Request at', new Date());
  next();  // next is a closure – knows what comes next in the chain
});

app.use((req, res, next) => {
  req.user = { id: 1, name: 'Alice' };
  next();
});

app.get('/profile', (req, res) => {
  res.json(req.user);  // req was modified by previous middleware
});
```

**Closure in action:**
- Each middleware function is stored and invoked in sequence.
- `next` is a function that, when called, invokes the next middleware.
- `next` maintains the "position" in the chain via closure over the middleware array and index.

---

### Why Closures Matter in Express

1. **`next` remembers the pipeline** – It knows which middleware to run next.
2. **Request/response flow** – `req` and `res` are passed through; each middleware can add to them.
3. **Error handling** – `next(err)` uses the same closure to jump to error handlers.

---

## 8. Summary: Closure Applications Across Libraries

| Library / Context | How Closures Are Used |
|------------------|------------------------|
| **React** | `useState`, `useEffect`, event handlers, custom hooks – each component/hook call has its own closure over state and props |
| **Redux** | `createStore` keeps `state` and `listeners` in a closure; only `getState`, `dispatch`, `subscribe` can access them |
| **Zustand** | `create` / `createStore` keeps store state in a closure; `setState`, `getState`, `subscribe` form the public API |
| **Express** | `next` is a closure over the middleware stack; it knows which middleware to run next |

---

## 9. Interview Cheat Sheet

| Concept | Key Point |
|---------|-----------|
| Closure | Function + lexical environment; "remembers" outer variables |
| Lexical scope | Scope determined by where code is written |
| Private variables | Use closure to hide data; expose only via returned methods |
| Memoization | Cache in closure; persist across calls |
| React hooks | Each render creates new closures; stale closure = old values |
| Redux store | State in closure; only dispatch/getState/subscribe can access |
| Express next | Closure over middleware stack; controls flow |

---

## 10. Related Interview Questions (Class 4)

### Basic Level

**Q1. What is a closure?**
- A closure is a function that retains access to variables from its outer (enclosing) scope, even after the outer function has finished executing. It's the combination of a function and its lexical environment.

**Q2. Give an example of a closure.**
- A counter: `function createCounter() { let count = 0; return () => ++count; }` – the returned function closes over `count`.

**Q3. What is the lexical scope?**
- Lexical scope means the scope of a variable is determined by where the code is written in the source, not by when or where it runs.

### Intermediate Level

**Q4. How do you create private variables in JavaScript?**
- Use a closure. Define variables inside a function and return an object with methods that access those variables. The variables stay private because they're in the closure scope.

**Q5. What is memoization and how do closures help?**
- Memoization is caching the results of expensive computations. A closure holds a private `cache` object that persists across function calls, so repeated inputs can return cached results.

**Q6. What is a stale closure in React?**
- A stale closure is when a function (e.g., in `useEffect` or an event handler) captures an old value of state because it was created in a previous render and never updated. Fix: use functional updates (`setState(prev => ...)`) or correct dependency arrays.

### Advanced Level

**Q7. How does Redux's createStore use closures?**
- `createStore` keeps `state` and `listeners` in its closure. It returns `getState`, `dispatch`, and `subscribe` – the only way to access or modify state. This encapsulates the store.

**Q8. How do Express middlewares use closures?**
- The `next` function is a closure that knows the middleware stack. When you call `next()`, it invokes the next middleware in the chain. The closure maintains the current position in the stack.

**Q9. What are the memory implications of closures?**
- Closures keep their outer scope in memory as long as the closure exists. Overuse can cause memory leaks (e.g., holding references to large objects or DOM nodes). Clean up by nulling references or avoiding unnecessary closures.

---

## End of Class 4 Notes
