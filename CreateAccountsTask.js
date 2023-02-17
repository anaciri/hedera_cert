const { Client, AccountCreateTransaction, PrivateKey } = require("@hashgraph/sdk");


async function main() {
    const myAccountId = "0.0.4061";
    const myPrivateKey = "70b86ec7c816795d896e64ddc8ede105924510d45ab38afe11188c034ba95931edbfb647cfcfa4b600f96efcf6a50d84a2a8a287b6e919033a6457f3f725b211";
    const accounts = [];

    const client = Client.forTestnet();
    client.setOperator(myAccountId,myPrivateKey)

    for (let i = 1; i <= 5; i++) {
      // Generate a new keypair for the account
      const privateKey =  PrivateKey.generate();
      const publicKey = privateKey.publicKey;
  
      // Create the account transaction
      let transaction = new AccountCreateTransaction()
        .setKey(publicKey)
        .setInitialBalance(1000)
        .setTransactionMemo(`Creating Account${i}`)
  
      // Submit the transaction to the network
      const response = await transaction.execute(client);
      let receipt = await response.getReceipt(client);
  
      // Get the new account ID
      const newAccountId = receipt.accountId.toString();
      
      accounts.push({
        accountId: newAccountId,
        privateKey: privateKey,
        publicKey: publicKey
      });
  
    }
    
    // Print the account information
  console.log("Accounts:");
  accounts.forEach((account, i) => {
    console.log(`Account${i + 1}:`);
    console.log(`  Account ID: ${account.accountId}`);
    console.log(`  Public key: ${account.publicKey.toString()}`);
    console.log(`  Private key: ${account.privateKey.toString()}\n`);
  });

    process.exit();
  }
        
void main();
    
   