import pandas as pd
from typing import Annotated
from datetime import datetime, timedelta

SavePathType = Annotated[str, "File path to save data. If None, data is not saved."]

def today(months_before: int = 0) -> str:
    modified_date = datetime.now() - timedelta(days=30.4 * months_before)
    return modified_date.strftime("%Y-%m-%d")

