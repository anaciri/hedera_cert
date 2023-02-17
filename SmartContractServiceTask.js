const {
    Client,
    FileCreateTransaction,
    ContractCreateTransaction,
    ContractExecuteTransaction,
    ContractFunctionResult,
    PrivateKey,
    ContractFunctionParameters} = require("@hashgraph/sdk");

const Web3 = require('web3');
const web3 = new Web3;
let abi;

require('dotenv').config({ path: 'SmartContract_Service/.env' });

const account1 = "0.0.3506856"
const account1PK = PrivateKey.fromString("302e020100300506032b657004220420224d9454b036a60163e97bc31cca05b905658aea97d0506df7aa15917eb079fd");

const client = Client.forTestnet();
client.setOperator(account1, account1PK);

async function main() {
    let jsonfile = require("/Users/ayb/mio/code/hedera/cert/hed-sandbox/CertificationC1.json");
    const bytecode = jsonfile.bytecode;

    //Create a file on Hedera and store the hex-encoded bytecode
    const fileCreateTx = new FileCreateTransaction()
        //Set the bytecode of the contract
        .setContents(bytecode);

    //Submit the file to the Hedera test network signing with the transaction fee payer key specified with the client
    const submitTx = await fileCreateTx.execute(client);

    //Get the receipt of the file create transaction
    const fileReceipt = await submitTx.getReceipt(client);

    //Get the file ID from the receipt
    const bytecodeFileId = fileReceipt.fileId;

    //Log the file ID
    console.log("The smart contract byte code file ID is " + bytecodeFileId)

    // Instantiate the contract instance
    const contractTx = await new ContractCreateTransaction()
        //Set the file ID of the Hedera file storing the bytecode
        .setBytecodeFileId(bytecodeFileId)
        //Set the gas to instantiate the contract
        .setGas(100000)
        //Provide the constructor parameters for the contract
        .setConstructorParameters(new ContractFunctionParameters().addString("Hello from Hedera!"));

    //Submit the transaction to the Hedera test network
    const contractResponse = await contractTx.execute(client);

    //Get the receipt of the file create transaction
    const contractReceipt = await contractResponse.getReceipt(client);

    //Get the smart contract ID
    const contractId = contractReceipt.contractId;

    //Log the smart contract ID
    console.log("The smart contract ID is " + contractId);

//------------  call contract

    const contractExecTx = await new ContractExecuteTransaction()
   // .setContractId(contractId)
   .setContractId(contractId)
    //Set the gas for the contract call
    .setGas(100000)
    //Set the contract function to call
    .setFunction("function1", new ContractFunctionParameters().addUint16(4).addUint16(3));

//Submit the transaction to a Hedera network and store the response
const submitExecTx = await contractExecTx.execute(client);

//Get the receipt of the transaction
const receipt2 = await submitExecTx.getReceipt(client);

//Confirm the transaction was executed successfully
console.log("The transaction status is " + receipt2.status.toString());

// a record contains the output of the function
// as well as events, let's get events for this transaction
const record = await submitExecTx.getRecord(client);
let results = decodeFunctionResult("function1", record.contractFunctionResult.bytes);
console.log(`The result of function1 is ${results.result}`);


//-------------- function 2
const contractExecTx1 = await new ContractExecuteTransaction()
        //Set the ID of the contract
        .setContractId(contractId)
        //Set the gas for the contract call
        .setGas(100000)
        //Set the contract function to call
        .setFunction("function2", new ContractFunctionParameters().addUint16(results.result));

    //Submit the transaction to a Hedera network and store the response
    const submitExecTx1 = await contractExecTx1.execute(client);

    //Get the receipt of the transaction
    const receipt21 = await submitExecTx1.getReceipt(client);

    //Confirm the transaction was executed successfully
    console.log("The transaction status is " + receipt21.status.toString());

    // a record contains the output of the function
    // as well as events, let's get events for this transaction
    const record1 = await submitExecTx1.getRecord(client);

    let results1 = decodeFunctionResult("function2", record1.contractFunctionResult.bytes);
    
    console.log(`The result of function2 is ${results1.result}`);


function decodeFunctionResult(functionName, resultAsBytes) {
    const abiFile = require("/Users/ayb/mio/code/hedera/cert/hed-sandbox/CertificationC1.json");
    abi = abiFile.abi;
    const functionAbi = abi.find((func) => func.name === functionName);
    const functionParameters = functionAbi.outputs;
    const resultHex = "0x".concat(Buffer.from(resultAsBytes).toString("hex"));
    const result = web3.eth.abi.decodeParameters(functionParameters, resultHex);
    return result;
}


    process.exit();
}

main();


