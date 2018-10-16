import React from "react";
import styled from "styled-components";
import QRCode from "qrcode-react";
import Notification from "../Notification";
import * as BITBOXCli from "bitbox-sdk/lib/bitbox-sdk";
// initialise BITBOX
const BITBOX = new BITBOXCli.default();

const Wrapper = styled.div`
  position: relative;
  margin: 15px;
  grid-template-areas: "pic qr" "addr addr" "name name" "genre genre" "bal bal";
  grid-gap: 5px;
  justify-content: center;
  background: #eee;
  border-radius: 5px;
  padding: 5px;
  box-shadow: 0px 0px 2px #000;
`;

const Image = styled.div`
  grid-area: pic;
  background: url(${props => props.image}) no-repeat center center;
  background-size: cover;
  width: 170px;
  margin: auto 10px;
  margin-right: 0px;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
`;

const QRContainer = styled.div`
  grid-area: qr;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Address = styled.a`
  text-decoration: none;
  color: #000;
  grid-area: addr;
  z-index: 10;
  text-size: 14px;
  text-align: center;
`;

const Name = styled.h2`
  grid-area: name;
  color: #000;
  text-align: center;
  margin: 5px auto;
`;

const Genre = styled.p`
  grid-area: genre;
  color: #000;
  text-align: center;
  margin: 0;
`;

const Balance = styled.div`
  grid-area: bal;
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
        <Notification donation={donation} show={donation.notification} />
        <QRContainer>
          <QRCode
            value={address}
            size={170}
            logo="../../assets/bch-logo.png"
            logoWidth={70}
            logoHeight={45}
          />
        </QRContainer>
        <Address href={address}>{shortAddr}</Address>
        <Balance>Balance BCH: {donation.balance}</Balance>
      </Wrapper>
    );
  }
}

export default Donation;
