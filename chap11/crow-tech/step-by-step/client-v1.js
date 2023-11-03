/*

  Crow Tech v1 testing

  Test Nest.readStorage and Network.defineRequestType + Nest.send.

  Note: this is synchronous code, therefore the logs will appear in order.

*/

/* eslint-disable no-console */

const Network = require('./crow-tech-v1');
const { nestConnections, storageFor } = require('../data');

const network = new Network(nestConnections, storageFor);
const bigOak = network.nests['Big Oak'];

// === 1. Read storage ===

bigOak.readStorage('food caches', (caches) => {
  for (const cache of caches) {
    bigOak.readStorage(cache, (content) => {
      console.log(`Content of "${cache}": ${content}`);
    });
  }
});
// Output:
// Content of cache in the oak : A hollow above the third big branch...
// Content of cache in the meadow : Buried below the patch of nettles...
// Content of cache under the hedge : Middle of the hedge at Gilles' garden...

// === 2. Requests ===

network.defineRequestType('note', (toNest, fromNest, content, callback) => {
  console.log(`${toNest.name} received note from ${fromNest.name}: ${content}`);
  callback('ack');
});

bigOak.send(
  'Cow Pasture',
  'note',
  "Let's caw loudly at 7PM",
  (res) => console.log(`Note delivered. Got ${res}`),
);
// Output:
// Cow Pasture received note from Big Oak: Let's caw loudly at 7PM
// Note delivered. Got ack
