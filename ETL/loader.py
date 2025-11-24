from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "Data"

def load_raw_data():
    # Force StateHoliday to string during CSV parse to avoid mixed-type warnings
    dtype_overrides = {"StateHoliday": str}

    df = pd.read_csv(DATA_DIR / "train.csv", dtype=dtype_overrides)
    df_test = pd.read_csv(DATA_DIR / "test.csv", dtype=dtype_overrides)
    df_store = pd.read_csv(DATA_DIR / "store.csv")
    df_states = pd.read_csv(DATA_DIR / "store_states.csv")
    df_geo = pd.read_csv(DATA_DIR / "rossmann_store_geo.csv", encoding="latin1")

    print("Loaded train, test, store, store_states, and geo CSVs.")
    return df, df_test, df_store, df_states, df_geo