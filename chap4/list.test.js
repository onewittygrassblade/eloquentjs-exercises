const {
  arrayToList,
  listToArray,
  prepend,
  nth,
} = require('./list');

let list;

beforeEach(async () => {
  list = await {
    value: 1,
    rest: {
      value: 2,
      rest: {
        value: 3,
        rest: null,
      },
    },
  };
});

test('arrayToList to return a well formed list', () => {
  expect(arrayToList([1, 2, 3])).toEqual(list);
});

test('listToArray to return an array of values from a list', () => {
  expect(listToArray(list)).toEqual([1, 2, 3]);
});

test('prepend to prepend a value to a list', () => {
  expect(prepend(0, list)).toEqual({
    value: 0,
    rest: {
      value: 1,
      rest: {
        value: 2,
        rest: {
          value: 3,
          rest: null,
        },
      },
    },
  });
});

test('nth to return undefined if passed a negative number', () => {
  expect(nth(list, -1)).toBeUndefined();
});

test('nth to return the correct value if passed a valid index', () => {
  expect(nth(list, 1)).toEqual(2);
});

test('nth to return undefined if passed an index out of bounds', () => {
  expect(nth(list, 3)).toBeUndefined();
});
