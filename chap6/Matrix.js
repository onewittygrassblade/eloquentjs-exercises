/*

Eloquent JavaScript - Chapter 6 - Matrix example

Objective: demonstrate how to make a class iterable.

*/

class Matrix {
  constructor(width, height, valueAt = (x, y) => undefined) { // eslint-disable-line no-unused-vars
    this.width = width;
    this.height = height;
    this.content = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.content[y * this.width + x] = valueAt(x, y);
      }
    }
  }

  get(x, y) {
    return this.content[y * this.width + x];
  }

  set(x, y, value) {
    this.content[y * this.width + x] = value;
  }

  toString() {
    let output = '';
    for (let i = 0; i < this.height; i++) {
      output += this.content
        .slice(i * this.width, (i + 1) * this.width)
        .join(', ');
      if (i < this.height - 1) output += '\n';
    }
    return output;
  }
}

class MatrixIterator {
  constructor(matrix) {
    this.x = 0;
    this.y = 0;
    this.matrix = matrix;
  }

  next() {
    if (this.y === this.matrix.height) return { done: true };

    const value = {
      x: this.x,
      y: this.y,
      value: this.matrix.get(this.x, this.y),
    };

    this.x += 1;

    if (this.x === this.matrix.width) {
      this.x = 0;
      this.y += 1;
    }

    return { value, done: false };
  }
}

Matrix.prototype[Symbol.iterator] = function () {
  return new MatrixIterator(this);
};

module.exports = Matrix;

// The following lines are commented out to avoid making tests noisy.

// const matrix = new Matrix(2, 3, (x, y) => x * y);
// for (const { x, y, value } of matrix) {
//   console.log(x, y, value);
// }
// console.log(matrix.toString());
