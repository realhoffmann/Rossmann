from loader import load_raw_data
from transformer import clean_and_merge_data
from writer import save_processed_data


def main() -> None:
    # 1. Load raw data
    df, df_test, df_store, df_states, df_geo = load_raw_data()

    # 2. Clean and merge
    df_merged, df_test_merged = clean_and_merge_data(df, df_test, df_store, df_states, df_geo)

    # 3. Save processed datasets
    save_processed_data(df_merged, df_test_merged)


if __name__ == "__main__":
    main()