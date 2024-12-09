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
        uint256 transactionFee; // Added to track fee per transaction
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
    uint256 public totalExecutedTransactionFees; // Tracks fees from executed transactions
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
        require(_amount + _tip > 0, "Amount and tip must be greater than zero");
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
            status: Status.Pending,
            transactionFee: transactionFee // Store the transaction fee
        });

        transactionCount++;
        emit TransactionCreated(transactionCount - 1, msg.sender, _recipient, _amount, _executionTime, _tip);
    }

    function RevertTransaction(uint256 _transactionId) external {
        Transaction storage transaction = transactions[_transactionId];

        require(transaction.creator == msg.sender, "Only creator can revert the transaction");
        require(transaction.status == Status.Pending, "Transaction is not pending");
        require(block.timestamp < transaction.executionTime, "Revert time has expired");

        transaction.status = Status.Reverted;

        // Refund the full transaction (including fee)
        payable(msg.sender).transfer(transaction.amount + transaction.tip + transaction.transactionFee);

        emit TransactionReverted(_transactionId);
    }

    function ExecuteTransaction(uint256 _transactionId) external {
        Transaction storage transaction = transactions[_transactionId];

        require(transaction.status == Status.Pending, "Transaction is not pending");
        require(transaction.recipient != msg.sender, "Recipient cannot execute this transaction");
        require(block.timestamp >= transaction.executionTime, "Transaction is not yet executable");

        transaction.status = Status.Executed;

        // Transfer the amount to the recipient and tip to the executor
        payable(transaction.recipient).transfer(transaction.amount);
        payable(msg.sender).transfer(transaction.tip);

        // Accumulate executed transaction fee for withdrawal
        totalExecutedTransactionFees += transaction.transactionFee;

        emit TransactionExecuted(_transactionId, msg.sender);
    }

    function calculateTransactionFee(uint256 amount) internal pure returns (uint256) {
        return (amount * 1) / 100; // 1% fee
    }

    // Admin can only withdraw the total fees from executed transactions
    function withdrawTransactionFees(uint256 _amount) external onlyAdmin {
        require(_amount <= totalExecutedTransactionFees, "Insufficient transaction fees to withdraw");
        totalExecutedTransactionFees -= _amount; // Deduct the withdrawn fees
        payable(admin).transfer(_amount);

        emit FundsWithdrawn(admin, _amount);
    }

    // Admin can view the contract's balance
    function getContractBalance() external view onlyAdmin returns (uint256) {
        return totalExecutedTransactionFees; // Return only the fees from executed transactions
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

    function getTransactionsByDateRange(uint256 startTimestamp, uint256 endTimestamp) public view returns (Transaction[] memory) {
        bool returnAll = (startTimestamp == 0 && endTimestamp == 0);

        uint256 count = 0;
        for (uint256 i = 0; i < transactionCount; i++) {
            if (returnAll || (transactions[i].createdAt >= startTimestamp && transactions[i].createdAt <= endTimestamp)) {
                count++;
            }
        }

        Transaction[] memory result = new Transaction[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < transactionCount; i++) {
            if (returnAll || (transactions[i].createdAt >= startTimestamp && transactions[i].createdAt <= endTimestamp)) {
                result[index] = transactions[i];
                index++;
            }
        }

        return result;
    }

    receive() external payable {}
}
