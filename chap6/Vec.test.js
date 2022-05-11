const Vec = require('./Vec');

let v;

beforeEach(async () => {
  v = new Vec(3, 4);
});

test('Vec to have public x and y fields', () => {
  expect(v.x).toEqual(3);
  expect(v.y).toEqual(4);
});

test('Vec to have a plus method for vector addition', () => {
  expect(v.plus(new Vec(7, -1))).toEqual(new Vec(10, 3));
});

test('Vec to have a minus method for vector subtraction', () => {
  expect(v.minus(new Vec(7, -1))).toEqual(new Vec(-4, 5));
});

test('Vec to have a length getter', () => {
  expect(v.length).toEqual(5);
});
