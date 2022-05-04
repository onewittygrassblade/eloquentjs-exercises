/*

Eloquent JavaScript - Chapter 4 - Exercise 3 (A List)

Requirements:
1. Write a function arrayToList that builds up the following list structure when
given [1, 2, 3] as argument:
{
  value: 1,
  rest: {
    value: 2,
    rest: {
      value: 3,
      rest: null
    }
  }
}
2. Write a function listToArray that produces an array from a list.
3. Write a function prepend, which takes an element and a list and creates a
new list thats adds the element to the front of the input list.
4. Write a function nth, which takes a list and a number and returns the element
at the given position in the list (with zero referring to the first element) or
undefined when there is no such element.

*/

function arrayToList(arr) {
  return arr.reduceRight((acc, elem) => ({
    value: elem,
    rest: acc,
  }), null);
}

function listToArray(list) {
  const arr = [];
  for (let node = list; node; node = node.rest) {
    arr.push(node.value);
  }
  return arr;
}

function prepend(elem, list) {
  return {
    value: elem,
    rest: list,
  };
}

function nth(list, n) {
  if (n < 0 || !list) {
    return undefined;
  }
  if (n === 0) {
    return list.value;
  }
  return nth(list.rest, n - 1);
}

exports.arrayToList = arrayToList;
exports.listToArray = listToArray;
exports.prepend = prepend;
exports.nth = nth;
