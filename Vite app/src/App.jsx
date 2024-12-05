import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import TransactionPool from './components/TransactionPool';
import CreateTransaction from './components/CreateTransaction';
import './App.css';

function App() {
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
          </Routes>
        </div>

        {/* Footer */}
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
