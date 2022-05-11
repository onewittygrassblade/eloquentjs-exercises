/*

Eloquent JavaScript - Chapter 6 - Temperature example

Objective: demonstrate the use of class getters and setters.

Private static methods were added to the original example.

*/

class Temperature {
  constructor(celsius) {
    this.celsius = celsius;
  }

  get fahrenheit() {
    return Temperature.#celsiusToFahrenheit(this.celsius);
  }

  set fahrenheit(value) {
    this.celsius = Temperature.#fahrenheitToCelsius(value);
  }

  static fromFahrenheit(value) {
    return new Temperature(Temperature.#fahrenheitToCelsius(value));
  }

  static #celsiusToFahrenheit(celsius) {
    return celsius * 1.8 + 32;
  }

  static #fahrenheitToCelsius(fahrenheit) {
    return (fahrenheit - 32) / 1.8;
  }
}

module.exports = Temperature;
