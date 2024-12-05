import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <nav class="container mx:auto flex justify-between items-center">
      <div  class="navbar-logo size-20"><img src="https://www.buildersacademy.ai/assets/icons/logowhite.svg" alt="" /></div>{' '}
      <ul class="flex space-x-4">
        <li class="text-lg hover:to-blue-950">
          <Link class=" hover:to-blue-950" to="/">Home</Link>
        </li>
        <li class="text-lg">
          <Link to="/about">About</Link>
        </li>
        <li class= "text-lg">
          <Link to="/transactions">Transactions</Link>
        </li>
        <li  class="text-lg">
          <Link to="/createTransaction">Create Transaction</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
