import yfinance as yf
import sys
from typing import Annotated, Any
from pandas import DataFrame
import pandas as pd
from utils.other import save_output, path_constructor

class YFinanceUtils:
    def __init__(self, symbol: Annotated[str, "ticker symbol"]):
        self.symbol = symbol 
        self.yfinance_ticker = self.init_yfinance_client(symbol)
    
    def init_yfinance_client(self, symbol: str) -> Any:
        """Initializes the yfinance client for a given symbol."""
        ticker = yf.Ticker(symbol)
        return ticker
    
    def get_income_stmt(self) -> DataFrame:
        """Fetches and returns the income statement of the company as a DataFrame."""
        income_stmt = self.yfinance_ticker.financials
        income_stmt_df = pd.DataFrame(income_stmt)
        save_output(income_stmt_df, f"Income statement for: {symbol}", path_constructor(symbol, "income_statement", 'csv'))
        return income_stmt_df

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python yfinance_utils.py <SYMBOL>")
        sys.exit(1)

    symbol = sys.argv[1]
    yfin = YFinanceUtils(symbol)
    
    income_stmt = yfin.get_income_stmt()
    print(income_stmt)