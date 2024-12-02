import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import tokens from "../../nextjs/tokens.config";
import beautyBalance from "../data/beautyBalances.json";
import intelligenceBalance from "../data/intelligenceBalances.json";
import jumpBalance from "../data/jumpBalances.json";
import speedBalance from "../data/speedBalances.json";
import rarityBalance from "../data/rarityBalances.json";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();

  interface BalanceItem {
    id: string;
    amount: string;
  }

  interface Balances {
    beauty: BalanceItem[];
    intelligence: BalanceItem[];
    jump: BalanceItem[];
    speed: BalanceItem[];
    rarity: BalanceItem[];
  }

  const balances: Balances = {
    beauty: beautyBalance,
    intelligence: intelligenceBalance,
    jump: jumpBalance,
    speed: speedBalance,
    rarity: rarityBalance,
  };

  for (const token of tokens) {
    const contractName = `FrogCrypto${token.attribute}TokenV2`;

    console.log(`Migrating ${token.attribute} tokens`);

    const tokenContract = await hre.ethers.getContract<Contract>(contractName, deployer);
    await tokenContract.grantMinterRole(deployer);

    console.log(`🔑 Minter role granted to deployer for ${token.attribute} tokens`);

    for (const balance of balances[token.attribute.toLowerCase() as keyof Balances]) {
      const address = balance.id;
      const amount = balance.amount;
      console.log(`Minting ${amount} ${token.attribute} tokens to ${address}`);
      await tokenContract.mint(address, BigInt(amount) * 10n ** 18n);
      console.log(`💰 ${amount} ${token.attribute} tokens minted to ${address}`);
    };

    console.log(`🐸 ${token.attribute} tokens migrated`);

    await tokenContract.revokeMinterRole(deployer);
    console.log(`🔑 Minter role revoked from deployer for ${token.attribute} tokens`);
  }

  console.log("Tokens migrated");
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["MigrateTokens"];
