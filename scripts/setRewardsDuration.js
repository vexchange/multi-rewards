// ES5 style
const find = require('lodash/find');
const readlineSync = require('readline-sync');

const Multirewards = require('../build/contracts/MultiRewards.json');

const { getConnex } = require('./utils');

const setRewardsDuration = async ({
  connex,
  duration,
  multiRewards,
  network,
  rewardToken,
}) => {
  const setRewardsDurationABI = find(Multirewards.abi, { name: 'setRewardsDuration' });
  const setRewardsMethod = connex.thor.account(multiRewards).method(setRewardsDurationABI);

  const clause = setRewardsMethod.asClause(rewardToken, duration);

  if (require.main === module && network === 'mainnet') {
    const input = readlineSync.question("Confirm you want to execute this on the MAINNET? (y/n) ");

    if (input != 'y') process.exit(1);
  }

  // try {
  //   const { txId } = await connex.vendor.sign('tx', [clause]).request();
  //   const transaction = await connex.thor.transaction(txId).getReceipt()
  //
  //   if (transaction.reverted) {
  //     console.log("tx was unsuccessful");
  //     reject('tx was unsuccessful')
  //   } else {
  //     console.log("Set rewards duration was succcessful");
  //     resolve('Set rewards duration was succcessful')
  //   }
  // } catch(error) {
  //   console.error(error);
  //   reject(error);
  // }
}

// if called directly (from terminal)
if (require.main === module) {
  const [network, multiRewards, rewardsToken, duration] = process.argv.slice(2);

  if (!network || !multiRewards || !rewardsToken || !duration) {
    console.error("Usage: node scripts/setRewardsDuration [mainnet|testnet] [Multirewards address] [Reward token address] [Duration in seconds]");

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
