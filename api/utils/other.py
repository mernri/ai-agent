import pandas as pd
from typing import Annotated
import os

SavePathType = Annotated[str, "File path to save data. If None, data is not saved."]

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
        data.to_csv(full_path, index=False)
        print(f"{tag} saved to {full_path}")