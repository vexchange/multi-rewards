require("dotenv").config({ path: "./.env" })

module.exports = {
    privateKey: process.env.PRIVATE_KEY,
    network: {
        mainnet: {
            name: "mainnet",
            rpcUrl: "http://mainnet02.vechain.fi.blockorder.net",
            vexAddress: "0x0BD802635eb9cEB3fCBe60470D2857B86841aab6"
        },
        testnet: {
            name: "testnet",
            rpcUrl: "http://testnet02.vechain.fi.blockorder.net",
            vexAddress: "0x377b467867CE906D14ea2bA610ED7553FE1Cd459"
        }
    },
    pathToMultirewardsJson: "../build/contracts/MultiRewards.json",
    pathToIERC20Json: "../build/contracts/IERC20.json",
};
