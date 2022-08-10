const { ROAD_GRAPH } = require('./places');
const findRoute = require('./findRoute');

/*
    This robot computes a new route based on the first parcel in
    the village stage.
*/
function routeFindingRobot({ robotPos, parcels }, route) {
  // If not already on a route, find a new one
  if (route.length === 0) {
    let newRoute;
    const parcel = parcels[0]; // Use first parcel to find route
    if (parcel.pos !== robotPos) { // if don't have it we go pick it up
      newRoute = findRoute(ROAD_GRAPH, robotPos, parcel.pos);
    } else { // else we go deliver it
      newRoute = findRoute(ROAD_GRAPH, robotPos, parcel.address);
    }
    return { direction: newRoute[0], memory: newRoute.slice(1) };
  }

  return { direction: route[0], memory: route.slice(1) };
}

module.exports = routeFindingRobot;
