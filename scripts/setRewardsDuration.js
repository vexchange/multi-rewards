// ES5 style
const find = require('lodash/find');
const readlineSync = require('readline-sync');
const consola = require('consola');

const Multirewards = require('../build/contracts/MultiRewards.json');

const { getConnex } = require('./utils');

const setRewardsDuration = async ({
  connex,
  duration,
  pool,
  network,
  rewardToken,
}) => {
  const setRewardsDurationABI = find(Multirewards.abi, { name: 'setRewardsDuration' });
  const setRewardsMethod = connex.thor.account(pool.address).method(setRewardsDurationABI);

  const clause = setRewardsMethod.asClause(rewardToken, duration);

  if (require.main === module && network === 'mainnet') {
    const input = readlineSync.question("Confirm you want to execute this on the MAINNET? (y/n) ");

    if (input != 'y') process.exit(1);
  }

  consola.info(`--------------------- Setting rewards duration for: ${pool.pair} ---------------------`);
  consola.info(`Duration: ${duration} seconds`);
  consola.log(' ');

  return new Promise(async (resolve, reject) => {
    try {
      const { txid } = await connex.vendor.sign('tx', [clause]).request();
      consola.info(`Transaction: ${txid}`);
      await connex.thor.ticker().next()

      const transaction = await connex.thor.transaction(txid).getReceipt();

      if (transaction.reverted) {
        consola.error('Transaction was unsuccessful');

        reject();
      } else {
        consola.success(`Successfully set duration`);
        consola.log(' ');

        resolve();
      }
    } catch(error) {
      consola.error(error);

      reject(error);
    }
  });
}

// if called directly (from terminal)
if (require.main === module) {
  const [network, multiRewards, rewardsToken, duration] = process.argv.slice(2);

  if (!network || !multiRewards || !rewardsToken || !duration) {
    consola.error("Usage: node scripts/setRewardsDuration [mainnet|testnet] [Multirewards address] [Reward token address] [Duration in seconds]");

    process.exit();
  }

  (async() => {
    const connex = await getConnex(network);

    const result = await setRewardsDuration({
      connex,
      duration,
      multiRewards,
      network,
      rewardsToken,
    });

    console.log(result)
  })();
}

module.exports = setRewardsDuration;
