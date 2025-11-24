# Rossmann ETL and Machine Learning Project

This repository contains the ETL scripts, exploratory data analysis notebooks, and machine learning models used for the
Rossmann tasks.

## Project Setup

### 1. Create and activate virtual environment

```
python3 -m venv venv
source venv/bin/activate
```

### 2. Install dependencies

```
pip install [PACKAGE_NAME]
```

### 3. Run the ETL pipeline

```
python ETL/etl_main.py
```

## Project Structure

```
ROSSMANN/
    Data/
    ETL/
    venv/
    README.md
```

## Notes

- The `Data` folder is not tracked in version control unless added manually.
- The `venv` folder is excluded through `.gitignore`.
- All scripts assume local file access without Google Drive integrations.
