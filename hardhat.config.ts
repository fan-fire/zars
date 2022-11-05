import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";


const config: HardhatUserConfig = {
  solidity: "0.8.17",
  gasReporter: {
    currency: "ZAR",
    gasPrice: 100,
    noColors: false,
    coinmarketcap: 'f62b19fc-bfad-4e1f-bfe4-8bede182f845',
    token: 'MATIC',
    gasPriceApi: 'https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice',
  },
};

export default config;
