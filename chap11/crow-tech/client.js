/*

  Crow Tech testing

  NB: the logging in this testing playground is excessively verbose.
    It is best to comment out unneeded code when running.

*/

/* eslint-disable no-console */

const Network = require('./crow-tech');
const { nestConnections, storageFor } = require('./data');

const network = new Network(nestConnections, storageFor);
const bigOak = network.nests['Big Oak'];

// === 1. Read a nest's storage (not as a request) ===

function readStorageAt(nest, storageName) {
  return nest.readStorage(storageName)
    .then((content) => {
      if (content) {
        console.log(`Content of '${storageName}' at ${nest.name}: ${content}`);
      } else {
        console.log(`'${storageName}' cache not found at ${nest.name}`);
      }
    });
}

readStorageAt(bigOak, 'food caches');
// Output:
// Content of 'food caches' at Big Oak: cache in the oak,cache in the meadow,cache under the hedge
readStorageAt(bigOak, 'not a cache');
// Output:
// 'not a cache' cache not found at Big Oak

// === 2. Define and issue requests to a nest ===

// Function for defining a request type
function requestType(name, handler) {
  network.defineRequestType(name, (toNest, fromNest, content, callback) => {
    try {
      // convert the value returned by handler to a promise if it isn’t already
      Promise.resolve(handler(toNest, fromNest, content))
        .then((res) => callback(null, res))
        .catch((err) => callback(err));
    } catch (exception) { // any exception raised by the handler is given to the callback
      callback(exception);
    }
  });
}

class Timeout extends Error {}

// Function to issue a request with retrying logic
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

// === 2.1 Non existent request ===

request(bigOak, 'Cow Pasture', 'foo')
  .then(() => console.log('Foo request succeeded'))
  .catch((err) => console.log(`Foo request from Big Oak failed: ${err.message}`));
// Output:
// Foo request from Big Oak failed: Unknown request type foo

// === 2.2 Ping request ===

requestType('ping', () => 'pong');

function sendPing(fromNest, toNestName) {
  request(fromNest, toNestName, 'ping')
    .then((res) => console.log(`Ping request from ${fromNest.name} to ${toNestName} succeeded: received ${res}`))
    .catch((err) => console.log(`Ping request from ${fromNest.name} to ${toNestName} failed: ${err.message}`));
}

sendPing(bigOak, 'Foobar');
// Output:
// Ping request from Big Oak to Foobar failed: Foobar not found

sendPing(bigOak, 'Big Maple');
// Output:
// Ping request from Big Oak to Big Maple failed: Big Maple is not reachable from Big Oak

sendPing(bigOak, 'Cow Pasture');
// Success output:
// Ping request from Big Oak to Cow Pasture succeeded: received pong
// Timeout output:
// Ping request from Big Oak to Cow Pasture failed: Request from Big Oak to Cow Pasture timed out

// === 2.2.1 Use ping request to check neighbors availability ===

function availableNeighbors(nest) {
  const requests = nest.neighbors.map((neighbor) => request(nest, neighbor, 'ping')
    .then(() => true, () => false));
  return Promise.all(requests).then((result) => nest.neighbors.filter((_, i) => result[i]));
}

availableNeighbors(bigOak).then((res) => {
  if (res.length > 0) {
    console.log(`Big Oak's available neighbors: ${res.join(', ')}`);
  } else {
    console.log('Big Oak does not have any available neighbors at the moment');
  }
});
// Output (all ping requests succeeded):
// Big Oak's available neighbors: Cow Pasture, Butcher Shop, Gilles' Garden
// Output (ping request to Butcher Shop failed):
// Big Oak's available neighbors: Cow Pasture, Gilles' Garden
// Output (all ping requests failed):
// console.log('Big Oak does not have any available neighbors at the moment');

// === 2.3 Note request ===

requestType('note', (toNest, fromNest, content) => {
  console.log(`${toNest.name} received note from ${fromNest.name}: ${content}`);
  return 'ack';
});

request(bigOak, 'Cow Pasture', 'note', "Let's caw loudly at 7PM")
  .then((res) => console.log(`Note delivered. Got ${res}`))
  .catch((err) => console.log(`Note delivery failed: ${err.message}`));
// Success output:
// Cow Pasture received note from Big Oak: Let's caw loudly at 7PM
// Note delivered. Got ack
// Timeout output:
// Note delivery failed: Request from Big Oak to Cow Pasture timed out

// === 2.3 Storage request ===

requestType('storage', (toNest, fromNest, storageName) => {
  console.log(`${toNest.name} received request from ${fromNest.name}: read storage at '${storageName}'`);
  return toNest.readStorage(storageName);
});

function sendStorage(fromNest, toNestName, storageName) {
  request(fromNest, toNestName, 'storage', storageName)
    .then((res) => {
      if (res) {
        console.log(`Storage at '${storageName}' for ${toNestName}: ${res}`);
      } else {
        console.log(`No storage found at '${storageName}' for ${toNestName}`);
      }
    })
    .catch((err) => console.log(`Storage request to ${toNestName} failed: ${err.message}`));
}

sendStorage(bigOak, 'Big Maple', 'food caches');
// Output:
// Storage request to Big Maple failed: Big Maple is not reachable from Big Oak
sendStorage(bigOak, 'Cow Pasture', 'food caches');
// Success output:
// Cow Pasture received request from Big Oak: read storage at 'food caches'
// Storage at 'food caches' for Cow Pasture: cache in the oak,cache in the meadow...
// Timeout output:
// Storage request to Cow Pasture failed: Request from Big Oak to Cow Pasture timed out
sendStorage(bigOak, 'Cow Pasture', 'not a cache');
// Success output:
// Cow Pasture received request from Big Oak: read storage at 'not a cache'
// No storage found at 'not a cache' for Cow Pasture
// Timeout output:
// Storage request to Cow Pasture failed: Request from Big Oak to Cow Pasture timed out

// === 3. Network flooding ===

// === 3.1 Broadcast gossip message ===

// Initialize gossip state for all nests.
// Here, we can get away with not waiting since this is a synchronous action.
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
  sendGossip(toNest, message, fromNest.name);
});

sendGossip(bigOak, 'Kids with airguns in the park');
// Output (non deterministic order):
// Cow Pasture received gossip from Big Oak: Kids with airguns in the park
// ... (all nests)

// === 3.2 Request routing ===

// Use network flooding to broadcast connections across the network.
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

// Wait for the connections to be established and then start routing requests.
network.everywhere((nest) => {
  nest.state.connections = new Map();
  nest.state.connections.set(nest.name, nest.neighbors);
  return broadcastConnections(nest, nest.name);
}).then(() => {
  routeRequest(bigOak, 'Church Tower', 'note', 'Incoming jackdaws!')
    .then((res) => console.log(`Note delivered. Got ${res}`))
    .catch((err) => console.log(`Note delivery failed: ${err.message}`));
});
// Output:
// Church Tower received note from Big Maple: Incoming jackdaws!
// Note delivered. Got ack
// Note: we may see "Church Tower received note from Big Maple: Incoming jackdaws!"
// logged multiple times if one or multiple requests (route or note) were retried.

// === 4. Remote storage ===

function getNetwork(nest) {
  return Array.from(nest.state.connections.keys());
}

async function findInStorage(nest, name) {
  console.log(`Storage request from ${nest.name} for '${name}'`);
  const local = await nest.readStorage(name);
  if (local) {
    console.log(`Cache '${name}' found in ${nest.name}: ${local}`);
    return local;
  }

  console.log(`Cache '${name}' not found in ${nest.name}, routing request to remote`);
  let sources = getNetwork(nest).filter((nestName) => nestName !== nest.name);
  while (sources.length > 0) {
    const source = sources[Math.floor(Math.random() * sources.length)];
    console.log(`Routing storage request to ${source}`);
    sources = sources.filter((s) => s !== source);
    try {
      // eslint-disable-next-line no-await-in-loop
      const found = await routeRequest(nest, source, 'storage', name);
      if (found) {
        console.log(`Cache '${name}' found in ${source}: ${found}`);
        return found;
      }
      console.log(`Cache '${name}' not found in ${source}, routing request to next remote`);
    } catch (_) {}
  }
  throw new Error(`Storage not found: ${name}`);
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
  // Gilles' Garden received request from Big Oak: read storage at 'events on 2017-12-21'
  // Cache 'events on 2017-12-21' not found in Gilles' Garden, routing request to next remote
  // Routing storage request to Chateau
  // Chateau received request from Butcher Shop: read storage at 'events on 2017-12-21'
  // Cache 'events on 2017-12-21' found in Chateau: Deep snow. Butcher's garbage can...
  // Contents of 'events on 2017-12-21': Deep snow. Butcher's garbage can fell over. We chased...

  printStorage(bigOak, 'not a cache');
  // Possible output:
  // Storage request from Big Oak for 'not a cache'
  // Cache 'not a cache' not found in Big Oak, routing request to remote
  // Routing storage request to Sportsgrounds
  // Sportsgrounds received request from Tall Poplar: read storage at 'not a cache'
  // Sportsgrounds received request from Tall Poplar: read storage at 'not a cache'
  // Sportsgrounds received request from Tall Poplar: read storage at 'not a cache'
  // Cache 'not a cache' not found in Sportsgrounds, routing request to next remote
  // Routing storage request to Gilles' Garden
  // Gilles' Garden received request from Big Oak: read storage at 'not a cache'
  // Cache 'not a cache' not found in Gilles' Garden, routing request to next remote
  // Routing storage request to Hawthorn
  // Hawthorn received request from Gilles' Garden: read storage at 'not a cache'
  // Cache 'not a cache' not found in Hawthorn, routing request to next remote
  // Routing storage request to Woods
  // Woods received request from Fabienne's Garden: read storage at 'not a cache'
  // Cache 'not a cache' not found in Woods, routing request to next remote
  // Routing storage request to Big Maple
  // Big Maple received request from Fabienne's Garden: read storage at 'not a cache'
  // Cache 'not a cache' not found in Big Maple, routing request to next remote
  // Routing storage request to Chateau
  // Chateau received request from Butcher Shop: read storage at 'not a cache'
  // Cache 'not a cache' not found in Chateau, routing request to next remote
  // Routing storage request to Great Pine
  // Great Pine received request from Gilles' Garden: read storage at 'not a cache'
  // Cache 'not a cache' not found in Great Pine, routing request to next remote
  // Routing storage request to Church Tower
  // Church Tower received request from Big Maple: read storage at 'not a cache'
  // Cache 'not a cache' not found in Church Tower, routing request to next remote
  // Routing storage request to Fabienne's Garden
  // Fabienne's Garden received request from Cow Pasture: read storage at 'not a cache'
  // Cache 'not a cache' not found in Fabienne's Garden, routing request to next remote
  // Routing storage request to Butcher Shop
  // Butcher Shop received request from Big Oak: read storage at 'not a cache'
  // Cache 'not a cache' not found in Butcher Shop, routing request to next remote
  // Routing storage request to Jacques' Farm
  // Jacques' Farm received request from Hawthorn: read storage at 'not a cache'
  // Cache 'not a cache' not found in Jacques' Farm, routing request to next remote
  // Routing storage request to Cow Pasture
  // Cow Pasture received request from Big Oak: read storage at 'not a cache'
  // Cache 'not a cache' not found in Cow Pasture, routing request to next remote
  // Routing storage request to Tall Poplar
  // Tall Poplar received request from Butcher Shop: read storage at 'not a cache'
  // Cache 'not a cache' not found in Tall Poplar, routing request to next remote
  // Storage not found: not a cache
});

// === 5. Chicks count ===

// Find something in any nest
// If the nest that issued the request has it, return.
// If not, route the request to the desired nest.
function anyStorage(nest, source, name) {
  if (source === nest.name) {
    return nest.readStorage(name);
  }
  return routeRequest(nest, source, 'storage', name);
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
// Butcher Shop received request from Big Oak: read storage at 'chicks in 2023'
// Cow Pasture received request from Big Oak: read storage at 'chicks in 2023'
// Gilles' Garden received request from Big Oak: read storage at 'chicks in 2023'
// Chateau received request from Butcher Shop: read storage at 'chicks in 2023'
// Fabienne's Garden received request from Cow Pasture: read storage at 'chicks in 2023'
// Great Pine received request from Gilles' Garden: read storage at 'chicks in 2023'
// Hawthorn received request from Gilles' Garden: read storage at 'chicks in 2023'
// Tall Poplar received request from Butcher Shop: read storage at 'chicks in 2023'
// Sportsgrounds received request from Tall Poplar: read storage at 'chicks in 2023'
// Big Maple received request from Fabienne's Garden: read storage at 'chicks in 2023'
// Jacques' Farm received request from Hawthorn: read storage at 'chicks in 2023'
// Woods received request from Fabienne's Garden: read storage at 'chicks in 2023'
// Church Tower received request from Big Maple: read storage at 'chicks in 2023'
// Chicks in 2023:
// Big Oak : 2
// Gilles' Garden : 1
// Butcher Shop : 3
// Cow Pasture : 4
// Great Pine : 5
// Fabienne's Garden : 3
// Tall Poplar : 0
// Hawthorn : 3
// Sportsgrounds : 1
// Woods : 2
// Big Maple : 5
// Jacques' Farm : 2
// Chateau : 4
// Church Tower : 0

// === 6. Scalpel tracking ===

async function locateScalpel(nest) {
  console.log(`Request to locate scalpel from ${nest.name}`);
  let scalpelLoc = await nest.readStorage('scalpel');
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
// Gilles' Garden received request from Big Oak: read storage at 'scalpel'
// Next location of scalpel is Woods
// Routing storage request to Woods
// Woods received request from Fabienne's Garden: read storage at 'scalpel'
// Next location of scalpel is Chateau
// Routing storage request to Chateau
// Chateau received request from Butcher Shop: read storage at 'scalpel'
// Next location of scalpel is Butcher Shop
// Routing storage request to Butcher Shop
// Butcher Shop received request from Big Oak: read storage at 'scalpel'
// Scalpel found at Butcher Shop
// Scalpel was found at: Butcher Shop
