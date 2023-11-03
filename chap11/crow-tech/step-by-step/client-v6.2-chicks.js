/*

  Crow Tech v6 testing

  Implement building a report of the chicks born a given year for all the nests.

  The nest building the report will issue a storage request to all nests:
    - For itself, it simply queries its local storage.
    - For all other nests, it issues a storage query.

*/

/* eslint-disable no-console */

const Network = require('./crow-tech-v6');
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

function storage(nest, name) {
  return new Promise((resolve) => {
    nest.readStorage(name, (result) => resolve(result));
  });
}

requestType('storage', (nest, _fromNest, name) => storage(nest, name));

// Find something in any nest
// If the nest that issued the request has it, return.
// If not, route the request to the desired nest.
function anyStorage(nest, source, name) {
  if (source === nest.name) {
    return storage(nest, name);
  }
  return routeRequest(nest, source, 'storage', name);
}

function getNetwork(nest) {
  return Array.from(nest.state.connections.keys());
}

async function chicks(nest, year) {
  const lines = getNetwork(nest).map(async (nestName) => `${nestName} : ${await anyStorage(nest, nestName, `chicks in ${year}`)}`);
  return (await Promise.all(lines)).join('\n');
}

network.everywhere((nest) => {
  nest.state.connections = new Map();
  nest.state.connections.set(nest.name, nest.neighbors);
  return broadcastConnections(nest, nest.name);
}).then(() => {
  chicks(bigOak, '2023').then((res) => {
    console.log(`Chicks in 2023:\n${res}`);
  });
});
// Example output:
// Chicks in 2023:
// Big Oak : 2
// Butcher Shop : 2
// Cow Pasture : 2
// Gilles' Garden : 5
// Hawthorn : 4
// Fabienne's Garden : 2
// Great Pine : 2
// Chateau : 2
// Tall Poplar : 5
// Jacques' Farm : 4
// Big Maple : 3
// Church Tower : 5
// Woods : 5
// Sportsgrounds : 1
