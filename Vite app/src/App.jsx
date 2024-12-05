import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { ethers } from 'ethers';
// import ABI from './constrants/ABI.json';
import './App.css';
// import { parseEther } from 'ethers/lib/utils';
import Header from './Header';
import Footer from './Footer';
import TransactionPool from './components/TransactionPool';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateTransaction from './components/CreateTransaction';

function App() {
  // const [count, setCount] = useState(0);

  return (
    <div>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/transactions" element={<TransactionPool />} />
          <Route path="/createTransaction" element={<CreateTransaction />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;

const HomePage = () => (
  <div>

  </div>
);
const AboutPage = () => (
  <div>
    <h1>About Page</h1>
  </div>
);

const ContactPage = () => (
  <div>
    <h1>Contact Page</h1>
  </div>
);
