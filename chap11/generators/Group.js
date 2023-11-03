/*

Eloquent JavaScript - Chapter 11

Rewrite the Group class from chapter 6 using a generator for the iterator.

*/

class Group {
  constructor() {
    this.elements = [];
  }

  get size() {
    return this.elements.length;
  }

  toString() {
    return `Group(${this.elements.length}) { ${this.elements.join(', ')} }`;
  }

  toArray() {
    return [...this.elements];
  }

  add(element) {
    if (!this.has(element)) {
      this.elements.push(element);
    }
    return this;
  }

  delete(element) {
    if (this.has(element)) {
      this.elements = this.elements.filter((e) => e !== element);
    }
    return this;
  }

  has(element) {
    return this.elements.includes(element);
  }

  static from(it) {
    const g = new Group();
    for (const elt of it) {
      g.add(elt);
    }
    return g;
  }
}

Group.prototype[Symbol.iterator] = function* () {
  for (let i = 0; i < this.elements.length; i++) {
    yield {
      index: i,
      value: this.elements[i],
    };
  }
};

module.exports = Group;

// The following lines are commented out to avoid making tests noisy.

// for (const value of Group.from(["a", "b", "c"])) {
//   console.log(value);
// }
