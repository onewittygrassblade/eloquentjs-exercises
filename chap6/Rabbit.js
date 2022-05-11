/*

Eloquent JavaScript - Chapter 6 - Rabbit example

Objective: demonstrate how object prototype and class syntax work.

*/

class Rabbit {
  family = 'mammals';

  constructor(type) {
    this.type = type;
  }

  toString() {
    return `A ${this.type} Rabbit of the ${this.family} family who likes eating ${this.favouriteFood}`;
  }

  speak(line) {
    return `The ${this.type} rabbit says ${line}`;
  }
}

Rabbit.prototype.favouriteFood = 'carrots';
Rabbit.prototype.eat = function eat() {
  return `The ${this.type} rabbit eats ${this.favouriteFood}`;
};

module.exports = Rabbit;
