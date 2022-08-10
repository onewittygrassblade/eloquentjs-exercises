const fixedRouteRobot = require('./fixedRouteRobot');
const routeFindingRobot = require('./routeFindingRobot');
const runRobot = require('./runRobot');
const smartRobot = require('./smartRobot');
const VillageState = require('./VillageState');

function compareRobots(robots, nTasks) {
  for (let i = 0; i < nTasks; i++) {
    const villageState = VillageState.random();
    for (const robot of robots) {
      robot.performanceResults += runRobot(villageState, robot.robot, robot.initialMemory);
    }
  }
  // eslint-disable-next-line no-console
  console.log(`${robots.map((r) => `${r.name}: ${r.performanceResults / nTasks} on average (n = ${nTasks})`).join('\n')}`);
}

compareRobots([
  {
    name: 'Fixed Route Robot',
    robot: fixedRouteRobot,
    initialMemory: [],
    performanceResults: 0,
  },
  {
    name: 'Route Finding Robot',
    robot: routeFindingRobot,
    initialMemory: [],
    performanceResults: 0,
  },
  {
    name: 'Smart Robot',
    robot: smartRobot,
    initialMemory: [],
    performanceResults: 0,
  },
], 1000);
