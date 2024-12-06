import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

const EthereumPriceTracker = () => {
  const [price, setPrice] = useState(null);
  const [previousPrice, setPreviousPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [isIncreasing, setIsIncreasing] = useState(null);

  useEffect(() => {
    // Binance WebSocket for ETH/USDT price
    const socket = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');

    socket.onmessage = (event) => {
      const tradeData = JSON.parse(event.data);
      const currentPrice = parseFloat(tradeData.p);

      // Update price state
      setPreviousPrice(price);
      setPrice(currentPrice);

      // Calculate price change
      if (previousPrice !== null) {
        const change = ((currentPrice - previousPrice) / previousPrice) * 100;
        setPriceChange(change.toFixed(2));
        setIsIncreasing(change >= 0);
      }
    };

    // Cleanup WebSocket on component unmount
    return () => {
      socket.close();
    };
  }, [price, previousPrice]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Ethereum (ETH) Price</span>
          {isIncreasing !== null && (
            isIncreasing ? 
              <ArrowUp color="green" className="ml-2"/> : 
              <ArrowDown color="red" className="ml-2"/>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {price ? `$${price.toLocaleString()}` : 'Loading...'}
        </div>
        {price && previousPrice && (
          <div className={`text-sm mt-2 ${isIncreasing ? 'text-green-600' : 'text-red-600'}`}>
            {priceChange}% {isIncreasing ? 'increase' : 'decrease'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EthereumPriceTracker;