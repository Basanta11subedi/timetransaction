import React from 'react';
import { Link } from 'react-router-dom';
import { useGlobalState } from './store';
import { ethers } from 'ethers';
import ABI from './constrants/ABI.json'


const Header = () => {

  const [connectedAccount] = useGlobalState('connectedAccount');
  const [account] = useGlobalState('account');
  const [contractAddress] = useGlobalState('contractAddress');

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
          { connectedAccount.toLowerCase() == account.toLowerCase() ? (<Link to="/withDrawn">Earning</Link>) : (<></>)}
          
        </li>
      </ul>
    </nav>
  );
};

export default Header;
