import React, { createContext, useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export const AppContext = createContext();

const EthereumPriceTracker = () => {
    const [price, setPrice] = useState(null);
    const [previousPrice, setPreviousPrice] = useState(null);
    const [priceChange, setPriceChange] = useState(0);
    const [dollarEth, setDollarEth] = useState(null);
    const [isIncreasing, setIsIncreasing] = useState(null);

    useEffect(() => {
        const socket = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');

        socket.onmessage = (event) => {
            const tradeData = JSON.parse(event.data);
            const currentPrice = parseFloat(tradeData.p);

            setPreviousPrice(price);
            setPrice(currentPrice);
            const oneDollarEth = 1 / currentPrice;
            setDollarEth(oneDollarEth);

            if (previousPrice !== null) {
                const change = ((currentPrice - previousPrice) / previousPrice) * 100;
                setPriceChange(change.toFixed(2));
                setIsIncreasing(change >= 0);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        return () => {
            socket.close();
        };
    }, [price, previousPrice]);

    return (
        <AppContext.Provider value={{ dollarEth, setDollarEth }}>
            <div className="bg-white shadow-md rounded-lg p-4 max-w-md mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Ethereum (ETH) Price</h2>
                    {isIncreasing !== null && (isIncreasing ? <ArrowUp color="green" /> : <ArrowDown color="red" />)}
                </div>
                <div>
                    <div className="text-2xl font-bold text-gray-900">
                        {price ? `$${price.toLocaleString()} = ${dollarEth * price} ETH and $1 = ${dollarEth}` : 'Loading...'}
                    </div>
                    {price && previousPrice && (
                        <div className={`text-sm mt-2 ${isIncreasing ? 'text-green-600' : 'text-red-600'}`}>
                            {priceChange}% {isIncreasing ? 'increase' : 'decrease'}
                        </div>
                    )}
                </div>
            </div>
        </AppContext.Provider>
    );
};

export default EthereumPriceTracker;
