from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from utils.data_sources.yfinance_utils import YFinanceUtils
from utils.data_sources.sec_api_utils import SecApiUtils

app = FastAPI()

class IncomeStatementResponse(BaseModel):
    symbol: str
    income_statement: dict

@app.get("/api/get_income_statement", response_model=IncomeStatementResponse)
async def get_income_statement(symbol: str):
    "example http://127.0.0.1:8000/api/get_income_statement?symbol=AAPL"
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
