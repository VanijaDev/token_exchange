var FixedSupplyToken = artifacts.require("./FixedSupplyToken.sol");

contract('FixedSupplyToken', (accounts) => {
  let tokenInst;
  const ACCOUNT_0 = accounts[0];
  const ACCOUNT_1 = accounts[1];

  before('setup', async() => {
    tokenInst = await FixedSupplyToken.deployed();
  });

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