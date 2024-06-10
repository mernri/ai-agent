import { useState, useEffect } from 'react';

export interface Stock {
    ticker: string;
    name: string;
    is_etf: boolean | null;
    exchange: string;
}

export const useSymbolSearch = (searchQuery: string) => {
    const [isLoading, setLoading] = useState(false);
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!searchQuery) {
            setStocks([]);
            return;
        }

        const fetchStocks = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`https://dumbstockapi.com/stock?ticker_search=${searchQuery}&exchanges=NASDAQ,NYSE&is_etf=false`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });


                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const data: Stock[] = await response.json();

                // Utilisation de reduce pour filtrer les doublons
                const uniqueStocks = data.reduce<Stock[]>((acc, stock) => {
                    if (!acc.some(item => item.ticker === stock.ticker)) {
                        acc.push(stock);
                    }
                    return acc;
                }, []);

                setStocks(uniqueStocks.slice(0, 5));
            } catch (error: any) {
                setError(error.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchStocks();
    }, [searchQuery]);

    return { stocks, isLoading, error };
};

