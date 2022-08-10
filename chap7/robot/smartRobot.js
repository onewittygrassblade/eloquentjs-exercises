const { ROAD_GRAPH } = require('./places');
const findRoute = require('./findRoute');

/*
    Official solution (lazyRobot) at https://eloquentjavascript.net/code/#7.2
*/

function routeScore({ route, pickUp }) {
  return (pickUp ? 0.5 : 0) - route.length;
}

function smartRobot({ robotPos, parcels }, route) {
  if (route.length === 0) {
    /*
        Compute one route for each parcel:
        - If the parcel is not at the robot's current location, then
          compute the route to go pick it up.
        - If the parcel is already where the robot is, compute the
          route to go deliver it.
    */
    const routes = parcels.map((p) => {
      if (p.pos !== robotPos) {
        return {
          route: findRoute(ROAD_GRAPH, robotPos, p.pos),
          pickUp: true,
        };
      }
      return {
        route: findRoute(ROAD_GRAPH, robotPos, p.address),
        pickUp: false,
      };
    });

    const newRoute = routes.reduce((a, b) => (routeScore(a) > routeScore(b) ? a : b)).route;
    return { direction: newRoute[0], memory: newRoute.slice(1) };
  }

  return { direction: route[0], memory: route.slice(1) };
}

module.exports = smartRobot;
