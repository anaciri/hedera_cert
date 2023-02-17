const {
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
    Client,
    Wallet,
    PrivateKey
} = require("@hashgraph/sdk");

const account1 = "0.0.3506856"
const account1PK = PrivateKey.fromString("302e020100300506032b657004220420224d9454b036a60163e97bc31cca05b905658aea97d0506df7aa15917eb079fd");

const client = Client.forTestnet();
client.setOperator(account1, account1PK);

const walletUser = new Wallet( account1, account1PK)

    async function main() {

        // Topic Creation

        const transaction = new TopicCreateTransaction()
            .setSubmitKey(walletUser.publicKey)
            .setAdminKey(walletUser.publicKey)
            .setTopicMemo('Hedera Cert Test');

        console.log(`Created a new TopicCreateTransaction with admin and submit key both set to: ${walletUser.publicKey}`);
         //Sign with the client operator private key and submit the transaction to a Hedera network
         const txResponse = await transaction.execute(client);
         const receipt = await txResponse.getReceipt(client);
         const topicId = receipt.topicId;

         console.log(`Your topic ID is: ${topicId}`);

         await new Promise((resolve) => setTimeout(resolve, 4000));


        // Submit message
        const now = new Date();
        const utcTimestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                                      now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
        const date = new Date(utcTimestamp);
        const dateString = date.toUTCString();

        let sendResponse = await new TopicMessageSubmitTransaction({
            topicId: topicId,
            message: dateString,
        }).execute(client);

        const transactionStatus = (await sendResponse.getReceipt(client)).status.toString();
        console.log("The message transaction status: " + transactionStatus)
    }


void main();