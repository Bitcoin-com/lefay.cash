import React, { Component } from "react";
import styled from "styled-components";
import * as BITBOXCli from "bitbox-sdk/lib/bitbox-sdk";

import Donation from "./components/Donation";
import Footer from "./components/Footer";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const BITBOX = new BITBOXCli.default();
// initialise socket connection
const socket = new BITBOX.Socket();

let mnemonic =
  "mucosa stufo impiego smontare cortese presenza sequenza radicale dalmata baccano ebano scarso gasolio parcella aguzzo velina davvero guaio cucire domenica scolpito crisi voragine rosolare";

// root seed buffer
let rootSeed = BITBOX.Mnemonic.toSeed(mnemonic);

// master HDNode
let masterHDNode = BITBOX.HDNode.fromSeed(rootSeed, "bitcoincash");

// HDNode of BIP44 account
let account = BITBOX.HDNode.derivePath(masterHDNode, "m/44'/145'/0'");

// derive the first external change address HDNode which is going to spend utxo
let change = BITBOX.HDNode.derivePath(account, "0/0");

// get the cash address
let cashAddress = BITBOX.HDNode.toCashAddress(change);
cashAddress = BITBOX.Address.toCashAddress(cashAddress, false);

const Wrapper = styled.div`
  padding: 0;
  margin: 0;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: center;
  align-items: space-between;
  min-height: 100vh;
`;

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: normal;
  padding: 28px 0;
`;

const Title = styled.h1`
  text-align: center;
  margin: 10px auto;
  font-size: 50px;
  color: black;
`;

const getOutputAddresses = outputs => {
  let finalArr = [];
  outputs.forEach((output, index) => {
    let obj = {};
    if (
      output.scriptPubKey &&
      output.scriptPubKey.addresses &&
      output.scriptPubKey.addresses.length > 0
    ) {
      let tmp = BITBOX.Address.toCashAddress(output.scriptPubKey.addresses[0]);
      obj[tmp] = {
        value: BITBOX.BitcoinCash.toBitcoinCash(output.satoshi)
      };
      finalArr.push(obj);
    }
  });

  return finalArr;
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      balance: 0,
      donationAddress: cashAddress,
      notification: false
    };

    this.handleNewTx = this.handleNewTx.bind(this);
  }

  componentDidMount() {
    const { donationAddres } = this.state;

    // create listenner with callback for incomming transactions
    socket.listen("transactions", this.handleNewTx);

    this.handleUpdateAddressBalance(cashAddress);
  }

  async handleNewTx(newTx) {
    let decodedTx = JSON.parse(newTx);
    let outputs = decodedTx.outputs;
    const outputAddresses = getOutputAddresses(outputs);

    outputAddresses.forEach(async addressObj => {
      const outputAddress = Object.keys(addressObj)[0];

      if (cashAddress === BITBOX.Address.toCashAddress(outputAddress, false)) {
        let input = decodedTx.inputs[0];
        let pubKey = input.script.split(" ")[1];
        let pubkeyBuffer = Buffer.from(pubKey, "hex");
        let ecpair = BITBOX.ECPair.fromPublicKey(pubkeyBuffer);
        let tmpAddr = BITBOX.Address.toCashAddress(
          BITBOX.ECPair.toCashAddress(ecpair),
          false
        );

        input.lastTip = addressObj[outputAddress].value;
        input.notification = true;
        let u = await BITBOX.Address.utxo([cashAddress]);
        // instance of transaction builder
        if (tmpAddr != cashAddress) {
          const utxo = this.findBiggestUtxo(u[0], input.txid);
          // return false;
          let transactionBuilder = new BITBOX.TransactionBuilder();

          // original amount of satoshis in vin
          let originalAmount = utxo.satoshis;

          // index of vout
          let vout = utxo.vout;

          // txid of vout
          let txid = utxo.txid;

          // add input with txid and index of vout
          transactionBuilder.addInput(txid, vout);

          // get byte count to calculate fee. paying 1 sat/byte
          let byteCount = BITBOX.BitcoinCash.getByteCount(
            { P2PKH: 1 },
            { P2PKH: 2 }
          );

          // amount to send to receiver. It's the original amount - 1 sat/byte for tx size
          let sendAmount = originalAmount - byteCount;

          transactionBuilder.addOutput(
            BITBOX.ECPair.toCashAddress(ecpair),
            BITBOX.BitcoinCash.toSatoshi(input.lastTip)
          );

          // send change back to main BIP44 account
          transactionBuilder.addOutput(
            cashAddress,
            sendAmount - BITBOX.BitcoinCash.toSatoshi(input.lastTip)
          );

          // keypair
          let keyPair = BITBOX.HDNode.toKeyPair(change);

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
          console.log(hex);

          let res = this.sendTx(hex, input, cashAddress);

          this.handleUpdateAddressBalance(cashAddress);
        }
      }
    });
  }

  async sendTx(hex, input, p) {
    // sendRawTransaction to running BCH node
    let res = await BITBOX.RawTransactions.sendRawTransaction(hex);
    if (res.length == 64) {
      input.txid = res;
      this.setState({
        notification: true,
        input: p,
        lastTip: input.lastTip,
        txid: res
      });
      setTimeout(() => {
        input.notification = false;
        this.setState({
          notification: false
        });
      }, 5000);
      return res;
      // } else if (res == "txn-mempool-conflict") {
      //   console.log("response", res);
      //   return false;
      // } else {
      //   await sleep(2000);
      //   this.sendTx(hex, donations, p);
    }
  }

  async handleUpdateAddressBalance(addr) {
    let result = await BITBOX.Address.details(addr);
    this.setState({
      balance: result.balance
    });
  }

  findBiggestUtxo(utxos, txid) {
    let largestAmount = 0;
    let largestIndex = 0;

    for (let i = 0; i < utxos.length; i++) {
      const thisUtxo = utxos[i];

      if (
        thisUtxo.satoshis > largestAmount &&
        thisUtxo.txid !== txid &&
        thisUtxo.satoshis
      ) {
        largestAmount = thisUtxo.satoshis;
        largestIndex = i;
      }
    }

    return utxos[largestIndex];
  }

  render() {
    return (
      <Wrapper>
        <Title>Lefay.cash</Title>
        <Container>
          return (
          <Donation
            balance={this.state.balance}
            address={cashAddress}
            notification={this.state.notification}
            lastTip={this.state.lastTip}
            input={this.state.input}
            txid={this.state.txid}
          />
          );
        </Container>
        <Footer />
      </Wrapper>
    );
  }
}

export default App;
