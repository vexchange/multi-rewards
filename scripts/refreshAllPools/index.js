// ES5 style
const ethers = require('ethers');
const find = require('lodash/find');
const sumBy = require('lodash/sumBy');
const dayjs = require('dayjs');

const Multirewards = require('../../build/contracts/MultiRewards.json');
const ERC20_ABI = require('../../build/contracts/IERC20.json');

const Connex = require('../utils/connex.js');
const setRewardsDuration = require('../setRewardsDuration');
const notifyRewardAmount = require('../notifyRewardAmount2');

const pools = require('./pools.json');

const [network] = process.argv.slice(2);

const THIRTY_DAYS = 2592000;
const DISTRIBUTOR = '0xE527972DD80970bb90977879658FB83aD568Bb28'

//ensure we have appropriate arguments
if (!network) {
  console.error("Usage: node scripts/refreshAllPools [mainnet|testnet]");

  process.exit();
} else if (network ==='mainnet') {
  const input = readlineSync.question("Confirm you want to execute this on the MAINNET? (y/n) ");

  if (input != 'y') process.exit(1);
}


const getBalance = async (connex) => {
  const abi = find(ERC20_ABI.abi, { name: 'balanceOf' });
  const account = connex.thor.account('0x0BD802635eb9cEB3fCBe60470D2857B86841aab6');
  const method = account.method(abi)

  const { decoded } = await method.call(DISTRIBUTOR);
  const balance = Math.round(ethers.utils.formatEther(decoded['0']));

  return ethers.BigNumber.from(balance);
}

const getRequiredBalance = percent => {
  const requiredBalance = Math.round(sumBy(pools, 'monthlyRate') / percent);

  return ethers.BigNumber.from(requiredBalance);
}

const getTimeConstraints = () => {
  const end = dayjs().endOf('month').unix();

  const now = dayjs().unix();
  const duration = end - now;
  const percent = (duration / THIRTY_DAYS) * 100;

  return { duration, percent };
}

const poolCheck = async () => {
  const rewardDataABI = find(Multirewards.abi, { name: 'rewardData' });
  const connex = await Connex.create(network);

  // get time constraints
  const { duration, percent } = getTimeConstraints();

  // check balance of distributor
  const requiredBalance = getRequiredBalance(percent);
  const currentBalance = await getBalance(connex);

  if (currentBalance.lt(requiredBalance)) {
    console.warn('Distributor does not have proper balance');

    process.exit(1);
  }

  // iterate through pools
  for (const pool of pools) {
    const method = connex.thor.account(pool.address).method(rewardDataABI);
    const { decoded } = await method.call('0x0BD802635eb9cEB3fCBe60470D2857B86841aab6');

    const rewardAmount = Math.round(pool.monthlyRate / percent);

    // we need duration and rewardAmount for each pool
    await setRewardsDuration({
      connex,
      duration,
      multiRewards: pool.address,
      network,
      rewardToken: '0x0BD802635eb9cEB3fCBe60470D2857B86841aab6',
    });

    await notifyRewardAmount({
      connex,
      multiRewards: pool.address,
      network,
      rewardAmount,
      rewardToken: '0x0BD802635eb9cEB3fCBe60470D2857B86841aab6',
    });
  };

  process.exit(1)
};


poolCheck()
