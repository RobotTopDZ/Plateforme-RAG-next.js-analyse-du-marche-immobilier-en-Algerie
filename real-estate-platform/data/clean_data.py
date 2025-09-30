"""
Real Estate Data Cleaning Script with Advanced Imputation
=========================================================

This script cleans and preprocesses real estate data using advanced imputation
techniques instead of simply dropping rows with missing values.
"""

import pandas as pd
import numpy as np
import re
import os
from pathlib import Path
from advanced_imputation import AdvancedImputer, impute_real_estate_data

def load_data(file_path):
    """Load the raw real estate data"""
    try:
        df = pd.read_csv(file_path)
        print(f"Data loaded successfully. Shape: {df.shape}")
        return df
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

def clean_data(df):
    """Clean and preprocess the real estate data with advanced imputation"""
    print("Starting data cleaning with advanced imputation...")
    
    # Store initial count for comparison
    initial_count = len(df)
    print(f"Initial dataset size: {initial_count} rows")
    
    # Analyze missing data before cleaning
    print("\nMissing data analysis:")
    missing_before = df.isnull().sum()
    print(missing_before[missing_before > 0])
    
    # Only remove rows where ALL critical columns are missing (extremely rare cases)
    critical_columns = ['TransactionType', 'Location', 'Wilaya', 'Price']
    df = df.dropna(subset=critical_columns, how='all')
    rows_removed = initial_count - len(df)
    if rows_removed > 0:
        print(f"Removed {rows_removed} rows where ALL critical data was missing")
    
    # Apply advanced imputation for remaining missing values
    print("\nApplying advanced imputation techniques...")
    
    # Configure imputation strategies for real estate data
    imputation_config = {
        'price_strategy': 'knn',  # Price correlates with other features
        'location_strategy': 'mode',  # Use most frequent location
        'surface_strategy': 'iterative',  # Can be predicted from price, rooms, etc.
        'rooms_strategy': 'knn',  # Correlates with surface and price
        'preserve_original': False  # Modify in place
    }
    
    # Apply imputation
    try:
        df_imputed, imputer = impute_real_estate_data(df, imputation_config)
        df = df_imputed
        
        # Generate and display imputation report
        report = imputer.get_imputation_report()
        print(f"\nImputation completed successfully!")
        print(f"Columns imputed: {report['summary']['total_columns_imputed']}")
        print(f"Strategies used: {report['summary']['strategies_used']}")
        print(f"Success rate: {report['summary']['imputation_success_rate']:.2f}%")
        
        # Show missing data after imputation
        missing_after = df.isnull().sum()
        remaining_missing = missing_after[missing_after > 0]
        if len(remaining_missing) > 0:
            print(f"\nRemaining missing values:")
            print(remaining_missing)
        else:
            print("\nNo missing values remaining after imputation!")
            
    except Exception as e:
        print(f"Error during imputation: {e}")
        print("Falling back to original method (dropping rows with missing values)")
        # Fallback to original method
        df = df.dropna(subset=critical_columns)
        print(f"Removed {initial_count - len(df)} rows with missing critical data")
    
    return df

def normalize_price(price_str):
    """Normalize price strings to numeric values"""
    if pd.isna(price_str):
        return np.nan
    
    # Convert to string and clean
    price_str = str(price_str).strip()
    
    # Remove currency symbols and spaces
    price_str = re.sub(r'[^\d.,]', '', price_str)
    
    # Handle different decimal separators
    if ',' in price_str and '.' in price_str:
        # Assume comma is thousands separator
        price_str = price_str.replace(',', '')
    elif ',' in price_str:
        # Could be decimal separator in some locales
        if price_str.count(',') == 1 and len(price_str.split(',')[1]) <= 2:
            price_str = price_str.replace(',', '.')
        else:
            price_str = price_str.replace(',', '')
    
    try:
        return float(price_str)
    except ValueError:
        return np.nan

def filter_realistic_prices(df, price_column='Price', min_price=10000, max_price=50000000):
    """Filter out unrealistic price values"""
    initial_count = len(df)
    df = df[(df[price_column] >= min_price) & (df[price_column] <= max_price)]
    removed_count = initial_count - len(df)
    if removed_count > 0:
        print(f"Removed {removed_count} rows with unrealistic prices")
    return df

def extract_surface_info(df):
    """Extract and clean surface information"""
    if 'Surface' in df.columns:
        # Clean surface data
        df['Surface'] = pd.to_numeric(df['Surface'], errors='coerce')
        
        # Filter realistic surface values (5m² to 10000m²)
        initial_count = len(df)
        df = df[(df['Surface'].isna()) | ((df['Surface'] >= 5) & (df['Surface'] <= 10000))]
        removed_count = initial_count - len(df)
        if removed_count > 0:
            print(f"Removed {removed_count} rows with unrealistic surface values")
    
    return df

def extract_room_info(df):
    """Extract and clean room information"""
    room_columns = ['Rooms', 'NbRooms', 'Chambres']
    
    for col in room_columns:
        if col in df.columns:
            # Convert to numeric
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
            # Filter realistic room counts (0 to 20 rooms)
            initial_count = len(df)
            df = df[(df[col].isna()) | ((df[col] >= 0) & (df[col] <= 20))]
            removed_count = initial_count - len(df)
            if removed_count > 0:
                print(f"Removed {removed_count} rows with unrealistic {col} values")
    
    return df

def standardize_locations(df):
    """Standardize location names"""
    location_columns = ['Location', 'Wilaya']
    
    for col in location_columns:
        if col in df.columns:
            # Clean and standardize location names
            df[col] = df[col].astype(str).str.strip().str.title()
            
            # Remove common prefixes/suffixes
            df[col] = df[col].str.replace(r'^(Wilaya\s+de\s+|Province\s+de\s+)', '', regex=True)
            df[col] = df[col].str.replace(r'\s+(Province|Wilaya)$', '', regex=True)
    
    return df

def clean_description(text):
    """Clean description text by removing emojis and excessive special characters"""
    if pd.isna(text):
        return text
    
    # Remove emojis
    emoji_pattern = re.compile("["
                              u"\U0001F600-\U0001F64F"  # emoticons
                              u"\U0001F300-\U0001F5FF"  # symbols & pictographs
                              u"\U0001F680-\U0001F6FF"  # transport & map symbols
                              u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
                              "]+", flags=re.UNICODE)
    text = emoji_pattern.sub(r'', text)
    
    # Clean excessive special characters
    text = re.sub(r'[^\w\s\-.,!?()]+', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def add_derived_features(df):
    """Add derived features that can help with analysis"""
    # Price per square meter
    if 'Price' in df.columns and 'Surface' in df.columns:
        df['PricePerSqm'] = df['Price'] / df['Surface']
        df['PricePerSqm'] = df['PricePerSqm'].replace([np.inf, -np.inf], np.nan)
    
    # Property type categorization based on surface and rooms
    if 'Surface' in df.columns:
        df['PropertyType'] = 'Unknown'
        df.loc[df['Surface'] <= 50, 'PropertyType'] = 'Studio/Small Apartment'
        df.loc[(df['Surface'] > 50) & (df['Surface'] <= 100), 'PropertyType'] = 'Medium Apartment'
        df.loc[(df['Surface'] > 100) & (df['Surface'] <= 200), 'PropertyType'] = 'Large Apartment'
        df.loc[df['Surface'] > 200, 'PropertyType'] = 'House/Villa'
    
    return df

def final_data_validation(df):
    """Perform final data validation and quality checks"""
    print("\nPerforming final data validation...")
    
    # Check for any remaining critical missing values
    critical_columns = ['TransactionType', 'Price']
    missing_critical = df[critical_columns].isnull().sum()
    
    if missing_critical.sum() > 0:
        print("Warning: Some critical values are still missing after imputation:")
        print(missing_critical[missing_critical > 0])
    
    # Data quality summary
    print(f"\nFinal dataset summary:")
    print(f"Total rows: {len(df)}")
    print(f"Total columns: {len(df.columns)}")
    print(f"Memory usage: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
    
    return df

def select_final_columns(df):
    """Select and rename final columns for the cleaned dataset"""
    # Define column mappings
    column_mapping = {
        'TransactionType': 'transaction_type',
        'Price': 'price',
        'Surface': 'surface',
        'Location': 'location',
        'Wilaya': 'wilaya',
        'Rooms': 'rooms',
        'NbRooms': 'rooms',
        'Chambres': 'rooms',
        'Description': 'description',
        'PricePerSqm': 'price_per_sqm',
        'PropertyType': 'property_type'
    }
    
    # Select available columns
    available_columns = [col for col in column_mapping.keys() if col in df.columns]
    df_final = df[available_columns].copy()
    
    # Rename columns
    df_final = df_final.rename(columns={col: column_mapping[col] for col in available_columns})
    
    return df_final

def split_data_by_transaction_type(df):
    """Split data into sales and rental datasets"""
    sales_data = df[df['transaction_type'].str.lower().isin(['sale', 'vente', 'sell'])].copy()
    rental_data = df[df['transaction_type'].str.lower().isin(['rent', 'rental', 'location', 'louer'])].copy()
    
    print(f"\nData split summary:")
    print(f"Sales data: {len(sales_data)} rows")
    print(f"Rental data: {len(rental_data)} rows")
    
    return sales_data, rental_data

def save_cleaned_data(sales_data, rental_data, output_dir='cleaned_data'):
    """Save cleaned data to CSV files"""
    # Create output directory
    Path(output_dir).mkdir(exist_ok=True)
    
    # Save datasets
    sales_file = os.path.join(output_dir, 'sales_data_cleaned.csv')
    rental_file = os.path.join(output_dir, 'rental_data_cleaned.csv')
    
    sales_data.to_csv(sales_file, index=False)
    rental_data.to_csv(rental_file, index=False)
    
    print(f"\nCleaned data saved:")
    print(f"Sales data: {sales_file}")
    print(f"Rental data: {rental_file}")
    
    return sales_file, rental_file

def print_data_summary(sales_data, rental_data):
    """Print summary statistics for cleaned data"""
    print("\n" + "="*50)
    print("CLEANED DATA SUMMARY")
    print("="*50)
    
    # Sales data summary
    if len(sales_data) > 0:
        print(f"\nSALES DATA ({len(sales_data)} properties):")
        print(f"Price range: {sales_data['price'].min():,.0f} - {sales_data['price'].max():,.0f}")
        print(f"Average price: {sales_data['price'].mean():,.0f}")
        print(f"Median price: {sales_data['price'].median():,.0f}")
        
        if 'wilaya' in sales_data.columns:
            print("Top 5 Wilayas:")
            print(sales_data['wilaya'].value_counts().head())
    
    # Rental data summary
    if len(rental_data) > 0:
        print(f"\nRENTAL DATA ({len(rental_data)} properties):")
        print(f"Price range: {rental_data['price'].min():,.0f} - {rental_data['price'].max():,.0f}")
        print(f"Average price: {rental_data['price'].mean():,.0f}")
        print(f"Median price: {rental_data['price'].median():,.0f}")
        
        if 'wilaya' in rental_data.columns:
            print("Top 5 Wilayas:")
            print(rental_data['wilaya'].value_counts().head())

def main(input_file, output_dir='cleaned_data'):
    """Main data cleaning pipeline"""
    print("Starting Real Estate Data Cleaning Pipeline with Advanced Imputation")
    print("="*70)
    
    # Load data
    df = load_data(input_file)
    if df is None:
        return
    
    # Clean data with advanced imputation
    df = clean_data(df)
    
    # Apply traditional cleaning steps
    df['Price'] = df['Price'].apply(normalize_price)
    df = filter_realistic_prices(df)
    df = extract_surface_info(df)
    df = extract_room_info(df)
    df = standardize_locations(df)
    
    # Clean descriptions if present
    if 'Description' in df.columns:
        df['Description'] = df['Description'].apply(clean_description)
    
    # Add derived features
    df = add_derived_features(df)
    
    # Final validation
    df = final_data_validation(df)
    
    # Select final columns
    df = select_final_columns(df)
    
    # Split by transaction type
    sales_data, rental_data = split_data_by_transaction_type(df)
    
    # Save cleaned data
    save_cleaned_data(sales_data, rental_data, output_dir)
    
    # Print summary
    print_data_summary(sales_data, rental_data)
    
    print("\nData cleaning pipeline completed successfully!")
    return sales_data, rental_data

if __name__ == "__main__":
    # Example usage
    input_file = "raw_real_estate_data.csv"  # Replace with your input file
    
    if os.path.exists(input_file):
        main(input_file)
    else:
        print(f"Input file '{input_file}' not found.")
        print("Please provide the path to your raw real estate data CSV file.")