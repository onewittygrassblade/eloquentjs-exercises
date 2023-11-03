const nestConnections = [
  'Church Tower-Sportsgrounds',
  'Church Tower-Big Maple',
  'Big Maple-Sportsgrounds',
  'Big Maple-Woods',
  "Big Maple-Fabienne's Garden",
  "Fabienne's Garden-Woods",
  "Fabienne's Garden-Cow Pasture",
  'Cow Pasture-Big Oak',
  'Big Oak-Butcher Shop',
  'Butcher Shop-Tall Poplar',
  'Tall Poplar-Sportsgrounds',
  'Tall Poplar-Chateau',
  'Chateau-Great Pine',
  "Great Pine-Jacques' Farm",
  "Jacques' Farm-Hawthorn",
  'Great Pine-Hawthorn',
  "Hawthorn-Gilles' Garden",
  "Great Pine-Gilles' Garden",
  "Gilles' Garden-Big Oak",
  "Gilles' Garden-Butcher Shop",
  'Chateau-Butcher Shop',
];

function storageFor(name) {
  const storage = Object.create(null);

  storage['food caches'] = ['cache in the oak', 'cache in the meadow', 'cache under the hedge'];
  storage['cache in the oak'] = 'A hollow above the third big branch from the bottom. Several pieces of bread and a pile of acorns.';
  storage['cache in the meadow'] = 'Buried below the patch of nettles (south side). A dead snake.';
  storage['cache under the hedge'] = "Middle of the hedge at Gilles' garden. Marked with a forked twig. Two bottles of beer.";

  storage.enemies = ["Farmer Jacques' dog", 'The butcher', 'That one-legged jackdaw', 'The boy with the airgun'];

  if (name === 'Church Tower' || name === 'Hawthorn' || name === 'Chateau') {
    storage['events on 2017-12-21'] = "Deep snow. Butcher's garbage can fell over. We chased off the ravens from Saint-Vulbas.";
  }

  for (let y = 1985; y <= 2023; y++) {
    // Random integer between 0 and 6 inclusive
    storage[`chicks in ${y}`] = Math.floor(Math.random() * 7);
  }

  if (name === 'Big Oak') {
    storage.scalpel = "Gilles' Garden";
  } else if (name === "Gilles' Garden") {
    storage.scalpel = 'Woods';
  } else if (name === 'Woods') {
    storage.scalpel = 'Chateau';
  } else if (name === 'Chateau' || name === 'Butcher Shop') {
    storage.scalpel = 'Butcher Shop';
  } else {
    storage.scalpel = 'Big Oak';
  }

  for (const prop of Object.keys(storage)) {
    storage[prop] = JSON.stringify(storage[prop]);
  }

  return storage;
}

exports.nestConnections = nestConnections;
exports.storageFor = storageFor;
