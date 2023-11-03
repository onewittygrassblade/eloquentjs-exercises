const Network = require('./crow-tech');
const { nestConnections, storageFor } = require('./data');

const network = new Network(nestConnections, storageFor);
const bigOak = network.nests['Big Oak'];

network.defineRequestType('note', (toNest, fromNest, content, done) => {
  done(toNest, fromNest, content);
});

describe('Nest', () => {
  describe('.readStorage', () => {
    it('returns the storage content parsed from JSON', async () => {
      const content = await bigOak.readStorage('cache in the oak');
      expect(content).toEqual('A hollow above the third big branch from the bottom. Several pieces of bread and a pile of acorns.');

      const contentArray = await bigOak.readStorage('food caches');
      expect(contentArray).toEqual(['cache in the oak', 'cache in the meadow', 'cache under the hedge']);
    });

    it('returns undefined if the storage does not contain the key', async () => {
      const content = await bigOak.readStorage('not a cache');
      expect(content).toBeUndefined();
    });
  });

  describe('.send', () => {
    it('passes an error to the callback if the target nest is not found', () => {
      const mockCallback = jest.fn();
      bigOak.send(
        'Foobar',
        'foo',
        'bar',
        mockCallback,
      );
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(new Error('Foobar not found'));
    });

    it('passes an error to the callback if the target nest is not a neighbor', () => {
      const mockCallback = jest.fn();
      bigOak.send(
        'Big Maple',
        'foo',
        'bar',
        mockCallback,
      );
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(new Error('Big Maple is not reachable from Big Oak'));
    });

    it('passes an error to the callback if the request handler is not found', () => {
      const mockCallback = jest.fn();
      bigOak.send(
        'Cow Pasture',
        'foo',
        'bar',
        mockCallback,
      );
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(new Error('Unknown request type foo'));
    });
  });
});
