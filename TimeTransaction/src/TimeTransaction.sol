// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract TimeTransactions{


    uint256 public transacctionFee = 0;

    struct Transaction{
        address creator;
        address recipient;
        uint256 amount;
        uint256 createdAt;
        uint256 executionTime;
        uint256 tip;
        Status status;
    }

    enum Status{
        Pending,
        Executed,
        Reverted
    }
    event TransactionCreated(uint256 indexed transactionCount, address creator, address recipient,uint256 amount,uint256 executionTime, uint256 tip);
    event TransactionReverted(uint256 indexed transactionId);
    event TransactionExecuted(uint256 indexed transactionId, address executor);
    event FundsWithdrawn(address admin, uint256 amount);

    mapping(uint256=> Transaction) public transactions;
    uint256 public transactionCount;
    address public admin;

    modifier onlyAdmin{
        require(msg.sender == admin,"Only admin can call this function");
        _;
    }
    constructor(){
        admin= msg.sender;
    }

    function createTransaction(address _recipient, uint256 _amount, uint256 _executionTime, uint256 _tip) external payable{
        require(_recipient != address(0), "Invalid Transaction");
        require(_amount>0,"Amount must be greater than zero");
        require(_executionTime > block.timestamp,"Execution time must be in future");

        uint256 transactionFee= calculateTransactionFee(_amount);

        require(msg.value == _amount + _tip + transactionFee,"Sent value must match amount, fee and transaction fee together");

        transactions[transactionCount]= Transaction({
            creator: msg.sender,
            recipient: _recipient,
            amount: _amount,
            createdAt: block.timestamp,
            executionTime: _executionTime,
            tip: _tip,
            status: Status.Pending

        });
        emit TransactionCreated(transactionCount, msg.sender, _recipient, _amount, _executionTime, _tip);
        transactionCount++;

    }
    function RevertTransaction(uint256 _transactionId) external {
        Transaction storage transaction= transactions[_transactionId];

        require(transaction.creator == msg.sender,"Only creator can Revert the transaction");
        require(transaction.status == Status.Pending,"Transaction not in pending status");
        require(block.timestamp < transaction.executionTime, "Revert time experied");

        transaction.status= Status.Reverted;

        uint256 transactionFee= calculateTransactionFee(transaction.amount);

        payable(msg.sender).transfer(transaction.amount + transaction.tip + transactionFee);

        emit TransactionReverted(_transactionId);
    }

    function ExecuteTransaction(uint256 _transactionId) external{
        Transaction storage transaction= transactions[_transactionId];

        require(transaction.status== Status.Pending,"Transaction Not Pending");
        require(transaction.recipient != msg.sender,"Executor cannot perform this task");
        require(block.timestamp>= transaction.executionTime,"Transaction not yet executable");

        uint256 transactionFee= calculateTransactionFee(transaction.amount);

        transaction.status= Status.Executed;

        payable(transaction.recipient).transfer(transaction.amount);
        
        payable(msg.sender).transfer(transaction.tip + transactionFee);

        emit TransactionExecuted(_transactionId, msg.sender);

    }

    function calculateTransactionFee(uint256 amount) internal pure returns(uint256){
        return (amount*1)/100;
    }

    function withdrawFunds(uint _amount) external onlyAdmin{
        require(_amount<= address(this).balance,"Insufficient balance to withdraw");
        payable(admin).transfer(_amount);

        emit FundsWithdrawn(admin, _amount);

    }

    function getTransaction(uint256 _transactionId) external view returns (
        address creator,
        address recipient,
        uint256 amount,
        uint256 createdAt,
        uint256 executionTime,
        uint256 tip,
        Status status
    ) {
        Transaction storage transaction = transactions[_transactionId];
        return (
            transaction.creator,
            transaction.recipient,
            transaction.amount,
            transaction.createdAt,
            transaction.executionTime,
            transaction.tip,
            transaction.status
        );
    }
    function getAllTransactions() external view returns (Transaction[] memory) {
        Transaction[] memory allTransactions = new Transaction[](transactionCount);
        
        for (uint256 i = 0; i < transactionCount; i++) {
            allTransactions[i] = transactions[i];
        }
        
        return allTransactions;
    }


    receive() external payable {}

    


}