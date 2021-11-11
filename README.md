# multi-rewards
A modified version of the [Synthetix](https://github.com/Synthetixio/synthetix) staking rewards contract, allowing for multiple rewards tokens. Designed for use with [Curve.fi](https://github.com/curvefi) liquidity gauges.

## Overview

The [`MultiRewards`](contracts/MultiRewards.sol) contract in this repository enables distribution of multiple reward tokens for staked users. It is a flattened and modified version of the SNX [staking rewards](https://github.com/Synthetixio/synthetix/blob/master/contracts/StakingRewards.sol) contract.

## How it Works

As an example, assume we desire users to stake an ERC20 Token `Base Token` ($BASE). As a reward for staking their token, we may wish to offer users multiple different tokens. For the sake of this example, we'll assume we have two different amount of governance tokens, `Reward Token 1` ($ONE) and `Reward Token 2` ($TWO), which we want to release over different schedules.

 * We begin by deploying the `MultiReward` contract with a link to $BASE as our staking token.
 * For both token $ONE and $TWO the contract's _Owner_ calls `addReward`
    * When calling `addReward`, _Owner_ also specifies the duration of the reward period (in seconds)
    * The `addReward` function also authorizes a _Distributor_ to further manage the reward token.
 * To begin the reward period, _Distributor_ will call `notifyRewardAmount`, which transfers the specified amount of reward tokens from their address to the contract and begins the reward cycle.
 * Users can stake the $BASE token by calling `stake`, and will then accrue $ONE and $TWO throughout the duration of the rewards period.
 * Users can claim their rewards at any time by calling `getReward`.
 * Users can also withdraw their $BASE token at any point by calling `withdraw`. At this point they can still claim any accumulated unclaimed $ONE and $TWO rewards through the `getReward` endpoint but will not longer accrue rewards.

### Considerations

Keep the following in mind when using the `MultiReward` contract:

 * The duration and amounts of $ONE and $TWO may be different, and the contract will support any number of additional tokens you may wish to provide.
 * The _Distributor_ may update the duration of the reward schedule by calling `setRewardsDuration` only after the active reward cycle has completed.
 * The _Owner_ may assign a new _Distributor_ to a reward token at any time.
 * Calling `exit` combines both `getReward` and `withdraw` in one endpoint.
 * While the rewards period is active, the contract will automatically update all reward balances anytime most mutative functions are called (`stake`, `withdraw`, `exit`, `getReward`, or `notifyRewardAmount`)
 * The _Owner_ may call `recoverERC20` to transfer reward tokens, but not the staking token. Claiming rewards may fail if this function drains the balance.
 * In order to transfer ERC20 tokens to the contract, you must first call the `approve` function on the token's contract and authorize `MultiRewards` to transfer the correct amount.

## Dependencies

* [python3](https://www.python.org/downloads/release/python-368/) version 3.6 or greater, python3-dev
* [brownie](https://github.com/iamdefinitelyahuman/brownie) - tested with version [1.13.0](https://github.com/eth-brownie/brownie/releases/tag/v1.12.0)
* [ganache-cli](https://github.com/trufflesuite/ganache-cli) - tested with version [6.12.1](https://github.com/trufflesuite/ganache-cli/releases/tag/v6.12.1)
* [brownie-token-tester](https://github.com/iamdefinitelyahuman/brownie-token-tester)

## Environment Setup

```
npm run preinstall
virtualenv .venv 
source .venv/bin/activate
pip install -r requirements.txt
npm install
```

## Testing

The test suite is broadly split between [unit](tests/unitary) and [integration](tests/integration) tests.

To run the unit tests:

```bash
brownie test tests/unitary
```

To run the integration tests:

```bash
brownie test tests/integration
```

## Deployment

To compile before deploying:

```bash
brownie compile
```

First step of deployment:
```bash
npm run deployMultirewards [mainnet|testnet]
```

We need to add the address of the token we are rewarding and the period. Assumed to be just VEX for now. Rewards are not live yet when this function is called.
```bash
npm run addReward [mainnet|testnet] [Multirewards address] [Duration in days]
```

Lastly, we need to `ERC20::approve` the amount to be rewarded and transfer it to the `Multirewards` contract address. Rewards are live once this function is called.
```bash
npm run notifyRewardAmount [mainnet|testnet] [Multirewards address] [Reward amount (excluding 18 decimals)]
```

**Mainnet**
| Contract       | Address                             |
| ---            | ---                                 |
| Multirewards   | 0x538f8890a383c44e59df4c7263d96ca8048da2c7  |
| stakingToken (this is the VEX-VET pair address) | 0x39cd888a1583498AD30E716625AE1a00ff51286D  |



## License

The smart contract within this repository is forked from [Synthetixio/synthetix](https://github.com/Synthetixio/synthetix/tree/master) which is licensed under the [MIT License](https://github.com/Synthetixio/synthetix/blob/develop/LICENSE).

This repository is licensed under the [MIT License](LICENSE).
