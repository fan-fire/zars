import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";

const weiToEth = (wei: string) => ethers.utils.formatEther(wei);
const zarToEth = (decimal: string) => ethers.utils.parseEther(decimal);

describe("ZARS", () => {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployZars() {
    const [owner, notOwner, minter, pauser, burner, govern, acc1, acc2, acc3] = await ethers.getSigners();

    const ZARS = await ethers.getContractFactory("ZARS");
    const zars = await ZARS.deploy();

    return {
      zars,
      owner,
      notOwner,
      minter,
      pauser,
      burner,
      govern,
      acc1,
      acc2,
      acc3
    };
  }


  async function applyMinterRole(zars: any, owner: any, minter: any) {
    await zars.connect(owner).grantRole(await zars.MINTER_ROLE(), minter.address);
  }

  async function applyPauserRole(zars: any, owner: any, pauser: any) {
    await zars.connect(owner).grantRole(await zars.PAUSER_ROLE(), pauser.address);
  }

  async function applyBurnerRole(zars: any, owner: any, burner: any) {
    await zars.connect(owner).grantRole(await zars.BURNER_ROLE(), burner.address);
  }

  async function applyGovernRole(zars: any, owner: any, govern: any) {
    await zars.connect(owner).grantRole(await zars.GOVERN_ROLE(), govern.address);
  }


  async function deployZarsWithMintedTokens() {
    const { zars,
      owner,
      notOwner,
      minter,
      pauser,
      burner,
      govern,
      acc1,
      acc2,
      acc3 } = await loadFixture(deployZars);

    await applyMinterRole(zars, owner, minter);

    // grant minter MINTER_ROLE
    // await zars.grantRole(await zars.MINTER_ROLE(), minter.address);

    await zars.connect(minter).mint(acc1.address, zarToEth("1000"));
    await zars.connect(minter).mint(acc2.address, zarToEth("1000"));
    await zars.connect(minter).mint(acc3.address, zarToEth("1000"));

    return {
      zars,
      owner,
      notOwner,
      minter,
      pauser,
      burner,
      govern,
      acc1,
      acc2,
      acc3
    };
  }

  describe("Deployment", () => {
    it("Should be able to depoy", async () => {
      const { zars, owner, notOwner } = await loadFixture(deployZars);

      expect(await zars.name()).to.equal("ZARS Stablecoin");
    });

    it("Should have granted owner DEFAULT_ADMIN_ROLE", async () => {
      const { zars, owner } = await loadFixture(deployZars);

      expect(await zars.hasRole(await zars.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

    });
  });

  describe("Roles", () => {
    describe("Granting", () => {
      it("Should be able to grant MINTER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { zars, owner, notOwner } = await loadFixture(deployZars);
        expect(await zars.hasRole(await zars.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm notOwner doens't have MINTER_ROLE
        expect(await zars.hasRole(await zars.MINTER_ROLE(), notOwner.address)).to.be.false;

        // grant MINTER_ROLE to notOwner
        await zars.grantRole(await zars.MINTER_ROLE(), notOwner.address);

        // confirm notOwner has MINTER_ROLE
        expect(await zars.hasRole(await zars.MINTER_ROLE(), notOwner.address)).to.be.true;
      });

      //       MINTER_ROLE
      // BURNER_ROLE
      // GOVERN_ROLE
      // PAUSER_ROLE

    });

    describe("Revoking", () => {

    });

    describe("Methods", () => {

    });
  });

  describe("Transacting", () => {
    describe("Minting", () => {
      it("Should be able to mint with MINTER_ROLE", async () => {
        const { zars, owner, notOwner } = await loadFixture(deployZars);

        // Grant MINTER_ROLE to notOwner
        await zars.grantRole(await zars.MINTER_ROLE(), notOwner.address);

        // confirm notOwner has MINTER_ROLE
        expect(await zars.hasRole(await zars.MINTER_ROLE(), notOwner.address)).to.be.true;

        // confirm owner has 0 balance
        expect(await zars.balanceOf(owner.address)).to.equal(0);

        // mint 1000 ZARS to owner
        const amount = zarToEth("1000");
        await zars.connect(notOwner).mint(owner.address, amount);

        expect(await zars.balanceOf(owner.address)).to.equal(amount);
      })

    });

    describe("Burning", () => {

    });

    describe("Transferring", () => {
      it("Should be able to transfer between 2 accounts that aren't frozen", async () => {
        const { zars, owner, acc1, acc2, acc3 } = await loadFixture(deployZarsWithMintedTokens);

        // confirm acc1 and acc2 aren't frozen
        expect(await zars.isFrozen(acc1.address)).to.be.false;
        expect(await zars.isFrozen(acc2.address)).to.be.false;

        // confirm acc1 has 1000 ZARS
        expect(await zars.balanceOf(acc1.address)).to.equal(zarToEth("1000"));

        // confirm acc2 has 1000 ZARS
        expect(await zars.balanceOf(acc2.address)).to.equal(zarToEth("1000"));

        // transfer 100 ZARS from acc1 to acc2
        await zars.connect(acc1).transfer(acc2.address, zarToEth("100"));

        // confirm acc1 has 900 ZARS
        expect(await zars.balanceOf(acc1.address)).to.equal(zarToEth("900"));

        // confirm acc2 has 1100 ZARS
        expect(await zars.balanceOf(acc2.address)).to.equal(zarToEth("1100"));
      });

      it("Should not be able to transfer between 2 accounts that are frozen", async () => {
        const { zars, owner, govern, acc1, acc2, acc3 } = await loadFixture(deployZarsWithMintedTokens);

        applyGovernRole(zars, owner, govern);

        // confirm acc1 isn't frozen
        expect(await zars.isFrozen(acc1.address)).to.be.false;
        // freeze acc1
        await zars.connect(govern).freeze(acc1.address);
        // confirm acc1 is frozen
        expect(await zars.isFrozen(acc1.address)).to.be.true;

        // confirm acc2 isn't frozen
        expect(await zars.isFrozen(acc2.address)).to.be.false;
        // freeze acc2
        await zars.connect(govern).freeze(acc2.address);
        // confirm acc2 is frozen
        expect(await zars.isFrozen(acc2.address)).to.be.true;

        // confirm acc1 has 1000 ZARS
        expect(await zars.balanceOf(acc1.address)).to.equal(zarToEth("1000"));
        // confirm acc2 has 1000 ZARS
        expect(await zars.balanceOf(acc2.address)).to.equal(zarToEth("1000"));

        // transfer 100 ZARS from acc1 to acc2
        await expect(zars.connect(acc1).transfer(acc2.address, zarToEth("100")))
          .to.be
          .revertedWith("ZARS: Account is frozen");

        await expect(zars.connect(acc2).transfer(acc1.address, zarToEth("100")))
          .to.be
          .revertedWith("ZARS: Account is frozen");

        // confirm acc1 has 1000 ZARS
        expect(await zars.balanceOf(acc1.address)).to.equal(zarToEth("1000"));
        // confirm acc2 has 1000 ZARS
        expect(await zars.balanceOf(acc2.address)).to.equal(zarToEth("1000"));
      });

      it("Evaluate GAS costs for 1000 transactions of differnt sizes between acc1, acc2 and acc3", async () => {
        const { zars, owner, acc1, acc2, acc3 } = await loadFixture(deployZarsWithMintedTokens);

        // confirm acc1 and acc2 aren't frozen
        expect(await zars.isFrozen(acc1.address)).to.be.false;
        expect(await zars.isFrozen(acc2.address)).to.be.false;
        expect(await zars.isFrozen(acc3.address)).to.be.false;
        for (let i = 0; i < 10; i++) {
          const amount = Math.floor(Math.random() * 1000);
          await zars.connect(acc1).transfer(acc2.address, amount);
          await zars.connect(acc2).transfer(acc3.address, amount);
          await zars.connect(acc3).transfer(acc1.address, amount);
        }


      });
    });

    describe("Seizing", () => {

    });

    describe("Withdrawing", () => {

    });

    describe("Freezing", () => {

    });
  });

  describe("Pausing/Unpausing", () => {
    describe("Pausing", () => {

    });

  });
});
