import React from "react";
import styled, { css } from "styled-components";

const Wrapper = styled.div`
  ${props =>
    props.show
      ? css`
          opacity: 1;
          z-index: 20;
        `
      : css`
          opacity: 0;
          z-index: 0;
        `} display: flex;
  position: absolute;
  left: 50%;
  top: 50%;
  width: 80%;
  height: 80%;
  margin-left: -40%;
  margin-top: -36%;
  background: #faba15;
  padding: 10px;
  border: 1px solid #000;
  box-sizing: border-box;
  text-align: center;
  flex: 1;
  flex-direction: column;
  align-items: center;
  border-radius: 5px;
  color: #000;
  justify-content: space-evenly;

  transition: all 0.3s ease-out;

  background: linear-gradient(314deg, #ffffff, #faba15, #ffffff);
  background-size: 600% 600%;

  -webkit-animation: AnimationName 3s ease infinite;
  -moz-animation: AnimationName 3s ease infinite;
  animation: AnimationName 3s ease infinite;

  @-webkit-keyframes AnimationName {
    0% {
      background-position: 0% 10%;
    }
    50% {
      background-position: 100% 91%;
    }
    100% {
      background-position: 0% 10%;
    }
  }
  @-moz-keyframes AnimationName {
    0% {
      background-position: 0% 10%;
    }
    50% {
      background-position: 100% 91%;
    }
    100% {
      background-position: 0% 10%;
    }
  }
  @keyframes AnimationName {
    0% {
      background-position: 0% 10%;
    }
    50% {
      background-position: 100% 91%;
    }
    100% {
      background-position: 0% 10%;
    }
  }
`;

const Image = styled.div`
  height: auto;
  background: url(${props => props.src}) no-repeat center center;
  width: 160px;
  height: 160px;
  background-size: cover;
  margin: 0 auto;
  border: 1px solid #000;
`;

const Name = styled.div`
  font-size: 18px;
  padding: 10px;
  font-weight: 700;
`;

const Tip = styled.div`
  font-size: 32px;
  font-weight: 700;
`;

class Notification extends React.Component {
  render() {
    const { donation, show } = this.props;

    return (
      <Wrapper show={show}>
        <Image src={donation.image} />
        <Name>just received a payment from</Name>
        <Name>{donation.input}</Name>
        <Tip>{donation.lastTip || 0.00500001} BCH</Tip>
        <Tip>Sent back w/ txid:</Tip>
        <Tip>
          <a
            target="_blank"
            href={`https://explorer.bitcoin.com/bch/tx/${donation.txid}`}
          >
            {donation.txid}
          </a>
        </Tip>
      </Wrapper>
    );
  }
}

export default Notification;
