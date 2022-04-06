// ES5 style
const ConnexDriver = require('@vechain/connex-driver');
const Framework = require("@vechain/connex-framework").Framework;
const find = require('lodash/find');

const config = require('./deploymentConfig');
const Multirewards = require('../build/contracts/MultiRewards.json');

const { Driver, SimpleNet, SimpleWallet } = ConnexDriver;

const [network, rewardsToken, duration] = process.argv.slice(2)

// ensure we have appropriate arguments
if (!network || !rewardsToken || !duration) {
  console.error("Usage: node scripts/setRewardsDuration [mainnet|testnet] [rewardsToken] [duration]");

  process.exit();
}

(async() => {
  const wallet = new SimpleWallet();

  wallet.import(config.privateKey);

  const net = new SimpleNet(config.network[network].rpcUrl, wallet);
  const driver = await Driver.connect(net);
  const connex = new Framework(driver);

  const setRewardsDurationABI = find(Multirewards.abi, { name: 'setRewardsDuration' });
  const setRewardsMethod = connex.thor.account(config.network[network].address).method(setRewardsDurationABI);

  const clause = setRewardsMethod.asClause(rewardsToken, duration);

  try {
    const result = await connex.vendor.sign('tx', [{ ...clause }]).request();

    console.log("Transaction Hash:", result.transactionHash);
  } catch(error) {
    console.error(error);
  }

  process.exit();
})();

