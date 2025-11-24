import pandas as pd

def clean_and_merge_data(df, df_test, df_store, df_states, df_geo):

     # Dates
    df["Date"] = pd.to_datetime(df["Date"])
    df_test["Date"] = pd.to_datetime(df_test["Date"])

    # Missing values
    df_test["Open"] = df_test["Open"].fillna(0)

    # StateHoliday type unification
    df["StateHoliday"] = df["StateHoliday"].astype(str)
    df_test["StateHoliday"] = df_test["StateHoliday"].astype(str)

    # 1) Merge store with state mapping (Store -> State)
    df_store = df_store.merge(df_states, on="Store", how="left")

    # 2) Build state-level geo features from df_geo
    geo_state = (
        df_geo
        .groupby("State")
        .agg({
            "lat": "mean",
            "lon": "mean",
            "opened_sunday": "mean",
            "elevation": "mean",
            "population": "sum",
            "nearest_hotel": "mean",
            "nearest_railstation": "mean",
        })
        .reset_index()
        .rename(columns={
            "lat": "LatMean",
            "lon": "LonMean",
            "opened_sunday": "OpenedSundayShare",
            "elevation": "AvgElevation",
            "population": "TotalPopulation",
            "nearest_hotel": "AvgDistanceHotel",
            "nearest_railstation": "AvgDistanceRail",
        })
    )

    # 3) Merge state-level geo features into store table on State
    df_store = df_store.merge(geo_state, on="State", how="left")

    # 4) Merge enriched store data into train and test
    df_merged = df.merge(df_store, on="Store", how="left")
    df_test_merged = df_test.merge(df_store, on="Store", how="left")

    print("Cleaned and merged datasets, including state-level geo features.")
    return df_merged, df_test_merged