class MultiplicatorUnitFailure extends Error {}

function primitiveMultiply(a, b) {
  if (Math.random() < 0.2) {
    return a * b;
  }
  throw new MultiplicatorUnitFailure('Klunk');
}
/*
    Forever loop approach:
    looks dangerous, but statistically safe.
*/
function reliableMultiply(a, b) {
  for (;;) {
    try {
      return primitiveMultiply(a, b);
    } catch (e) {
      if (!(e instanceof MultiplicatorUnitFailure)) {
        throw e;
      }
    }
  }
}

/*
    Recursive function approch:
    bounded by stack size, which is a safe bet.
*/
function recursiveReliableMultiply(a, b) {
  try {
    return primitiveMultiply(a, b);
  } catch (e) {
    if (e instanceof MultiplicatorUnitFailure) {
      return recursiveReliableMultiply(a, b);
    }
    throw e;
  }
}

exports.reliableMultiply = reliableMultiply;
exports.recursiveReliableMultiply = recursiveReliableMultiply;
