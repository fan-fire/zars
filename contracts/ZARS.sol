// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract ZARS is ERC20, ERC20Burnable, AccessControl, Pausable {
    mapping(address => bool) private _frozen;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant GOVERN_ROLE = keccak256("GOVERN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    modifier whenNotFrozen(address account) {
        require(!_frozen[account], "ZARS: Account is frozen");
        _;
    }

    modifier whenFrozen(address account) {
        require(_frozen[account], "ZARS: Account is not frozen");
        _;
    }

    function isFrozen(address account) public view returns (bool) {
        return _frozen[account];
    }

    /**
     * See {IERC20-constructor}.
     *
     * @dev Grants `DEFAULT_ADMIN_ROLE` to the account that deploys the contract.
     *
     * Further roles can be granted by the deployer wallets by calling {grantRole}.
     *
     */
    constructor() ERC20("ZARS Stablecoin", "ZARS") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    event AddressFrozen(address indexed account);
    event AddressUnfrozen(address indexed account);
    event AddressSeized(address indexed account);
    event FundsWithdrew(address indexed account, uint256 amount);

    /**
     * @dev Freezes a specific account.
     *
     * @param account The address to be frozen.
     *
     * Requirements:
     * - the contract must not be paused.
     * - the caller must have the `GOVERN_ROLE`.
     * - the account must not be frozen.
     *
     * Emits AddressFrozen event.
     */
    function freeze(address account)
        public
        whenNotPaused
        onlyRole(GOVERN_ROLE)
        whenNotFrozen(account)
    {
        _frozen[account] = true;
        emit AddressFrozen(account);
    }

    /**
     * @dev Unfreezes a specific account.
     *
     * @param account The address to be unfrozen.
     *
     * Requirements:
     * - the contract must not be paused.
     * - the caller must have the `GOVERN_ROLE`.
     * - the account must be frozen.
     *
     *
     * Emits Unfreeze event.
     */
    function unfreeze(address account)
        public
        whenNotPaused
        onlyRole(GOVERN_ROLE)
        whenFrozen(account)
    {
        _frozen[account] = false;
        emit AddressUnfrozen(account);
    }

    /**
     * @dev Seizes a specific account which entails transffering
     * all the funds to this contract which can later be pulled
     * and/or burned using the withdraw function.
     *
     * @param account The address to be seized.
     *
     * Requirements:
     * - contract must not be paused.
     * - caller must have the GOVERN_ROLE.
     * - account must not be frozen.
     * - account cannot be the zero address.
     * - account cannot be the contract address.
     * - account must have a balance greater than zero.
     *
     * Emits AddressSeized event.
     */
    function seize(address account)
        public
        whenNotPaused
        onlyRole(GOVERN_ROLE)
        whenFrozen(account)
    {
        require(account != address(0), "ZARS: Cannot seize zero address");
        require(account != address(this), "ZARS: cannot clean to self");
        require(balanceOf(account) > 0, "ZARS: cannot clean empty account");
        uint256 balance = balanceOf(account);
        _transfer(account, address(this), balance);
        emit AddressSeized(account);
    }

    /**
     * @dev Withdraws a specific amount of ZARS from this contract.
     *
     * @param amount The amount of ZARS to withdraw to the sender.
     *
     * Requirements:
     *
     * - contract must not be paused.
     * - contract must have enough ZARS to withdraw.
     * - caller must have the `GOVERN_ROLE`.
     *
     * Emits Withdraw event.
     */
    function withdraw(uint256 amount)
        public
        whenNotPaused
        onlyRole(GOVERN_ROLE)
    {
        require(amount <= balanceOf(address(this)), "ZARS: not enough funds");
        _transfer(address(this), _msgSender(), amount);
        emit FundsWithdrew(_msgSender(), amount);
    }

    /**
     * @dev See {ERC20-_mint}.
     *
     * Requirements:
     * - contract must not be paused.
     * - caller must have the `MINTER_ROLE`.
     * - account must not be frozen.
     */
    function mint(address account, uint256 amount)
        public
        onlyRole(MINTER_ROLE)
        whenNotFrozen(account)
    {
        _mint(account, amount);
    }

    /**
     * @dev See {ERC20-_burn}.
     *
     * Requirements:
     * - contract must not be paused.
     * - caller must have the `BURNER_ROLE`.
     */
    function burn(uint256 amount)
        public
        override
        whenNotPaused
        onlyRole(BURNER_ROLE)
    {
        super.burn(amount);
    }

    /**
     * @dev See {ERC20-_transfer}.
     *
     * Requirements:
     * - contract must not be paused.
     * - caller must not be frozen.
     * - recipient must not be frozen.
     */
    function transfer(address recipient, uint256 amount)
        public
        virtual
        override
        whenNotPaused
        whenNotFrozen(_msgSender())
        whenNotFrozen(recipient)
        returns (bool)
    {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    /**
     * @dev See {ERC20-_transfer}.
     *
     * The ability to transfor to mutiple recipients.
     *
     * Requirements:
     * - contract must not be paused.
     * - sender must not be frozen.
     * - recipients must not be frozen.
     * - recipients cannot be this contract
     * - recipients cannot be the zero address
     * - amounts must be greater than zero.
     */
    function multiTransfer(
        address[] memory recipients,
        uint256[] memory amounts
    ) public whenNotPaused whenNotFrozen(_msgSender()) returns (bool) {
        require(
            recipients.length == amounts.length,
            "ZARS: recipients and amounts length mismatch"
        );
        for (uint256 i = 0; i < recipients.length; i++) {
            require(
                recipients[i] != address(0),
                "ZARS: Cannot transfer to zero address"
            );
            require(
                recipients[i] != address(this),
                "ZARS: Cannot transfer to contract address"
            );
            require(
                !isFrozen(recipients[i]),
                "ZARS: Cannot transfer to frozen address"
            );
            _transfer(_msgSender(), recipients[i], amounts[i]);
        }
        return true;
    }

    /**
     * @dev See {Pausable-_pause}.
     *
     * Requirements:
     * - caller must have the `PAUSER_ROLE`.
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev See {Pausable-_unpause}.
     *
     * Requirements:
     * - caller must have the `PAUSER_ROLE`.
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
