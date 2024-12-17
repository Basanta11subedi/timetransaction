import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import TransactionPool from './components/TransactionPool';
import CreateTransaction from './components/CreateTransaction';
// import EthereumPriceTracker from './components/EthereumPriceTracker';
import './App.css';
import { ethers } from "ethers";
import AdminPannel from './components/AdminPannel';
import { useEffect } from 'react';
import { setGlobalState } from './store';
// import { providers } from 'ethers';

function App() {

  
  const isWalletConnected = async () => {
    try {
      if (!window.ethereum) return alert('MetaMask not found');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();

      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });

      window.ethereum.on('accountsChanged', async () => {
        setGlobalState('connectedAccount', accounts[0]?.toLowerCase() || '');
        await isWalletConnected();
      });

      if (accounts.length) {
        setGlobalState('connectedAccount', accounts[0].toLowerCase());
        // window.location.reload();
      } else {
        alert('Please connect wallet');
        console.log('No account found');
      }
    } catch (error) {}
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      await isWalletConnected();
    };

    checkWalletConnection();

  }, []);

  return (
    
    <div className="flex flex-col min-h-screen">
      <Router>
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/transactions" element={<TransactionPool />} />
            <Route path="/createTransaction" element={<CreateTransaction />} />
            <Route path="/withDrawn" element={<AdminPannel />} />
          </Routes>
        </div>

        {/* Footer */}
        {/* <EthereumPriceTracker /> */}
        <Footer />
      </Router>
    </div>
    
  
  );
}

export default App;

// Define Pages
const HomePage = () => (
  <div className="container mx-auto py-6">
    <h1 className="text-3xl font-bold text-center">Welcome to the Home Page</h1>
  </div>
);

const AboutPage = () => (
  <div className="container mx-auto py-6">
    <h1 className="text-3xl font-bold text-center">About Us</h1>
    <p className="text-center">Learn more about our mission and vision.</p>
  </div>
);
