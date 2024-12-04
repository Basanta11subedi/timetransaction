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

    function testInsufficientFunds() public {
        uint256 executionTime = block.timestamp + 1 minutes;
        uint256 amount = 0.5 ether;
        uint256 tip = 0.1 ether;
        
        // Sending only 'amount + tip', but missing the 'fee'
        uint256 incorrectValue = amount + tip; // Incorrect value without the fee

        vm.prank(creator);
        vm.expectRevert("Sent value must match amount, fee and transaction fee together"); // Ensure this matches the error message in the contract
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
        vm.expectRevert("Transaction not yet executable");
        timetransactions.ExecuteTransaction(0);
    }

    function testWithdrawFunds() public {
        uint256 initialContractBalance = 1 ether;

        // Fund the contract
        vm.prank(creator);
        (bool success, ) = address(timetransactions).call{value: initialContractBalance}("");
        require(success, "Funding failed");

        // Verify the contract balance
        assertEq(address(timetransactions).balance, initialContractBalance);

        // Withdraw funds as the admin
        uint256 withdrawAmount = 0.5 ether;

        vm.prank(admin); // Simulate `msg.sender` as `admin`
        timetransactions.withdrawFunds(withdrawAmount);

        // Verify the new contract balance
        assertEq(address(timetransactions).balance, initialContractBalance - withdrawAmount);
    }

    function testWithdrawFundsInsufficientBalance() public {
        // Fund the contract with some Ether
        uint256 initialContractBalance = 0.3 ether;
        vm.prank(creator); // Simulate the creator sending funds
        (bool success, ) = address(timetransactions).call{value: initialContractBalance}("");
        require(success, "Funding failed");

        // Verify the contract balance
        assertEq(address(timetransactions).balance, initialContractBalance, "Contract balance mismatch");

        // Attempt to withdraw more than the contract balance as the admin
        uint256 withdrawAmount = 0.5 ether;

        vm.prank(admin); // Ensure this matches the admin address
        vm.expectRevert("Insufficient balance to withdraw");
        timetransactions.withdrawFunds(withdrawAmount); 
    }
}
