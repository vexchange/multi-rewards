const ethers = require('ethers');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

const ConnexDriver = require('@vechain/connex-driver');
const Framework = require("@vechain/connex-framework").Framework;

const sumBy = require('lodash/sumBy');
const find = require('lodash/find');


const IERC20 = require('../../build/contracts/IERC20.json');
const MultiRewards = require('../../build/contracts/MultiRewards.json');

const { DISTRIBUTOR, THIRTY_DAYS, REWARD_TOKEN, POOLS } = require('../../constants');

const config = require('../deploymentConfig');

const { Driver, SimpleNet, SimpleWallet } = ConnexDriver;

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("UTC");

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
  const end = dayjs().add(1, 'month').endOf('month').subtract(4, 'hours').unix();

  const now = dayjs.utc().unix();
  const duration = end - now;
  const ratio = duration / THIRTY_DAYS;

  return { duration, ratio };
}

const getRequiredBalance = (percent, network) => {
  const requiredBalance = Math.round(sumBy(POOLS[network], 'monthlyRate') / percent);

  return ethers.BigNumber.from(requiredBalance);
}

const getCurrentVexBalance = async (connex, network) => {
  const abi = find(IERC20.abi, { name: 'balanceOf' });
  const account = connex.thor.account(REWARD_TOKEN[network]);
  const method = account.method(abi)

  const { decoded } = await method.call(DISTRIBUTOR);
  const balance = Math.round(ethers.utils.formatEther(decoded['0']));

  return ethers.BigNumber.from(balance);
}

const getPoolState = async (pool, connex, network) => {
  const rewardDataABI = find(MultiRewards.abi, { name: 'rewardData' });
  const rewardDataMethod = connex.thor.account(pool.address).method(rewardDataABI);
  const now = dayjs.utc();

  const { decoded } = await rewardDataMethod.call(REWARD_TOKEN[network]);
  const periodFinish = dayjs.unix(decoded.periodFinish).utc();

  return now.isBefore(periodFinish);
}

module.exports = {
  getConnex,
  getCurrentVexBalance,
  getRequiredBalance,
  getTimeConstraints,
  getPoolState,
};


