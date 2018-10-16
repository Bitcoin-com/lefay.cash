import React from "react";
import styled from "styled-components";
import QRCode from "qrcode-react";
import Notification from "../Notification";
import * as BITBOXCli from "bitbox-sdk/lib/bitbox-sdk";
// initialise BITBOX
const BITBOX = new BITBOXCli.default();

const Wrapper = styled.div`
  text-align: center;
`;

const QRContainer = styled.div`
  padding-bottom: 25px;
`;

const Address = styled.a`
  text-decoration: none;
  color: #000;
`;

const Balance = styled.div`
  margin-top: 25px;
  font-size: 36px;
  font-weight: 700;
  color: #000;
  text-align: center;
`;

class Donation extends React.Component {
  render() {
    const { donation, address } = this.props;

    const shortAddr = address.substring(12);
    return (
      <Wrapper>
        <Address
          target="_blank"
          href="https://explorer.bitcoin.com/bch/address/bitcoincash:qrcgrg69ey7mylken3gdyf2qtnygp7n76uyr30xqw7"
        >
          <QRContainer>
            <QRCode
              value={address}
              size={170}
              logo="../../assets/bch-logo.png"
              logoWidth={70}
              logoHeight={45}
            />
          </QRContainer>
          {shortAddr}
        </Address>
        <Balance>Balance BCH: {this.props.balance}</Balance>
      </Wrapper>
    );
  }
}

export default Donation;
