## lefay.cash

Double spend game for Satoshi's Vision 2018 Milan.

[Live example](https://www.lefay.cash/)

![BCH Gang](bch-gang.jpg "BCH Gang")

## Setup

1. Clone the repo
   - `git clone https://github.com/Bitcoin-com/lefay.cash.git`
2. Install the dependencies
   - `cd lefay.cash && npm install`
3. Plug in your mnemonic to `app.js` on line #13 and fund the first BIP44 account's external change address.
   - ex: `m/44'/145'/0'/0/0`
4. Start the app
   - `npm start`
5. Load the app in your browser
   - `http://localhost:3000/`
6. Send funds to the app's address. Whatever you send will be immediately resent to your original sending address. If you can double spend your tx you get to keep the BCH! You can use `setup.js` as a helper script to send to the double spend address from a single output.
