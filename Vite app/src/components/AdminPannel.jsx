import React, { useState } from "react";
import { ethers } from "ethers";

const AdminPannel = () => {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [status, setStatus] = useState("");

  const handleWithdraw = async () => {
    if (!ethers.utils.isAddress(withdrawAddress)) {
      setStatus("Invalid Ethereum address.");
      return;
    }

    try {
      // Connect to Ethereum wallet
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      // Withdraw funds
      const tx = await signer.sendTransaction({
        to: withdrawAddress,
        value: ethers.utils.parseEther(withdrawAmount),
      });

      setStatus(`Transaction sent: ${tx.hash}`);
      await tx.wait();
      setStatus("Transaction confirmed!");
    } catch (error) {
      console.error(error);
      setStatus("Transaction failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-xl font-bold mb-4 text-center">Admin ETH Withdraw</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            value={withdrawAddress}
            onChange={(e) => setWithdrawAddress(e.target.value)}
            placeholder="0x..."
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (ETH)
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>
        <button
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          onClick={handleWithdraw}
        >
          Withdraw ETH
        </button>
        {status && <p className="mt-4 text-sm text-center text-gray-600">{status}</p>}
      </div>
    </div>
  );
};

export default AdminPannel;
