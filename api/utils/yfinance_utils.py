import sys
from typing import Annotated, Any
from pandas import DataFrame
import pandas as pd
import yfinance as yf

class YFinanceUtils:
    def __init__(self, symbol: Annotated[str, "ticker symbol"]):
        self.symbol = symbol 
        self.yfinance_ticker = self.init_yfinance_client(symbol)
    
    def init_yfinance_client(self, symbol: str) -> Any:
        ticker = yf.Ticker(symbol)
        return ticker
    
    def get_income_stmt(self) -> DataFrame:
        """Retrieve the latest income statement for the stock defined by the initialized ticker symbol."""
        income_stmt = self.yfinance_ticker.financials
        income_stmt_df = pd.DataFrame(income_stmt)
        income_stmt_dict = income_stmt_df.transpose().to_dict(orient='index')
        return income_stmt_dict

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python yfinance_utils.py <SYMBOL>")
        sys.exit(1)

    symbol = sys.argv[1]
    yfin = YFinanceUtils(symbol)
    
    income_stmt = yfin.get_income_stmt()
    # print(income_stmt)