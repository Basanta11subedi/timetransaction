import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { ethers } from 'ethers'
import  ABI  from './constrants/ABI.json'
import './App.css'
import { parseEther } from 'ethers/lib/utils'

function App() {
  // const [count, setCount] = useState(0);
  
  const [formData, setFormData] = useState({ recipient: '', amount: '', executionTime: '',  tip: ''});
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [initializeContract, setContractInstance] = useState(null);
  const [timeStamp, setTimeStamp] = useState(null);
  const [account, setAccount] = useState(null);

  const contractAddress = '0xCc181C5Df1e31d8ad8ED621946255C0443e84125';

  
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined')
        reportError('Please install MetaMask');
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      

      setAccount(accounts[0].toLowerCase());
      // window.location.reload();
    } catch (error) {
      reportError(error);
    }
  };

  const handleSubmit = async (e) => { 
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
      const initializeContract = new ethers.Contract(contractAddress, ABI, signer);
      const currentTimeStamp = block.timestamp;
  
      setProvider(provider);
      setSigner(signer);
      setContractInstance(initializeContract);
      setTimeStamp(currentTimeStamp)
  
      // if(!initializeContract()){
      //   throw new Error('Contract initialization failed');
  
      // } else{
        console.log("contractInstance:", initializeContract);
        console.log("provider:", provider);
        console.log("signer:", signer);
        console.log("timestamp", timeStamp);

        const totalAmount = (parseFloat(formData.amount) + parseFloat(formData.tip));
        console.log("totalAmount:", totalAmount.toString())
        
        const valueInWei = (ethers.utils.parseUnits(totalAmount.toString(), 18));
        console.log("valueInWei:", valueInWei.toString());

        const days = timeStamp + parseInt(formData.executionTime) * 24 * 60 * 60;



  
        if (!initializeContract || !provider || !signer) {
          throw new Error('Contract instance, provider, or signer is not set');
        }
  
        const createTx = await initializeContract.createTransaction(
          formData.recipient, 
          parseEther((formData.amount).toString()), 
          days, 
          parseEther(formData.tip.toString()), {value: valueInWei.toString(),});

          await createTx.wait();
  
      // }
    
    
  }

  

  const handleChange = (e) => { 
    const { name, value } = e.target; 
    
       
      
        setFormData({ ...formData, [name]: value 

        });
 
}

  
  
  
  return (
    <div>
      <button onClick={connectWallet}>{account}</button>
      <form onSubmit={handleSubmit}> 
        <div> <label>Recipient:</label> 
        <input type="text" name="recipient" value={formData.recipient} onChange={handleChange} required /> 
        </div> 
        <div> 
          <label>Amount:</label> 
          <input type="text" name="amount" value={formData.amount} onChange={handleChange} required /> 
          </div> 
          <div> 
          <label>ExecutionTime:</label> 
          <input type="text" name="executionTime" value={formData.executionTime} onChange={handleChange} required /> 
          </div> 
          <div>
          <label>Tip:</label> 
          <input type="text" name="tip" value={formData.tip} onChange={handleChange} required /> 
          </div> 
          <button type="submit">Submit</button> 
          </form>
    </div>
  )

  
  

}

export default App