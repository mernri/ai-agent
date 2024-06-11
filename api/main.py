from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
from utils.data_sources.yfinance_utils import YFinanceUtils
from utils.data_sources.sec_api_utils import SecApiUtils
from utils.data_sources.finnhub_utils import FinnhubUtils
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)



class IncomeStatementResponse(BaseModel):
    symbol: str
    income_statement: dict

@app.get("/api/get_income_statement", response_model=IncomeStatementResponse)
async def get_income_statement(symbol: str):
    """Retrieve and format a detailed profile of a company using its stock ticker symbol. 
        example http://127.0.0.1:8000/api/get_income_statement?symbol=AAPL"""
    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol parameter is required.")

    yfin = YFinanceUtils(symbol)
    try:
        income_stmt = yfin.get_income_stmt()
        return {"symbol": symbol, "income_statement": income_stmt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))





class SecSectionResponse(BaseModel):
    symbol: str
    section: str
    fiscal_year: Optional[str]
    section_text: str

@app.get("/api/get_10k_section", response_model=SecSectionResponse)
async def get_10k_section(ticker_symbol: str, section: str, fyear: Optional[str] = None, report_address: Optional[str] = None):
    """Get a specific section of a 10-K report from the SEC API."""
    if not ticker_symbol or not section:
        raise HTTPException(status_code=400, detail="Ticker symbol and section are required.")
    
    sec_api_extractor = SecApiUtils()
    try:
        section_text = sec_api_extractor.get_10k_section(ticker_symbol=ticker_symbol, section=section, fyear=fyear, report_address=report_address)
        return {
            "symbol": ticker_symbol,
            "section": section,
            "fiscal_year": fyear,
            "section_text": section_text
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


finnhub_utils = FinnhubUtils()

class CompanyProfileResponse(BaseModel):
    symbol: str
    company_profile: str

@app.get("/api/get_company_profile", response_model=CompanyProfileResponse)
async def get_company_profile(symbol: str):
    """Retrieve and format a detailed profile of a company using its stock ticker symbol."""
    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol parameter is required.")
    
    try:
        profile = finnhub_utils.get_company_profile(symbol)
        return {
            "symbol": symbol,
            "company_profile": profile
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




class CompanyNewsResponse(BaseModel):
    symbol: str
    news: List[dict]

@app.get("/api/get_company_news", response_model=CompanyNewsResponse)
async def get_company_news(symbol: str, start_date: Optional[str] = None, end_date: Optional[str] = None, max_news_num: Optional[int] = 10):
    """Fetch recent news articles about a company based on its stock ticker, within a specified date range."""
    
    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol parameter is required.")
    
    try:
        news = finnhub_utils.get_company_news(symbol, start_date, end_date, max_news_num)
        return {"symbol": symbol, "news": news}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
    
    
    
class BasicFinancialsHistoryResponse(BaseModel):
    symbol: str
    financials: dict

@app.get("/api/get_basic_financials_history", response_model=BasicFinancialsHistoryResponse)
async def get_basic_financials_history(symbol: str, freq: str, start_date: Optional[str] = None, end_date: Optional[str] = None, selected_columns: Optional[List[str]] = None):
    """Retrieve historical financial data for a company, specified by stock ticker, for chosen financial metrics over time."""

    if not symbol or not freq:
        raise HTTPException(status_code=400, detail="Symbol and freq parameters are required.")
    
    try:
        financials = finnhub_utils.get_basic_financials_history(symbol, freq, start_date, end_date, selected_columns)
        return {"symbol": symbol, "financials": financials.to_dict(orient='index')}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class BasicFinancialsResponse(BaseModel):
    symbol: str
    financials: dict
    
    

@app.get("/api/get_basic_financials", response_model=BasicFinancialsResponse)
async def get_basic_financials(symbol: str, selected_columns: Optional[List[str]] = None):
    """Get the most recent basic financial data for a company using its stock ticker symbol, with optional specific financial metrics."""

    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol parameter is required.")
    
    try:
        financials = finnhub_utils.get_basic_financials(symbol, selected_columns)
        return {"symbol": symbol, "financials": json.loads(financials)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



class SecFilingResponse(BaseModel):
    symbol: str
    filing: dict

@app.get("/api/get_sec_filing", response_model=SecFilingResponse)
async def get_sec_filing(symbol: str, form: Optional[str] = "10-K", from_date: Optional[str] = None, to_date: Optional[str] = None):
    """Obtain the most recent SEC filing for a company specified by its stock ticker, within a given date range."""

    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol parameter is required.")
    
    try:
        filing = finnhub_utils.get_sec_filing(symbol, form, from_date, to_date)
        return {"symbol": symbol, "filing": filing}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)



