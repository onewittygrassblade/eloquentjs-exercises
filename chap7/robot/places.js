const buildGraph = require('./buildGraph');

const ADDRESSES = {
  ALICE_HOUSE: "Alice's House",
  BOB_HOUSE: "Bob's House",
  CABIN: 'Cabin',
  DARIA_HOUSE: "Daria's House",
  ERNIE_HOUSE: "Ernie's House",
  FARM: 'Farm',
  GRETE_HOUSE: "Grete's House",
  MARKETPLACE: 'Marketplace',
  POST_OFFICE: 'Post Office',
  SHOP: 'Shop',
  TOWN_HALL: 'Town Hall',
};

const ROADS = [
  [ADDRESSES.ALICE_HOUSE, ADDRESSES.BOB_HOUSE],
  [ADDRESSES.ALICE_HOUSE, ADDRESSES.CABIN],
  [ADDRESSES.ALICE_HOUSE, ADDRESSES.POST_OFFICE],
  [ADDRESSES.BOB_HOUSE, ADDRESSES.TOWN_HALL],
  [ADDRESSES.DARIA_HOUSE, ADDRESSES.ERNIE_HOUSE],
  [ADDRESSES.DARIA_HOUSE, ADDRESSES.TOWN_HALL],
  [ADDRESSES.ERNIE_HOUSE, ADDRESSES.GRETE_HOUSE],
  [ADDRESSES.GRETE_HOUSE, ADDRESSES.FARM],
  [ADDRESSES.GRETE_HOUSE, ADDRESSES.SHOP],
  [ADDRESSES.MARKETPLACE, ADDRESSES.FARM],
  [ADDRESSES.MARKETPLACE, ADDRESSES.POST_OFFICE],
  [ADDRESSES.MARKETPLACE, ADDRESSES.SHOP],
  [ADDRESSES.MARKETPLACE, ADDRESSES.TOWN_HALL],
  [ADDRESSES.SHOP, ADDRESSES.TOWN_HALL],
];

const ROAD_GRAPH = buildGraph(ROADS);

exports.ADDRESSES = Object.freeze(ADDRESSES);
exports.ROAD_GRAPH = Object.freeze(ROAD_GRAPH);
