// ES5 style
const ethers = require('ethers');
const readlineSync = require('readline-sync');
const consola = require('consola');

const { REWARD_TOKEN, POOLS } = require('../constants');

const {
  getConnex,
  getCurrentVexBalance,
  getPoolState,
  getRequiredBalance,
  getTimeConstraints,
} = require('./utils/')

const setRewardsDuration = require('./setRewardsDuration');
const notifyRewardAmount = require('./notifyRewardAmount');

const [network] = process.argv.slice(2);

// // ensure we have appropriate arguments
if (!network) {
  consola.error("Usage: node scripts/refreshAllPools [mainnet|testnet]");

  process.exit(1);
} else if (network ==='mainnet') {
  const input = readlineSync.question("Confirm you want to execute this on the MAINNET? (y/n) ");

  if (input != 'y') process.exit(1);
}

const poolCheck = async () => {
  const connex = await getConnex(network);

  // get time constraints
  const { duration, percent } = getTimeConstraints();

  // check balance of distributor
  const currentBalance = await getCurrentVexBalance(connex, network);
  const requiredBalance = getRequiredBalance(percent, network);

  if (currentBalance.lt(requiredBalance)) {
    consola.error('Distributor does not have proper balance');

    process.exit(1);
  }

  // iterate through pools
  for (const pool of POOLS[network]) {
    const rewardAmount = (Math.round(pool.monthlyRate / percent)).toString();
    const isPoolActive = await getPoolState(pool, connex, network);

    // if pool hasn't launched
    if (!pool.address) {
      consola.info(`Pool ${pool.pair } hasn\'t launched, skipping.`);
      continue;
    };

    // if pool hasn't expired skip
    if (isPoolActive) {
      consola.info(`Pool ${pool.pair} is active, skipping.`);
      continue;
    }

    try {
      await setRewardsDuration({
        connex,
        duration,
        network,
        pool,
        rewardToken: REWARD_TOKEN[network],
      });
    } catch (error) {
      consola.warn(error.msg);
    }

    await connex.thor.ticker().next()

    try {
      await notifyRewardAmount({
        connex,
        network,
        pool,
        rewardAmount: ethers.utils.parseEther(rewardAmount).toString(),
        rewardToken: REWARD_TOKEN[network],
      });
    } catch(error) {
      consola.warn(error.msg);
    }
  };

  process.exit(1)
};

poolCheck();
