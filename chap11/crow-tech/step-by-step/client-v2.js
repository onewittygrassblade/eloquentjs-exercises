/*

  Crow Tech v2 testing

  Test failure in storage reading and request handling.
  Note that this is made a lot easier by using promises.

*/

/* eslint-disable no-console */

const Network = require('./crow-tech-v2');
const { nestConnections, storageFor } = require('../data');

const network = new Network(nestConnections, storageFor);
const bigOak = network.nests['Big Oak'];

// === 1. Read storage ===

// 1.1 Manually handle errors

// Convenience function to log Nest.readStorage errors
function readStorageFrom(nest, name) {
  nest.readStorage(name, (err, content) => {
    if (err) {
      console.log(`[${nest.name}] Failed to read storage: ${err}`);
    } else {
      console.log(`[${nest.name}] Content of ${name}: ${content}`);
    }
  });
}

readStorageFrom(bigOak, 'food caches');
// Output:
// [Big Oak] Content of food caches: cache in the oak,cache in the meadow,cache under the hedge
readStorageFrom(bigOak, 'not a cache');
// Output:
// [Big Oak] Failed to read storage: Error: Storage not found: not a cache

// 1.2 Define promise-based interface

// This function wraps nest.readStorage into a promise.
function storage(nest, name) {
  return new Promise((resolve, reject) => {
    nest.readStorage(name, (failed, result) => {
      if (failed) reject(failed);
      else resolve(result);
    });
  });
}

// Redefine the convenience function to read a nest's storage.
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
// Output:
// [Big Oak] Content of food caches: cache in the oak,cache in the meadow,cache under the hedge
readStorageAt(bigOak, 'not a cache');
// Output:
// [Big Oak] Failed to read storage: Error: Storage not found: not a cache

// === 2. Requests ===

// This function wraps nest.send into a promise.
function request(nest, toName, requestType, content) {
  return new Promise((resolve, reject) => {
    nest.send(toName, requestType, content, (failed, value) => {
      if (failed) reject(failed);
      else resolve(value);
    });
  });
}

// Convenience function
function sendNote(nest, toName, content) {
  request(nest, toName, 'note', content)
    .then((res) => console.log(`Note delivered. Got ${res}`))
    .catch((err) => console.log(`Note delivery failed: ${err}`));
}

sendNote(bigOak, 'Foobar', "Let's caw loudly at 7PM");
// Output: Note delivery failed: Error: Foobar not found
sendNote(bigOak, 'Church Tower', "Let's caw loudly at 7PM");
// Output: Note delivery failed: Error: Church Tower is not reachable from Big Oak
sendNote(bigOak, 'Cow Pasture', "Let's caw loudly at 7PM");
// Output: Note delivery failed: Error: Unknown request type note

network.defineRequestType('note', (toNest, fromNest, content, callback) => {
  console.log(`${toNest.name} received note from ${fromNest.name}: ${content}`);
  callback(null, 'ack');
});

sendNote(bigOak, 'Cow Pasture', "Let's caw loudly at 7PM");
// Output:
// Cow Pasture received note from Big Oak: Let's caw loudly at 7PM
// Note delivered. Got ack
