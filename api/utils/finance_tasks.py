from crewai import Task
from textwrap import dedent

class FinanceTasks:
    def __tip_section(self):
            return "If you do your BEST WORK, I'll give you a $10,000 commission!"

    def analyze_market_trends(self, agent, symbol):
        return Task(
            description=dedent(
                f"""
                Analyze current market trends for the company symbol {symbol}.
                
                {self.__tip_section()}
        
                Use the most recent market data and company news to identify key trends and potential market shifts.
                This analysis should help inform strategic decisions and investment opportunities.
        
                Please focus on comprehensive market data analysis, including recent news and SEC filings.
                """
            ),
            agent=agent,
            expected_output="Report outlining key market trends and insights for the symbol"
        )

    def generate_investment_report(self, agent, symbol, financial_year):
        return Task(
            description=dedent(
                f"""
                Generate a detailed investment report for {symbol} for the financial year {financial_year}.
                
                {self.__tip_section()}
                
                Your report should include an analysis of the income statement and basic financial metrics to assess the company's financial health and potential investment risks and returns.
                
                Ensure that your analysis is thorough and considers both historical data and recent financial developments.
                """
            ),
            agent=agent,
            expected_output="Comprehensive investment report including financial analysis and recommendations"
        )

    def follow_up_market_analysis(self, agent, symbol):
        return Task(
            description=dedent(
                f"""
                Based on the initial market trends analysis for {symbol}, provide a follow-up report that refines previous insights and includes the latest market developments.
                
                {self.__tip_section()}
                
                Make sure to incorporate the latest company news and SEC filings to enhance the report's accuracy and relevance.
                This report should enable clients to adapt their strategies to current market conditions.
                """
            ),
            agent=agent,
            expected_output="Updated report with refined market insights and analysis"
        )

    def update_investment_strategy(self, agent, symbol):
        return Task(
            description=dedent(
                f"""
                Update the investment strategy for {symbol} based on the latest financial analysis and market conditions.
                
                {self.__tip_section()}
                
                This task should refine previous recommendations by incorporating new financial data and analysis of recent business activities and financial statements.
                The updated strategy should provide clear, actionable advice for both short-term and long-term investment decisions.
                """
            ),
            agent=agent,
            expected_output="Revised investment strategy document incorporating latest data and insights"
        )