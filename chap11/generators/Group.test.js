const Group = require('./Group');

let g;

beforeEach(async () => {
  g = new Group();
});

describe('Group', () => {
  test('Group constructor to return an empty group', () => {
    expect(g.size).toEqual(0);
  });

  describe('.toString', () => {
    test('return a formatted string with the group size and elements', () => {
      g.add(1);
      g.add(2);
      expect(g.toString()).toEqual('Group(2) { 1, 2 }');
    });
  });

  describe('.toArray', () => {
    test('return an array containing the elements of the group', () => {
      g.add(1);
      g.add(2);
      expect(g.toArray()).toEqual([1, 2]);
    });

    test('return a different array than the one used internally', () => {
      g.add(1);
      g.add(2);
      const arr = g.toArray();
      arr.push(3);
      expect(g.has(3)).toEqual(false);
    });
  });

  describe('.add', () => {
    test('add an element if not already present', () => {
      g.add(1);
      expect(g.size).toEqual(1);
      g.add(1);
      expect(g.size).toEqual(1);
    });
  });

  describe('.delete', () => {
    test('remove an element if present', () => {
      g.add(1);
      expect(g.size).toEqual(1);
      g.delete(1);
      expect(g.size).toEqual(0);
      g.delete(1);
      expect(g.size).toEqual(0);
    });
  });

  describe('.has', () => {
    test('return true if an element is present in the group', () => {
      g.add(1);
      expect(g.has(1)).toEqual(true);
    });

    test('return false if an element is not present in the group', () => {
      expect(g.has(1)).toEqual(false);
    });
  });

  describe('.from', () => {
    test('return a group containing all the unique elements of an array', () => {
      const arr = [1, 1, 2, 3, 4, 4, 4, 5, 5];
      expect(Group.from(arr).toString()).toEqual('Group(5) { 1, 2, 3, 4, 5 }');
    });
  });

  test('to be iterable', () => {
    const group = Group.from([1, 2, 3]);
    const it = group[Symbol.iterator]();
    expect(it.next()).toEqual({ done: false, value: { index: 0, value: 1 } });
  });
});
