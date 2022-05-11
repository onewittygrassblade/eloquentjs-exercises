const Temperature = require('./Temperature');

test('Temperature to have a fahrenheit getter and setter', () => {
  const temp = new Temperature(20);
  expect(temp.celsius).toEqual(20);
  expect(temp.fahrenheit).toEqual(68);

  temp.fahrenheit = 86;
  expect(temp.celsius).toEqual(30);
});

test('Temperature.fromFahrenheit to return a correct Temperature instance', () => {
  expect(Temperature.fromFahrenheit(104).celsius).toEqual(40);
});
