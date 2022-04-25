// ES5 style
const find = require('lodash/find');

const { getConnex, getCurrentBalance, getRequiredBalance, getTimeConstraints } = require('../utils/')

const Multirewards = require('../../build/contracts/MultiRewards.json');

const setRewardsDuration = require('../setRewardsDuration');
const notifyRewardAmount = require('../notifyRewardAmount2');

const pools = require('./pools.json');

const [network] = process.argv.slice(2);

//ensure we have appropriate arguments
// if (!network) {
//   console.error("Usage: node scripts/refreshAllPools [mainnet|testnet]");
//
//   process.exit();
// } else if (network ==='mainnet') {
//   const input = readlineSync.question("Confirm you want to execute this on the MAINNET? (y/n) ");
//
//   if (input != 'y') process.exit(1);
// }
//

const poolCheck = async () => {
  const connex = await getConnex(network);

  const rewardDataABI = find(Multirewards.abi, { name: 'rewardData' });

  // get time constraints
  const { duration, percent } = getTimeConstraints();

  // check balance of distributor
  const requiredBalance = getRequiredBalance(percent);
  const currentBalance = await getCurrentBalance(connex);

  if (currentBalance.lt(requiredBalance)) {
    console.warn('Distributor does not have proper balance');

    process.exit(1);
  }

  // iterate through pools
  for (const pool of pools) {
    const method = connex.thor.account(pool.address).method(rewardDataABI);
    const rewardAmount = Math.round(pool.monthlyRate / percent);

    // we need duration and rewardAmount for each pool
    // await setRewardsDuration({
    //   connex,
    //   duration,
    //   multiRewards: pool.address,
    //   network,
    //   rewardToken: '0x0BD802635eb9cEB3fCBe60470D2857B86841aab6',
    // });

    // await notifyRewardAmount({
    //   connex,
    //   multiRewards: pool.address,
    //   network,
    //   rewardAmount,
    //   rewardToken: '0x0BD802635eb9cEB3fCBe60470D2857B86841aab6',
    // });
  };

  process.exit(1)
};


poolCheck()
