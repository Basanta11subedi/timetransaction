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

        (address txCreator, , , , uint256 txExecutionTime, uint256 txTip, ) = timetransactions.getTransaction(0);
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
        timetransactions.RevertTransaction(0);

        (, , , , , , TimeTransactions.Status status) = timetransactions.getTransaction(0);
        assertEq(uint256(status), uint256(TimeTransactions.Status.Reverted), "Status should be Reverted");
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
        timetransactions.ExecuteTransaction(0);

        (, , , , , , TimeTransactions.Status status) = timetransactions.getTransaction(0);
        assertEq(uint256(status), uint256(TimeTransactions.Status.Executed), "Status should be Executed");
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

        // Verify admin can withdraw only transaction fees
        vm.prank(admin);
        timetransactions.withdrawTransactionFees(fee);

        // Validate that the total transaction fees are now zero
        assertEq(timetransactions.totalTransactionFees(), 0, "Transaction fees not fully withdrawn");

        // Attempt withdrawal beyond available fees
        vm.prank(admin);
        vm.expectRevert("Insufficient transaction fees to withdraw");
        timetransactions.withdrawTransactionFees(1 ether);
    }

    function testInsufficientFunds() public {
        uint256 executionTime = block.timestamp + 1 minutes;
        uint256 amount = 0.5 ether;
        uint256 tip = 0.1 ether;

        // Sending only 'amount + tip', but missing the 'fee'
        uint256 incorrectValue = amount + tip; // Incorrect value without the fee

        vm.prank(creator);
        vm.expectRevert("Sent value must equal amount, tip, and transaction fee");
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
        timetransactions.ExecuteTransaction(0);
    }

    function testWithdrawTransactionFeesInsufficientBalance() public {
        // Attempt to withdraw fees without any transaction created
        vm.prank(admin);
        vm.expectRevert("Insufficient transaction fees to withdraw");
        timetransactions.withdrawTransactionFees(0.1 ether);
    }
}
