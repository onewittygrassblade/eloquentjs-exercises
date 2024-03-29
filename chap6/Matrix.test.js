const Matrix = require('./Matrix');

describe('Matrix', () => {
  test('to be initialised with undefined values by default', () => {
    const m = new Matrix(2, 3);
    expect(m.get(1, 2)).toBeUndefined();
  });

  test('to accept a function parameter to initialise elements', () => {
    const m = new Matrix(2, 3, (x, y) => `${x}, ${y}`);
    expect(m.get(1, 2)).toEqual('1, 2');
  });

  test('.set to set the value of the element at x, y', () => {
    const m = new Matrix(2, 3, (x, y) => `${x}, ${y}`);
    m.set(1, 2, 'BOOM');
    expect(m.get(1, 2)).toEqual('BOOM');
  });

  test('to be iterable', () => {
    const m = new Matrix(2, 3, (x, y) => x * y);
    const it = m[Symbol.iterator]();
    expect(it.next()).toEqual({ done: false, value: { value: 0, x: 0, y: 0 } });
  });

  test('.toString to return a formatted string representation', () => {
    const m = new Matrix(2, 3, (x, y) => x * y);
    expect(m.toString()).toEqual('0, 0\n0, 1\n0, 2');
  });
});
