/*

  Crow Tech v3

  Simulate latency and random failure (timeouts).

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
    setTimeout(() => callback(null, JSON.parse(value)), 20); // Add fixed latency
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

    // Simulate latency and random failure
    if (Math.random() > 0.03) {
      setTimeout(() => {
        try {
          handler(toNest, this, content, (err, res) => {
            setTimeout(() => {
              callback(err, res);
            }, 10);
          });
        } catch (e) {
          callback(e);
        }
      }, 10 + Math.floor(Math.random() * 10));
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
