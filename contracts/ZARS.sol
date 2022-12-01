// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IERC20Z.sol";

contract ZARS is ERC20, AccessControl, Pausable, IERC20Z {
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

    function isFrozen(address account) public view override returns (bool) {
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
        override
        whenNotPaused
        onlyRole(GOVERN_ROLE)
        whenNotFrozen(account)
        returns (bool)
    {
        _frozen[account] = true;
        emit AddressFrozen(account);
        return true;
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
     * Emits AddressUnfrozen event.
     */
    function unfreeze(address account)
        public
        override
        whenNotPaused
        onlyRole(GOVERN_ROLE)
        whenFrozen(account)
        returns (bool)
    {
        _frozen[account] = false;
        emit AddressUnfrozen(account);
        return true;
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
     * - account cannot be the contract address.
     * - account must have a balance greater than zero.
     *
     * Emits AddressSeized event.
     */
    function seize(address account)
        public
        override
        whenNotPaused
        onlyRole(GOVERN_ROLE)
        whenFrozen(account)
        returns (bool)
    {
        require(account != address(this), "ZARS: cannot clean to self");
        require(balanceOf(account) > 0, "ZARS: cannot clean empty account");
        uint256 balance = balanceOf(account);
        _transfer(account, address(this), balance);
        emit AddressSeized(account);
        return true;
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
     * Emits FundsWithdrew event.
     */
    function withdraw(uint256 amount)
        public
        override
        whenNotPaused
        onlyRole(GOVERN_ROLE)
        returns (bool)
    {
        require(amount <= balanceOf(address(this)), "ZARS: not enough funds");
        _transfer(address(this), _msgSender(), amount);
        emit FundsWithdrew(_msgSender(), amount);
        return true;
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
        whenNotPaused
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
    function burn(uint256 amount) public whenNotPaused onlyRole(BURNER_ROLE) {
        _burn(_msgSender(), amount);
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
     * - recipients must not be the sender.
     */
    function multiTransfer(
        address[] memory recipients,
        uint256[] memory amounts
    ) public override whenNotPaused whenNotFrozen(_msgSender()) returns (bool) {
        require(
            recipients.length == amounts.length,
            "ZARS: recipients and amounts length mismatch"
        );

        require(
            recipients.length < 256,
            "ZARS: recipients and amounts length must be less than 256"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            require(
                recipients[i] != _msgSender(),
                "ZARS: Recipient cannot be the sender"
            );
            require(!isFrozen(recipients[i]), "ZARS: Account is frozen");
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

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return
            super.supportsInterface(interfaceId) ||
            interfaceId == type(IERC20).interfaceId ||
            interfaceId == type(IERC20Z).interfaceId;
    }
}
