// ES5 style
const ethers = require('ethers');
const readlineSync = require('readline-sync');
const consola = require('consola');

const { DISTRIBUTOR, REWARD_TOKEN, POOLS } = require('../constants');

const { getConnex, getCurrentVexBalance, getRequiredBalance, getTimeConstraints } = require('./utils/')

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
    if (!pool.address) {
      consola.info('skipping: ', pool.pair);
      continue;
    };

    const rewardAmount = (Math.round(pool.monthlyRate / percent)).toString();

    // await setRewardsDuration({
    //   connex,
    //   duration,
    //   network,
    //   pool,
    //   rewardToken: REWARD_TOKEN[network],
    // });
    //
    // await connex.thor.ticker().next()
    //
    await notifyRewardAmount({
      connex,
      network,
      pool,
      rewardAmount: ethers.utils.parseEther(rewardAmount).toString(),
      rewardToken: REWARD_TOKEN[network],
    });
  };

  process.exit(1)
};

poolCheck();
