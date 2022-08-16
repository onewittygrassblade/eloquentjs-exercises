const { reliableMultiply, recursiveReliableMultiply } = require('./reliableMultiply');

describe('reliableMultiply', () => {
  test('to return the product of two numbers passed as arguments', () => {
    expect(reliableMultiply(7, 8)).toEqual(56);
  });
});

describe('recursiveReliableMultiply', () => {
  test('to return the product of two numbers passed as arguments', () => {
    expect(recursiveReliableMultiply(7, 8)).toEqual(56);
  });
});
