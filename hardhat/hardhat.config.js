require("@nomiclabs/hardhat-waffle");
require('dotenv').config({ path: __dirname + '/../.env' });


// https://docs.polygon.technology/docs/develop/network-details/network

const mumbai_ID = process.env.MUMBAI_ID
const mainnet_ID = process.env.MAINNET_ID

const privateKey = process.env.PRIVATE_KEY

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${mumbai_ID}`,
      accounts: [privateKey]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${mainnet_ID}`,
      accounts: [privateKey]
    }
  },
  solidity: "0.8.4",
};
