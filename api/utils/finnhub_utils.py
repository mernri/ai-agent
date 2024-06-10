import os 
import json
from typing import Annotated
import pandas as pd
from datetime import datetime
from collections import defaultdict
import finnhub
from dotenv import load_dotenv
import sys
from utils.other import save_output, save_htm, SavePathType, today
load_dotenv(".env")

## FINNHUB API DOCUMENTATION: https://finnhub.io/docs/api
class FinnhubUtils:
    def __init__(self):
        self.finnhub_client = self.init_finnhub_client()
        
    def init_finnhub_client(self):
        if os.environ.get("FINNHUB_API_KEY") is None:
            raise Exception("Missing FINNHUB_API_KEY in .env")
        else:
            finnhub_client = finnhub.Client(api_key=os.environ.get("FINNHUB_API_KEY"))
            print("\nSuccessfully initialized Finnhub client!\n")
            return finnhub_client

    def get_company_profile(self, symbol: Annotated[str, "ticker symbol"]) -> str:
        profile = self.finnhub_client.company_profile2(symbol=symbol)
        
        if not profile:
            return f"\nFailed to find company profile for symbol {symbol} from finnhub!"

        formatted_str = (
            "[Company Introduction]:\n\n{name} is a leading entity in the {finnhubIndustry} sector based in {country}. "
            "Incorporated and publicly traded since {ipo}, the company has established its reputation as "
            "one of the key players in the market. As of today, {name} has a market capitalization "
            "of {marketCapitalization:.2f} in {currency}, with {shareOutstanding:.2f} shares outstanding."
            "\n\n{name} operates primarily in the {country}, trading under the ticker {ticker} on the {exchange}. "
            "As a dominant force in the {finnhubIndustry} space, the company continues to innovate and drive "
            "progress within the industry."
        ).format(**profile)

        return formatted_str

    def get_company_news(
        self,
        entity: Annotated[str, "entity type: company"],
            symbol: Annotated[str, "ticker symbol"],
            start_date: Annotated[
                str,
                "start date of the search period for the company's basic financials, yyyy-mm-dd",
            ],
            end_date: Annotated[
                str,
                "end date of the search period for the company's basic financials, yyyy-mm-dd",
            ],
            max_news_num: Annotated[
                int, "maximum number of news to return, default to 10"
            ] = 10,
            save_path: SavePathType = None,
        ) -> pd.DataFrame:
            news = self.finnhub_client.company_news(symbol, _from=start_date, to=end_date)
            if len(news) == 0:
                print(f"No company news found for symbol {symbol} from finnhub!")
            news = [
                {
                    "date": datetime.fromtimestamp(n["datetime"]).strftime("%Y%m%d%H%M%S"),
                    "headline": n["headline"],
                    "summary": n["summary"],
                }
                for n in news
            ]
            # Select the 10 most recent news if the number of news exceeds the limit
            ##TODO : Add a list of priority sources to sort the news
            if len(news) > max_news_num:
                news = news[:max_news_num]
            news.sort(key=lambda x: x["date"])
            output = pd.DataFrame(news)
            save_output(output, f"company news of {symbol}", save_path=save_path)

            return output

    def get_basic_financials_history(
        self,
        symbol: Annotated[str, "ticker symbol"],
        freq: Annotated[
            str,
            "reporting frequency of the company's basic financials: annual / quarterly",
        ],
        start_date: Annotated[
            str,
            "start date of the search period for the company's basic financials, yyyy-mm-dd",
        ],
        end_date: Annotated[
            str,
            "end date of the search period for the company's basic financials, yyyy-mm-dd",
        ],
        selected_columns: Annotated[
            list[str] | None,
            "List of column names of news to return, should be chosen from 'assetTurnoverTTM', 'bookValue', 'cashRatio', 'currentRatio', 'ebitPerShare', 'eps', 'ev', 'fcfMargin', 'fcfPerShareTTM', 'grossMargin', 'inventoryTurnoverTTM', 'longtermDebtTotalAsset', 'longtermDebtTotalCapital', 'longtermDebtTotalEquity', 'netDebtToTotalCapital', 'netDebtToTotalEquity', 'netMargin', 'operatingMargin', 'payoutRatioTTM', 'pb', 'peTTM', 'pfcfTTM', 'pretaxMargin', 'psTTM', 'ptbv', 'quickRatio', 'receivablesTurnoverTTM', 'roaTTM', 'roeTTM', 'roicTTM', 'rotcTTM', 'salesPerShare', 'sgaToSale', 'tangibleBookValue', 'totalDebtToEquity', 'totalDebtToTotalAsset', 'totalDebtToTotalCapital', 'totalRatio'",
        ] = None,
        save_path: SavePathType = None,
    ) -> pd.DataFrame:

        if freq not in ["annual", "quarterly"]:
            return f"Invalid reporting frequency {freq}. Please specify either 'annual' or 'quarterly'."

        basic_financials = self.finnhub_client.company_basic_financials(symbol, "all")
        if not basic_financials["series"]:
            return f"Failed to find basic financials for symbol {symbol} from finnhub! Try a different symbol."

        output_dict = defaultdict(dict)
        for metric, value_list in basic_financials["series"][freq].items():
            if selected_columns and metric not in selected_columns:
                continue
            for value in value_list:
                if value["period"] >= start_date and value["period"] <= end_date:
                    output_dict[metric].update({value["period"]: value["v"]})

        financials_output = pd.DataFrame(output_dict)
        financials_output = financials_output.rename_axis(index="date")
        save_output(financials_output, "basic financials", save_path=save_path)

        return financials_output

    def get_basic_financials(
        self,
        symbol: Annotated[str, "ticker symbol"],
        selected_columns: Annotated[
            list[str] | None,
            "List of column names of news to return, should be chosen from 'assetTurnoverTTM', 'bookValue', 'cashRatio', 'currentRatio', 'ebitPerShare', 'eps', 'ev', 'fcfMargin', 'fcfPerShareTTM', 'grossMargin', 'inventoryTurnoverTTM', 'longtermDebtTotalAsset', 'longtermDebtTotalCapital', 'longtermDebtTotalEquity', 'netDebtToTotalCapital', 'netDebtToTotalEquity', 'netMargin', 'operatingMargin', 'payoutRatioTTM', 'pb', 'peTTM', 'pfcfTTM', 'pretaxMargin', 'psTTM', 'ptbv', 'quickRatio', 'receivablesTurnoverTTM', 'roaTTM', 'roeTTM', 'roicTTM', 'rotcTTM', 'salesPerShare', 'sgaToSale', 'tangibleBookValue', 'totalDebtToEquity', 'totalDebtToTotalAsset', 'totalDebtToTotalCapital', 'totalRatio','10DayAverageTradingVolume', '13WeekPriceReturnDaily', '26WeekPriceReturnDaily', '3MonthADReturnStd', '3MonthAverageTradingVolume', '52WeekHigh', '52WeekHighDate', '52WeekLow', '52WeekLowDate', '52WeekPriceReturnDaily', '5DayPriceReturnDaily', 'assetTurnoverAnnual', 'assetTurnoverTTM', 'beta', 'bookValuePerShareAnnual', 'bookValuePerShareQuarterly', 'bookValueShareGrowth5Y', 'capexCagr5Y', 'cashFlowPerShareAnnual', 'cashFlowPerShareQuarterly', 'cashFlowPerShareTTM', 'cashPerSharePerShareAnnual', 'cashPerSharePerShareQuarterly', 'currentDividendYieldTTM', 'currentEv/freeCashFlowAnnual', 'currentEv/freeCashFlowTTM', 'currentRatioAnnual', 'currentRatioQuarterly', 'dividendGrowthRate5Y', 'dividendPerShareAnnual', 'dividendPerShareTTM', 'dividendYieldIndicatedAnnual', 'ebitdPerShareAnnual', 'ebitdPerShareTTM', 'ebitdaCagr5Y', 'ebitdaInterimCagr5Y', 'enterpriseValue', 'epsAnnual', 'epsBasicExclExtraItemsAnnual', 'epsBasicExclExtraItemsTTM', 'epsExclExtraItemsAnnual', 'epsExclExtraItemsTTM', 'epsGrowth3Y', 'epsGrowth5Y', 'epsGrowthQuarterlyYoy', 'epsGrowthTTMYoy', 'epsInclExtraItemsAnnual', 'epsInclExtraItemsTTM', 'epsNormalizedAnnual', 'epsTTM', 'focfCagr5Y', 'grossMargin5Y', 'grossMarginAnnual', 'grossMarginTTM', 'inventoryTurnoverAnnual', 'inventoryTurnoverTTM', 'longTermDebt/equityAnnual', 'longTermDebt/equityQuarterly', 'marketCapitalization', 'monthToDatePriceReturnDaily', 'netIncomeEmployeeAnnual', 'netIncomeEmployeeTTM', 'netInterestCoverageAnnual', 'netInterestCoverageTTM', 'netMarginGrowth5Y', 'netProfitMargin5Y', 'netProfitMarginAnnual', 'netProfitMarginTTM', 'operatingMargin5Y', 'operatingMarginAnnual', 'operatingMarginTTM', 'payoutRatioAnnual', 'payoutRatioTTM', 'pbAnnual', 'pbQuarterly', 'pcfShareAnnual', 'pcfShareTTM', 'peAnnual', 'peBasicExclExtraTTM', 'peExclExtraAnnual', 'peExclExtraTTM', 'peInclExtraTTM', 'peNormalizedAnnual', 'peTTM', 'pfcfShareAnnual', 'pfcfShareTTM', 'pretaxMargin5Y', 'pretaxMarginAnnual', 'pretaxMarginTTM', 'priceRelativeToS&P50013Week', 'priceRelativeToS&P50026Week', 'priceRelativeToS&P5004Week', 'priceRelativeToS&P50052Week', 'priceRelativeToS&P500Ytd', 'psAnnual', 'psTTM', 'ptbvAnnual', 'ptbvQuarterly', 'quickRatioAnnual', 'quickRatioQuarterly', 'receivablesTurnoverAnnual', 'receivablesTurnoverTTM', 'revenueEmployeeAnnual', 'revenueEmployeeTTM', 'revenueGrowth3Y', 'revenueGrowth5Y', 'revenueGrowthQuarterlyYoy', 'revenueGrowthTTMYoy', 'revenuePerShareAnnual', 'revenuePerShareTTM', 'revenueShareGrowth5Y', 'roa5Y', 'roaRfy', 'roaTTM', 'roe5Y', 'roeRfy', 'roeTTM', 'roi5Y', 'roiAnnual', 'roiTTM', 'tangibleBookValuePerShareAnnual', 'tangibleBookValuePerShareQuarterly', 'tbvCagr5Y', 'totalDebt/totalEquityAnnual', 'totalDebt/totalEquityQuarterly', 'yearToDatePriceReturnDaily'",
        ] = None,
        save_path: SavePathType = None,
    ) -> str:

        basic_financials = self.finnhub_client.company_basic_financials(symbol, "all")
        if not basic_financials["series"]:
            return f"Failed to find basic financials for symbol {symbol} from finnhub! Try a different symbol."

        output_dict = basic_financials["metric"]
        for metric, value_list in basic_financials["series"]["quarterly"].items():
            value = value_list[0]
            output_dict.update({metric: value["v"]})

        for k in output_dict.keys():
            if selected_columns and k not in selected_columns:
                output_dict.pop(k)
        
        output_dict_df = pd.DataFrame(output_dict, index=[0])
        save_output(output_dict_df, "basic financials", save_path=save_path)

        return json.dumps(output_dict, indent=2)

    def get_sec_filing(self,
                        symbol: Annotated[str, "ticker symbol"], 
                        form: Annotated[str, "Form type from the list : '10-k', '10-q', '8-k'.. "] = "10-K", 
                        from_date: Annotated[str, "From date, format yyyy-mm-dd"] = today(12), 
                        to_date: Annotated[str, "To date, format yyyy-mm-dd"] = today(),
                        save_path: SavePathType = None,
                        ) -> str:
        
        
        params = {
            'symbol': symbol,
            'form': form,
            '_from': from_date,
            'to': to_date
        }
        
        filings = self.finnhub_client.filings(**params)
            
        if filings:   
            latest_filing = max(filings, key=lambda x: x['filedDate'])
            save_htm(latest_filing['reportUrl'], 'latest sec filling', save_path)
            return json.dumps(latest_filing, indent=2)
        else:
            print("No filings found for the provided criteria.")
            return {}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python finnhub_utils.py <SYMBOL>")
        sys.exit(1) 

    symbol = sys.argv[1]
    fin = FinnhubUtils()

    # company_profile = fin.get_company_profile(symbol)    
    # basic_fin = fin.get_basic_financials(symbol, None, f"../outputs/{symbol}/basic_financials.csv")
    # company_news = fin.get_company_news("company", symbol, "2024-01-01", "2024-10-02", 10, f"../outputs/{symbol}/company_news.csv")
    # financial_hist = fin.get_basic_financials_history(symbol, "annual", "2020-01-01", "2021-01-01", None, f"../outputs/{symbol}/financial_hist.csv")
    # sec_filing = fin.get_sec_filing(symbol=symbol, save_path=f"../outputs/{symbol}/latest_sec_filing.htm")
    
    # print("\nCompany Profile", company_profile)
    # print("\nBasic Financials", basic_fin)
    # print("\nCompany News", company_news)
    # print("\nFinancial History", financial_hist)
    # print("\nLatest SEC 10k Filing", sec_filing)