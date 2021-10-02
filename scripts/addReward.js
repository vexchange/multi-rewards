// ES5 style
const config = require("./deploymentConfig");
const thorify = require("thorify").thorify;
const Web3 = require("web3");
const Multirewards = require(config.pathToMultirewardsJson);
const assert = require('assert');
const readlineSync = require('readline-sync');

let network = null;
let multirewardsAddress = null;
let duration = null;

if (process.argv.length < 5) 
{
    console.error("Usage: node scripts/addReward [mainnet|testnet] [Multirewards address] [Duration in days]");
    process.exit(1);
} 
else
{
    network = config.network[process.argv[2]];
    if (network === undefined) {
        console.error("Invalid network specified");
        process.exit(1);
    }

    multirewardsAddress = process.argv[3];
    duration = parseInt(process.argv[4]) * 86400;
}

const web3 = thorify(new Web3(), network.rpcUrl);
web3.eth.accounts.wallet.add(config.privateKey);

addReward = async() =>
{
    // This is the address associated with the private key
    const walletAddress = web3.eth.accounts.wallet[0].address;

    console.log("Using wallet address:", walletAddress);
    console.log("Using RPC:", web3.eth.currentProvider.RESTHost);

    try
    {
        let transactionReceipt = null;
        const multirewardsContract = new web3.eth.Contract(Multirewards.abi, multirewardsAddress);

        console.log("Attempting to add reward for multireward address:", multirewardsAddress);
        console.log("For staking token:", await multirewardsContract
                                            .methods
                                            .stakingToken()
                                            .call()) ;
        console.log("For a duration of:", duration, "seconds");

        if (network.name == "mainnet")
        {
            let input = readlineSync.question("Confirm you want to deploy this on the MAINNET? (y/n) ");
            if (input != 'y') process.exit(1);
        }
        
        await multirewardsContract
                .methods
                .addReward(
                    network.vexAddress, // Assuming we are only giving VEX for now
                    walletAddress, // Assuming owner to be the distributor
                    duration
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

addReward();
