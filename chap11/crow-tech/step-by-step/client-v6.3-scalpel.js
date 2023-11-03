/*

  Crow Tech v6 testing

  Implement tracking the location of the scalpel:
  - It is assumed that all nests have a scalpel entry in their storage.
  - The scalpel entry points towards the next known location of the scalpel.
  - There is exactly one nest with a scalpel location pointing to itself.
  - When a nest issues a request to track the scalpel, it begins with its own scalpel entry
    and then goes on to the next entry until it finds the nest pointing to itself.

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

function getNetwork(nest) {
  return Array.from(nest.state.connections.keys());
}

function storage(nest, name) {
  return new Promise((resolve) => {
    nest.readStorage(name, (result) => resolve(result));
  });
}

requestType('storage', (nest, _fromNest, name) => storage(nest, name));

async function locateScalpel(nest) {
  console.log(`Request to locate scalpel from ${nest.name}`);
  let scalpelLoc = await storage(nest, 'scalpel');
  if (scalpelLoc === nest.name) {
    console.log(`Scalpel found at ${scalpelLoc}`);
    return nest.name;
  }

  console.log(`Next location of scalpel is ${scalpelLoc}`);
  let sources = getNetwork(nest).filter((nestName) => nestName !== nest.name);
  while (sources.length > 0) {
    console.log(`Routing storage request to ${scalpelLoc}`);
    // eslint-disable-next-line no-loop-func
    sources = sources.filter((s) => s !== scalpelLoc);
    try {
      // eslint-disable-next-line no-await-in-loop
      const nextLoc = await routeRequest(nest, scalpelLoc, 'storage', 'scalpel');
      if (nextLoc === scalpelLoc) {
        console.log(`Scalpel found at ${scalpelLoc}`);
        return scalpelLoc;
      }
      scalpelLoc = nextLoc;
      console.log(`Next location of scalpel is ${scalpelLoc}`);
    } catch (_) {}
  }
  throw new Error('Scalpel not found');
}

network.everywhere((nest) => {
  nest.state.connections = new Map();
  nest.state.connections.set(nest.name, nest.neighbors);
  return broadcastConnections(nest, nest.name);
}).then(() => {
  locateScalpel(bigOak)
    .then((res) => console.log(`Scalpel was found at: ${res}`))
    .catch((err) => console.log(err.message));
});
// Output:
// Request to locate scalpel from Big Oak
// Next location of scalpel is Gilles' Garden
// Routing storage request to Gilles' Garden
// Next location of scalpel is Woods
// Routing storage request to Woods
// Next location of scalpel is Chateau
// Routing storage request to Chateau
// Next location of scalpel is Butcher Shop
// Routing storage request to Butcher Shop
// Scalpel found at Butcher Shop
// Scalpel was found at: Butcher Shop
