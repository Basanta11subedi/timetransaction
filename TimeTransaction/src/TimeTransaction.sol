// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract TimeTransactions {
    struct Transaction {
        address creator;
        address recipient;
        uint256 amount;
        uint256 createdAt;
        uint256 executionTime;
        uint256 tip;
        Status status;
    }

    enum Status {
        Pending,
        Executed,
        Reverted
    }

    event TransactionCreated(uint256 indexed transactionCount, address creator, address recipient, uint256 amount, uint256 executionTime, uint256 tip);
    event TransactionReverted(uint256 indexed transactionId);
    event TransactionExecuted(uint256 indexed transactionId, address executor);
    event FundsWithdrawn(address admin, uint256 amount);

    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount;
    uint256 public totalTransactionFees; // Tracks the accumulated transaction fees
    address public admin;

    modifier onlyAdmin {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createTransaction(address _recipient, uint256 _amount, uint256 _executionTime, uint256 _tip) external payable {
        require(_recipient != address(0), "Invalid recipient address");
        require(_amount & _tip > 0, "Amount must be greater than zero");
        require(_executionTime > block.timestamp, "Execution time must be in the future");

        uint256 transactionFee = calculateTransactionFee(_amount);

        require(msg.value == _amount + _tip + transactionFee, "Sent value must equal amount, tip, and transaction fee");

        transactions[transactionCount] = Transaction({
            creator: msg.sender,
            recipient: _recipient,
            amount: _amount,
            createdAt: block.timestamp,
            executionTime: _executionTime,
            tip: _tip,
            status: Status.Pending
        });

        totalTransactionFees += transactionFee; // Increment total transaction fees
        emit TransactionCreated(transactionCount, msg.sender, _recipient, _amount, _executionTime, _tip);
        transactionCount++;
    }

    function RevertTransaction(uint256 _transactionId) external {
        Transaction storage transaction = transactions[_transactionId];

        require(transaction.creator == msg.sender, "Only creator can revert the transaction");
        require(transaction.status == Status.Pending, "Transaction is not in a pending status");
        require(block.timestamp < transaction.executionTime, "Revert time has expired");

        transaction.status = Status.Reverted;

        uint256 transactionFee = calculateTransactionFee(transaction.amount);
        totalTransactionFees -= transactionFee; // Reduce the fee from the admin's available balance

        payable(msg.sender).transfer(transaction.amount + transaction.tip + transactionFee);

        emit TransactionReverted(_transactionId);
    }

    function ExecuteTransaction(uint256 _transactionId) external {
        Transaction storage transaction = transactions[_transactionId];

        require(transaction.status == Status.Pending, "Transaction is not pending");
        require(transaction.recipient != msg.sender, "Recipient cannot execute this transaction");
        require(block.timestamp >= transaction.executionTime, "Transaction is not yet executable");

        uint256 transactionFee = calculateTransactionFee(transaction.amount);

        transaction.status = Status.Executed;

        payable(transaction.recipient).transfer(transaction.amount);
        payable(msg.sender).transfer(transaction.tip + transactionFee);

        emit TransactionExecuted(_transactionId, msg.sender);
    }

    function calculateTransactionFee(uint256 amount) internal pure returns (uint256) {
        return (amount * 1) / 100;
    }

    function withdrawTransactionFees(uint256 _amount) external onlyAdmin {
        require(_amount <= totalTransactionFees, "Insufficient transaction fees to withdraw");
        totalTransactionFees -= _amount; // Deduct the withdrawn fees
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
