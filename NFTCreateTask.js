const {
    TokenCreateTransaction,
    Client,
    TokenType,
    TokenSupplyType,
    PrivateKey,
    AccountBalanceQuery,
    CustomRoyaltyFee,
    CustomFixedFee,
    Hbar
} = require("@hashgraph/sdk");
require('dotenv').config();

const account1 = "0.0.3506856"
const account1PK = PrivateKey.fromString("302e020100300506032b657004220420224d9454b036a60163e97bc31cca05b905658aea97d0506df7aa15917eb079fd");

const feeCollectorAccountId = "0.0.3506857"
;

// Create our connection to the Hedera network
const client = Client.forTestnet();

client.setOperator(account1, account1PK);

async function main() {

    let nftCustomFee = new CustomRoyaltyFee()
        .setNumerator(1)
        .setDenominator(10)
        .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(200)))
        .setFeeCollectorAccountId(feeCollectorAccountId);

    //Create the NFT
    let nftCreate = await new TokenCreateTransaction()
        .setTokenName("MY NFT")
        .setTokenSymbol("AYB")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(account1)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(5)
        .setCustomFees([nftCustomFee])
        .setSupplyKey(account1PK)
        .freezeWith(client);

    //Sign the transaction with the treasury key
    let nftCreateTxSign = await nftCreate.sign(account1PK);

    //Submit the transaction to a Hedera network
    let nftCreateSubmit = await nftCreateTxSign.execute(client);

    //Get the transaction receipt
    let nftCreateRx = await nftCreateSubmit.getReceipt(client);

    //Get the token ID
    let tokenId = nftCreateRx.tokenId;

    //Log the token ID
    console.log(`- Created NFT with Token ID: ${tokenId} \n`);

    const balanceCheckTx = await new AccountBalanceQuery().setAccountId(account1).execute(client);

    console.log(`- User balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);

    process.exit();
}

main();
