// ES5 style
const config = require("./deploymentConfig");
const thorify = require("thorify").thorify;
const Web3 = require("web3");
const Multirewards = require(config.pathToMultirewardsJson);
const IERC20 = require(config.pathToIERC20Json);
const assert = require('assert');

let network = null;
let multirewardsAddress = null;
let rewardAmount = null;

if (process.argv.length < 5) 
{
    console.error("Usage: node scripts/notifyRewardAmount [mainnet|testnet] [Multirewards address] [Reward amount (excluding 18 decimals)]");
    process.exit(1);
} 
else
{
    if (process.argv[2] == "mainnet") network = config.network.mainnet;
    else if (process.argv[2] == "testnet") network = config.network.testnet;
    else {
        console.error("Invalid network specified");
        process.exit(1);
    }

    multirewardsAddress = process.argv[3];
    rewardAmount = Web3.utils.toWei(process.argv[4]);
}

const web3 = thorify(new Web3(), network.rpcUrl);
web3.eth.accounts.wallet.add(config.privateKey);

notifyRewardAmount = async() =>
{
    // This is the address associated with the private key
    const walletAddress = web3.eth.accounts.wallet[0].address;

    console.log("Using wallet address:", walletAddress);
    console.log("Using RPC:", web3.eth.currentProvider.RESTHost);

    try
    {
        let transactionReceipt = null;
        const multirewardsContract = new web3.eth.Contract(Multirewards.abi, multirewardsAddress);
        const vexERC20 = new web3.eth.Contract(IERC20.abi, network.vexAddress);

        console.log("Attempting ERC20 approve for transfer, amount:", rewardAmount);        

        await vexERC20
                .methods
                .approve(multirewardsAddress,
                         rewardAmount)
                .send({ from: walletAddress })
                .on("receipt", (receipt) => {
                    transactionReceipt = receipt;
                });;

        console.log("Approve successful, tx hash:", transactionReceipt.transactionHash);
        console.log("Attempting notifyRewardAmount for multireward address:", multirewardsAddress);
        console.log("For staking token:", await multirewardsContract
                                            .methods
                                            .stakingToken()
                                            .call());

        await multirewardsContract
                .methods
                .notifyRewardAmount(
                    network.vexAddress, // Assuming we are only giving VEX for now
                    rewardAmount
                )
        .send({ from: walletAddress })
        .on("receipt", (receipt) => {
            transactionReceipt = receipt;
        });

        console.log("Transaction Hash:", transactionReceipt.transactionHash);
    } 
    catch(error)
    {
        console.log("Deployment failed with:", error)
    }
}

notifyRewardAmount();
