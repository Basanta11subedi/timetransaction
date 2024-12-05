import React from 'react';
import { parseEther } from 'ethers/lib/utils';
import ABI from '../constrants/ABI.json';
import { ethers } from 'ethers';
import { useState } from 'react';

const CreateTransaction = () => {
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    executionTime: '',
    tip: '',
  });
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [initializeContract, setContractInstance] = useState(null);
  const [timeStamp, setTimeStamp] = useState(null);
  const [account, setAccount] = useState(null);

  // const contractAddress = '0xe3Da69444b7F1f9e6910Fbf4fdA654835ACE9762';
  const contractAddress = '0xFD8046c82ac3B1B5A5F45922abE4334970e4aA6b';


  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined')
        reportError('Please install MetaMask');
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      setAccount(accounts[0].toLowerCase());
      // window.location.reload();
    } catch (error) {
      reportError(error);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    console.log('Form data submitted:', formData); // Here you can add code to send formData to a server or handle it as needed.

    // const initializeContract = async () => {

    //   if(window.ethereum){
    //     try{
    //       const provider = new ethers.providers.Web3Provider(window.ethereum);
    //       const signer = provider.getSigner();
    //       const initializeContract = new ethers.Contract(contractAddress, ABI, signer);

    //       setProvider(provider);
    //       setSigner(signer);
    //       setContractInstance(initializeContract);

    //       return true;

    //     }catch (error){
    //       console.error('Error in initializing contract', error);
    //       return false;
    //     }
    //   } else {
    //       console.log("Error in Ethereum");
    //       return false;
    //   }

    // }

    // const createTransaction = async () => {

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const block = await provider.getBlock('latest');
    const signer = provider.getSigner();
    const initializeContract = new ethers.Contract(
      contractAddress,
      ABI,
      signer,
    );
    const currentTimeStamp = block.timestamp;

    setProvider(provider);
    setSigner(signer);
    setContractInstance(initializeContract);
    setTimeStamp(currentTimeStamp);

    // if(!initializeContract()){
    //   throw new Error('Contract initialization failed');

    // } else{
    console.log('contractInstance:', initializeContract);
    console.log('provider:', provider);
    console.log('signer:', signer);
    console.log('timestamp', timeStamp);

    const totalAmount = parseFloat(formData.amount) + parseFloat(formData.tip);
    console.log('totalAmount:', totalAmount.toString());

    const valueInWei = ethers.utils.parseUnits(totalAmount.toString(), 18);
    console.log('valueInWei:', valueInWei.toString());

    const days = timeStamp + parseInt(formData.executionTime) * 24 * 60 * 60;

    if (!initializeContract || !provider || !signer) {
      throw new Error('Contract instance, provider, or signer is not set');
    }

    const createTx = await initializeContract.createTransaction(
      formData.recipient,
      parseEther(formData.amount.toString()),
      days,
      parseEther(formData.tip.toString()),
      { value: valueInWei.toString() },
    );

    await createTx.wait();

    // }
  };

  const handleChange = e => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-200 space-y-6">
      <button
        className="bg-green-500 rounded-2xl px-4 py-2 text-white hover:bg-blue-950 hover:text-white"
        onClick={connectWallet}
      >
        Connect Wallet
      </button>
      <div className="space-y-6">
        {/* Form 1 */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-black p-6 rounded-lg shadow-md w-96"
        >
          <h2 className="text-xl font-bold mb-4">Transaction Form</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Recipient:
            </label>
            <input
              type="text"
              name="recipient"
              value={formData.recipient}
              onChange={handleChange}
              className="mt-1 block w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Amount:
            </label>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="mt-1 block w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Execution Time:
            </label>
            <input
              type="text"
              name="executionTime"
              value={formData.executionTime}
              onChange={handleChange}
              className="mt-1 block w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Tip:</label>
            <input
              type="text"
              name="tip"
              value={formData.tip}
              onChange={handleChange}
              className="mt-1 block w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 rounded-2xl px-4 py-2 text-white hover:bg-blue-950 hover:text-white"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTransaction;
