/*

Eloquent JavaScript - Chapter 6 - Exercise 1 (A Vector Type)

Requirements:
1. Write a class Vec that represents a 2D vector, with x and y (numbers) as parameters.
2. Give the Vec prototype the methods plus(v) and minus(v), where v is another
vector, which return a new vector containing the element-wise sum or difference.
3. Add a getter property length to the prototype that computes the distance of
the point (x, y) to the origin (0, 0).

*/

class Vec {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  plus(v) {
    return new Vec(this.x + v.x, this.y + v.y);
  }

  minus(v) {
    return new Vec(this.x - v.x, this.y - v.y);
  }
}

module.exports = Vec;
