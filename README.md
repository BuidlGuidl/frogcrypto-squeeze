# 🐸 FrogCrypto Squeeze

![frogjuice fun_ (1)](https://github.com/user-attachments/assets/3c1780a3-5518-4aad-b1e6-3dcc95274a46)

---

**FrogCrypto Squeeze** is a prototype application that allows you to squeeze your **CryptoFrogs** inside your **Zupass**. These frogs were minted during **Devcon 7** and can now be interacted with through this fun and engaging web application.

Try it out live here: [https://frogjuice.fun/](https://frogjuice.fun/)

![frogjuice fun_ (3)](https://github.com/user-attachments/assets/5c2b8bbe-2498-4b29-92ac-ed5330b8ff73)



## 🐸 What Are CryptoFrogs?

CryptoFrogs are unique, programmable cryptographic collectibles introduced at **Devcon 7**. They were minted as part of an initiative to introduce attendees to programmable cryptography in a fun and engaging way. These frogs can now be squeezed using this application, adding a playful layer of interaction to the collectibles.

## 🚀 Features

- **Zupass Integration**: Seamlessly connect your Zupass to interact with your CryptoFrogs.
- **Frog Squeezing**: A playful and interactive way to engage with your frogs.
- **On-Chain Proof Verification**: Built with cutting-edge cryptographic proof verification to ensure secure and transparent interactions.


## 🛠️ Implementation Details

This project leverages **on-chain GPC proof verification** to ensure secure and verifiable interactions with CryptoFrogs. The implementation is based on the following principles:

1. **Zupass Integration**: The application uses Zupass, a decentralized identity and proof system, to authenticate users and verify ownership of CryptoFrogs.
2. **On-Chain Proofs**: The squeezing process involves generating and verifying cryptographic proofs directly on-chain, ensuring transparency and trust.
2. **Frontend Circuit Data**: The frontend retrieves the circuit data required to send to the smart contract for verification. You can find the relevant code [here](https://github.com/BuidlGuidl/frogcrypto-squeeze/blob/a694e147a8f1d55df270471e1174761a4a52ec7f/packages/nextjs/app/page.tsx#L155).
3. **Smart Contract Verification**: The smart contract verifies the proof data sent from the front end. First, it verifies known constants, then the attributes, and finally, the proof. The verification logic is implemented [here](https://github.com/BuidlGuidl/frogcrypto-squeeze/blob/main/packages/hardhat/contracts/FrogCryptoSqueeze.sol#L84).

This architecture ensures that the ownership of CryptoFrogs is provable and verifiable in a decentralized manner.

For more technical details, refer to https://www.notion.so/0xparc/On-Chain-GPC-Proof-Verification-1dd71e0a542080eea9a7d463d40758cd


## 🌐 Live Demo

Check out the live application here: [https://frogjuice.fun/](https://frogjuice.fun/)

---

## 🏗 This application uses Scaffold-ETH 2

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## 📦 Installation

To run the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/BuidlGuidl/frogcrypto-squeeze.git
   cd frogcrypto-squeeze
   ```

2. Copy `packages/nextjs/.env.example` to `packages/nextjs/.env` and fill environment variables values.

3. Install dependencies:
   ```bash
   yarn install
   ```

4. Start the Ponder server:
   ```bash
   yarn ponder:dev
   ```

5. Start the development server:
   ```bash
   yarn start
   ```

6. Open your browser and navigate to `http://localhost:3000`.

If you want to run the contracts locally:

1. Run a local network:

```bash
yarn chain
```

2. Deploy contracts:

```bash
yarn deploy
```

3. Change `packages/nextjs/scaffold.config.ts` targetNetworks.

4. Change Ponder *startBlock* on `packages/ponder/ponder.config.ts`.


---

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute to this project, please fork the repository and submit a pull request.

---

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
