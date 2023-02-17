const {
    TransferTransaction,
    Client,
    ScheduleCreateTransaction,
    PrivateKey,
    Hbar, ScheduleInfoQuery
} = require("@hashgraph/sdk");
const fs = require('fs');

const account1 = "0.0.3506856"
const account1PK = PrivateKey.fromString("302e020100300506032b657004220420224d9454b036a60163e97bc31cca05b905658aea97d0506df7aa15917eb079fd");
const account2 = "0.0.3506857"

const client = Client.forTestnet();
client.setOperator(account1, account1PK);

async function main() {
    
        //const nodeId = [];
        //nodeId.push(new AccountId(3));
    
        const sttx = new TransferTransaction()
            .addHbarTransfer(account1, new Hbar(-10))
            .addHbarTransfer(account2, new Hbar(10))
            .schedule()     //<======= shortcut to avoid having to duplicate
            .freezeWith(client)
//            .setScheduleMemo("Exam2 Scheduled Tx")     
            //.setNodeAccountIds(nodeId); needed?
        //const transaction = await transferTransaction.freezeWith(client);
    
        // encode 1
        const binTx = sttx.toBytes();
        const encodedTx =  Buffer.from(binTx).toString('base64');
        console.log(`Encoded1: ${encodedTx}`);
        fs.writeFileSync('./scheduledTx.bin', encodedTx)



        //---------------  SCript two
        // Decode 1
        const binSchTx  = fs.readFileSync('./scheduledTx.bin', 'utf8');
        const decodedBin = Buffer.from(binSchTx, 'base64');
        const recoveredTx = TransferTransaction.fromBytes(decodedBin);
        const signedTx = await recoveredTx.sign(myPrivateKey)
    
        //const signedTx = recoveredTx.addSignature(myPublicKey, myPrivateKey.signTransaction(recoveredTx));
    
        const txresp = signedTx.execute(client)
        console.log(JSON.stringify(txresp))

        const receipt = await txresp.getReceipt(client);
    
        console.log(`TX ${txResponse.transactionId.toString()} status: ${receipt.status}`);
    
        process.exit();
    }
    
    void main();
    
   