function runRobot(villageState, robot, memory, nTurns = 0, maxTurns = 50) {
  if (villageState.parcels.length === 0) {
    return nTurns;
  } if (nTurns === maxTurns) {
    return -1; // This is ugly. Returning an Either would be a lot cleaner.
  }
  const action = robot(villageState, memory);
  return runRobot(villageState.move(action.direction), robot, action.memory, nTurns + 1);
}

module.exports = runRobot;
