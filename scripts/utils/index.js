const ethers = require('ethers');
const dayjs = require('dayjs');
const ConnexDriver = require('@vechain/connex-driver');
const Framework = require("@vechain/connex-framework").Framework;

const sumBy = require('lodash/sumBy'); const find = require('lodash/find');
const pools = require('../refreshAllPools/pools.json');

const IERC20 = require('../../build/contracts/IERC20.json');

const { DISTRIBUTOR, THIRTY_DAYS } = require('../../constants');

const config = require('../deploymentConfig');

const { Driver, SimpleNet, SimpleWallet } = ConnexDriver;

const getConnex = async (network) => {
  const wallet = new SimpleWallet();

  wallet.import(config.privateKey);

  console.log("Using wallet address:", wallet.keys[0].address);

  const net = new SimpleNet(config.network[network].rpcUrl);
  const driver = await Driver.connect(net, wallet);
  const connex = new Framework(driver);

  return connex;
}

const getTimeConstraints = () => {
  const end = dayjs().endOf('month').unix();

  const now = dayjs().unix();
  const duration = end - now;
  const percent = (duration / THIRTY_DAYS) * 100;

  return { duration, percent };
}

const getRequiredBalance = percent => {
  const requiredBalance = Math.round(sumBy(pools, 'monthlyRate') / percent);

  return ethers.BigNumber.from(requiredBalance);
}

const getCurrentBalance = async (connex) => {
  const abi = find(IERC20.abi, { name: 'balanceOf' });
  const account = connex.thor.account('0x0BD802635eb9cEB3fCBe60470D2857B86841aab6');
  const method = account.method(abi)

  const { decoded } = await method.call(DISTRIBUTOR);
  const balance = Math.round(ethers.utils.formatEther(decoded['0']));

  return ethers.BigNumber.from(balance);
}

module.exports = {
  getConnex,
  getCurrentBalance,
  getRequiredBalance,
  getTimeConstraints,
};


