const PGroup = require('./PGroup');

let pg;

beforeEach(async () => {
  pg = PGroup.empty;
});

describe('PGroup', () => {
  test('PGroup.empty to return a new empty PGroup', () => {
    expect(pg.size).toEqual(0);
  });

  describe('.add', () => {
    test('return a new PGroup with the added element if not already present', () => {
      const pg2 = pg.add(1);
      expect(pg.size).toEqual(0);
      expect(pg2.size).toEqual(1);
      expect(pg).not.toBe(pg2);
    });

    test('return the same PGroup if the element is already present', () => {
      const pg2 = pg.add(1);
      const pg3 = pg2.add(1);
      expect(pg2.size).toEqual(1);
      expect(pg3.size).toEqual(1);
      expect(pg2).toBe(pg3);
    });
  });

  describe('.delete', () => {
    test('return a new PGroup without the removed element if present', () => {
      const pg2 = pg.add(1);
      const pg3 = pg2.add(2);
      const pg4 = pg3.delete(1);
      expect(pg4.has(1)).toEqual(false);
      expect(pg4.has(2)).toEqual(true);
      expect(pg4.size).toEqual(1);
    });

    test('return the same PGroup if the element is not present', () => {
      const pg2 = pg.add(1);
      const pg3 = pg2.delete(2);
      expect(pg2.size).toEqual(1);
      expect(pg3.size).toEqual(1);
      expect(pg2).toBe(pg3);
    });
  });

  describe('.has', () => {
    test('return true if an element is present in the group', () => {
      const pg2 = pg.add(1);
      expect(pg2.has(1)).toEqual(true);
    });

    test('return false if an element is not present in the group', () => {
      expect(pg.has(1)).toEqual(false);
    });
  });
});
