import React, { useState } from 'react';
import { Link } from 'react-router-dom';


const Header = () => {

  const [connectedAddress, setConnectedAddress] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Predefined admin account address
  const adminAccount = "0xa5d66DCab3d4f9778cB07Ce49BF5eFb42Af5641E";

  // Function to connect wallet and validate admin
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask to use this feature!");
        return;
      }

      // Request wallet connection and fetch accounts
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0]; // Use the first account from the list

      // Set the connected address in state
      setConnectedAddress(address);

      // Compare with admin account (case insensitive)
      setIsAdmin(address.toLowerCase() === adminAccount.toLowerCase());
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  return (
    <nav className="container mx-auto flex flex-wrap justify-between items-center p-4">
      <div className="navbar-logo">
        <img
          src="https://www.buildersacademy.ai/assets/icons/logowhite.svg"
          alt="Logo"
          className="h-12 w-auto"
        />
      </div>
      <ul className="flex flex-wrap justify-center space-x-4 text-center md:text-left">
      <li className="text-lg md:text-2xl hover:text-blue-950">
          <Link to="/transactions">Transaction Pools</Link>
        </li>

        <li className="text-lg md:text-2xl hover:text-blue-950">
          <Link to="/about">About</Link>
        </li>
        <li className="text-lg md:text-2xl hover:text-blue-950">
          <Link to="/connectAccount"><button
        className="bg-green-500 rounded-2xl px-2 py-1 text-white hover:bg-blue-950 hover:text-white"
        onClick={connectWallet}
      >
        Connect Wallet
      </button></Link>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
