import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";

const weiToEth = (wei: string) => ethers.utils.formatEther(wei);
const zarToEth = (decimal: string) => ethers.utils.parseEther(decimal);

const accessControlMessage = (role: string, account: string) =>
  `AccessControl: account ${account.toLowerCase()} is missing role ${role.toLowerCase()}`;

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

      it("Should be able to grant BURNER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { zars, owner, notOwner } = await loadFixture(deployZars);
        expect(await zars.hasRole(await zars.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm notOwner doens't have BURNER_ROLE
        expect(await zars.hasRole(await zars.BURNER_ROLE(), notOwner.address)).to.be.false;

        // grant BURNER_ROLE to notOwner
        await zars.grantRole(await zars.BURNER_ROLE(), notOwner.address);

        // confirm notOwner has BURNER_ROLE
        expect(await zars.hasRole(await zars.BURNER_ROLE(), notOwner.address)).to.be.true;
      });

      it("Should be able to grant GOVERN_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { zars, owner, notOwner } = await loadFixture(deployZars);
        expect(await zars.hasRole(await zars.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm notOwner doens't have GOVERN_ROLE
        expect(await zars.hasRole(await zars.GOVERN_ROLE(), notOwner.address)).to.be.false;

        // grant GOVERN_ROLE to notOwner
        await zars.grantRole(await zars.GOVERN_ROLE(), notOwner.address);

        // confirm notOwner has GOVERN_ROLE
        expect(await zars.hasRole(await zars.GOVERN_ROLE(), notOwner.address)).to.be.true;
      });

      it("Should be able to grant PAUSER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { zars, owner, notOwner } = await loadFixture(deployZars);
        expect(await zars.hasRole(await zars.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm notOwner doens't have PAUSER_ROLE
        expect(await zars.hasRole(await zars.PAUSER_ROLE(), notOwner.address)).to.be.false;

        // grant PAUSER_ROLE to notOwner
        await zars.grantRole(await zars.PAUSER_ROLE(), notOwner.address);

        // confirm notOwner has PAUSER_ROLE
        expect(await zars.hasRole(await zars.PAUSER_ROLE(), notOwner.address)).to.be.true;
      });

    });

    describe("Revoking", () => {
      it("Should be able to revoke MINTER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { zars, owner, notOwner } = await loadFixture(deployZars);
        expect(await zars.hasRole(await zars.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm notOwner doens't have MINTER_ROLE
        expect(await zars.hasRole(await zars.MINTER_ROLE(), notOwner.address)).to.be.false;

        // grant MINTER_ROLE to notOwner
        await zars.grantRole(await zars.MINTER_ROLE(), notOwner.address);

        // confirm notOwner has MINTER_ROLE
        expect(await zars.hasRole(await zars.MINTER_ROLE(), notOwner.address)).to.be.true;

        // revoke MINTER_ROLE from notOwner
        await zars.revokeRole(await zars.MINTER_ROLE(), notOwner.address);

        // confirm notOwner doesn't have MINTER_ROLE
        expect(await zars.hasRole(await zars.MINTER_ROLE(), notOwner.address)).to.be.false;
      });

      it("Should be able to revoke BURNER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { zars, owner, notOwner } = await loadFixture(deployZars);
        expect(await zars.hasRole(await zars.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm notOwner doens't have BURNER_ROLE
        expect(await zars.hasRole(await zars.BURNER_ROLE(), notOwner.address)).to.be.false;

        // grant BURNER_ROLE to notOwner
        await zars.grantRole(await zars.BURNER_ROLE(), notOwner.address);

        // confirm notOwner has BURNER_ROLE
        expect(await zars.hasRole(await zars.BURNER_ROLE(), notOwner.address)).to.be.true;

        // revoke BURNER_ROLE from notOwner
        await zars.revokeRole(await zars.BURNER_ROLE(), notOwner.address);

        // confirm notOwner doesn't have BURNER_ROLE
        expect(await zars.hasRole(await zars.BURNER_ROLE(), notOwner.address)).to.be.false;
      });

      it("Should be able to revoke GOVERN_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { zars, owner, notOwner } = await loadFixture(deployZars);
        expect(await zars.hasRole(await zars.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm notOwner doens't have GOVERN_ROLE
        expect(await zars.hasRole(await zars.GOVERN_ROLE(), notOwner.address)).to.be.false;

        // grant GOVERN_ROLE to notOwner
        await zars.grantRole(await zars.GOVERN_ROLE(), notOwner.address);

        // confirm notOwner has GOVERN_ROLE
        expect(await zars.hasRole(await zars.GOVERN_ROLE(), notOwner.address)).to.be.true;

        // revoke GOVERN_ROLE from notOwner
        await zars.revokeRole(await zars.GOVERN_ROLE(), notOwner.address);

        // confirm notOwner doesn't have GOVERN_ROLE
        expect(await zars.hasRole(await zars.GOVERN_ROLE(), notOwner.address)).to.be.false;
      });

      it("Should be able to revoke PAUSER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { zars, owner, notOwner } = await loadFixture(deployZars);
        expect(await zars.hasRole(await zars.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm notOwner doens't have PAUSER_ROLE
        expect(await zars.hasRole(await zars.PAUSER_ROLE(), notOwner.address)).to.be.false;

        // grant PAUSER_ROLE to notOwner
        await zars.grantRole(await zars.PAUSER_ROLE(), notOwner.address);

        // confirm notOwner has PAUSER_ROLE
        expect(await zars.hasRole(await zars.PAUSER_ROLE(), notOwner.address)).to.be.true;

        // revoke PAUSER_ROLE from notOwner
        await zars.revokeRole(await zars.PAUSER_ROLE(), notOwner.address);

        // confirm notOwner doesn't have PAUSER_ROLE
        expect(await zars.hasRole(await zars.PAUSER_ROLE(), notOwner.address)).to.be.false;
      });


    });

    describe("Methods", () => {
      it("Should be able to mint ZARs as MINTER_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { zars, owner, minter } = await loadFixture(deployZars);
        expect(await zars.hasRole(await zars.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm minter doens't have MINTER_ROLE
        expect(await zars.hasRole(await zars.MINTER_ROLE(), minter.address)).to.be.false;

        // grant MINTER_ROLE to minter
        await zars.grantRole(await zars.MINTER_ROLE(), minter.address);

        // confirm minter has MINTER_ROLE
        expect(await zars.hasRole(await zars.MINTER_ROLE(), minter.address)).to.be.true;

        // mint 100 ZARs to minter
        await zars.connect(minter).mint(minter.address, 100);

        // confirm minter has 100 ZARs
        expect(await zars.balanceOf(minter.address)).to.equal(100);

      });

      it("Should be able to `burn` ZARs as BURNER_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { zars, owner, burner } = await loadFixture(deployZars);
        expect(await zars.hasRole(await zars.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm burner doens't have BURNER_ROLE
        expect(await zars.hasRole(await zars.BURNER_ROLE(), burner.address)).to.be.false;

        // grant BURNER_ROLE to burner
        await zars.grantRole(await zars.BURNER_ROLE(), burner.address);

        // confirm burner has BURNER_ROLE
        expect(await zars.hasRole(await zars.BURNER_ROLE(), burner.address)).to.be.true;

        await zars.grantRole(await zars.MINTER_ROLE(), burner.address);

        // mint 100 ZARs to burner
        await zars.connect(burner).mint(burner.address, 100);

        // confirm burner has 100 ZARs
        expect(await zars.balanceOf(burner.address)).to.equal(100);

        // burn 100 ZARs from burner
        await zars.connect(burner).burn(100);

        // confirm burner has 0 ZARs
        expect(await zars.balanceOf(burner.address)).to.equal(0);
      });

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

      it("Shouldn't be able to mint with only DEFAULT_ADMIN_ROLE", async () => {
        const { zars, owner } = await loadFixture(deployZars);

        // confirm owner has DEFAULT_ADMIN_ROLE
        expect(await zars.hasRole(await zars.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm owner has 0 balance
        expect(await zars.balanceOf(owner.address)).to.equal(0);

        // mint 1000 ZARS to owner
        const amount = zarToEth("1000");
        await expect(zars.connect(owner).mint(owner.address, amount))
          .to.be
          .revertedWith(accessControlMessage(await zars.MINTER_ROLE(), owner.address));

        expect(await zars.balanceOf(owner.address)).to.equal(0);
      });

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

      it("Evaluate GAS costs for 10 transactions of differnt sizes between acc1, acc2 and acc3", async () => {
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

      it("Evaluate GAs cost for 10 multi transactions of differnt sizes between acc1, acc2 and acc3", async () => {
        const { zars, owner, acc1, acc2, acc3 } = await loadFixture(deployZarsWithMintedTokens);

        // confirm acc1 and acc2 aren't frozen
        expect(await zars.isFrozen(acc1.address)).to.be.false;
        expect(await zars.isFrozen(acc2.address)).to.be.false;
        expect(await zars.isFrozen(acc3.address)).to.be.false;


        let acc2Total = zarToEth("1000");
        let acc3Total = zarToEth("1000");
        for (let i = 0; i < 10; i++) {
          const acc2Amount = Math.floor(Math.random() * 10);
          const acc3Amount = Math.floor(Math.random() * 10);

          acc2Total = acc2Total.add(acc2Amount);
          acc3Total = acc3Total.add(acc3Amount);


          await zars.connect(acc1).multiTransfer(
            [acc2.address, acc3.address],
            [acc2Amount, acc3Amount]
          );
        }

        expect(await zars.balanceOf(acc2.address)).to.equal(acc2Total);
        expect(await zars.balanceOf(acc3.address)).to.equal(acc3Total);

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
