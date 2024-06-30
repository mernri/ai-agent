import pandas as pd
from typing import Annotated
import os
from datetime import datetime, timedelta
import requests

SavePathType = Annotated[str, "File path to save data. If None, data is not saved."]

def today(months_before: int = 0) -> str:
    modified_date = datetime.now() - timedelta(days=30.4 * months_before)
    return modified_date.strftime("%Y-%m-%d")

def ensure_directory_exists(path):
    os.makedirs(path, exist_ok=True)
    
def get_output_path(relative_path):
    dir_path = os.path.dirname(os.path.realpath(__file__))
    output_path = os.path.join(dir_path, relative_path)
    return output_path

def save_output(data: pd.DataFrame, tag: str, save_path: SavePathType = None) -> None:
    if save_path:
        full_path = get_output_path(save_path)
        ensure_directory_exists(os.path.dirname(full_path))
        data.to_csv(full_path)
        print(f"{tag} saved to {full_path}")
        
def save_htm(url, tag: str, save_path):
    headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'fr,en-US;q=0.9,en;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    }

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        full_path = get_output_path(save_path)
        ensure_directory_exists(os.path.dirname(full_path))
        with open(full_path, 'w', encoding='utf-8') as file:
            file.write(response.text)
        print(f"Report {tag} saved to {full_path}")
    else:
        print(f"Failed to download the report {tag}")

def save_sec_filing_section(section_content: str, save_path: SavePathType = None) -> None:
    if save_path:
        full_path = get_output_path(save_path)
        ensure_directory_exists(os.path.dirname(full_path))
        with open(full_path, 'w', encoding='utf-8') as file:
            file.write(section_content)
        print(f"Sec filing section content saved to {full_path}")
        
        
def path_constructor(symbol: str, output: str, extension: str) -> str:
    """
    Construct the path for the given ouput and thicker symbol.
    """
    return f"../../outputs/{symbol}/{output}.{extension}"