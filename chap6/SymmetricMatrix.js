/*

Eloquent JavaScript - Chapter 6 - SymmetricMatrix example

Objective: demonstrate class inheritance.

*/

const Matrix = require('./Matrix');

class SymmetricMatrix extends Matrix {
  constructor(size, valueAt = (x, y) => undefined) { // eslint-disable-line no-unused-vars
    super(size, size, (x, y) => {
      if (x > y) return valueAt(y, x);
      return valueAt(x, y);
    });
  }

  set(x, y, value) {
    super.set(x, y, value);
    if (x !== y) {
      super.set(y, x, value);
    }
  }
}

module.exports = SymmetricMatrix;
