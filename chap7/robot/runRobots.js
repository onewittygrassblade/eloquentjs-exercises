const fixedRouteRobot = require('./fixedRouteRobot');
const randomRobot = require('./randomRobot');
const routeFindingRobot = require('./routeFindingRobot');
const runRobot = require('./runRobot');
const smartRobot = require('./smartRobot');
const VillageState = require('./VillageState');

function printRobot(nTurns) {
  if (nTurns < 0) {
    return 'Max number of turns reached';
  }
  return `Done in ${nTurns} turns`;
}

const villageState = VillageState.random();
// eslint-disable-next-line no-console
console.log(`Random Robot: ${printRobot(runRobot(villageState, randomRobot))}
Fixed Route Robot: ${printRobot(runRobot(villageState, fixedRouteRobot, []))}
Route Finding Robot: ${printRobot(runRobot(villageState, routeFindingRobot, []))}
Smart Robot: ${printRobot(runRobot(villageState, smartRobot, []))}`);
