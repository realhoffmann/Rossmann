from pathlib import Path

def save_processed_data(df_merged, df_test_merged):
    project_root = Path(__file__).resolve().parents[1]
    output_dir = project_root / "Data" / "processed"
    output_dir.mkdir(exist_ok=True)

    df_merged.to_csv(output_dir / "train_clean.csv", index=False)
    df_test_merged.to_csv(output_dir / "test_clean.csv", index=False)

    print(f"Saved cleaned data to {output_dir}")