// ES5 style
const ConnexDriver = require('@vechain/connex-driver');
const Framework = require("@vechain/connex-framework").Framework;
const find = require('lodash/find');

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

  const net = new SimpleNet(config.network[network].rpcUrl, wallet);
  const driver = await Driver.connect(net);
  const connex = new Framework(driver);

  const setRewardsDurationABI = find(Multirewards.abi, { name: 'setRewardsDuration' });
  const setRewardsMethod = connex.thor.account(multiRewards).method(setRewardsDurationABI);

  const clause = setRewardsMethod.asClause(rewardsToken, duration);

  try {
    const result = await connex.vendor.sign('tx', [{ ...clause }]).request();

    console.log("Transaction Hash:", result.transactionHash);
  } catch(error) {
    console.error(error);
  }

  process.exit();
})();


