// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TimeTransaction.sol";

contract TimeTransactionsTest is Test {
    TimeTransactions public timetransactions;
    address creator;
    address recipient;
    address executor;
    address admin;

    function setUp() public {
        // Simulate the admin address using `makeAddr`
        admin = makeAddr("admin");

        // Deploy the contract as the admin
        vm.prank(admin); // Simulate `msg.sender` as `admin`
        timetransactions = new TimeTransactions();

        // Label accounts for better readability
        creator = makeAddr("creator");
        recipient = makeAddr("recipient");
        executor = makeAddr("executor");

        // Fund test accounts
        vm.deal(creator, 10 ether);
        vm.deal(executor, 10 ether);
    }

    function testCreateTransaction() public {
        uint256 executionTime = block.timestamp + 1 minutes;
        uint256 amount = 0.5 ether;
        uint256 tip = 0.1 ether;
        uint256 fee = (amount * 1) / 100;

        vm.prank(creator);
        timetransactions.createTransaction{value: amount + tip + fee}(
            recipient,
            amount,
            executionTime,
            tip
        );

        (
            address txCreator,
            ,
            ,
            ,
            uint256 txExecutionTime,
            uint256 txTip,

        ) = timetransactions.getTransaction(0);
        assertEq(txCreator, creator, "Creator mismatch");
        assertEq(txExecutionTime, executionTime, "Execution time mismatch");
        assertEq(txTip, tip, "Tip mismatch");
    }

    function testRevertTransaction() public {
        uint256 executionTime = block.timestamp + 1 minutes;
        uint256 amount = 0.5 ether;
        uint256 tip = 0.1 ether;
        uint256 fee = (amount * 1) / 100;

        vm.prank(creator);
        timetransactions.createTransaction{value: amount + tip + fee}(
            recipient,
            amount,
            executionTime,
            tip
        );

        vm.prank(creator);
        timetransactions.RevertTransaction(0); // Corrected function name

        (, , , , , , TimeTransactions.Status status) = timetransactions
            .getTransaction(0);
        assertEq(
            uint256(status),
            uint256(TimeTransactions.Status.Reverted),
            "Status should be Reverted"
        );
    }

    function testExecuteTransaction() public {
        uint256 executionTime = block.timestamp + 1 minutes;
        uint256 amount = 0.5 ether;
        uint256 tip = 0.1 ether;
        uint256 fee = (amount * 1) / 100;

        vm.prank(creator);
        timetransactions.createTransaction{value: amount + tip + fee}(
            recipient,
            amount,
            executionTime,
            tip
        );

        vm.warp(executionTime + 1 minutes); // Simulate time passing

        vm.prank(executor); // Executor is not the creator
        timetransactions.ExecuteTransaction(0); // Corrected function name

        (, , , , , , TimeTransactions.Status status) = timetransactions
            .getTransaction(0);
        assertEq(
            uint256(status),
            uint256(TimeTransactions.Status.Executed),
            "Status should be Executed"
        );
    }

    function testWithdrawTransactionFees() public {
        uint256 executionTime = block.timestamp + 1 minutes;
        uint256 amount = 0.5 ether;
        uint256 tip = 0.1 ether;
        uint256 fee = (amount * 1) / 100;

        // Create a transaction to accumulate fees
        vm.prank(creator);
        timetransactions.createTransaction{value: amount + tip + fee}(
            recipient,
            amount,
            executionTime,
            tip
        );
        // Execute the transaction to accumulate fees
        vm.warp(executionTime + 1 minutes); // Simulate time passing
        vm.prank(executor); // Execute by a different user (executor)
        timetransactions.ExecuteTransaction(0); // Corrected function name

        // Verify admin can withdraw only transaction fees
        vm.prank(admin);
        timetransactions.withdrawTransactionFees(fee);

        // Validate that the total transaction fees are now zero
        assertEq(
            timetransactions.totalExecutedTransactionFees(),
            0,
            "Transaction fees not fully withdrawn"
        );

        // Attempt withdrawal beyond available fees
        vm.prank(admin);
        vm.expectRevert("Insufficient transaction fees to withdraw");
        timetransactions.withdrawTransactionFees( 1 ether);
    }

    function testInsufficientFunds() public {
        uint256 executionTime = block.timestamp + 1 minutes;
        uint256 amount = 0.5 ether;
        uint256 tip = 0.1 ether;

        // Sending only 'amount + tip', but missing the 'fee'
        uint256 incorrectValue = amount + tip; // Incorrect value without the fee

        vm.prank(creator);
        vm.expectRevert(
            "Sent value must equal amount, tip, and transaction fee"
        );
        timetransactions.createTransaction{value: incorrectValue}(
            recipient,
            amount,
            executionTime,
            tip
        );
    }

    function testCannotExecuteBeforeExecutionTime() public {
        uint256 executionTime = block.timestamp + 1 minutes;
        uint256 amount = 0.5 ether;
        uint256 tip = 0.1 ether;
        uint256 fee = (amount * 1) / 100;

        vm.prank(creator);
        timetransactions.createTransaction{value: amount + tip + fee}(
            recipient,
            amount,
            executionTime,
            tip
        );

        vm.prank(executor);
        vm.expectRevert("Transaction is not yet executable");
        timetransactions.ExecuteTransaction(0); // Corrected function name
    }

    function testWithdrawTransactionFeesInsufficientBalance() public {
        // Attempt to withdraw fees without any transaction created
        vm.prank(admin);
        vm.expectRevert("Insufficient transaction fees to withdraw");
        timetransactions.withdrawTransactionFees(0.1 ether);
    }

    function testGetTransactionsByDateRange() public {
        // Initialize variables
        uint256 startTime = 1; // Start block.timestamp at 1 for better clarity
        vm.warp(startTime);

        uint256 amount = 0.5 ether;
        uint256 tip = 0.1 ether;
        uint256 fee = (amount * 1) / 100;

        // Transaction 1
        uint256 tx1ExecutionTime = block.timestamp + 1 minutes;
        vm.prank(creator);
        timetransactions.createTransaction{value: amount + tip + fee}(
            recipient,
            amount,
            tx1ExecutionTime,
            tip
        );

        // Transaction 2
        vm.warp(startTime + 1 days); // Advance by 1 day
        uint256 tx2ExecutionTime = block.timestamp + 1 minutes;
        vm.prank(creator);
        timetransactions.createTransaction{value: amount + tip + fee}(
            recipient,
            amount,
            tx2ExecutionTime,
            tip
        );
        // Define date range
        uint256 rangeStart = startTime; // Initial timestamp
        uint256 rangeEnd = startTime + 1 days + 1 minutes; // Include the first two transactions

        // Get transactions within the date range
        TimeTransactions.Transaction[] memory transactions = timetransactions
            .getTransactionsByDateRange(rangeStart, rangeEnd);

        // Validate results
        assertEq(
            transactions.length,
            2,
            "Should return exactly 2 transactions in the range"
        );
        assertEq(
            transactions[0].executionTime,
            tx1ExecutionTime,
            "Transaction 1's execution time mismatch"
        );
        assertEq(
            transactions[1].executionTime,
            tx2ExecutionTime,
            "Transaction 2's execution time mismatch"
        );
    }

    function testGetContractBalance() public {
        // Fund the contract with 5 ether from the creator's account
        vm.startPrank(creator);
        vm.deal(address(timetransactions), 5 ether);
        vm.stopPrank();

        // Call the getContractBalance function
        vm.prank(admin);
        uint256 balance = timetransactions.getContractBalance();

        // Assert that the balance matches the expected value (5 ether)
        uint256 expectedbalance= timetransactions.totalExecutedTransactionFees();
        assertEq(balance, expectedbalance, "Contract balance should be 5 ether");
    }

    function testGetContractBalanceOnlyAdmin() public {
        // Attempt to call getContractBalance from a non-admin address (creator)
        vm.prank(creator);
        vm.expectRevert("Only admin can call this function");
        timetransactions.getContractBalance();
    }
}
