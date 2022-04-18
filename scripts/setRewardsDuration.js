// ES5 style
const ConnexDriver = require('@vechain/connex-driver');
const Framework = require("@vechain/connex-framework").Framework;
const find = require('lodash/find');
const readlineSync = require('readline-sync');

const config = require('./deploymentConfig');
const Multirewards = require('../build/contracts/MultiRewards.json');

const { Driver, SimpleNet, SimpleWallet } = ConnexDriver;

const [network, multiRewards, rewardsToken, duration] = process.argv.slice(2)

// ensure we have appropriate arguments
if (!network || !multiRewards || !rewardsToken || !duration) {
  console.error("Usage: node scripts/setRewardsDuration [mainnet|testnet] [Multirewards address] [Reward token address] [Duration in seconds]");

  process.exit();
}

(async() => {
  const wallet = new SimpleWallet();

  wallet.import(config.privateKey);

  console.log("Using wallet address:", wallet.keys[0].address);

  const net = new SimpleNet(config.network[network].rpcUrl);
  const driver = await Driver.connect(net, wallet);
  const connex = new Framework(driver);

  const setRewardsDurationABI = find(Multirewards.abi, { name: 'setRewardsDuration' });
  const setRewardsMethod = connex.thor.account(multiRewards).method(setRewardsDurationABI);

  const clause = setRewardsMethod.asClause(rewardsToken, duration);

  if (network ==='mainnet') {
    const input = readlineSync.question("Confirm you want to execute this on the MAINNET? (y/n) ");

    if (input != 'y') process.exit(1);
  }

  try {
    const result = await connex.vendor.sign('tx', [{ ...clause }]).request();

    console.log("Result: ", result);
  } catch(error) {
    console.error(error);
  }

  process.exit();
})();
