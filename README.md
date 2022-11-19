# ZARS

A stablecoin for the South African Rand (ZAR).

## Overview

ZARS is a stable coin for the South African Rand (ZAR). It draws a lot of inspiration from the [USDP](https://github.com/paxosglobal/usdp-contracts) project. It is a non-upgradable EIP-20 compatible contract with two additional features:

+ The ability to freeze-and-seize funds from a user's account through a wallet with the GOVERN_ROLE
+ The ability for third parties to offer "GAS-less" transactions to custodial wallet users through the use of the `multiTransfer` method.

### Inheritance

The contract inherits from the following OpenZeppelin contracts:

+ ERC20
+ ERC20Burnable
+ AccessControl - and by extension the following contracts:
  + Context
  + ERC165
+ Pausable

### Roles

+ MINTER_ROLE: A wallet that has this role can
  +  call the `mint` method
+ BURNER_ROLE: A wallet that has this role can
  + call the `burn` method
+ GOVERN_ROLE: A wallet that has this role can
  + call the `freeze` method
  + call the `unfreeze` method
  + call the  `seize` method
  + call the `withdraw` method
+ PAUSER_ROLE: A wallet that has this role can
  + call the `pause` method
  + call the `unpause` method

### ERC20 Token

The public interface of ZARS is the ERC20 interface
specified by [EIP-20](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md).

- `name()`
- `symbol()`
- `decimals()`
- `totalSupply()`
- `balanceOf(address who)`
- `transfer(address to, uint256 value)`
- `approve(address spender, uint256 value)`
- `allowance(address owner, address spender)`
- `transferFrom(address from, address to, uint256 value)`

And the usual events.

- `event Transfer(address indexed from, address indexed to, uint256 value)`
- `event Approval(address indexed owner, address indexed spender, uint256 value)`

A typical interaction with the contract will use `transfer` to move the token as payment.
Additionally, a pattern involving `approve` and `transferFrom` can be used to allow another 
address to move tokens from your address to a third party without the need for the middle person 
to custody the tokens, such as in the 0x protocol. 

### Additional Events

We've enriched the ERC20 interface with the IERC20Z interface (`0xe6f9bbc6`), which adds the following methods and events:

#### Methods
+ isFrozen(address account)
+ freeze(address account)
+ unfreeze(address account)
+ seize(address account)
+ withdraw(uint256 amount)
+ multiTransfer(address[] memory recipients, uint256[] memory amounts)

#### Events
+ event AddressFrozen(address indexed account);
+ event AddressUnfrozen(address indexed account);
+ event AddressSeized(address indexed account);
+ event FundsWithdrew(address indexed account, uint256 amount);

### Controlling the token supply

The total supply of ZARS is backed by fiat held in reserve. Only wallets with the `MINTER_ROLE` are allowed to mint new tokens and only the wallet which deployed the ZARS contract has the `DEFAULT_ADMIN_ROLE` which is allowed to grant and revoke the `MINTER_ROLE`. The ZARS contract will be deployed with a hardware wallet of which the seed phrase and password will be kept in 3 different locations and a trusted third party (an auditor) will need to facilitate the granting and revoking of any roles with roles only being granted for the minimum duration required then being revoked.

The exact process for minting new tokens will be documented in due course once the ZARS contract has been audited.