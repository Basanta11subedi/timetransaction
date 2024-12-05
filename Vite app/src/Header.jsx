import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <div className="">
      <div className="navbar-logo">MyApp</div>{' '}
      <ul className="">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/services">Services</Link>
        </li>
        <li>
          <Link to="/transactions">Transactions</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li>
        <li>
          <Link to="/createTransaction">Create Transaction</Link>
        </li>
      </ul>
    </div>
  );
};

export default Header;
