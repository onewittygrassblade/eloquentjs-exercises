/*

  Crow Tech v3 testing

  Test random failure and latency in storage reading and request handling.
  Request types:
  - ping (used to implement checking on available neighbors)
  - note
  - storage

*/

/* eslint-disable no-console */

const Network = require('./crow-tech-v3');
const { nestConnections, storageFor } = require('../data');

const network = new Network(nestConnections, storageFor);
const bigOak = network.nests['Big Oak'];

// === 1. Read storage ===

// NB: this part is identical to v2, except that there is latency.

// Define promise-based interface for Nest.readStorage
function storage(nest, name) {
  return new Promise((resolve, reject) => {
    nest.readStorage(name, (failed, result) => {
      if (failed) reject(failed);
      else resolve(result);
    });
  });
}

// Convenience function to log readStorage errors
function readStorageAt(nest, name) {
  return storage(nest, name)
    .then((content) => {
      console.log(`[${nest.name}] Content of ${name}: ${content}`);
    })
    .catch((err) => {
      console.log(`[${nest.name}] Failed to read storage: ${err}`);
    });
}

readStorageAt(bigOak, 'food caches');
// Output: [Big Oak] Content of food caches: cache in the oak,cache in the meadow...
readStorageAt(bigOak, 'not a cache');
// Output: [Big Oak] Failed to read storage: Error: Storage not found: not a cache

// === 2. Requests ===

class Timeout extends Error {}

// Define request function that retries a given type of request.
// NB: this is only a promise wrapper with retrying logic.
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

// Define a wrapper for defineRequestType that allows the handler to return a promise
// or plain value and wires it to the callback.
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

// 2.1 ping request

requestType('ping', () => 'pong');

function sendPing(nest, toName) {
  request(nest, toName, 'ping')
    .then((res) => console.log(`Ping request succeeded: received ${res}`))
    .catch((err) => console.log(`Ping request failed: ${err}`));
}

sendPing(bigOak, 'Foobar');
// Output: Ping request failed: Error: Foobar not found

sendPing(bigOak, 'Big Maple');
// Output: Ping request failed: Error: Big Maple is not reachable from Big Oak

sendPing(bigOak, 'Cow Pasture');
// Success output: Ping request succeeded: received pong
// Timeout output: Ping request failed: Error: Request from Big Oak to Cow Pasture timed out

// Test: ping available neighbors

function availableNeighbors(nest) {
  const requests = nest.neighbors.map((neighbor) => request(nest, neighbor, 'ping')
    .then(() => true, () => false));
  return Promise.all(requests).then((result) => nest.neighbors.filter((_, i) => result[i]));
}

availableNeighbors(bigOak).then((res) => {
  console.log(`${bigOak.name}'s available neighbors: ${res.join(', ')}`);
});
// Output:
// Big Oak's available neighbors: Cow Pasture, Butcher Shop, Gilles' Garden
// In case a ping request timed out, e.g. Butcher Shop, then it simply won't be listed.
// At worst (no available neighbors), this returns an empty array.
// /!\ This will return an empty array if the ping request type is not defined!

// 2.2 note request

requestType('note', (toNest, fromNest, content) => {
  console.log(`${toNest.name} received note from ${fromNest.name}: ${content}`);
  return 'ack';
});

request(bigOak, 'Cow Pasture', 'note', "Let's caw loudly at 7PM")
  .then((res) => console.log(`Note delivered. Got ${res}`))
  .catch((err) => console.log(`Note delivery failed: ${err}`));
// Success output:
// Cow Pasture received note from Big Oak: Let's caw loudly at 7PM
// Note delivered. Got ack
// Timeout output:
// Note delivery failed: Error: Request from Big Oak to Cow Pasture timed out

// 2.3 request with a callback that might fail (read storage)

requestType('storage', (toNest, fromNest, name) => {
  console.log(`${toNest.name} received request from ${fromNest.name}: read storage at ${name}`);
  return storage(toNest, name);
});

function sendStorage(nest, toName, storageName) {
  request(nest, toName, 'storage', storageName)
    .then((res) => console.log(`Storage at ${storageName} for ${toName}: ${res}`))
    .catch((err) => console.log(`Storage request to ${toName} failed: ${err}`));
}

sendStorage(bigOak, 'Cow Pasture', 'food caches');
// Success output:
// Cow Pasture received request from Big Oak: read storage at food caches
// Storage at food caches for Cow Pasture: cache in the oak,cache in the meadow...
// Timeout output:
// Storage request to Cow Pasture failed: Error: Request from Big Oak to Cow Pasture timed out
sendStorage(bigOak, 'Big Maple', 'food caches');
// Output:
// Storage request to Big Maple failed: Error: Big Maple is not reachable from Big Oak
sendStorage(bigOak, 'Cow Pasture', 'not a cache');
// Success output:
// Cow Pasture received request from Big Oak: read storage at not a cache
// Storage request to Cow Pasture failed: Error: Storage not found: not a cache
// Timeout output:
// Storage request to Cow Pasture failed: Error: Request from Big Oak to Cow Pasture timed out
