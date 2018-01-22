let Exchange = artifacts.require('./Exchange.sol');
let FixedSupplyToken = artifacts.require('./FixedSupplyToken.sol');
let Asserts = require('./helpers/asserts.js');

contract('Exchange', (accounts) => {
  const ACCOUNT_0 = accounts[0];
  const ACCOUNT_1 = accounts[1];
  const asserts = Asserts(assert);

  let exchange;

  before('setup', async() => {
    exchange = await Exchange.deployed();
  });

  afterEach('reset state', async() => {
    exchange = await Exchange.new();
  });

  describe('Ether deposit & withdrawal', () => {
    const ETH_TO_DEPOSIT = web3.toWei(0.05, 'ether');

    describe('depositEther & getEthBalanceInWei', () => {
      it('Eth amount is updated in "balanceEthForAddress" for address', async() => {
        await exchange.depositEther({value: ETH_TO_DEPOSIT});
        assert.equal((await exchange.getEthBalanceInWei.call()).toNumber(), ETH_TO_DEPOSIT, 'wrong Eth amount after deposit');
      });
    });

    describe('withdrawEther & getEthBalanceInWei', () => {
      it('multiple withdrawals', async() => {
        const ETH_TO_WITHDRAW = web3.toWei(0.02, 'ether');

        await exchange.depositEther({value: ETH_TO_DEPOSIT});
        await exchange.withdrawEther(ETH_TO_WITHDRAW);

        let depositAfterWithdrawal = (await exchange.getEthBalanceInWei.call()).toNumber();
        assert.equal(depositAfterWithdrawal, ETH_TO_DEPOSIT - ETH_TO_WITHDRAW, 'wrong deposit after withdrawal');
      });
    });
  });

  describe('token management', () => {

    it('add token', async() => {
      /**
       * function addToken(string symbolName, address erc20TokenAddress) public onlyOwner {
      */
      let token = await FixedSupplyToken.new();
      const tokenSymbol = await token.symbol();

      asserts.doesNotThrow(exchange.addToken(tokenSymbol, token.address), 'token should be added successfully');
      assert.isTrue(await exchange.hasToken(tokenSymbol), 'tokenSymbol should be already present');
      asserts.throws(exchange.addToken(tokenSymbol, token.address), 'should fail - token already present');
      asserts.throws(exchange.addToken('', token.address), 'should fail - empty symbolName');
      asserts.throws(exchange.addToken("tokenSymbol", 0), 'should fail - 0 address');
    });
  });

  describe('deposit token', () => {

    it('deposit token from owner directly', async() => {
      /**
       * function depositToken(string symbolName, uint amount) public {
      */
      let token = await FixedSupplyToken.new();
      const tokenSymbol = await token.symbol();
      const TRANSFER_AMOUNT = 10;

      //  add token
      await exchange.addToken(tokenSymbol, token.address)

      //  allow exchange to deposit ACCOUNT_0 tokens
      token.approve(exchange.address, TRANSFER_AMOUNT);

      //  now, make deposit
      asserts.doesNotThrow(exchange.depositToken(tokenSymbol, TRANSFER_AMOUNT/2), 'should deposit successfully');
      asserts.throws(exchange.depositToken(tokenSymbol, TRANSFER_AMOUNT), 'should fail - not enough token');

      //  fail - no token name
      //  fail - no amount
    });

    it('deposit token from allowed account', async() => {
      /**
       * function depositToken(string symbolName, uint amount) public {
      */
      let token = await FixedSupplyToken.new();
      const tokenSymbol = await token.symbol();
      const TRANSFER_AMOUNT = 10;

      //  add token
      await exchange.addToken(tokenSymbol, token.address)

    });
  });
});