import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";

const zarToEth = (decimal: string) => ethers.utils.parseEther(decimal);
const accessControlMessage = (role: string, account: string) =>
  `AccessControl: account ${account.toLowerCase()} is missing role ${role.toLowerCase()}`;

describe("ZARS", () => {
  async function deployZars() {
    const [owner, notOwner, minter, pauser, burner, governor, acc1, acc2, acc3] = await ethers.getSigners();

    const ZARS = await ethers.getContractFactory("ZARS");
    const zars = await ZARS.deploy();

    return {
      zars,
      owner,
      notOwner,
      minter,
      pauser,
      burner,
      governor,
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

  /**
   * Fixture to 
   *  - deploy ZARS
   *  - apply roles
   *  - mint 1000 ZAR (1e21) tokens to acc1, acc2, acc3
   * 
   * @returns
   * zars: ZARS contract
   * owner: owner of ZARS
   * notOwner: not owner of ZARS
   * minter: minter of ZARS
   * pauser: pauser of ZARS
   * burner: burner of ZARS
   * governor: governor of ZARS
   * acc1: account 1
   * acc2: account 2
   * acc3: account 3
   * 
   */
  async function deployFullZars() {
    const { zars,
      owner,
      notOwner,
      minter,
      pauser,
      burner,
      governor,
      acc1,
      acc2,
      acc3 } = await loadFixture(deployZars);

    await applyMinterRole(zars, owner, minter);
    await applyPauserRole(zars, owner, pauser);
    await applyBurnerRole(zars, owner, burner);
    await applyGovernRole(zars, owner, governor);

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
      governor,
      acc1,
      acc2,
      acc3
    };
  }

  describe("Deployment", () => {
    it("Should be able to deploy", async () => {
      const { zars } = await loadFixture(deployZars);

      expect(await zars.name()).to.equal("ZARS Stablecoin");
      expect(await zars.symbol()).to.equal("ZARS");
    });

    it("Should have granted owner DEFAULT_ADMIN_ROLE to deployer (owner)", async () => {
      const { zars, owner } = await loadFixture(deployZars);

      expect(await zars.hasRole(await zars.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
    });

    it("Should not have granted owner MINTER_ROLE to deployer (owner)", async () => {
      const { zars, owner } = await loadFixture(deployZars);

      expect(await zars.hasRole(await zars.MINTER_ROLE(), owner.address)).to.be.false;
    })

    it("Should not have granted owner PAUSER_ROLE to deployer (owner)", async () => {
      const { zars, owner } = await loadFixture(deployZars);

      expect(await zars.hasRole(await zars.PAUSER_ROLE(), owner.address)).to.be.false;
    });

    it("Should not have granted owner BURNER_ROLE to deployer (owner)", async () => {
      const { zars, owner } = await loadFixture(deployZars);

      expect(await zars.hasRole(await zars.BURNER_ROLE(), owner.address)).to.be.false;
    });

    it("Should not have granted owner GOVERN_ROLE to deployer (owner)", async () => {
      const { zars, owner } = await loadFixture(deployZars);

      expect(await zars.hasRole(await zars.GOVERN_ROLE(), owner.address)).to.be.false;
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
      describe("MINTER_ROLE", () => {
        it("Should be able to `mint` ZARs as MINTER_ROLE", async () => {
          const { zars, owner, minter } = await loadFixture(deployZars);
          // confirm minter doens't have MINTER_ROLE
          expect(await zars.hasRole(await zars.MINTER_ROLE(), minter.address))
            .to
            .be
            .false;

          // grant MINTER_ROLE to minter
          await zars
            .connect(owner)
            .grantRole(await zars.MINTER_ROLE(), minter.address);

          // confirm minter has MINTER_ROLE
          expect(await zars.hasRole(await zars.MINTER_ROLE(), minter.address)).to.be.true;

          // mint 100 ZARs to minter
          await zars
            .connect(minter)
            .mint(minter.address, 100);

          // confirm minter has 100 ZARs
          expect(await zars.balanceOf(minter.address)).to.equal(100);

        });

        it("Shouldn't be able to `mint` ZARs as not MINTER_ROLE", async () => {
          const { zars, minter } = await loadFixture(deployZars);
          // confirm minter doens't have MINTER_ROLE
          expect(await zars.hasRole(await zars.MINTER_ROLE(), minter.address)).to.be.false;

          // mint 100 ZARs to minter
          await expect(zars
            .connect(minter)
            .mint(minter.address, 100))
            .to
            .be
            .revertedWith(accessControlMessage(await zars.MINTER_ROLE(), minter.address));

        });
      });

      describe("BURNER_ROLE", () => {

        it("Should be able to `burn` ZARs as BURNER_ROLE", async () => {
          const { zars, owner, burner } = await loadFixture(deployZars);

          // confirm burner doens't have BURNER_ROLE
          expect(await zars.hasRole(await zars.BURNER_ROLE(), burner.address))
            .to
            .be
            .false;

          // grant BURNER_ROLE to burner
          await zars.connect(owner).grantRole(await zars.BURNER_ROLE(), burner.address);

          // confirm burner has BURNER_ROLE
          expect(await zars.hasRole(await zars.BURNER_ROLE(), burner.address))
            .to
            .be
            .true;

          await zars.connect(owner).grantRole(await zars.MINTER_ROLE(), burner.address);

          // mint 100 ZARs to burner
          await zars.connect(burner).mint(burner.address, 100);

          // confirm burner has 100 ZARs
          expect(await zars.balanceOf(burner.address)).to.equal(100);

          // burn 100 ZARs from burner
          await zars.connect(burner).burn(100);

          // confirm burner has 0 ZARs
          expect(await zars.balanceOf(burner.address)).to.equal(0);
        });

        it("Shouldn't be able to `burn` ZARs as not BURNER_ROLE", async () => {
          const { zars, burner } = await loadFixture(deployZars);

          // confirm burner doens't have BURNER_ROLE
          expect(await zars.hasRole(await zars.BURNER_ROLE(), burner.address))
            .to
            .be
            .false;

          // burn 100 ZARs from burner
          await expect(zars.connect(burner).burn(100))
            .to
            .be
            .revertedWith(accessControlMessage(await zars.BURNER_ROLE(), burner.address));
        });

      });

      describe("GOVERN_ROLE", () => {

        // function freeze(address account)
        it("Should be able to `freeze` an account as GOVERN_ROLE", async () => {
          const { zars, owner, governor, acc1 } = await loadFixture(deployZars);
          // confirm governor doens't have GOVERN_ROLE
          expect(await zars.hasRole(await zars.GOVERN_ROLE(), governor.address))
            .to
            .be
            .false;

          // grant GOVERN_ROLE to governor
          await zars.connect(owner).grantRole(await zars.GOVERN_ROLE(), governor.address);

          // confirm governor has GOVERN_ROLE
          expect(await zars.hasRole(await zars.GOVERN_ROLE(), governor.address)).to.be.true;

          // confirm acc1 is not frozen
          expect(await zars.isFrozen(acc1.address)).to.be.false;

          // freeze acc1
          await zars.connect(governor).freeze(acc1.address);

          // confirm acc1 is frozen
          expect(await zars.isFrozen(acc1.address)).to.be.true;
        });

        it("Shouldn't be able to `freeze` an account as not GOVERN_ROLE", async () => {
          const { zars, governor, acc1 } = await loadFixture(deployZars);
          // confirm governor doens't have GOVERN_ROLE
          expect(await zars.hasRole(await zars.GOVERN_ROLE(), governor.address))
            .to
            .be
            .false;

          // freeze acc1
          await expect(zars.connect(governor).freeze(acc1.address))
            .to
            .be
            .revertedWith(accessControlMessage(await zars.GOVERN_ROLE(), governor.address));
        });

        // function unfreeze(address account)
        it("Should be able to `unfreeze` an account as GOVERN_ROLE", async () => {
          const { zars, owner, governor, acc1 } = await loadFixture(deployZars);
          // confirm governor doens't have GOVERN_ROLE
          expect(await zars.hasRole(await zars.GOVERN_ROLE(), governor.address)).to.be.false;

          // grant GOVERN_ROLE to governor
          await zars.connect(owner).grantRole(await zars.GOVERN_ROLE(), governor.address);

          // confirm governor has GOVERN_ROLE
          expect(await zars.hasRole(await zars.GOVERN_ROLE(), governor.address)).to.be.true;

          // confirm acc1 is not frozen
          expect(await zars.isFrozen(acc1.address)).to.be.false;

          // freeze acc1
          await zars.connect(governor).freeze(acc1.address);

          // confirm acc1 is frozen
          expect(await zars.isFrozen(acc1.address)).to.be.true;

          // unfreeze acc1
          await zars.connect(governor).unfreeze(acc1.address);

          // confirm acc1 is not frozen
          expect(await zars.isFrozen(acc1.address)).to.be.false;
        });

        it("Shouldn't be able to `unfreeze` an account as not GOVERN_ROLE", async () => {
          const { zars, governor, acc1 } = await loadFixture(deployZars);
          // confirm governor doens't have GOVERN_ROLE
          expect(await zars.hasRole(await zars.GOVERN_ROLE(), governor.address)).to.be.false;

          // unfreeze acc1
          await expect(zars.connect(governor).unfreeze(acc1.address))
            .to
            .be
            .revertedWith(accessControlMessage(await zars.GOVERN_ROLE(), governor.address));
        });

        // function seize(address account)
        it("Should be able to `seize` an account as GOVERN_ROLE", async () => {
          const { zars, owner, governor, minter, acc1 } = await loadFixture(deployZars);
          // confirm governor doens't have GOVERN_ROLE
          expect(await zars.hasRole(await zars.GOVERN_ROLE(), governor.address)).to.be.false;
          // grant GOVERN_ROLE to governor
          await zars.connect(owner).grantRole(await zars.GOVERN_ROLE(), governor.address);
          // confirm governor has GOVERN_ROLE
          expect(await zars.hasRole(await zars.GOVERN_ROLE(), governor.address)).to.be.true;

          // grant MINTER_ROLE to minter
          await zars.connect(owner).grantRole(await zars.MINTER_ROLE(), minter.address);

          // mint 100 ZARs to acc1
          await zars.connect(minter).mint(acc1.address, 100);

          // confirm acc1 has 100 ZARs
          expect(await zars.balanceOf(acc1.address)).to.equal(100);

          // confirm zars contract has 0 ZARs
          expect(await zars.balanceOf(zars.address)).to.equal(0);

          // freeze acc1 (acc1 is not frozen)
          await zars.connect(governor).freeze(acc1.address);

          // seize acc1
          await zars.connect(governor).seize(acc1.address);

          // confirm acc1 has 0 ZARs
          expect(await zars.balanceOf(acc1.address)).to.equal(0);

          // confirm zars contract has 100 ZARs
          expect(await zars.balanceOf(zars.address)).to.equal(100);

        });

        it("Shouldn't be able to `seize` an account as not GOVERN_ROLE", async () => {
          const { zars, governor, minter, acc1 } = await loadFixture(deployZars);
          // confirm governor doens't have GOVERN_ROLE
          expect(await zars.hasRole(await zars.GOVERN_ROLE(), governor.address)).to.be.false;

          // seize acc1
          await expect(zars.connect(governor).seize(acc1.address))
            .to
            .be
            .revertedWith(accessControlMessage(await zars.GOVERN_ROLE(), governor.address));
        });


        // function withdraw(uint256 amount)
        it("Should be able to `withdraw` ZARs as GOVERN_ROLE", async () => {
          const { zars, owner, governor, minter, acc1 } = await loadFixture(deployZars);
          // confirm governor doens't have GOVERN_ROLE
          expect(await zars.hasRole(await zars.GOVERN_ROLE(), governor.address)).to.be.false;
          // grant GOVERN_ROLE to governor
          await zars.connect(owner).grantRole(await zars.GOVERN_ROLE(), governor.address);
          // confirm governor has GOVERN_ROLE
          expect(await zars.hasRole(await zars.GOVERN_ROLE(), governor.address)).to.be.true;

          // grant MINTER_ROLE to minter
          await zars.connect(owner).grantRole(await zars.MINTER_ROLE(), minter.address);

          // mint 100 ZARs to acc1
          await zars.connect(minter).mint(acc1.address, 100);

          // confirm acc1 has 100 ZARs
          expect(await zars.balanceOf(acc1.address)).to.equal(100);

          // confirm zars contract has 0 ZARs
          expect(await zars.balanceOf(zars.address)).to.equal(0);

          // freeze acc1 (acc1 is not frozen)
          await zars.connect(governor).freeze(acc1.address);

          // seize acc1
          await zars.connect(governor).seize(acc1.address);

          // confirm acc1 has 0 ZARs
          expect(await zars.balanceOf(acc1.address)).to.equal(0);

          // confirm zars contract has 100 ZARs
          expect(await zars.balanceOf(zars.address)).to.equal(100);

          // withdraw 100 ZARs
          await zars.connect(governor).withdraw(100);

          // confirm acc1 has 0 ZARs
          expect(await zars.balanceOf(acc1.address)).to.equal(0);

          // confirm zars contract has 0 ZARs
          expect(await zars.balanceOf(zars.address)).to.equal(0);

          // confirm governor has 100 ZARs
          expect(await zars.balanceOf(governor.address)).to.equal(100);

        });

        it("Shouldn't be able to `withdraw` ZARs as not GOVERN_ROLE", async () => {
          const { zars, governor, minter, acc1 } = await loadFixture(deployZars);
          // confirm governor doens't have GOVERN_ROLE
          expect(await zars.hasRole(await zars.GOVERN_ROLE(), governor.address)).to.be.false;

          // withdraw 100 ZARs
          await expect(zars.connect(governor).withdraw(100))
            .to
            .be
            .revertedWith(accessControlMessage(await zars.GOVERN_ROLE(), governor.address));
        });
      });

      describe("PAUSER_ROLE", () => {
        // function pause() public onlyRole(PAUSER_ROLE)
        it("Should be able to `pause` as PAUSER_ROLE", async () => {
          const { zars, owner, pauser } = await loadFixture(deployZars);
          // confirm pauser doens't have PAUSER_ROLE
          expect(await zars.hasRole(await zars.PAUSER_ROLE(), pauser.address)).to.be.false;

          // grant PAUSER_ROLE to pauser
          await zars.connect(owner).grantRole(await zars.PAUSER_ROLE(), pauser.address);

          // confirm pauser has PAUSER_ROLE
          expect(await zars.hasRole(await zars.PAUSER_ROLE(), pauser.address)).to.be.true;

          // confirm zars is not paused
          expect(await zars.paused()).to.be.false;

          // pause zars
          await zars.connect(pauser).pause();

          // confirm zars is paused
          expect(await zars.paused()).to.be.true;
        });

        it("Shouldn't be able to `pause` as not PAUSER_ROLE", async () => {
          const { zars, pauser } = await loadFixture(deployZars);
          // confirm pauser doens't have PAUSER_ROLE
          expect(await zars.hasRole(await zars.PAUSER_ROLE(), pauser.address)).to.be.false;

          // confirm zars is not paused
          expect(await zars.paused()).to.be.false;

          // pause zars
          await expect(zars.connect(pauser).pause())
            .to
            .be
            .revertedWith(accessControlMessage(await zars.PAUSER_ROLE(), pauser.address));
        });

        // function unpause() public onlyRole(PAUSER_ROLE)
        it("Should be able to `unpause` as PAUSER_ROLE", async () => {
          const { zars, owner, pauser } = await loadFixture(deployZars);
          // confirm pauser doens't have PAUSER_ROLE
          expect(await zars.hasRole(await zars.PAUSER_ROLE(), pauser.address)).to.be.false;

          // grant PAUSER_ROLE to pauser
          await zars.connect(owner).grantRole(await zars.PAUSER_ROLE(), pauser.address);

          // confirm pauser has PAUSER_ROLE
          expect(await zars.hasRole(await zars.PAUSER_ROLE(), pauser.address)).to.be.true;

          // confirm zars is not paused
          expect(await zars.paused()).to.be.false;

          // pause zars
          await zars.connect(pauser).pause();

          // confirm zars is paused
          expect(await zars.paused()).to.be.true;

          // unpause zars
          await zars.connect(pauser).unpause();

          // confirm zars is not paused
          expect(await zars.paused()).to.be.false;
        });

        it("Shouldn't be able to `unpause` as not PAUSER_ROLE", async () => {
          const { zars, pauser } = await loadFixture(deployZars);
          // confirm pauser doens't have PAUSER_ROLE
          expect(await zars.hasRole(await zars.PAUSER_ROLE(), pauser.address)).to.be.false;

          // confirm zars is not paused
          expect(await zars.paused()).to.be.false;

          // unpause zars
          await expect(zars.connect(pauser).unpause())
            .to
            .be
            .revertedWith(accessControlMessage(await zars.PAUSER_ROLE(), pauser.address));
        });
      });
    });
  });

  describe.only("Government", () => {
    describe("Freezing ", () => {
      it("Should be able to transfer between 2 accounts that aren't frozen", async () => {
        const { zars, acc1, acc2 } = await loadFixture(deployFullZars);

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

      it("Should not be able to transfer if source account is frozen", async () => {
        const { zars, governor, acc1, acc2 } = await loadFixture(deployFullZars);

        const src = acc1;
        const dst = acc2;

        // confirm src and dst aren't frozen
        expect(await zars.isFrozen(src.address)).to.be.false;
        expect(await zars.isFrozen(dst.address)).to.be.false;

        // confirm src has 1000 ZARS
        expect(await zars.balanceOf(src.address)).to.equal(zarToEth("1000"));

        // confirm dst has 1000 ZARS
        expect(await zars.balanceOf(dst.address)).to.equal(zarToEth("1000"));

        // freeze src
        await zars.connect(governor).freeze(src.address);

        // confirm src is frozen
        expect(await zars.isFrozen(src.address)).to.be.true;

        // confirm dst is not frozen
        expect(await zars.isFrozen(dst.address)).to.be.false;

        // confirm src has 1000 ZARS
        expect(await zars.balanceOf(src.address)).to.equal(zarToEth("1000"));

        // confirm dst has 1000 ZARS
        expect(await zars.balanceOf(dst.address)).to.equal(zarToEth("1000"));

        // transfer 100 ZARS from src to dst
        await expect(zars.connect(src).transfer(dst.address, zarToEth("100")))
          .to
          .be
          .revertedWith("ZARS: Account is frozen");

        // confirm src has 1000 ZARS
        expect(await zars.balanceOf(src.address)).to.equal(zarToEth("1000"));

        // confirm dst has 1000 ZARS
        expect(await zars.balanceOf(dst.address)).to.equal(zarToEth("1000"));
      });

      it("Should not be able to transfer if destination account is frozen", async () => {
        const { zars, governor, acc1, acc2 } = await loadFixture(deployFullZars);

        const src = acc1;
        const dst = acc2;

        // confirm src and dst aren't frozen
        expect(await zars.isFrozen(src.address)).to.be.false;
        expect(await zars.isFrozen(dst.address)).to.be.false;

        // confirm src has 1000 ZARS
        expect(await zars.balanceOf(src.address)).to.equal(zarToEth("1000"));

        // confirm dst has 1000 ZARS
        expect(await zars.balanceOf(dst.address)).to.equal(zarToEth("1000"));

        // freeze dst
        await zars.connect(governor).freeze(dst.address);

        // confirm src is not frozen
        expect(await zars.isFrozen(src.address)).to.be.false;

        // confirm dst is frozen
        expect(await zars.isFrozen(dst.address)).to.be.true;

        // confirm src has 1000 ZARS
        expect(await zars.balanceOf(src.address)).to.equal(zarToEth("1000"));

        // confirm dst has 1000 ZARS
        expect(await zars.balanceOf(dst.address)).to.equal(zarToEth("1000"));

        // transfer 100 ZARS from src to dst
        await expect(zars.connect(src).transfer(dst.address, zarToEth("100")))
          .to
          .be
          .revertedWith("ZARS: Account is frozen");

        // confirm src has 1000 ZARS
        expect(await zars.balanceOf(src.address)).to.equal(zarToEth("1000"));

        // confirm dst has 1000 ZARS
        expect(await zars.balanceOf(dst.address)).to.equal(zarToEth("1000"));
      });

      it("Should not be able to transfer if both source and destination accounts are frozen", async () => {
        const { zars, governor, acc1, acc2 } = await loadFixture(deployFullZars);

        const src = acc1;
        const dst = acc2;

        // confirm src and dst aren't frozen
        expect(await zars.isFrozen(src.address)).to.be.false;
        expect(await zars.isFrozen(dst.address)).to.be.false;

        // confirm src has 1000 ZARS
        expect(await zars.balanceOf(src.address)).to.equal(zarToEth("1000"));

        // confirm dst has 1000 ZARS
        expect(await zars.balanceOf(dst.address)).to.equal(zarToEth("1000"));

        // freeze src
        await zars.connect(governor).freeze(src.address);

        // freeze dst
        await zars.connect(governor).freeze(dst.address);

        // confirm src is frozen
        expect(await zars.isFrozen(src.address)).to.be.true;

        // confirm dst is frozen
        expect(await zars.isFrozen(dst.address)).to.be.true;

        // confirm src has 1000 ZARS
        expect(await zars.balanceOf(src.address)).to.equal(zarToEth("1000"));

        // confirm dst has 1000 ZARS
        expect(await zars.balanceOf(dst.address)).to.equal(zarToEth("1000"));

        // transfer 100 ZARS from src to dst
        await expect(zars.connect(src).transfer(dst.address, zarToEth("100")))
          .to
          .be
          .revertedWith("ZARS: Account is frozen");

        // confirm src has 1000 ZARS
        expect(await zars.balanceOf(src.address)).to.equal(zarToEth("1000"));

        // confirm dst has 1000 ZARS
        expect(await zars.balanceOf(dst.address)).to.equal(zarToEth("1000"));
      });

      it("Should not be able to freeze an account if it is already frozen", async () => {
        const { zars, governor, acc1 } = await loadFixture(deployFullZars);

        // confirm acc1 isn't frozen
        expect(await zars.isFrozen(acc1.address)).to.be.false;

        // freeze acc1
        await zars.connect(governor).freeze(acc1.address);

        // confirm acc1 is frozen
        expect(await zars.isFrozen(acc1.address)).to.be.true;

        // freeze acc1 again
        await expect(zars.connect(governor).freeze(acc1.address))
          .to
          .be
          .revertedWith("ZARS: Account is frozen");

        // confirm acc1 is still frozen
        expect(await zars.isFrozen(acc1.address)).to.be.true;
      });

      it("Should not be able to unfreeze an account if it is not frozen", async () => {
        const { zars, governor, acc1 } = await loadFixture(deployFullZars);

        // confirm acc1 isn't frozen
        expect(await zars.isFrozen(acc1.address)).to.be.false;

        // unfreeze acc1
        await expect(zars.connect(governor).unfreeze(acc1.address))
          .to
          .be
          .revertedWith("ZARS: Account is not frozen");

        // confirm acc1 is still not frozen
        expect(await zars.isFrozen(acc1.address)).to.be.false;
      });

      it("Should not be able to mint to a frozen account", async () => {
        const { zars, governor, minter, acc1 } = await loadFixture(deployFullZars);

        // confirm acc1 isn't frozen
        expect(await zars.isFrozen(acc1.address)).to.be.false;

        // freeze acc1
        await zars.connect(governor).freeze(acc1.address);

        // confirm acc1 is frozen
        expect(await zars.isFrozen(acc1.address)).to.be.true;

        // confirm acc1 has 1000 ZARS
        expect(await zars.balanceOf(acc1.address)).to.equal(zarToEth("1000"));

        // mint 100 ZARS to acc1
        await expect(zars.connect(minter).mint(acc1.address, zarToEth("100")))
          .to
          .be
          .revertedWith("ZARS: Account is frozen");

        // confirm acc1 still has 1000 ZARS
        expect(await zars.balanceOf(acc1.address)).to.equal(zarToEth("1000"));
      });

      it("Should not be able to transfer to a frozen account using multiTransfer", async () => {
        const { zars, governor, acc1, acc2, acc3 } = await loadFixture(deployFullZars);

        const src = acc1;
        const dst = acc2;

        // confirm src and dst aren't frozen
        expect(await zars.isFrozen(src.address)).to.be.false;
        expect(await zars.isFrozen(dst.address)).to.be.false;

        // confirm src has 1000 ZARS
        expect(await zars.balanceOf(src.address)).to.equal(zarToEth("1000"));

        // confirm dst has 1000 ZARS
        expect(await zars.balanceOf(dst.address)).to.equal(zarToEth("1000"));

        // freeze dst
        await zars.connect(governor).freeze(dst.address);

        // confirm src is not frozen
        expect(await zars.isFrozen(src.address)).to.be.false;

        // confirm dst is frozen
        expect(await zars.isFrozen(dst.address)).to.be.true;

        // confirm src has 1000 ZARS
        expect(await zars.balanceOf(src.address)).to.equal(zarToEth("1000"));

        // confirm dst has 1000 ZARS
        expect(await zars.balanceOf(dst.address)).to.equal(zarToEth("1000"));

        // transfer 100 ZARS from src to dst
        await expect(zars.connect(src)
          .multiTransfer([acc1.address, dst.address], [zarToEth("100"), zarToEth("100")]))
          .to
          .be
          .revertedWith("ZARS: Account is frozen");

        // confirm src has 1000 ZARS
        expect(await zars.balanceOf(src.address)).to.equal(zarToEth("1000"));

        // confirm dst has 1000 ZARS
        expect(await zars.balanceOf(dst.address)).to.equal(zarToEth("1000"));
      });

      it("Should not be able to transfer from a frozen account using multiTransferFrom", async () => {
        const { zars, governor, acc1, acc2, acc3 } = await loadFixture(deployFullZars);

        const src = acc1;
        const dst = acc2;

        // confirm src and dst aren't frozen
        expect(await zars.isFrozen(src.address)).to.be.false;
        expect(await zars.isFrozen(dst.address)).to.be.false;

        // confirm src has 1000 ZARS
        expect(await zars.balanceOf(src.address)).to.equal(zarToEth("1000"));

        // confirm dst has 1000 ZARS
        expect(await zars.balanceOf(dst.address)).to.equal(zarToEth("1000"));

        // freeze src
        await zars.connect(governor).freeze(src.address);

        // confirm src is frozen
        expect(await zars.isFrozen(src.address)).to.be.true;

        // confirm dst is not frozen
        expect(await zars.isFrozen(dst.address)).to.be.false;

        // confirm src has 1000 ZARS
        expect(await zars.balanceOf(src.address)).to.equal(zarToEth("1000"));

        // confirm dst has 1000 ZARS
        expect(await zars.balanceOf(dst.address)).to.equal(zarToEth("1000"));

        // transfer 100 ZARS from src to dst
        await expect(zars.connect(src)
          .multiTransfer([acc1.address, dst.address], [zarToEth("100"), zarToEth("100")]))
          .to
          .be
          .revertedWith("ZARS: Account is frozen");

        // confirm src has 1000 ZARS
        expect(await zars.balanceOf(src.address)).to.equal(zarToEth("1000"));

        // confirm dst has 1000 ZARS
        expect(await zars.balanceOf(dst.address)).to.equal(zarToEth("1000"));
      });

    });

    describe("Seizing", () => {

    });

    describe("Withdrawing", () => {

    });
  });

  describe("Transacting", () => {
    describe("Multitransfer", () => {
      //race conditions if the same account is used in src and dst
    });

  });

  describe("Pausing/Unpausing", () => {
    describe("Methods when paused", () => {

    });


    describe("Methods when unpaused", () => {

    });

  });

  describe("GAS Usage", () => {

    it("Evaluate GAS costs for 10 transactions of different sizes between acc1, acc2 and acc3", async () => {
      const { zars, owner, acc1, acc2, acc3 } = await loadFixture(deployFullZars);

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

    it("Evaluate GAs cost for 10 multi transactions of different sizes between acc1, acc2 and acc3", async () => {
      const { zars, owner, acc1, acc2, acc3 } = await loadFixture(deployFullZars);

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
});
