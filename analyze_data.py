import pandas as pd
import numpy as np

# Load the CSV file
df = pd.read_csv('data/immobilier_data_full.csv')

print('Dataset Overview:')
print(f'Total rows: {len(df)}')
print(f'Total columns: {len(df.columns)}')
print('\nColumn names:')
print(df.columns.tolist())

print('\nData types:')
print(df.dtypes)

print('\nPrice column analysis:')
print(f'Price column has {df["Price"].isna().sum()} null values')
print(f'Price range: {df["Price"].min()} to {df["Price"].max()}')
print(f'Price mean: {df["Price"].mean():.2f}')

print('\nPriceUnit values:')
print(df['PriceUnit'].value_counts())

print('\nTransactionType values:')
print(df['TransactionType'].value_counts())

print('\nSample of problematic prices (very low values):')
low_prices = df[df['Price'] < 1000]
print(f'Number of entries with price < 1000: {len(low_prices)}')
if len(low_prices) > 0:
    print(low_prices[['Title', 'Price', 'PriceUnit', 'TransactionType']].head())

print('\nSample of very high prices:')
high_prices = df[df['Price'] > 1000000000]  # > 1 billion
print(f'Number of entries with price > 1 billion: {len(high_prices)}')
if len(high_prices) > 0:
    print(high_prices[['Title', 'Price', 'PriceUnit', 'TransactionType']].head())

print('\nMissing values per column:')
print(df.isnull().sum())

print('\nUnique values in key columns:')
print(f'Unique Wilayas: {df["Wilaya"].nunique()}')
print(f'Unique Locations: {df["Location"].nunique()}')
print(f'Unique Categories: {df["Category"].nunique()}')