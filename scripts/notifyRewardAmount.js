// ES5 style
const find = require('lodash/find');
const readlineSync = require('readline-sync');
const consola = require('consola');
const ethers = require('ethers');

const Multirewards = require('../build/contracts/MultiRewards.json');
const IERC20 = require('../build/contracts/IERC20.json');

const { getConnex } = require('./utils');

const notifyRewardAmount = async ({
  connex,
  pool,
  network,
  rewardAmount,
  rewardToken,
}) => {
  const approveABI = find(IERC20.abi, { name: 'approve' });
  const approveMethod = connex.thor.account(rewardToken).method(approveABI);

  const notifyRewardAmountABI = find(Multirewards.abi, { name: 'notifyRewardAmount' });
  const notifyRewardAmountMethod = connex.thor.account(pool.address).method(notifyRewardAmountABI);

  const approveClause = approveMethod.asClause(pool.address, rewardAmount);
  const notifyRewardAmountClause = notifyRewardAmountMethod.asClause(rewardToken, rewardAmount);

  if (require.main === module && network === 'mainnet') {
    const input = readlineSync.question("Confirm you want to execute this on the MAINNET? (y/n) ");

    if (input != 'y') process.exit(1);
  }

  consola.info(`--------------------- Notifying reward amount for: ${pool.pair} ---------------------`);
  consola.info(`Reward token: ${rewardToken}`);
  consola.info(`Reward amount: ${ethers.utils.formatEther(rewardAmount)}`);
  consola.log(' ');

  return new Promise(async (resolve, reject) => {
    try {
      consola.info('Approving amount...');

      const approve = await connex.vendor.sign('tx', [approveClause]).request();

      consola.info('Transaction: ', approve.txid);
      await connex.thor.ticker().next()

      consola.log(' ');
      consola.info('Notifying reward amount...');

      const notifyRewardAmount = await connex.vendor.sign('tx', [notifyRewardAmountClause]).dependsOn(approve.txid).request();

      consola.info('Transaction: ', notifyRewardAmount.txid);
      await connex.thor.ticker().next()

      const transaction = await connex.thor.transaction(notifyRewardAmount.txid).getReceipt();

      if (transaction.reverted) {
        reject({
          msg: 'Transaction was reverted',
          transaction,
        });
      } else {
        resolve({
          msg: 'Successfully notified rewards',
          transaction
        });
      }
    } catch(error) {
      reject();
    }
  });
};

// if called directly (from terminal)
if (require.main === module) {
  const [network, multiRewards, rewardToken, rewardAmount] = process.argv.slice(2);

  if (!network || !multiRewards || !rewardToken || !rewardAmount) {
    consola.error("Usage: node scripts/notifyRewardAmount [mainnet|testnet] [Multirewards address] [Reward token address] [Reward amount (excluding 18 decimals)]");

    process.exit();
  }

  (async() => {
    const connex = await getConnex(network);

    const result = await notifyRewardAmount({
      connex,
      multiRewards,
      network,
      rewardAmount,
      rewardToken,
    });

    console.log(result)
  })();
}

module.exports = notifyRewardAmount;
