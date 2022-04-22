const ConnexDriver = require('@vechain/connex-driver');
const Framework = require("@vechain/connex-framework").Framework;

const config = require('../deploymentConfig');

const { Driver, SimpleNet, SimpleWallet } = ConnexDriver;

const create = async (network) => {
  const wallet = new SimpleWallet();

  wallet.import(config.privateKey);

  console.log("Using wallet address:", wallet.keys[0].address);

  const net = new SimpleNet(config.network[network].rpcUrl);
  const driver = await Driver.connect(net, wallet);
  const connex = new Framework(driver);

  return connex;
}

exports.create = create;
