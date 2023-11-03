/*

  Crow Tech v2

  Introduce error handling by having callbacks in Nest methods
    follow the convention where the first argument represents failure
    and the second argument contain the value upon success.

  This allows us to define promise-based interfaces for the client.

  Nest.readStorage failures:
  - storage not found

  Nest.send failures:
  - target nest not found
  - target nest is not reachable (not a neighbor)
  - unknown request type

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
    if (!value) {
      callback(new Error(`Storage not found: ${name}`));
      return;
    }
    callback(null, JSON.parse(value));
  }

  send(toName, requestType, content, callback) {
    const toNest = this.#network.nests[toName];
    if (!toNest) {
      callback(new Error(`${toName} not found`));
      return;
    }
    if (!this.neighbors.includes(toNest.name)) {
      callback(new Error(`${toName} is not reachable from ${this.name}`));
      return;
    }

    const handler = this.#network.requestHandlers[requestType];
    if (!handler) {
      callback(new Error(`Unknown request type ${requestType}`));
      return;
    }

    try {
      handler(toNest, this, content, (err, res) => {
        callback(err, res);
      });
    } catch (e) {
      callback(e);
    }
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
