from fastapi import FastAPI, HTTPException
import pandas as pd
from utils.data_sources.yfinance_utils import YFinanceUtils
import json

app = FastAPI()

def get_yfinance_utils(symbol: str) -> YFinanceUtils:
    return YFinanceUtils(symbol)

@app.get("/api/get_income_statement")
async def get_income_statement(symbol: str):
    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol parameter is required.")

    yfin = YFinanceUtils(symbol)
    try:
        income_stmt= yfin.get_income_stmt()
        return {"symbol": symbol, "income_statement": income_stmt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))