const { ROAD_GRAPH } = require('./places');
const randomPick = require('./randomPick');

/*
    This robot chooses a random direction every time.
*/
function randomRobot(villageState) {
  return { direction: randomPick(ROAD_GRAPH[villageState.robotPos]) };
}

module.exports = randomRobot;
