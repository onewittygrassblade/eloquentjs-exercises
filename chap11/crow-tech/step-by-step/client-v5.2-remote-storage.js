/*

  Crow Tech v5 testing

  Implement finding in remote storage:
  - If local storage (nest that issued the request) has the desired item, return.
  - Otherwise, pick a random nest within the rest of the network and route a storage request
    to it. If its storage has the item, return, otherwise try next random nest.
  - If no nest had the desired item, fail.

*/

/* eslint-disable no-console */

const Network = require('./crow-tech-v5');
const { nestConnections, storageFor } = require('../data');

const network = new Network(nestConnections, storageFor);
const bigOak = network.nests['Big Oak'];

// Define requestType and request same as v3

function requestType(name, handler) {
  network.defineRequestType(name, (toNest, fromNest, content, callback) => {
    try {
      // convert the value returned by handler to a promise if it isn’t already
      Promise.resolve(handler(toNest, fromNest, content))
        .then((response) => callback(null, response))
        .catch((failure) => callback(failure));
    } catch (exception) { // any exception raised by the handler is given to the callback
      callback(exception);
    }
  });
}

class Timeout extends Error {}

function request(nest, targetName, type, content) {
  return new Promise((resolve, reject) => {
    let done = false;

    function attempt(nAttempts) {
      nest.send(targetName, type, content, (failed, value) => {
        done = true;
        if (failed) reject(failed);
        else resolve(value);
      });
      // Wait 250 ms until checking for success.
      setTimeout(() => {
        if (done) return;
        if (nAttempts > 0) attempt(nAttempts - 1);
        else reject(new Timeout(`Request from ${nest.name} to ${targetName} timed out`));
      }, 250);
    }

    attempt(3);
  });
}

// Request routing same as v5

function broadcastConnections(nest, name, exceptFor = null) {
  return Promise.all(
    nest.neighbors
      .filter((neighbor) => neighbor !== exceptFor)
      .map((neighbor) => request(nest, neighbor, 'connections', {
        name,
        neighbors: nest.state.connections.get(name),
      })),
  );
}

requestType('connections', (toNest, fromNest, { name, neighbors }) => {
  const { connections } = toNest.state;
  if (JSON.stringify(connections.get(name)) === JSON.stringify(neighbors)) {
    return null;
  }
  connections.set(name, neighbors);
  return broadcastConnections(toNest, name, fromNest);
});

function findRoute(from, to, connections) {
  const work = [{ at: from, via: null }];
  for (let i = 0; i < work.length; i++) {
    const { at, via } = work[i];
    for (const next of connections.get(at) || []) {
      if (next === to) {
        return via;
      }
      if (!work.some((w) => w.at === next)) {
        work.push({ at: next, via: via || next });
      }
    }
  }
  return null;
}

function routeRequest(nest, target, type, content) {
  if (nest.neighbors.includes(target)) {
    return request(nest, target, type, content);
  }
  const via = findRoute(nest.name, target, nest.state.connections);
  if (!via) {
    return Promise.reject(new Error(`No route to ${target}`));
  }
  return request(nest, via, 'route', { target, type, content });
}

requestType('route', (nest, _fromNest, { target, type, content }) => routeRequest(nest, target, type, content));

// Find in remote storage

function storage(nest, name) {
  return new Promise((resolve, reject) => {
    nest.readStorage(name, (failed, result) => {
      if (failed) reject(failed);
      else resolve(result);
    });
  });
}

requestType('storage', (nest, _fromNest, name) => storage(nest, name));

function getNetwork(nest) {
  return Array.from(nest.state.connections.keys());
}

function findInRemoteStorage(nest, name) {
  const otherNests = getNetwork(nest).filter((nestName) => nestName !== nest.name);
  function next(sources) {
    if (sources.length === 0) {
      return Promise.reject(new Error(`Storage not found: ${name}`));
    }
    const source = sources[Math.floor(Math.random() * sources.length)];
    console.log(`Routing storage request to ${source}`);
    return routeRequest(nest, source, 'storage', name)
      .then((res) => {
        console.log(`Cache '${name}' found in ${source}: ${res}`);
        return res;
      })
      .catch(() => {
        console.log(`Cache '${name}' not found in ${source}, routing request to next remote`);
        return next(sources.filter((n) => n !== source));
      });
  }
  return next(otherNests);
}

function findInStorage(nest, name) {
  console.log(`Storage request from ${nest.name} for '${name}'`);
  return storage(nest, name)
    .then((found) => {
      console.log(`Cache '${name}' found in ${nest.name}: ${found}`);
      return found;
    })
    .catch(() => {
      console.log(`Cache '${name}' not found in ${nest.name}, routing request to remote`);
      return findInRemoteStorage(nest, name);
    });
}

function printStorage(nest, name) {
  findInStorage(nest, name)
    .then((res) => console.log(`Contents of '${name}': ${res}`))
    .catch((err) => console.log(err.message));
}

network.everywhere((nest) => {
  nest.state.connections = new Map();
  nest.state.connections.set(nest.name, nest.neighbors);
  return broadcastConnections(nest, nest.name);
}).then(() => {
  printStorage(bigOak, 'food caches');
  // Output:
  // Storage request from Big Oak for 'food caches'
  // Cache 'food caches' found in Big Oak: cache in the oak,cache in the meadow...
  // Contents of 'food caches': cache in the oak,cache in the meadow,cache under the hedge

  printStorage(bigOak, 'events on 2017-12-21');
  // Possible output:
  // Storage request from Big Oak for 'events on 2017-12-21'
  // Cache 'events on 2017-12-21' not found in Big Oak, routing request to remote
  // Routing storage request to Gilles' Garden
  // Cache 'events on 2017-12-21' not found in Gilles' Garden, routing request to next remote
  // Routing storage request to Jacques' Farm
  // Cache 'events on 2017-12-21' not found in Jacques' Farm, routing request to next remote
  // Routing storage request to Tall Poplar
  // Cache 'events on 2017-12-21' not found in Tall Poplar, routing request to next remote
  // Routing storage request to Fabienne's Garden
  // Cache 'events on 2017-12-21' not found in Fabienne's Garden, routing request to next remote
  // Routing storage request to Hawthorn
  // Cache 'events on 2017-12-21' found in Hawthorn: Deep snow. Butcher's garbage can...
  // Contents of 'events on 2017-12-21': Deep snow. Butcher's garbage can fell over. We chased...

  printStorage(bigOak, 'not a cache');
  // Possible output:
  // Storage request from Big Oak for 'not a cache'
  // Cache 'not a cache' not found in Big Oak, routing request to remote
  // Routing storage request to Fabienne's Garden
  // Cache 'not a cache' not found in Fabienne's Garden, routing request to next remote
  // Routing storage request to Big Maple
  // Cache 'not a cache' not found in Big Maple, routing request to next remote
  // Routing storage request to Sportsgrounds
  // Cache 'not a cache' not found in Sportsgrounds, routing request to next remote
  // Routing storage request to Church Tower
  // Cache 'not a cache' not found in Church Tower, routing request to next remote
  // Routing storage request to Chateau
  // Cache 'not a cache' not found in Chateau, routing request to next remote
  // Routing storage request to Tall Poplar
  // Cache 'not a cache' not found in Tall Poplar, routing request to next remote
  // Routing storage request to Gilles' Garden
  // Cache 'not a cache' not found in Gilles' Garden, routing request to next remote
  // Routing storage request to Great Pine
  // Cache 'not a cache' not found in Great Pine, routing request to next remote
  // Routing storage request to Butcher Shop
  // Cache 'not a cache' not found in Butcher Shop, routing request to next remote
  // Routing storage request to Cow Pasture
  // Cache 'not a cache' not found in Cow Pasture, routing request to next remote
  // Routing storage request to Hawthorn
  // Cache 'not a cache' not found in Hawthorn, routing request to next remote
  // Routing storage request to Jacques' Farm
  // Cache 'not a cache' not found in Jacques' Farm, routing request to next remote
  // Routing storage request to Woods
  // Cache 'not a cache' not found in Woods, routing request to next remote
  // Storage not found: not a cache
});
