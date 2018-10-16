import React, { Component } from "react";
import styled from "styled-components";
import * as BITBOXCli from "bitbox-sdk/lib/bitbox-sdk";

import Donation from "./components/Donation";
import Footer from "./components/Footer";
import { donations as initDonations } from "./donations";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// initialise BITBOX
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

    obj[output.scriptPubKey.addresses[0]] = {
      value: BITBOX.BitcoinCash.toBitcoinCash(output.satoshi)
    };
    finalArr.push(obj);
  });

  return finalArr;
};

class App extends Component {
  constructor(props) {
    super(props);

    const donationAddresses = Object.keys(initDonations).reduce(
      (prev, curr, idx) => {
        return [...prev, curr];
      },
      []
    );

    this.state = {
      donations: initDonations,
      donationAddresses
    };

    this.handleNewTx = this.handleNewTx.bind(this);
  }

  componentDidMount() {
    const { donationAddresses } = this.state;

    // create listenner with callback for incomming transactions
    socket.listen("transactions", this.handleNewTx);

    this.handleUpdateAddressBalance(donationAddresses);
  }

  async handleNewTx(msg) {
    const { donations, donationAddresses } = this.state;
    const json = JSON.parse(msg);
    // console.log(json);
    const outputs = json.outputs;

    const addresses = getOutputAddresses(outputs);
    // console.log("addresses", addresses);

    Object.keys(donations).forEach(p => {
      addresses.forEach(a => {
        const key = Object.keys(a)[0];

        if (BITBOX.Address.toLegacyAddress(p) === key) {
          // console.log("key", key);
          let input = json.inputs[0];
          let pubKey = input.script.split(" ")[1];
          // console.log("pubKey", pubKey);
          let pubkeyBuffer = Buffer.from(pubKey, "hex");
          let ecpair = BITBOX.ECPair.fromPublicKey(pubkeyBuffer);
          donations[p].input = BITBOX.ECPair.toCashAddress(ecpair);
          donations[p].lastTip = a[key].value;
          donations[p].notification = true;
          // instance of transaction builder
          let transactionBuilder = new BITBOX.TransactionBuilder("bitcoincash");
          // original amount of satoshis in vin

          let originalAmount = BITBOX.BitcoinCash.toSatoshi(
            donations[p].lastTip
          );
          // console.log("originalAmount", originalAmount);

          // index of vout
          let vout = 0;

          // txid of vout
          let txid = json.format.txid;
          // console.log("txid", txid);

          // add input with txid and index of vout
          transactionBuilder.addInput(txid, vout);

          // get byte count to calculate fee. paying 1 sat/byte
          let byteCount = BITBOX.BitcoinCash.getByteCount(
            { P2PKH: 1 },
            { P2PKH: 1 }
          );

          // amount to send to receiver. It's the original amount - 1 sat/byte for tx size
          let sendAmount = originalAmount - byteCount;

          // add output w/ address and amount to send
          transactionBuilder.addOutput(donations[p].input, sendAmount);

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
          // console.log(hex);

          let res = this.sendTx(hex, donations, p);
          // console.log("response: ", res);
          // sendRawTransaction to running BCH node
          // BITBOX.RawTransactions.sendRawTransaction(hex).then(
          //   result => {
          //     donations[p].txid = result;
          //     this.setState({
          //       donations
          //     });
          //     setTimeout(() => {
          //       donations[p].notification = false;
          //       this.setState({
          //         donations
          //       });
          //     }, 5000);
          //   },
          //   err => {
          //     console.log(err);
          //   }
          // );

          this.handleUpdateAddressBalance(donationAddresses);
        }
      });
    });
  }

  async sendTx(hex, donations, p) {
    //   // sendRawTransaction to running BCH node
    let res = await BITBOX.RawTransactions.sendRawTransaction(hex);
    if (res.length != 64) {
      await sleep(2000);
      this.sendTx(hex, donations, p);
    }
    donations[p].txid = res;
    this.setState({
      donations
    });
    setTimeout(() => {
      donations[p].notification = false;
      this.setState({
        donations
      });
    }, 5000);
    return res;
  }

  handleUpdateAddressBalance(addr) {
    const { donations } = this.state;

    // pass array or string and update balances
    BITBOX.Address.details(addr).then(
      result => {
        result.forEach(r => {
          Object.keys(donations).forEach(p => {
            donations[p].balance = (r.unconfirmedBalance + r.balance).toFixed(
              8
            );
          });
        });
        this.setState({
          donations
        });
      },
      err => {
        console.log(err);
      }
    );
  }

  render() {
    const { donations, donationAddresses } = this.state;
    // create 256 bit BIP39 mnemonic
    console.log(cashAddress);

    return (
      <Wrapper>
        <Title>Lefay.cash</Title>
        <Container>
          {donationAddresses.map((address, i) => {
            const donation = donations[address];

            // converts legacy address to cashaddr and passes to donation component for display
            const cashaddr = BITBOX.Address.toCashAddress(address);

            return <Donation key={i} donation={donation} address={cashaddr} />;
          })}
        </Container>
        <Footer />
      </Wrapper>
    );
  }
}

export default App;
