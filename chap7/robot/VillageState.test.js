const VillageState = require('./VillageState');
const { ADDRESSES } = require('./places');

describe('VillageState', () => {
  describe('.random', () => {
    test('return a VillageState instance with set robot position', () => {
      expect(VillageState.random().robotPos).toEqual(ADDRESSES.POST_OFFICE);
    });

    test('return a VillageState instance with 5 parcels by default', () => {
      expect(VillageState.random().parcels).toHaveLength(5);
    });

    test('return a VillageState instance with the number of specified parcels', () => {
      expect(VillageState.random(3).parcels).toHaveLength(3);
    });
  });

  describe('.move', () => {
    test('return the same state if the move is invalid', () => {
      const villageState = VillageState.random();
      expect(villageState.move(ADDRESSES.SHOP)).toEqual(villageState);
    });

    test('return an updated state if the move is valid', () => {
      const villageState = new VillageState(
        ADDRESSES.POST_OFFICE,
        [
          { pos: ADDRESSES.POST_OFFICE, address: ADDRESSES.ALICE_HOUSE },
          { pos: ADDRESSES.POST_OFFICE, address: ADDRESSES.BOB_HOUSE },
          { pos: ADDRESSES.ALICE_HOUSE, address: ADDRESSES.BOB_HOUSE },
        ],
      );
      const newState = villageState.move(ADDRESSES.ALICE_HOUSE);
      expect(newState.robotPos).toEqual(ADDRESSES.ALICE_HOUSE);
      expect(newState.parcels).toEqual([
        { pos: ADDRESSES.ALICE_HOUSE, address: ADDRESSES.BOB_HOUSE },
        { pos: ADDRESSES.ALICE_HOUSE, address: ADDRESSES.BOB_HOUSE },
      ]);
    });
  });
});
