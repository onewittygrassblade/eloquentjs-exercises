const { ADDRESSES, ROAD_GRAPH } = require('./places');
const findRoute = require('./findRoute');

describe('findRoute', () => {
  test('to return an empty route if the start and destination match', () => {
    expect(findRoute(ROAD_GRAPH, ADDRESSES.POST_OFFICE, ADDRESSES.POST_OFFICE)).toEqual([]);
  });

  test('to return the shortest route', () => {
    expect(findRoute(ROAD_GRAPH, ADDRESSES.POST_OFFICE, ADDRESSES.ERNIE_HOUSE)).toHaveLength(4);
  });
});
