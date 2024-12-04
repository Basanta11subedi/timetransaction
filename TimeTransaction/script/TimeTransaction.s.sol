// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {TimeTransactions} from "../src/TimeTransaction.sol";

contract CounterScript is Script {
    TimeTransactions public timetransaction;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        timetransaction = new TimeTransactions();

        vm.stopBroadcast();
    }
}
