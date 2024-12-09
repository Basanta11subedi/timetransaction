import ABI from '../constrants/ABI.json';
import React, { useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
// import { AppContext } from './EthereumPriceTracker';

const CreateTransaction = () => {
  // const { dollarEth } = useContext(AppContext);

  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    executionTime: '',
    tip: '',
    timeUnit: 'minutes', // Default time unit
    amtCurrency: 'doller',
    tipCurrency: 'doller'
  });

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [initializeContract, setContractInstance] = useState(null);
  const [timeStamp, setTimeStamp] = useState(null);
  const [account, setAccount] = useState(null);
  const contractAddress = '0xFD8046c82ac3B1B5A5F45922abE4334970e4aA6b';

  const [price, setPrice] = useState(null);
    const [previousPrice, setPreviousPrice] = useState(null);
    // const [priceChange, setPriceChange] = useState(0);  
    const [dollarEth, setDollarEth] = useState(null);
    // const [isIncreasing, setIsIncreasing] = useState(null);

  useEffect(() => {
    const socket = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');

    socket.onmessage = (event) => {
      const tradeData = JSON.parse(event.data);
      const currentPrice = parseFloat(tradeData.p);

      setPreviousPrice(price);
      setPrice(currentPrice);
      const oneDollarEth = 1 / currentPrice;
      setDollarEth(oneDollarEth);

      // if (previousPrice !== null) {
      //   const change = ((currentPrice - previousPrice) / previousPrice) * 100;
      //   // setPriceChange(change.toFixed(2));
      //   // setIsIncreasing(change >= 0);
      // }
    };

    // socket.onerror = (error) => {
    //   console.error('WebSocket Error:', error);
    // };

    return () => {
      socket.close();
    };
  }, [price, previousPrice]);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        console.error('Please install MetaMask');
        return;
      }
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      setAccount(accounts[0].toLowerCase());
    } catch (error) {
      console.error(error);
    }
  };

  const calculateExecutionTimeInSeconds = () => {
    const { executionTime, timeUnit } = formData;
    const time = parseInt(executionTime, 10);

    switch (timeUnit) {
      case 'hours':
        return time * 60 * 60; // Convert hours to seconds
      case 'days':
        return time * 24 * 60 * 60; // Convert days to seconds
      case 'minutes':
      default:
        return time * 60; // Convert minutes to seconds
    }
  };

  const calculateAmtCurrent = () => {
    const { amount, amtCurrency } = formData;
    const amountInt = parseInt(amount);

    switch (amtCurrency) {
      case 'eth':
        return ethers.utils.parseUnits(amount.toString(), 18); // Convert hours to seconds
      case 'doller':
        
        const value = ethers.utils.parseUnits((parseFloat(amountInt * dollarEth)).toString(), 18); // Convert days to seconds
        console.log(value.toString());
        return value
      default:
        const value1 = ethers.utils.parseUnits((parseFloat(amountInt * dollarEth)).toString(), 18); // Convert minutes to seconds
        console.log(value1.toString());
        return value1
      }
  };

  const calculateTipCurrent = () => {
    const { tip, tipCurrency } = formData;
    const tipInt = parseInt(tip);

    // const floorToDecimals = (num, decimals) => { const factor = Math.pow(10, decimals); return Math.floor(num * factor) / factor; };

    switch (tipCurrency) {
      case 'eth':
        return ethers.utils.parseUnits(tip.toString(), 18); // Convert hours to seconds
      case 'doller':
        const value = ethers.utils.parseUnits((parseFloat((tipInt * dollarEth).toFixed(18))).toString(), 18); // Convert days to seconds
        console.log( "tip: ",value.toString());
        return value;
      default:
        return ethers.utils.parseUnits((parseFloat(tipInt * dollarEth)).toString(), 18); // Convert minutes to seconds
    }
  };

  const calculateTransactionFee = () => {
    const { amount, amtCurrency } = formData;
    const amountInt = parseFloat(amount);

    switch (amtCurrency) {
      case 'eth':
        console.log("amount int: ", amountInt)
        const ethFee = ethers.utils.parseEther(amountInt.toString()) * 1 / 100;
        console.log("Eth fee",ethFee); // Parse the fee to a BigNumber using ethers
        // const ethValue = ethers.utils.parseUnits(ethFee, 18);
        // console.log(ethValue.toString());
        return ethFee; // Convert hours to seconds
      case 'doller':
        
        // const value = ethers.utils.parseUnits(((parseFloat((amountInt * dollarEth) * 1 / 100))).toString(), 18); // Convert days to seconds
        const dollarFee = (parseFloat(amountInt * dollarEth * 1 / 100)).toFixed(18);
        console.log(dollarFee); // Parse the fee to a BigNumber using ethers
        const dollarValue = ethers.utils.parseUnits(dollarFee, 18);
        
        console.log(dollarValue.toString());
        return dollarValue
      default:
        const value1 = ethers.utils.parseUnits((parseFloat(amountInt * dollarEth)).toString(), 18); // Convert minutes to seconds
        console.log(value1.toString());
        return value1
      }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    const executionTimeInSeconds = calculateExecutionTimeInSeconds();
    const amtCurrent = calculateAmtCurrent();
    const tipCurrent = calculateTipCurrent();
    const transactionFeea = calculateTransactionFee();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const block = await provider.getBlock('latest');
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

    console.log('Form data submitted:', formData);
    console.log('contractInstance:', initializeContract);
    console.log('provider:', provider);
    console.log('signer:', signer);
    console.log('timestamp', currentTimeStamp);
    console.log('Execution Time in Seconds:', executionTimeInSeconds);
    console.log('Amount in Ether:', amtCurrent.toString());
    console.log('Tip in Ether:', tipCurrent.toString());

    // const transactionFee = parseFloat(ethers.utils.parseEther(((parseFloat(formData.amount) * 1) / 100).toString()));

    const totalAmount = parseInt(amtCurrent) + parseInt(tipCurrent) + parseInt(transactionFeea);
    console.log('totalAmount:', totalAmount.toString());
    console.log('Transaction fee:', transactionFeea.toString());

    const days = timeStamp + executionTimeInSeconds;

    if (!initializeContract || !provider || !signer) {
      throw new Error('Contract instance, provider, or signer is not set');
    }

    const createTx = await initializeContract.createTransaction(
      formData.recipient,
      amtCurrent,
      days,
      tipCurrent,
      { value: totalAmount.toString()}
    );

    await createTx.wait();
  };

  const handleChange = (e) => {
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
        <form onSubmit={handleSubmit} className="bg-white border border-black p-6 rounded-lg shadow-md w-96">
          <h2 className="text-xl font-bold mb-4">Transaction Form</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Recipient:</label>
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
            <label className="block text-sm font-medium text-gray-700">Amount:</label>
            <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="mt-1 block border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                required
              />
            <select
              name="amtCurrency"
              value={formData.amtCurrency}
              onChange={handleChange}
              className="mt-1 block border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="eth">Eth</option>
              <option value="doller">Doller</option>
            </select>
            <p className="mt-2">{formData.amtCurrency == 'eth' ? `Doller equivalent: $${formData.amount * price}`: `ETH equivalent: ${formData.amount * dollarEth}`}</p>

          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Tip:</label>
            <input
                type="text"
                name="tip"
                value={formData.tip}
                onChange={handleChange}
                className="mt-1 block border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tip"
                required
              />

            <select
                name="tipCurrency"
                value={formData.tipCurrency}
                onChange={handleChange}
                className="mt-1 block border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="eth">Eth</option>
                <option value="doller">Doller</option>
              </select>
            <p className="mt-2">{formData.tipCurrency == 'eth' ? `Doller equivalent: $${formData.tip * price}`: `ETH equivalent: ${formData.tip * dollarEth}`}</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Execution Time:</label>
            <div className="flex space-x-2">
              <input
                type="text"
                name="executionTime"
                value={formData.executionTime}
                onChange={handleChange}
                className="mt-1 block border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter time"
                required
              />
              <select
                name="timeUnit"
                value={formData.timeUnit}
                onChange={handleChange}
                className="mt-1 block border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
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
