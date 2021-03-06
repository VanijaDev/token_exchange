pragma solidity ^0.4.17;

import "./Owned.sol";
import "./FixedSupplyToken.sol";


contract Exchange is Owned {

    ///////////////////////
    // GENERAL STRUCTURE //
    ///////////////////////
    struct Offer {
        
        uint amount;
        address who;
    }

    struct OrderBook {
        
        uint higherPrice;
        uint lowerPrice;
        
        mapping (uint => Offer) offers;
        
        uint offers_key;
        uint offers_length;
    }

    struct Token {
        
        address tokenContract;

        string symbolName;
        

        mapping (uint => OrderBook) buyBook;
        
        uint curBuyPrice;
        uint lowestBuyPrice;
        uint amountBuyPrices;


        mapping (uint => OrderBook) sellBook;
        uint curSellPrice;
        uint highestSellPrice;
        uint amountSellPrices;

    }


    //we support a max of 255 tokens...
    mapping (uint8 => Token) tokens;
    uint8 symbolNameIndex;

    function Exchange() public {
        
    }

    //////////////
    // BALANCES //
    //////////////
    mapping (address => mapping (uint8 => uint)) tokenBalanceForAddress;

    mapping (address => uint) balanceEthForAddress;




    ////////////
    // EVENTS //
    ////////////




    //////////////////////////////////
    // DEPOSIT AND WITHDRAWAL ETHER //
    //////////////////////////////////
    function depositEther() public payable {
        require(balanceEthForAddress[msg.sender] + msg.value > balanceEthForAddress[msg.sender]);
        balanceEthForAddress[msg.sender] += msg.value;
    }

    function withdrawEther(uint amountInWei) public {
        require(balanceEthForAddress[msg.sender] - amountInWei >= 0);
        require(balanceEthForAddress[msg.sender] - amountInWei <= balanceEthForAddress[msg.sender]);

        balanceEthForAddress[msg.sender] -= amountInWei;
        msg.sender.transfer(amountInWei);
    }

    function getEthBalanceInWei() public constant returns (uint) {
        return balanceEthForAddress[msg.sender];
    }


    //////////////////////
    // TOKEN MANAGEMENT //
    //////////////////////

    function addToken(string symbolName, address erc20TokenAddress) public onlyOwner {
        require(bytes(symbolName).length > 0);
        require(erc20TokenAddress != address(0));
        require(!hasToken(symbolName));

        symbolNameIndex++;
        
        Token storage token = tokens[symbolNameIndex];
        token.tokenContract = erc20TokenAddress; 
        token.symbolName = symbolName;
    }

    function hasToken(string symbolName) public view returns (bool) {
        uint8 index = getSymbolIndex(symbolName);
        
        return (index == 0) ? false : true;
    }


     function getSymbolIndex(string symbolName) view internal returns (uint8) {
        for (uint8 i = 1; i <= symbolNameIndex; i++) {
            if (stringsEqual(tokens[i].symbolName, symbolName)) {
                return i;
            }
        }
        return 0;
    }




    ////////////////////////////////
    // STRING COMPARISON FUNCTION //
    ////////////////////////////////
    function stringsEqual(string storage _a, string memory _b) view internal returns (bool) {
        bytes storage a = bytes(_a);
        bytes memory b = bytes(_b);
        if (a.length != b.length)
            return false;
        // @todo unroll this loop
        for (uint i = 0; i < a.length; i ++) {
            if (a[i] != b[i]) {
                return false; 
            }
            return true;
        }
    }


    //////////////////////////////////
    // DEPOSIT AND WITHDRAWAL TOKEN //
    //////////////////////////////////
    function depositToken(string symbolName, uint amount) public {
        require(amount > 0);

        //  get token index
        uint8 idx = getSymbolIndex(symbolName); 
        require(idx > 0);

        //  get token address
        address tokenAddr = tokens[idx].tokenContract;
        require(tokenAddr != address(0));

        //  create ERC20Interface token instance
        ERC20Interface erc20Token = ERC20Interface(tokenAddr);

        //  transfer token amount from sender to exchange
        require(erc20Token.transferFrom(msg.sender, this, amount) == true);
        
        // //  transfer token in local tokenBalanceForAddress
        // require(tokenBalanceForAddress[msg.sender][idx] + amount > tokenBalanceForAddress[msg.sender][idx]);
        // tokenBalanceForAddress[msg.sender][idx] += amount;
    }

    function withdrawToken(string symbolName, uint amount) public {
        require(amount > 0);

        //  get token index
        uint8 idx = getSymbolIndex(symbolName); 
        require(idx > 0);

        //  get token address
        address tokenAddr = tokens[idx].tokenContract;
        require(tokenAddr != address(0x0));

        //  substract from local tokenBalanceForAddress
        require(tokenBalanceForAddress[msg.sender][idx] - amount >= 0);
        require(tokenBalanceForAddress[msg.sender][idx] - amount < tokenBalanceForAddress[msg.sender][idx]);

        tokenBalanceForAddress[msg.sender][idx] -= amount;

        //  create ERC20Interface token instance and transfer tokens
        ERC20Interface erc20Token = ERC20Interface(tokenAddr);
        erc20Token.transfer(msg.sender, amount);
    }

    function getBalance(string symbolName) public view returns (uint) {
        uint8 idx = getSymbolIndex(symbolName); 
        require(idx > 0);

        return tokenBalanceForAddress[msg.sender][idx];
    }





    /////////////////////////////
    // ORDER BOOK - BID ORDERS //
    /////////////////////////////
    // function getBuyOrderBook(string symbolName) public view returns (uint[], uint[]) {
    // }


    // /////////////////////////////
    // // ORDER BOOK - ASK ORDERS //
    // /////////////////////////////
    // function getSellOrderBook(string symbolName)public view returns (uint[], uint[]) {
    // }



    // ////////////////////////////
    // // NEW ORDER - BID ORDER //
    // ///////////////////////////
    // function buyToken(string symbolName, uint priceInWei, uint amount) public {
    // }





    ////////////////////////////
    // NEW ORDER - ASK ORDER //
    ///////////////////////////
    // function sellToken(string symbolName, uint priceInWei, uint amount) public {
    // }



    // //////////////////////////////
    // // CANCEL LIMIT ORDER LOGIC //
    // //////////////////////////////
    // function cancelOrder(string symbolName, bool isSellOrder, uint priceInWei, uint offerKey) public {
    // }



}