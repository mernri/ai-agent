
from typing import Annotated
from api.utils.data_sources.yfinance_utils import YFinanceUtils
from api.utils.data_sources.finnhub_utils import FinnhubUtils
from textwrap import dedent
from utils.other import save_instruction_prompt

class AnalysisUtils:
    
    def analyze_income_stmt(
        ticker_symbol: Annotated[str, "ticker symbol"],
        fyear: Annotated[str, "fiscal year of the 10-K report"],
    ) -> str:
        """
        Retrieve the income statement for the given ticker symbol with the related section of its 10-K report.
        Then return with an instruction on how to analyze the income statement.
        """
        # Retrieve the income statement
        income_stmt = YFinanceUtils.get_income_stmt(ticker_symbol)
        ticker_income_stmt = "Income statement:\n" + income_stmt.to_string().strip()

        # Analysis instruction
        instruction = dedent(
            """
            Conduct a comprehensive analysis of the company's income statement for the current fiscal year. 
            Start with an overall revenue record, including Year-over-Year or Quarter-over-Quarter comparisons, 
            and break down revenue sources to identify primary contributors and trends. Examine the Cost of 
            Goods Sold for potential cost control issues. Review profit margins such as gross, operating, 
            and net profit margins to evaluate cost efficiency, operational effectiveness, and overall profitability. 
            Analyze Earnings Per Share to understand investor perspectives. Compare these metrics with historical 
            data and industry or competitor benchmarks to identify growth patterns, profitability trends, and 
            operational challenges. The output should be a strategic overview of the company’s financial health 
            in a single paragraph, less than 130 words, summarizing the previous analysis into 4-5 key points under 
            respective subheadings with specific discussion and strong data support.
            """
        )

        # Retrieve the related section from the 10-K report
        finnhub_client = FinnhubUtils()
        sec_filing_params = {
            "symbol": ticker_symbol,
            }
        if fyear: 
            sec_filing_params['from_date'] = f"{fyear}-01-01"
            sec_filing_params['to_date'] = f"{fyear}-12-31"

        thicker_sec_filing = finnhub_client.get_sec_filing(**sec_filing_params)

        # Combine the instruction, section text, and income statement
        prompt = dedent(
            f"""
            ## Instruction :
                {instruction}
            
            ## SEC filing : 
                {thicker_sec_filing}
                
            ## Income statement :
                {ticker_income_stmt}
            """
        )

        save_instruction_prompt(prompt, save_path)
        return prompt