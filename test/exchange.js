var Exchange = artifacts.require("./Exchange.sol");

contract('Exchange', (accounts) => {
  const ACCOUNT_0 = accounts[0];
  const ACCOUNT_1 = accounts[1];

  let exchange;

  before('setup', async() => {
    exchange = await Exchange.deployed();
  });

  afterEach('reset state', async() => {
    exchange = await Exchange.new();
  });

  describe('methods, which work with Ether', () => {
    const ETH_TO_DEPOSIT = web3.toWei(5, 'ether');

    describe('depositEther & getEthBalanceInWei', () => {
      it('Eth amount is updated in "balanceEthForAddress" for address', async() => {
        await exchange.depositEther({value: ETH_TO_DEPOSIT});
        assert.equal((await exchange.getEthBalanceInWei.call()).toNumber(), ETH_TO_DEPOSIT, 'wrong Eth amount after deposit');
      });
    });

    describe('withdrawEther & getEthBalanceInWei', () => {
      it('multiple withdrawals', async() => {
        const ETH_TO_WITHDRAW = web3.toWei(2, 'ether');

        await exchange.depositEther({value: ETH_TO_DEPOSIT});
        await exchange.withdrawEther(ETH_TO_WITHDRAW);

        let depositAfterWithdrawal = (await exchange.getEthBalanceInWei.call()).toNumber();
        assert.equal(depositAfterWithdrawal, ETH_TO_DEPOSIT - ETH_TO_WITHDRAW, 'wrong deposit after withdrawal');
      });
    });
  });
});