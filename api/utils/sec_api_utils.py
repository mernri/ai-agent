import os 
from typing import Annotated
from dotenv import load_dotenv
import sys
from sec_api import ExtractorApi
from utils.finnhub_utils import FinnhubUtils

load_dotenv(".env")

class SecApiUtils:
    def __init__(self):
        self.sec_api_extractor = self.init_sec_api_client()
        
    def init_sec_api_client(self):
        if os.environ.get("SEC_API_KEY") is None:
            raise Exception("Missing SEC_API_KEY in .env")
        else:
            sec_api_extractor = ExtractorApi(api_key=os.environ.get("SEC_API_KEY"))
            print("\nSuccessfully initialized sec api extractor!\n")
            return sec_api_extractor
    
    def get_10k_section(
        self,
        ticker_symbol: Annotated[str, "ticker symbol"],
        fyear: Annotated[str, "fiscal year of the 10-K report"],
        section: Annotated[
            str | int,
            "Section of the 10-K report to extract, should be in [1, 1A, 1B, 2, 3, 4, 5, 6, 7, 7A, 8, 9, 9A, 9B, 10, 11, 12, 13, 14, 15]",
        ],
        report_address: Annotated[
            str,
            "URL of the 10-K report, if not specified, will get report url from fmp api",
        ] = None,
    ) -> str:
        """
        Get a specific section of a 10-K report from the SEC API.
        """
        if isinstance(section, int):
            section = str(section)
        if section not in [
            "1A",
            "1B",
            "7A",
            "9A",
            "9B",
        ] + [str(i) for i in range(1, 16)]:
            raise ValueError(
                "Section must be in [1, 1A, 1B, 2, 3, 4, 5, 6, 7, 7A, 8, 9, 9A, 9B, 10, 11, 12, 13, 14, 15]"
            )
        
        if report_address is None:
            finnhub = FinnhubUtils()
            sec_filing_params = {
                "symbol": ticker_symbol,
            }
            if fyear: 
                sec_filing_params['from_date'] = f"{fyear}-01-01"
                sec_filing_params['to_date'] = f"{fyear}-12-31"

            sec_report_dict = finnhub.get_sec_filing(**sec_filing_params)
            
        section_text = self.sec_api_extractor.get_section(sec_report_dict['reportUrl'], section, "text")
            
        return section_text

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python sec_api_utils.py <SYMBOL> <SECTION> <FISCAL_YEAR>")
        sys.exit(1) 

    symbol = sys.argv[1]
    section = sys.argv[2]
    fyear = sys.argv[3] if len(sys.argv) == 4 else None

    sec_api_extractor = SecApiUtils()
    
    sec_section = sec_api_extractor.get_10k_section(ticker_symbol=symbol, section=section, fyear=fyear)
                                                