const { ADDRESSES } = require('./places');

const mailRoute = [
  ADDRESSES.ALICE_HOUSE,
  ADDRESSES.CABIN,
  ADDRESSES.ALICE_HOUSE,
  ADDRESSES.BOB_HOUSE,
  ADDRESSES.TOWN_HALL,
  ADDRESSES.DARIA_HOUSE,
  ADDRESSES.ERNIE_HOUSE,
  ADDRESSES.GRETE_HOUSE,
  ADDRESSES.SHOP,
  ADDRESSES.GRETE_HOUSE,
  ADDRESSES.FARM,
  ADDRESSES.MARKETPLACE,
  ADDRESSES.POST_OFFICE,
];

/*
    This robot follows a fixed route: by following it twice,
    it is guaranteed to deliver all parcels.
*/
function fixedRouteRobot(villageState, memory) {
  const m = memory.length === 0 ? mailRoute : memory;
  return { direction: m[0], memory: m.slice(1) };
}

module.exports = fixedRouteRobot;
