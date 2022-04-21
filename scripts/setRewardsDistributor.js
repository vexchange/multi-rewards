// ES5 style
const ConnexDriver = require('@vechain/connex-driver');
const Framework = require("@vechain/connex-framework").Framework;
const find = require('lodash/find');

const config = require('./deploymentConfig');
const Multirewards = require('../build/contracts/MultiRewards.json');

const { Driver, SimpleNet, SimpleWallet } = ConnexDriver;

const [network, multiRewards, rewardsToken, newRewardsDistributor] = process.argv.slice(2)

// ensure we have appropriate arguments
if (!network || !multiRewards || !rewardsToken || !newRewardsDistributor) {
  console.error("Usage: node scripts/setRewardsDuration [mainnet|testnet] [Multirewards address] [Reward token address] [New rewardsDistributor address]");

  process.exit();
}

(async() => {
  const wallet = new SimpleWallet();

  wallet.import(config.privateKey);

  console.log("Using wallet address:", wallet.keys[0].address);

  const net = new SimpleNet(config.network[network].rpcUrl);
  const driver = await Driver.connect(net, wallet);
  const connex = new Framework(driver);

  const setRewardsDistributorABI = find(Multirewards.abi, { name: 'setRewardsDistributor' });
  const setRewardsMethod = connex.thor.account(multiRewards).method(setRewardsDistributorABI);

  const clause = setRewardsMethod.asClause(rewardsToken, newRewardsDistributor);

  if (network ==='mainnet') {
    const input = readlineSync.question("Confirm you want to execute this on the MAINNET? (y/n) ");

    if (input != 'y') process.exit(1);
  }

  try {
    const { txId } = await connex.vendor.sign('tx', [clause]).request();
    const transaction = await connex.thor.transaction(txId).getReceipt()


    if (transaction.reverted) {
      console.log("tx was unsuccessful");
    } else {
      console.log("Set rewards distributor was succcessful");
    }
  } catch(error) {
    console.error(error);
  }

  process.exit();
})();


