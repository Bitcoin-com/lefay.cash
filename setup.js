let BITBOXSDK = require("bitbox-sdk/lib/bitbox-sdk").default;
const BITBOX = new BITBOXSDK();
let mnemonic =
  "mucosa stufo impiego smontare cortese presenza sequenza radicale dalmata baccano ebano scarso gasolio parcella aguzzo velina davvero guaio cucire domenica scolpito crisi voragine rosolare";
// root seed buffer
let rootSeed = BITBOX.Mnemonic.toSeed(mnemonic);

// master HDNode
let masterHDNode = BITBOX.HDNode.fromSeed(rootSeed, "bitcoincash");

// HDNode of BIP44 account
let account = BITBOX.HDNode.derivePath(masterHDNode, "m/44'/145'/0'");

// derive the first external change address HDNode which is going to spend utxo
let sender = BITBOX.HDNode.derivePath(account, "0/2");
let receiver = BITBOX.HDNode.derivePath(account, "0/1");

// get the cash address
let senderCashAddress = BITBOX.HDNode.toCashAddress(sender);
let receiverCashAddress = BITBOX.HDNode.toCashAddress(receiver);
console.log(senderCashAddress);
// return false;
// bitcoincash:qqn2yf5jzrhwr3magjps5muz30akqqgsm5q7wcgkga

BITBOX.Address.utxo(senderCashAddress).then(
  result => {
    console.log(result);
    // return false;

    // instance of transaction builder
    let transactionBuilder = new BITBOX.TransactionBuilder("bitcoincash");
    // original amount of satoshis in vin

    let originalAmount = result[0].satoshis;

    // index of vout
    let vout = result[0].vout;

    // txid of vout
    let txid = result[0].txid;

    // add input with txid and index of vout
    transactionBuilder.addInput(txid, vout);

    // get byte count to calculate fee. paying 1 sat/byte
    let byteCount = BITBOX.BitcoinCash.getByteCount({ P2PKH: 1 }, { P2PKH: 1 });
    // 192

    // amount to send to receiver. It's the original amount - 1 sat/byte for tx size
    let sendAmount = originalAmount - byteCount;

    // add output w/ address and amount to send
    transactionBuilder.addOutput(receiverCashAddress, sendAmount);

    // keypair
    let keyPair = BITBOX.HDNode.toKeyPair(sender);

    // sign w/ HDNode
    let redeemScript;
    transactionBuilder.sign(
      0,
      keyPair,
      redeemScript,
      transactionBuilder.hashTypes.SIGHASH_ALL,
      originalAmount
    );

    // build tx
    let tx = transactionBuilder.build();
    // output rawhex
    let hex = tx.toHex();

    // sendRawTransaction to running BCH node
    BITBOX.RawTransactions.sendRawTransaction(hex).then(
      result => {
        console.log(result);
      },
      err => {
        console.log(err);
      }
    );
  },
  err => {
    console.log(err);
  }
);
