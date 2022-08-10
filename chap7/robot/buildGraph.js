function buildGraph(edges) {
  const graph = {};

  function addEdge(from, to) {
    if (graph[from] == null) {
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  }

  for (const [from, to] of edges) {
    addEdge(from, to);
    addEdge(to, from);
  }

  return graph;
}

module.exports = buildGraph;
