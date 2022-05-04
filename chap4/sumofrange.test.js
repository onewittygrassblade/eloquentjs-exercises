const { range, sum } = require('./sumofrange');

test('range(1, 10) to equal [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]', () => {
  const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  expect(range(1, 10)).toEqual(expected);
});

test('sum(range(1, 10)) to equal 55', () => {
  const expected = 55;
  expect(sum(range(1, 10))).toEqual(expected);
});
