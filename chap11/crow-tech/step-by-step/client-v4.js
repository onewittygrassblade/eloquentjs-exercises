/*

  Crow Tech v4 testing

  Make use of Network.everywhere to perform network flooding.

  1. Gossip request: flood network so that all nests get the information.
  2. Request routing: network flooding is used to give all nests knowledge of
    the network connections. Using that, requests can be routed across the network
    and not just to neighbors, using a path-finding algorithm.
    Note: this implementation is flawed as it does not wait for the connections broadcast to
      finish. v5 fixes that.

*/

/* eslint-disable no-console */

const Network = require('./crow-tech-v4');
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

// === 1. Network flooding: gossip request ===

// Initialize gossip state for all nests.
network.everywhere((nest) => {
  nest.state.gossip = [];
});

// Function to add a gossip message to a nest and send a gossip request to its neighbors.
function sendGossip(nest, message, exceptFor = null) {
  nest.state.gossip.push(message);
  for (const neighbor of nest.neighbors) {
    if (neighbor !== exceptFor) {
      request(nest, neighbor, 'gossip', message);
    }
  }
}

requestType('gossip', (toNest, fromNest, message) => {
  if (toNest.state.gossip.includes(message)) {
    return;
  }
  console.log(`${toNest.name} received gossip from ${fromNest.name}: ${message}`);
  sendGossip(toNest, message, fromNest);
});

sendGossip(bigOak, 'Kids with airguns in the park');
// Example output:
// Gilles' Garden received gossip from Big Oak: Kids with airguns in the park
// Butcher Shop received gossip from Big Oak: Kids with airguns in the park
// Cow Pasture received gossip from Big Oak: Kids with airguns in the park
// Hawthorn received gossip from Gilles' Garden: Kids with airguns in the park
// Great Pine received gossip from Gilles' Garden: Kids with airguns in the park
// Chateau received gossip from Butcher Shop: Kids with airguns in the park
// Tall Poplar received gossip from Butcher Shop: Kids with airguns in the park
// Fabienne's Garden received gossip from Cow Pasture: Kids with airguns in the park
// Jacques' Farm received gossip from Hawthorn: Kids with airguns in the park
// Big Maple received gossip from Fabienne's Garden: Kids with airguns in the park
// Sportsgrounds received gossip from Tall Poplar: Kids with airguns in the park
// Woods received gossip from Fabienne's Garden: Kids with airguns in the park
// Church Tower received gossip from Big Maple: Kids with airguns in the park

// === 2. Request routing ===

// Use network flooding to give all nests knowledge of the network's connections

function broadcastConnections(nest, name, exceptFor = null) {
  for (const neighbor of nest.neighbors) {
    if (neighbor !== exceptFor) {
      request(nest, neighbor, 'connections', {
        name,
        neighbors: nest.state.connections.get(name),
      });
    }
  }
}

requestType('connections', (toNest, fromNest, { name, neighbors }) => {
  const { connections } = toNest.state;
  if (JSON.stringify(connections.get(name)) === JSON.stringify(neighbors)) {
    return;
  }
  connections.set(name, neighbors);
  broadcastConnections(toNest, name, fromNest);
});

// Broadcast connections across the network.
// /!\ Any action depending on connections should wait for them to be established,
// which is not feasible as is as Network.everywhere is not async.
network.everywhere((nest) => {
  nest.state.connections = new Map();
  nest.state.connections.set(nest.name, nest.neighbors);
  broadcastConnections(nest, nest.name);
});

// Route-finding function (cf. chapter 7).
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

// This function takes the params for a request and checks if the target nest is a neighbor:
// If it is a neighbor, it issues the request normally.
// If not, it issues a route request with the necessary information.
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

requestType('note', (toNest, fromNest, content) => {
  console.log(`${toNest.name} received note from ${fromNest.name}: ${content}`);
  return 'ack';
});

routeRequest(bigOak, 'Cow Pasture', 'note', 'Incoming jackdaws!')
  .then((res) => console.log(`Note delivered. Got ${res}`))
  .catch((err) => console.log(`Note delivery failed: ${err.message}`));
// Output:
// Cow Pasture received note from Big Oak: Incoming jackdaws!
// Note delivered. Got ack

// Artificially wait for a long time to ensure all nests have connections.
setTimeout(() => {
  routeRequest(bigOak, 'Church Tower', 'note', 'Incoming jackdaws!')
    .then((res) => console.log(`Note delivered. Got ${res}`))
    .catch((err) => console.log(`Note delivery failed: ${err.message}`));
}, 2000);
// Output:
// Church Tower received note from Big Maple: Incoming jackdaws!
// Note delivered. Got ack
// Important note:
// Because the network has latency, requests may be retried, resulting in the log
// Church Tower received note from Big Maple: Incoming jackdaws!
// to be logged multiple times.

// If we don't wait, connections are not ready.
routeRequest(bigOak, 'Church Tower', 'note', 'Incoming jackdaws!')
  .then((res) => console.log(`Note delivered. Got ${res}`))
  .catch((err) => console.log(`Note delivery failed: ${err.message}`));
// Output:
// Note delivery failed: No route to Church Tower
