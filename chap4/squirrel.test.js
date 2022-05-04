const JOURNAL = require('./journal');
const {
  journalEvents,
  phi,
  tableFor,
  correlationsFor,
  addCompositeEvent,
} = require('./squirrel');

test('journalEvents to return an array with all the unique event names', () => {
  expect(journalEvents(JOURNAL)).toEqual([
    'carrot', 'exercise',
    'weekend', 'bread',
    'pudding', 'brushed teeth',
    'touched tree', 'nachos',
    'cycling', 'brussel sprouts',
    'ice cream', 'computer',
    'potatoes', 'candy',
    'dentist', 'running',
    'pizza', 'work',
    'beer', 'cauliflower',
    'lasagna', 'lettuce',
    'television', 'spaghetti',
    'reading', 'peanuts',
  ]);
});

test('tableFor to return a frequency table for the passed event and the squirrel occurrences', () => {
  expect(tableFor(JOURNAL, 'pizza')).toEqual([76, 9, 4, 1]);
});

test('phi to return the phi coefficient for the passed frequency table', () => {
  expect(phi(tableFor(JOURNAL, 'pizza'))).toBeCloseTo(0.06859943405700354, 17);
});

test('correlationsFor to return the phi coefficient for the journal above or below the passed cutoff', () => {
  expect(correlationsFor(JOURNAL, 0.3)).toEqual([
    ['brushed teeth', -0.3805211953235953],
    ['peanuts', 0.59026798116852],
  ]);
});

test('addCompositeEvent to return a copy of the journal with a new event computed from the occurrence of two existing events', () => {
  const tag = 'peanut teeth';
  const taggedJournal = addCompositeEvent(JOURNAL, 'peanuts', true, 'brushed teeth', false, tag);
  expect(journalEvents(taggedJournal)).toEqual(expect.arrayContaining([tag]));
  // We know that peanuts + no brushing teeth are perfectly correlated.
  expect(phi(tableFor(taggedJournal, tag))).toEqual(1);
});
