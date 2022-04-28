// ES5 style
const ethers = require('ethers');
const readlineSync = require('readline-sync');

const { DISTRIBUTOR, REWARD_TOKEN, POOLS } = require('../constants');

const { getConnex, getCurrentVexBalance, getRequiredBalance, getTimeConstraints } = require('./utils/')

const notifyRewardAmount = require('./notifyRewardAmount');

const [network] = process.argv.slice(2);

// // ensure we have appropriate arguments
if (!network) {
  console.error("Usage: node scripts/refreshAllPools [mainnet|testnet]");

  process.exit(1);
} else if (network ==='mainnet') {
  const input = readlineSync.question("Confirm you want to execute this on the MAINNET? (y/n) ");

  if (input != 'y') process.exit(1);
}

const poolCheck = async () => {
  const connex = await getConnex(network);

  // get time constraints
  const { percent } = getTimeConstraints();

  // check balance of distributor
  const requiredBalance = getRequiredBalance(percent);
  const currentBalance = await getCurrentVexBalance(connex);

  if (currentBalance.lt(requiredBalance)) {
    console.warn('Distributor does not have proper balance');

    process.exit(1);
  }

  // iterate through pools
  for (const pool of POOLS) {
    if (!pool.address) {
      console.log('skipping: ', pool.pair);
      continue;
    };

    const rewardAmount = (Math.round(pool.monthlyRate / percent)).toString();

    // we need duration and rewardAmount for each pool
    await notifyRewardAmount({
      connex,
      multiRewards: pool.address,
      network,
      rewardAmount: ethers.utils.parseEther(rewardAmount).toString(),
      rewardToken: REWARD_TOKEN,
    });
  };

  process.exit(1)
};

poolCheck();
