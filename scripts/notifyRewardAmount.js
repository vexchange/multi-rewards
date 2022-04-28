// ES5 style
const find = require('lodash/find');
const readlineSync = require('readline-sync');
const ethers = require('ethers');

const Multirewards = require('../build/contracts/MultiRewards.json');
const IERC20 = require('../build/contracts/IERC20.json');

const { getConnex } = require('./utils');

const notifyRewardAmount = async ({
  connex,
  multiRewards,
  network,
  rewardAmount,
  rewardToken,
}) => {
  console.log(rewardAmount)
  const approveABI = find(IERC20.abi, { name: 'approve' });
  const approveMethod = connex.thor.account(rewardToken).method(approveABI);

  const notifyRewardAmountABI = find(Multirewards.abi, { name: 'notifyRewardAmount' });
  const notifyRewardAmountMethod = connex.thor.account(multiRewards).method(notifyRewardAmountABI);

  const approveClause = approveMethod.asClause(multiRewards, rewardAmount);
  const notifyRewardAmountClause = notifyRewardAmountMethod.asClause(rewardToken, rewardAmount);

  if (require.main === module && network === 'mainnet') {
    const input = readlineSync.question("Confirm you want to execute this on the MAINNET? (y/n) ");

    if (input != 'y') process.exit(1);
  }

  return new Promise(async (resolve, reject) => {
    try {
      const approve = await connex.vendor.sign('tx', [approveClause]).request();
      const notifyRewardAmount = await connex.vendor.sign('tx', [notifyRewardAmountClause]).dependsOn(approve.txid).request();
      const transaction = await connex.thor.transaction(notifyRewardAmount.txid).getReceipt()

      if (transaction.reverted) {
        console.log("tx was unsuccessful");
        reject('tx was unsuccessful')
      } else {
        console.log("Set rewards duration was succcessful");
        resolve('Set rewards duration was succcessful')
      }
    } catch(error) {
      console.error(error);
      reject(error);
    }
  })
}

// if called directly (from terminal)
if (require.main === module) {
  const [network, multiRewards, rewardToken, rewardAmount] = process.argv.slice(2);

  if (!network || !multiRewards || !rewardToken || !rewardAmount) {
    console.error("Usage: node scripts/notifyRewardAmount [mainnet|testnet] [Multirewards address] [Reward token address] [Reward amount (excluding 18 decimals)]");

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
