/*

Eloquent JavaScript - Chapter 6 - Exercises 2 and 3 (Groups and Iterable Groups)

Requirements:
1. Write a class Group similar to Set with the add, delete and has methods.
2. Write a static from method that takes an iterable object as argument and
creates a group that contains all the values produced by iterating over it.
3. Make the Group class iterable.

*/

class Group {
  #elements;

  constructor() {
    this.#elements = [];
  }

  get size() {
    return this.#elements.length;
  }

  toString() {
    return `Group(${this.#elements.length}) { ${this.#elements.join(', ')} }`;
  }

  toArray() {
    return [...this.#elements];
  }

  add(element) {
    if (!this.has(element)) {
      this.#elements.push(element);
    }
    return this;
  }

  delete(element) {
    if (this.has(element)) {
      this.#elements = this.#elements.filter((e) => e !== element);
    }
    return this;
  }

  has(element) {
    return this.#elements.includes(element);
  }

  static from(it) {
    const g = new Group();
    for (const elt of it) {
      g.add(elt);
    }
    return g;
  }
}

class GroupIterator {
  constructor(group) {
    this.index = 0;
    this.elements = group.toArray();
  }

  next() {
    if (this.index === this.elements.length) return { done: true };

    const value = {
      index: this.index,
      value: this.elements[this.index],
    };

    this.index += 1;

    return { value, done: false };
  }
}

Group.prototype[Symbol.iterator] = function () { // eslint-disable-line func-names
  return new GroupIterator(this);
};

module.exports = Group;

// The following lines are commented out to avoid making tests noisy.

// for (const value of Group.from(["a", "b", "c"])) {
//   console.log(value);
// }
