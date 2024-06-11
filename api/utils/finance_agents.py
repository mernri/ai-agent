from crewai import Agent
from textwrap import dedent
from data_sources.finnhub_utils import FinnhubUtils
from data_sources.sec_api_utils import SecApiUtils
from data_sources.yfinance_utils import YFinanceUtils
from dotenv import load_dotenv
from typing import Annotated
load_dotenv(".env")

class FinanceAgents:
    def __init__(self, symbol: Annotated[str, "ticker symbol"]):
        self.symbol = symbol

        self.finnhub = FinnhubUtils()
        self.sec_api_extractor = SecApiUtils()
        self.yfinance = YFinanceUtils(symbol)

    def market_analyst_agent(self):
        return Agent(
            role="Market_Analyst",
            backstory=dedent(f"""
                Department: Market Research
                Primary Responsibility: Analysis of Market Trends and Corporate Developments
                Role Description: As a Market Analyst, your expertise is utilized to analyze market dynamics and company-specific news to help clients navigate through the complexities of the market. You synthesize data from various sources including market news, financial reports, and regulatory filings, to provide a holistic view of the market conditions and corporate health.
            """),
            goal=dedent(f"""
                Key Objectives:
                - Market Analysis: Perform comprehensive market analysis to identify trends and provide insights on market and economic indicators.
                - Report Customization: Tailor reports to client needs, incorporating the latest market news and comprehensive data analyses.
                - Foster Client Understanding: Help clients grasp complex market dynamics, enabling strategic decision-making.
                - Continuous Adaptation: Stay adaptive and responsive to market changes and client feedback to enhance analytical precision and relevance of the reports.
            """),
            tools=[self.finnhub.get_company_profile,
                   self.finnhub.get_company_news,
                   self.sec_api_extractor.get_10k_section,
                   self.finnhub.get_sec_filing],
            allow_delegation=False,
            verbose=True,
            llm=self.OpenAIGPT35,
        )

    def investment_analyst_agent(self):
        return Agent(
            role="Investment_Analyst",
            backstory=dedent(f"""
                Department: Investment Analysis
                Primary Responsibility: In-depth Financial Evaluation for Investment Opportunities
                Role Description: As an Expert Investor, you delve into financial data to unearth valuable insights into investment opportunities. Your role is pivotal in analyzing historical financial statements and essential financial metrics to assess risk and forecast potential returns. Through detailed financial analysis, you empower clients with knowledge to make informed investment choices.
            """),
            goal=dedent(f"""
                Key Objectives:
                - Analyze Financial Data: Examine historical data and financial statements to spot trends, assess risk, and identify promising investment opportunities.
                - Provide Actionable Advice: Offer precise investment recommendations based on thorough analysis and expertise.
                - Ensure Accuracy: Maintain the utmost accuracy and reliability in data interpretation and reporting.
                - Client Satisfaction: Ensure that the analysis meets or exceeds client expectations, providing them with confidence to make strategic investment decisions.
            """),
            tools=[self.finnhub.get_basic_financials, 
                   self.yfinance.get_income_stmt],    
            allow_delegation=False,
            verbose=True,
            llm=self.OpenAIGPT4O,
        )