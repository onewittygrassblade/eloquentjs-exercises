const { ADDRESSES, ROAD_GRAPH } = require('./places');
const randomPick = require('./randomPick');

class VillageState {
  constructor(robotPos, parcels) {
    this.robotPos = robotPos;
    this.parcels = parcels;
  }

  static random(parcelCount = 5) {
    const parcels = [];

    for (let i = 0; i < parcelCount; i++) {
      const pos = randomPick(Object.keys(ROAD_GRAPH));
      let address;
      do {
        address = randomPick(Object.keys(ROAD_GRAPH));
      } while (address === pos);
      parcels.push({ pos, address });
    }

    return new VillageState(ADDRESSES.POST_OFFICE, parcels);
  }

  move(destination) {
    // Return old state if invalid move
    if (!ROAD_GRAPH[this.robotPos].includes(destination)) {
      return this;
    }

    // Update parcels
    const parcels = this.parcels
      .map((p) => ({
        pos: p.pos === this.robotPos ? destination : p.pos,
        address: p.address,
      }))
      .filter((p) => p.pos !== p.address);

    return new VillageState(destination, parcels);
  }
}

module.exports = VillageState;
