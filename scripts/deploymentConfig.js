require("dotenv").config({ path: "./.env" })

module.exports = {
    privateKey: process.env.PRIVATE_KEY,
    network: {
        mainnet: {
            name: "mainnet",
            rpcUrl: "https://mainnet.veblocks.net/",
            vexAddress: ""
        },
        testnet: {
            name: "testnet",
            rpcUrl: "https://testnet.veblocks.net/",
            vexAddress: ""
        }
    },
    pathToMultirewardsJson: "../build/contracts/MultiRewards.json",
    pathToIERC20Json: "../build/contracts/IERC20.json",
};
