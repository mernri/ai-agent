import React, { useState, useEffect } from 'react';
import { useSymbolSearch } from '@/hooks/useSymbolSearch';
import { Input } from "@/components/ui/input";

const InputSymbolAutocomplete = ({ handleSelectSymbol }: { handleSelectSymbol: any }) => {
    const [input, setInput] = useState('');
    const { stocks, isLoading, error } = useSymbolSearch(input);
    const [displaySymbolsList, setDisplaySymbolsList] = useState(false);


    useEffect(() => {
        if (input.length > 0 && stocks.length > 0) {
            setDisplaySymbolsList(true);
        } else {
            setDisplaySymbolsList(false);
        }
    }, [stocks.length]);

    const handleSelectStock = (ticker: string) => {
        setInput(ticker);
        handleSelectSymbol(ticker);
        setDisplaySymbolsList(false);
    }

    // console.log("\n\n HEEEEEEYYY displaySymbolsList", displaySymbolsList, "\n\n")

    return (
        <div className="relative w-full">
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setDisplaySymbolsList(input.length > 0 && stocks.length > 0)}
                placeholder="Enter company symbol (Ex: AAPL for Apple)"
                className="w-full"
            />
            {displaySymbolsList && (
                <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 overflow-auto">
                    {isLoading && <p className="p-2 text-gray-500">Loading...</p>}
                    {error && <p className="p-2 text-red-500">Error: {error}</p>}
                    <ul>
                        {stocks.map(stock => (
                            <li
                                onClick={() => handleSelectStock(stock.ticker)}
                                key={stock.ticker}
                                className="p-2 hover:bg-gray-100 hover:cursor-pointer"
                            >
                                {stock.name} ({stock.ticker})
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default InputSymbolAutocomplete;
