// ES5 style
const config = require("./deploymentConfig");
const thorify = require("thorify").thorify;
const Web3 = require("web3");
const Multirewards = require(config.pathToMultirewardsJson);
const assert = require('assert');
const readlineSync = require('readline-sync');

let network = null;
let stakingTokenAddress = null;

if (process.argv.length < 4) 
{
    console.error("Usage: node scripts/deployMultirewards [mainnet|testnet] [stakingTokenAddress]");
    process.exit(1);
} 
else
{
    network = config.network[process.argv[2]];
    if (network === undefined) {
        console.error("Invalid network specified");
        process.exit(1);
    }

    stakingTokenAddress = process.argv[3];
}

const web3 = thorify(new Web3(), network.rpcUrl);
web3.eth.accounts.wallet.add(config.privateKey);

renounceMastership = async(contractAddress) => 
{
    console.log("Renouncing Mastership");

    const SET_MASTER_SELECTOR = web3.eth.abi.encodeFunctionSignature("setMaster(address,address)");

    // This address is the same for both mainnet and testnet
    const PROTOTYPE_CONTRACT_ADDRESS = "0x000000000000000000000050726f746f74797065";

    const data = web3.eth.abi.encodeParameters(
       ["address", "address"],
       [contractAddress, "0x0000000000000000000000000000000000000000"],
    ).slice(2); // slicing to get rid of the '0x' in the beginning

    await web3.eth.sendTransaction({
        to: PROTOTYPE_CONTRACT_ADDRESS,
        data: SET_MASTER_SELECTOR + data,
        from: web3.eth.accounts.wallet[0].address
    }).on("receipt", (receipt) => {
        console.log("Mastership successfully renounced, txid: ", receipt.transactionHash);
    });
}

deployMultirewards = async() =>
{
    // This is the address associated with the private key
    const walletAddress = web3.eth.accounts.wallet[0].address;

    console.log("Using wallet address:", walletAddress);
    console.log("Using RPC:", web3.eth.currentProvider.RESTHost);

    try
    {
        let transactionReceipt = null;

        console.log("Attempting to deploy contract:", config.pathToMultirewardsJson);
        console.log("For staking token:", stakingTokenAddress);

        if (network.name == "mainnet")
        {
            let input = readlineSync.question("Confirm you want to deploy this on the MAINNET? (y/n) ");
            if (input != 'y') process.exit(1);
        }

        const multirewardsContract = new web3.eth.Contract(Multirewards.abi);
        await multirewardsContract.deploy({ 
            data: Multirewards.bytecode,
            arguments: [ 
                         walletAddress, 
                         stakingTokenAddress 
                       ]
        })
        .send({ from: walletAddress })
        .on("receipt", (receipt) => {
            transactionReceipt = receipt;
        });

        console.log("Transaction Hash:", transactionReceipt.transactionHash);
        console.log("Contract Successfully deployed at address:", transactionReceipt.contractAddress);

        await renounceMastership(transactionReceipt.contractAddress);
    } 
    catch(error)
    {
        console.log("Deployment failed with:", error)
    }
}

deployMultirewards();
