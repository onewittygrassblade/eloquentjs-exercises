/*

Eloquent JavaScript - Chapter 4 - Exercise 1 (The Sum of a Range)

Requirements:
1. Write a range function that takes two arguments, start and end, and returns
an array containing all the numbers from start to (and including) end.
2. Write a sum function that takes an array of numbers and returns the sum of
these numbers.
3. Modify the range function to take an optional argument that indicates the
"step" value used when building the array. If no step is given, the elements go
up by increments of one. The following cases should be verified:
  range(1, 10, 2) === [1, 3, 5, 7, 9]
  range(5, 2, -1) === [5, 4, 3, 2]

*/

function range(start, end, step = 1) {
  return Array((Math.abs(end - start) + 1) / Math.abs(step))
    .fill(0)
    .map((_, i) => start + i * step);
}

function sum(arr) {
  return arr.reduce((acc, i) => acc + i);
}

exports.range = range;
exports.sum = sum;
