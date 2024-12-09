import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import ABI from '../constrants/ABI.json';
import { Link } from 'react-router-dom';


const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contractAddress = '0xFD8046c82ac3B1B5A5F45922abE4334970e4aA6b';
const contract = new ethers.Contract(contractAddress, ABI, signer);

const TransactionPool = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');


  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const connectedContract = contract.connect(signer);
        const allTransactions = await connectedContract.getAllTransactions();
        const accountAddress = await signer.getAddress();
        setAddress(accountAddress);
        
        setTransactions(
          allTransactions.map(tx => ({
            creator: (tx.creator),
            recipient: (tx.recipient),
            amount: ethers.utils.formatEther(tx.amount),
            createdAt: new Date(tx.createdAt * 1000).toLocaleString(),
            executionTime: new Date(tx.executionTime * 1000).toLocaleString(),
            tip: ethers.utils.formatEther(tx.tip),
            
            status: tx.status,
            transactionFee: ethers.utils.formatEther(tx.amount) * 0.01 // 1% transaction fee
          }))
        );
        console.log(transactions.status);
      
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const handleRevertClick = async transactionId => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const revertTransaction = await contract.RevertTransaction(transactionId);
      await revertTransaction.wait();
    } catch (error) {
      console.error('Error reverting transaction:', error);
    }
  };

  const handleExecuteClick = async transactionId => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const executeTransaction = await contract.ExecuteTransaction(transactionId);
      await executeTransaction.wait();
    } catch (error) {
      console.error('Error executing transaction:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
    <h1 className="text-3xl font-semibold mb-6"><Link to="/createTransaction">Create Transaction</Link></h1>
      <h1 className="text-3xl font-semibold mb-6">Transactions</h1>
      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="px-4 py-2">Index</th>
              <th className="px-4 py-2">Creator</th>
              <th className="px-4 py-2">Recipient</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Transaction Fee</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Execution Time</th>
              <th className="px-4 py-2">Tip</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index} className="border-b hover:bg-gray-100">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{tx.creator}</td>
                <td className="px-4 py-2">{tx.recipient}</td>
                <td className="px-4 py-2">{tx.amount} ETH</td>
                <td className="px-4 py-2">{tx.transactionFee} ETH</td>
                <td className="px-4 py-2">{tx.createdAt}</td>
                <td className="px-4 py-2">{tx.executionTime}</td>
                <td className="px-4 py-2">{tx.tip} ETH</td>
                <td className="px-4 py-2">
                  {tx.status === 0 && ( // Pending
                    <>
                      {tx.creator === address && ( // Creator can revert
                        <button
                          onClick={() => handleRevertClick(index)}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 mr-2"
                        >
                          Revert
                        {console.log(signer._address)}
        
        {console.log("Creator:",creator)}
                          
                        </button>
                      )}
                      {tx.recipient !== address && ( // Execute if not the recipient
                        <button
                          onClick={() => handleExecuteClick(index)}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2"
                        >
                          Execute
                        {console.log(signer._address)}
                        {console.log(tx.recipient)}


                        </button>
                      )}
                      <span className="text-yellow-500">Pending</span>
                    </>
                  )}

                  {tx.status === 1 && ( // Executed
                    <span className="text-green-500">Executed</span>
                  )}

                  {tx.status === 2 && ( // Reverted
                    <span className="text-red-500">Reverted</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionPool;
