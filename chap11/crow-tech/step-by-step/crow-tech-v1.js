/*

  Crow Tech v1

  Introduce the concept in its simplest form (callbacks, no error handling,
    no latency, no random failures).

  Details:
  - The Network class holds a connected graph of nodes (nests),
    each associated with a Nest instance.
  - Available requests to nodes are defined in the network: it is
    up to the user to define them with defineRequestType.
  - Each nest has a storage (object), which holds information like
    food caches, ennemies, chicks.
  - Each nest has a readStorage method that calls a given callback
    on the desired storage key. Note: there is no safeguard if the key doesn't exist!
  - Each nest has a send method that retrieves the handled associated with the
    request type and calls it with the passed callback. Note: there is no safeguard
    if the handler doesn't exist or the handler or callback are malformed!

*/

class Nest {
  #network;

  #storage;

  constructor(name, neighbors, network, storage) {
    this.name = name;
    this.neighbors = neighbors;
    this.#network = network;
    this.#storage = storage;
  }

  readStorage(name, callback) {
    const value = this.#storage[name];
    callback(JSON.parse(value));
  }

  send(toName, requestType, content, callback) {
    const toNest = this.#network.nests[toName];
    const handler = this.#network.requestHandlers[requestType];
    handler(toNest, this, content, callback);
  }
}

class Network {
  constructor(connections, getStorageFor) {
    const graph = Object.create(null);
    for (const [from, to] of connections.map((conn) => conn.split('-'))) {
      (graph[from] || (graph[from] = [])).push(to);
      (graph[to] || (graph[to] = [])).push(from);
    }

    this.nests = Object.create(null);
    for (const name of Object.keys(graph)) {
      this.nests[name] = new Nest(name, graph[name], this, getStorageFor(name));
    }

    this.requestHandlers = Object.create(null);
  }

  defineRequestType(type, handler) {
    this.requestHandlers[type] = handler;
  }
}

module.exports = Network;
