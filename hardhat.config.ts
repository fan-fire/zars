import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";


const config: HardhatUserConfig = {
  solidity: "0.8.17",
  gasReporter: {
    currency: "ZAR",
    gasPrice: 100,
    noColors: false,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: 'MATIC',
    gasPriceApi: 'https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice',
  },
};

export default config;
