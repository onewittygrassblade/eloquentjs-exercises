const SymmetricMatrix = require('./SymmetricMatrix');

let m;

beforeEach(async () => {
  m = new SymmetricMatrix(3, (x, y) => `${x}, ${y}`);
});

describe('SymmetricMatrix', () => {
  test('constructor to generate a symmetric matrix', () => {
    expect(m.get(1, 2)).toEqual('1, 2');
    expect(m.get(2, 1)).toEqual('1, 2');
  });

  test('.set to set values symmetrically', () => {
    m.set(1, 2, 'BOOM');
    expect(m.get(1, 2)).toEqual('BOOM');
    expect(m.get(2, 1)).toEqual('BOOM');
  });

  test('to be iterable', () => {
    const it = m[Symbol.iterator]();
    expect(it.next()).toEqual({ done: false, value: { value: '0, 0', x: 0, y: 0 } });
  });

  test('.toString to return a formatted string representation', () => {
    expect(m.toString()).toEqual('0, 0, 0, 1, 0, 2\n0, 1, 1, 1, 1, 2\n0, 2, 1, 2, 2, 2');
  });
});
