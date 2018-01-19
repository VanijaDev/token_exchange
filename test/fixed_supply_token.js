var FixedSupplyToken = artifacts.require("./FixedSupplyToken.sol");

contract('FixedSupplyToken', (accounts) => {
  let tokenInst;
  const ACCOUNT_0 = accounts[0];
  const ACCOUNT_1 = accounts[1];

  before('setup', async() => {
    tokenInst = await FixedSupplyToken.deployed();
  });

  afterEach('reset state', async() => {
    tokenInst = await FixedSupplyToken.new();
  });

  describe('initial values', () => {
    it('ACCOUNT_0 should own all the token supply', async() => {
      let totalSupply = await tokenInst.totalSupply.call();
      let acc0_tokenAmount = await tokenInst.balanceOf.call(ACCOUNT_0);
  
      assert.equal(totalSupply.toNumber(), acc0_tokenAmount.toNumber(), '0 account should own total supply');
    });
  
    it('ACCOUNT_1 should nave no tokens', async() => {
      let amount = await tokenInst.balanceOf.call(ACCOUNT_1);
      assert.equal(amount.toNumber(), 0, 'ACCOUNT_0 should have no tokens');
    });
  });

  describe('token transfers', () => {    
    it('should check token amount after sending between accounts', async() => {
      const SEND_AMOUNT = 111;

      let tx = await tokenInst.transfer(ACCOUNT_1, SEND_AMOUNT, {from: ACCOUNT_0});

      
      //  check for event Transfer(address indexed from, address indexed to, uint256 value); 
      assert.equal(tx.logs.length, 1, 'should be single event')
      let Log_Transfer = tx.logs[0];
      assert.equal(Log_Transfer.event, 'Transfer', 'wrong event name logged');
      assert.equal(Log_Transfer.args._from, ACCOUNT_0, 'wrong "from" parameter');
      assert.equal(Log_Transfer.args._to, ACCOUNT_1, 'wrong "to" parameter');
      assert.equal(Log_Transfer.args._value, SEND_AMOUNT, 'wrong "value" parameter');


      //  check actual balances
      let account0_TokenAmount = await tokenInst.balanceOf(ACCOUNT_0);
      let account1_TokenAmount = await tokenInst.balanceOf(ACCOUNT_1);

      let totalSupply = await tokenInst.totalSupply.call();
      assert.equal(totalSupply - account0_TokenAmount.toNumber(), SEND_AMOUNT, 'wrong token amount for ACCOUNT_0 after transaction');
      assert.equal(account1_TokenAmount.toNumber(), SEND_AMOUNT, 'wrong token amount for ACCOUNT_1 after transaction');
    });
  });
});