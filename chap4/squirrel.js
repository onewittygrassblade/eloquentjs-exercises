/*

Eloquent JavaScript - Chapter 4 - Weresquirrel example

Objective: based on a journal recording, for each day, events and whether
a person changed into a squirrel, compute correlations between events and
squirrel occurrences; identify whether a particular combination causes the
transformations.

The journal is given in journal.js and is formatted as an array of objects of
format { events: ['carrot', 'exercise', 'weekend'], squirrel: false }.

Main functionality:
1. The The function journalEvents(journal) returns an array of all the unique
events in the journal.
2. The function tableFor(journal, event) returns a array of format
[n00, n01, n10, n11], where n** is the count of (anti-)correlations between
the event and the squirrel occurrence.
3. The function phi([n00, n01, n10, n11]) returns the phi coefficient between
two Boolean variables, based on the passed table.

Added analysis helpers:
1. The function correlationsFor(journal, cutoff) returns an array of all
event correlations with format:
["brushed teeth", -0.3805211953235953], ["work", -0.13719886811400708], ...].
If the optional cutoff is passed, the entries with phi < |cutoff| are
filtered out.
2. The function
addCompositeEvent(journal, event1, event1IsPresent, event2, event2IsPresent, tag)
returns a copy of the journal with a new "event" computed from the presence of
the two specified events. For instance,
addCompositeEvent(JOURNAL, 'peanuts', true, 'brushed teeth', false, 'peanut teeth')
will return a copy of JOURNAL with the event 'peanut teeth' present wherever
'peanuts' is present and 'brushed teeth' is absent.

Data analysis:
Listing event correlations < -0.3 or > 0.3 gives:
  brushed teeth: -0.3805211953235953
  peanuts: 0.59026798116852
which suggests a correlation with peanuts and an anticorrelation with brushing
teeth. Adding the composite event 'peanut teeth' as above and computing the
phi coefficient for 'peanut teeth' gives:
  Phi (ate peanuts, did not brush teeth) = 1
i.e. perfect correlation, i.e. 100% chance of weresquirrel if the person ate
peanuts and failed to brush their teeth.

*/

function journalEvents(journal) {
  return [...new Set(journal.flatMap((entry) => entry.events))];
}

function tableFor(journal, event) {
  const table = [0, 0, 0, 0];

  for (const entry of journal) {
    let index = 0;
    if (entry.events.includes(event)) index += 1;
    if (entry.squirrel) index += 2;
    table[index] += 1;
  }

  return table;
}

function phi([n00, n01, n10, n11]) {
  return (n00 * n11 - n01 * n10)
    / Math.sqrt((n00 + n01)
              * (n00 + n10)
              * (n01 + n11)
              * (n10 + n11));
}

function correlationsFor(journal, cutoff) {
  return journalEvents(journal)
    .map((event) => [event, phi(tableFor(journal, event))])
    .sort((a, b) => a[1] - b[1])
    .filter((event) => (cutoff ? Math.abs(event[1]) > cutoff : event));
}

function addCompositeEvent(journal, event1, event1IsPresent, event2, event2IsPresent, tag) {
  return journal
    .map((entry) => (entry.events.includes(event1) === event1IsPresent
        && entry.events.includes(event2) === event2IsPresent
      ? { ...entry, events: [...entry.events, tag] }
      : entry));
}

exports.phi = phi;
exports.tableFor = tableFor;
exports.journalEvents = journalEvents;
exports.correlationsFor = correlationsFor;
exports.addCompositeEvent = addCompositeEvent;

// The following lines are commented out to avoid making tests noisy.

// const JOURNAL = require('./journal');
//
// console.log('Event correlations (< -0.1 or > 0.1):');
// correlationsFor(JOURNAL, 0.1).forEach(([event, phiCoeff]) => {
//   console.log(`  ${event}: ${phiCoeff}`);
// });
//
// console.log('Correlation for peanuts and not brushing teeth:');
// const tag = 'peanut teeth';
// const peanutTeethTaggedJournal = addCompositeEvent(
//   JOURNAL,
//   'peanuts',
//   true,
//   'brushed teeth',
//   false,
//   tag,
// );
// console.log(`  Phi = ${phi(tableFor(peanutTeethTaggedJournal, tag))}`);
