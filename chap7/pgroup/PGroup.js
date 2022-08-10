class PGroup {
  #elements;

  constructor(elements) {
    this.#elements = elements;
  }

  get size() {
    return this.#elements.length;
  }

  add(element) {
    if (this.has(element)) {
      return this;
    }
    return new PGroup([...this.#elements, element]);
  }

  delete(element) {
    if (!this.has(element)) {
      return this;
    }
    return new PGroup(this.#elements.filter((e) => e !== element));
  }

  has(element) {
    return this.#elements.includes(element);
  }
}

PGroup.empty = new PGroup([]);

module.exports = PGroup;
