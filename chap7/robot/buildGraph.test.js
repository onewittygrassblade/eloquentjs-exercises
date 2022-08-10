const buildGraph = require('./buildGraph');

describe('buildGraph', () => {
  test('to return a well formed graph object', () => {
    const edges = [
      ['A', 'B'],
      ['A', 'C'],
      ['A', 'P'],
      ['B', 'T'],
      ['D', 'E'],
      ['D', 'T'],
      ['E', 'G'],
      ['G', 'F'],
      ['G', 'S'],
      ['M', 'F'],
      ['M', 'P'],
      ['M', 'S'],
      ['M', 'T'],
      ['S', 'T'],
    ];

    const graph = {
      A: ['B', 'C', 'P'],
      B: ['A', 'T'],
      C: ['A'],
      P: ['A', 'M'],
      T: ['B', 'D', 'M', 'S'],
      D: ['E', 'T'],
      E: ['D', 'G'],
      G: ['E', 'F', 'S'],
      F: ['G', 'M'],
      S: ['G', 'M', 'T'],
      M: ['F', 'P', 'S', 'T'],
    };

    expect(buildGraph(edges)).toEqual(graph);
  });
});
