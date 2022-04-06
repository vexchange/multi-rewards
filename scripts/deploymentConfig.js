require("dotenv").config({ path: "./.env" })

module.exports = {
    privateKey: process.env.PRIVATE_KEY,
    network: {
        mainnet: {
            address: "0x538f8890a383c44e59df4c7263d96ca8048da2c7",
            name: "mainnet",
            rpcUrl: "http://mainnet02.vechain.fi.blockorder.net"
        },
        testnet: {
            name: "testnet",
            rpcUrl: "http://testnet02.vechain.fi.blockorder.net"
        }
    },
    pathToMultirewardsJson: "../build/contracts/MultiRewards.json",
    pathToIERC20Json: "../build/contracts/IERC20.json",
};
