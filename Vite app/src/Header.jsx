import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
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
      </ul>
    </nav>
  );
};

export default Header;
