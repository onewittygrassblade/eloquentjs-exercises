/*
    findRoute algorithm:
    - Build a collection of routes for each reachable node (called work in the book).
    - From starting point, explore every nearest reachable node:
        - If one of these nodes is the destination, return the route.
        - Otherwise, if we haven't seen this node before, add the route to it to the collection.
    - Repeat for all the nearest neighbours.
    - Because ROAD_GRAPH is a connected graph, all nodes will eventually be reached, thus the
      function will always return a route.
*/

// eslint-disable-next-line consistent-return
function findRoute(graph, from, to) {
  if (from === to) {
    return [];
  }

  const routes = [{ to: from, route: [] }];

  for (let i = 0; i < routes.length; i++) {
    const { to: at, route } = routes[i];

    for (const place of graph[at]) {
      if (place === to) {
        return route.concat(place);
      }
      if (!routes.some((r) => r.to === place)) {
        routes.push({ to: place, route: route.concat(place) });
      }
    }
  }
}

module.exports = findRoute;
