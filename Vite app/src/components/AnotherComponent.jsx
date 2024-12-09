import React, { useContext } from 'react';
import { AppContext } from './EthereumPriceTracker';

const AnotherComponent = () => {
    const { dollarEth } = useContext(AppContext);

    return (
        <div>
            <h2>Dollar to Ether Value</h2>
            <p>{dollarEth !== null ? `$1 = ${dollarEth.toFixed(8)} ETH` : 'Loading...'}</p>
        </div>
    );
};

export default AnotherComponent;
