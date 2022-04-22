// ES5 style
const find = require('lodash/find');
const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');
const schedule = require('node-schedule');


const Multirewards = require('../../build/contracts/MultiRewards.json');
const Connex = require('../utils/connex.js');
const pools = require('./pools.json');

const setRewardsDuration = require('../setRewardsDuration');
const notifyRewardAmount = require('../notifyRewardAmount2');

const [network] = process.argv.slice(2);

dayjs.extend(duration);

//ensure we have appropriate arguments
// if (!network) {
//   console.error("Usage: node scripts/refreshAllPools [mainnet|testnet]");
//
//   process.exit();
// } else if (network ==='mainnet') {
//   const input = readlineSync.question("Confirm you want to execute this on the MAINNET? (y/n) ");
//
//   if (input != 'y') process.exit(1);
// }

const poolCheck = async () => {
  const rewardDataABI = find(Multirewards.abi, { name: 'rewardData' });
  const connex = await Connex.create(network);

  for (const pool of pools) {
    const method = connex.thor.account(pool.address).method(rewardDataABI);
    const { decoded } = await method.call('0x0BD802635eb9cEB3fCBe60470D2857B86841aab6');

    // we need duration and rewardAmount for each pool

    // await setRewardsDuration({
    //   connex,
    //   network,
    //   multiRewards: pool.address,
    //   rewardAmount: '0x0BD802635eb9cEB3fCBe60470D2857B86841aab6',
    //   duration: 1031400,
    // });
    //
    // const test2 = await notifyRewardAmount({
    //   connex,
    //   network,
    //   multiRewards: pool.address,
    //   rewardAmount: 1989,
    //   rewardToken: '0x0BD802635eb9cEB3fCBe60470D2857B86841aab6',
    // });
  };

  process.exit(1)
};


poolCheck()
