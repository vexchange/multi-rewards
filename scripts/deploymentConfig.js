require("dotenv").config({ path: "./.env" })

module.exports = {
    privateKey: process.env.PRIVATE_KEY,
    network: {
        mainnet: {
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
