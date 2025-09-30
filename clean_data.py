import pandas as pd
import numpy as np
import re
from datetime import datetime
from sklearn.impute import KNNImputer, SimpleImputer
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

def clean_real_estate_data():
    """
    Comprehensive data cleaning for real estate dataset with advanced imputation
    """
    print("Loading dataset...")
    df = pd.read_csv('data/immobilier_data_full.csv')
    
    print(f"Original dataset size: {len(df)} rows")
    
    # 1. Initial data assessment
    print("\n1. Assessing missing data...")
    missing_stats = df.isnull().sum()
    print("Missing values per column:")
    for col, missing in missing_stats.items():
        if missing > 0:
            print(f"  {col}: {missing} ({missing/len(df)*100:.1f}%)")
    
    # 2. Clean and standardize prices FIRST (before imputation)
    print("\n2. Cleaning and standardizing prices...")
    
    # Only remove rows with completely invalid prices (not just missing)
    invalid_price_mask = (df['Price'].isna()) & (df['PriceUnit'].isna())
    df = df[~invalid_price_mask]
    print(f"After removing completely invalid prices: {len(df)} rows")
    
    # Function to normalize prices to DA (Algerian Dinar)
    def normalize_price(row):
        price = row['Price']
        unit = row['PriceUnit']
        
        if pd.isna(price) or price <= 0:
            return np.nan
            
        # Convert based on unit
        if unit == 'MILLION':
            return price * 1_000_000
        elif unit == 'BILLION':
            return price * 1_000_000_000
        elif unit == 'UNIT':
            return price
        elif unit == 'UNIT_PER_SQUARE':
            # For per square meter prices, we'll keep them as is for now
            return price
        elif unit == 'MILLION_PER_SQUARE':
            return price * 1_000_000
        else:
            return price
    
    # Apply price normalization
    df['NormalizedPrice'] = df.apply(normalize_price, axis=1)
    
    # 3. Smart imputation for missing prices
    print("\n3. Imputing missing prices using advanced techniques...")
    
    # For missing prices, use median by location and property type
    price_missing_mask = df['NormalizedPrice'].isna()
    print(f"Missing prices to impute: {price_missing_mask.sum()}")
    
    if price_missing_mask.sum() > 0:
        # Group by location and property type for imputation
        for wilaya in df['Wilaya'].unique():
            if pd.isna(wilaya):
                continue
            wilaya_mask = df['Wilaya'] == wilaya
            wilaya_median = df[wilaya_mask]['NormalizedPrice'].median()
            
            if not pd.isna(wilaya_median):
                df.loc[wilaya_mask & price_missing_mask, 'NormalizedPrice'] = wilaya_median
    
    # 4. Filter out unrealistic prices (more lenient than before)
    print("\n4. Filtering unrealistic prices...")
    
    # Define more lenient realistic price ranges for Algeria
    MIN_PRICE = 100_000  # Reduced from 500k
    MAX_PRICE = 1_000_000_000  # Increased from 500M
    
    # For per square meter prices, use different thresholds
    per_sqm_mask = df['PriceUnit'].isin(['UNIT_PER_SQUARE', 'MILLION_PER_SQUARE'])
    
    # Filter regular prices (more lenient)
    regular_price_mask = ~per_sqm_mask
    valid_regular_prices = (
        (df['NormalizedPrice'] >= MIN_PRICE) & 
        (df['NormalizedPrice'] <= MAX_PRICE)
    ) | df['NormalizedPrice'].isna()
    
    # Filter per square meter prices (more lenient)
    valid_per_sqm_prices = (
        (df['NormalizedPrice'] >= 5_000) &  # Reduced from 10k
        (df['NormalizedPrice'] <= 2_000_000)  # Increased from 1M
    ) | df['NormalizedPrice'].isna()
    
    # Apply filters
    df = df[
        (regular_price_mask & valid_regular_prices) | 
        (per_sqm_mask & valid_per_sqm_prices)
    ]
    print(f"After filtering unrealistic prices: {len(df)} rows")
    
    # 4. Advanced imputation for missing location data
    print("\n4. Imputing missing location data...")
    
    # Impute missing Wilaya based on Location
    location_missing_mask = df['Location'].isna()
    wilaya_missing_mask = df['Wilaya'].isna()
    
    print(f"Missing locations to impute: {location_missing_mask.sum()}")
    print(f"Missing wilayas to impute: {wilaya_missing_mask.sum()}")
    
    # Create location mappings for imputation
    location_to_wilaya = df.dropna(subset=['Location', 'Wilaya']).groupby('Location')['Wilaya'].first().to_dict()
    wilaya_to_location = df.dropna(subset=['Location', 'Wilaya']).groupby('Wilaya')['Location'].first().to_dict()
    
    # Impute Wilaya based on Location
    for location, wilaya in location_to_wilaya.items():
        mask = (df['Location'] == location) & df['Wilaya'].isna()
        df.loc[mask, 'Wilaya'] = wilaya
    
    # Impute Location based on Wilaya (use most common location in that wilaya)
    for wilaya in df['Wilaya'].unique():
        if pd.isna(wilaya):
            continue
        wilaya_locations = df[df['Wilaya'] == wilaya]['Location'].value_counts()
        if len(wilaya_locations) > 0:
            most_common_location = wilaya_locations.index[0]
            mask = (df['Wilaya'] == wilaya) & df['Location'].isna()
            df.loc[mask, 'Location'] = most_common_location
    
    # For remaining missing locations, use "Unknown" with the wilaya
    df.loc[df['Location'].isna() & df['Wilaya'].notna(), 'Location'] = df.loc[df['Location'].isna() & df['Wilaya'].notna(), 'Wilaya'].apply(lambda x: f"Unknown-{x}")
    
    # For remaining missing wilayas, use "Unknown"
    df.loc[df['Wilaya'].isna(), 'Wilaya'] = 'Unknown'
    df.loc[df['Location'].isna(), 'Location'] = 'Unknown'
    
    print(f"After location imputation: {len(df)} rows")
    
    # 5. Impute missing TransactionType
    print("\n5. Imputing missing transaction types...")
    
    transaction_missing_mask = df['TransactionType'].isna()
    print(f"Missing transaction types to impute: {transaction_missing_mask.sum()}")
    
    if transaction_missing_mask.sum() > 0:
        # Use the most common transaction type
        most_common_transaction = df['TransactionType'].mode().iloc[0] if len(df['TransactionType'].mode()) > 0 else 'SALE'
        df.loc[transaction_missing_mask, 'TransactionType'] = most_common_transaction
    
    # 6. Clean surface data
    print("\n6. Cleaning surface data...")
    
    def extract_surface(surface_str):
        """Extract numeric surface value from string"""
        if pd.isna(surface_str):
            return np.nan
        
        # Handle list format like "['124 m²']"
        if isinstance(surface_str, str):
            # Remove brackets and quotes
            surface_str = re.sub(r"[\[\]']", "", surface_str)
            # Extract numbers followed by m² or m2
            match = re.search(r'(\d+(?:\.\d+)?)\s*m[²2]?', surface_str, re.IGNORECASE)
            if match:
                return float(match.group(1))
        
        return np.nan
    
    df['CleanSurface'] = df['Surface'].apply(extract_surface)
    
    # Filter realistic surface values (5 m² to 5000 m² - more lenient)
    surface_mask = (df['CleanSurface'] >= 5) & (df['CleanSurface'] <= 5000)
    df.loc[~surface_mask, 'CleanSurface'] = np.nan
    
    # 7. Advanced imputation for surface data
    print("\n7. Imputing missing surface data...")
    
    surface_missing_mask = df['CleanSurface'].isna()
    print(f"Missing surface values to impute: {surface_missing_mask.sum()}")
    
    if surface_missing_mask.sum() > 0:
        # Use KNN imputation for surface based on price and location
        # Prepare data for imputation
        imputation_features = []
        
        # Encode categorical variables for imputation
        le_wilaya = LabelEncoder()
        le_transaction = LabelEncoder()
        
        df_temp = df.copy()
        df_temp['Wilaya_encoded'] = le_wilaya.fit_transform(df_temp['Wilaya'].astype(str))
        df_temp['TransactionType_encoded'] = le_transaction.fit_transform(df_temp['TransactionType'].astype(str))
        
        # Features for imputation
        features_for_imputation = ['NormalizedPrice', 'Wilaya_encoded', 'TransactionType_encoded']
        available_features = [col for col in features_for_imputation if col in df_temp.columns and not df_temp[col].isna().all()]
        
        if len(available_features) > 0:
            # Use KNN imputation
            imputer = KNNImputer(n_neighbors=5)
            imputation_data = df_temp[available_features + ['CleanSurface']].copy()
            
            # Only impute if we have enough non-null values
            if imputation_data.dropna().shape[0] > 10:
                imputed_data = imputer.fit_transform(imputation_data)
                df['CleanSurface'] = imputed_data[:, -1]  # Last column is CleanSurface
                print(f"Imputed {surface_missing_mask.sum()} surface values using KNN")
            else:
                # Fallback to median imputation by wilaya
                for wilaya in df['Wilaya'].unique():
                    wilaya_mask = df['Wilaya'] == wilaya
                    wilaya_median_surface = df[wilaya_mask]['CleanSurface'].median()
                    if not pd.isna(wilaya_median_surface):
                        df.loc[wilaya_mask & surface_missing_mask, 'CleanSurface'] = wilaya_median_surface
                
                # Global median for remaining missing values
                global_median_surface = df['CleanSurface'].median()
                if not pd.isna(global_median_surface):
                    df.loc[df['CleanSurface'].isna(), 'CleanSurface'] = global_median_surface
    
    # 8. Clean and impute rooms data
    print("\n8. Cleaning and imputing rooms data...")
    
    def extract_rooms(rooms_str):
        """Extract numeric room count from string"""
        if pd.isna(rooms_str):
            return np.nan
        
        if isinstance(rooms_str, str):
            # Remove brackets and quotes
            rooms_str = re.sub(r"[\[\]']", "", rooms_str)
            # Extract numbers
            match = re.search(r'(\d+)', rooms_str)
            if match:
                rooms = int(match.group(1))
                # Realistic room count (1 to 20)
                if 1 <= rooms <= 20:
                    return rooms
        
        return np.nan
    
    df['CleanRooms'] = df['Rooms'].apply(extract_rooms)
    
    # Impute missing room counts
    rooms_missing_mask = df['CleanRooms'].isna()
    print(f"Missing room counts to impute: {rooms_missing_mask.sum()}")
    
    if rooms_missing_mask.sum() > 0:
        # Impute rooms based on surface (if available)
        # Rough estimate: 1 room per 30-40 m²
        surface_available_mask = ~df['CleanSurface'].isna()
        rooms_from_surface_mask = rooms_missing_mask & surface_available_mask
        
        if rooms_from_surface_mask.sum() > 0:
            estimated_rooms = np.round(df.loc[rooms_from_surface_mask, 'CleanSurface'] / 35).clip(1, 20)
            df.loc[rooms_from_surface_mask, 'CleanRooms'] = estimated_rooms
            print(f"Estimated {rooms_from_surface_mask.sum()} room counts from surface")
        
        # For remaining missing values, use median by wilaya
        for wilaya in df['Wilaya'].unique():
            wilaya_mask = df['Wilaya'] == wilaya
            wilaya_median_rooms = df[wilaya_mask]['CleanRooms'].median()
            if not pd.isna(wilaya_median_rooms):
                remaining_mask = wilaya_mask & df['CleanRooms'].isna()
                df.loc[remaining_mask, 'CleanRooms'] = wilaya_median_rooms
        
        # Global median for any remaining missing values
        global_median_rooms = df['CleanRooms'].median()
        if not pd.isna(global_median_rooms):
            df.loc[df['CleanRooms'].isna(), 'CleanRooms'] = global_median_rooms
        else:
            df.loc[df['CleanRooms'].isna(), 'CleanRooms'] = 3  # Default to 3 rooms
    
    # 9. Clean and standardize location data (keep more data)
    print("\n9. Standardizing location data...")
    
    def clean_location_name(name):
        if pd.isna(name):
            return "Unknown"
        name = str(name).strip()
        # Remove extra spaces and standardize
        name = re.sub(r'\s+', ' ', name)
        return name.title()
    
    df['Location'] = df['Location'].apply(clean_location_name)
    df['Wilaya'] = df['Wilaya'].apply(clean_location_name)
    
    print(f"After location standardization: {len(df)} rows")
    
    # 10. Clean description data
    print("\n10. Cleaning description data...")
    
    def clean_description(desc):
        """Clean description text"""
        if pd.isna(desc):
            return ""
        
        # Remove excessive emojis and special characters
        desc = re.sub(r'[🏗️📍⛔📱🏡📐🪟⏳💰✨🔹📞🔴🟦🟥0️⃣1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣]+', ' ', desc)
        # Remove multiple spaces
        desc = re.sub(r'\s+', ' ', desc)
        # Remove leading/trailing spaces
        desc = desc.strip()
        
        return desc
    
    df['CleanDescription'] = df['Description'].apply(clean_description)
    
    # 11. Add derived features
    print("\n11. Adding derived features...")
    
    # Price per square meter (where surface is available)
    df['PricePerSqm'] = np.where(
        (df['CleanSurface'].notna()) & (df['CleanSurface'] > 0),
        df['NormalizedPrice'] / df['CleanSurface'],
        np.nan
    )
    
    # Property type from title
    def extract_property_type(title):
        """Extract property type from title"""
        if pd.isna(title):
            return "Unknown"
        
        title_lower = str(title).lower()
        if 'appartement' in title_lower:
            return 'Appartement'
        elif 'villa' in title_lower:
            return 'Villa'
        elif 'maison' in title_lower:
            return 'Maison'
        elif 'terrain' in title_lower:
            return 'Terrain'
        elif 'local' in title_lower:
            return 'Local'
        elif 'studio' in title_lower:
            return 'Studio'
        else:
            return 'Autre'
    
    df['PropertyType'] = df['Title'].apply(extract_property_type)
    
    # 12. Final data validation (minimal filtering)
    print("\n12. Final data validation...")
    
    # Only remove rows that are completely unusable (very minimal filtering)
    initial_count = len(df)
    
    # Keep rows that have at least price OR location information
    essential_data_mask = (
        (df['NormalizedPrice'].notna()) | 
        (df['Location'] != 'Unknown') | 
        (df['Wilaya'] != 'Unknown')
    )
    
    df = df[essential_data_mask]
    removed_count = initial_count - len(df)
    
    print(f"Removed {removed_count} completely unusable rows")
    print(f"Final cleaned dataset size: {len(df)} rows")
    
    # Fill any remaining critical missing values
    df['TransactionType'] = df['TransactionType'].fillna('SALE')
    df['NormalizedPrice'] = df['NormalizedPrice'].fillna(df['NormalizedPrice'].median())
    
    print(f"Dataset after final imputation: {len(df)} rows")
    
    # 10. Select and rename columns for final dataset
    final_columns = [
        'Title', 'TransactionType', 'NormalizedPrice', 'PricePerSqm',
        'Location', 'Wilaya', 'CleanDescription', 'CleanSurface', 'CleanRooms',
        'PropertyType', 'Category', 'Source', 'Date', 'Link', 'ImageURLs'
    ]
    
    df_final = df[final_columns].copy()
    df_final.columns = [
        'Title', 'TransactionType', 'Price', 'PricePerSqm',
        'Location', 'Wilaya', 'Description', 'Surface', 'Rooms',
        'PropertyType', 'Category', 'Source', 'Date', 'Link', 'ImageURLs'
    ]
    
    return df_final

def split_data_by_transaction_type(df):
    """
    Split data into sales and rental datasets
    """
    print("\nSplitting data by transaction type...")
    
    # Sales data
    df_sales = df[df['TransactionType'] == 'Vente'].copy()
    df_sales = df_sales.drop('TransactionType', axis=1)
    
    # Rental data
    df_rental = df[df['TransactionType'] == 'Location'].copy()
    df_rental = df_rental.drop('TransactionType', axis=1)
    
    print(f"Sales data: {len(df_sales)} rows")
    print(f"Rental data: {len(df_rental)} rows")
    
    return df_sales, df_rental

def main():
    """Main execution function"""
    print("Starting data cleaning process...")
    print("=" * 50)
    
    # Clean the data
    df_cleaned = clean_real_estate_data()
    
    # Split into sales and rental
    df_sales, df_rental = split_data_by_transaction_type(df_cleaned)
    
    # Save cleaned datasets
    print("\nSaving cleaned datasets...")
    
    # Create cleaned_data directory
    import os
    os.makedirs('cleaned_data', exist_ok=True)
    
    # Save full cleaned dataset
    df_cleaned.to_csv('cleaned_data/immobilier_cleaned_full.csv', index=False, encoding='utf-8')
    print("Saved: cleaned_data/immobilier_cleaned_full.csv")
    
    # Save sales dataset
    df_sales.to_csv('cleaned_data/immobilier_sales.csv', index=False, encoding='utf-8')
    print("Saved: cleaned_data/immobilier_sales.csv")
    
    # Save rental dataset
    df_rental.to_csv('cleaned_data/immobilier_rental.csv', index=False, encoding='utf-8')
    print("Saved: cleaned_data/immobilier_rental.csv")
    
    # Print summary statistics
    print("\n" + "=" * 50)
    print("CLEANING SUMMARY")
    print("=" * 50)
    
    print(f"Total cleaned records: {len(df_cleaned)}")
    print(f"Sales records: {len(df_sales)}")
    print(f"Rental records: {len(df_rental)}")
    
    print(f"\nPrice statistics (Sales):")
    print(f"Min: {df_sales['Price'].min():,.0f} DA")
    print(f"Max: {df_sales['Price'].max():,.0f} DA")
    print(f"Mean: {df_sales['Price'].mean():,.0f} DA")
    print(f"Median: {df_sales['Price'].median():,.0f} DA")
    
    print(f"\nPrice statistics (Rental):")
    print(f"Min: {df_rental['Price'].min():,.0f} DA")
    print(f"Max: {df_rental['Price'].max():,.0f} DA")
    print(f"Mean: {df_rental['Price'].mean():,.0f} DA")
    print(f"Median: {df_rental['Price'].median():,.0f} DA")
    
    print(f"\nTop 5 Wilayas (Sales):")
    print(df_sales['Wilaya'].value_counts().head())
    
    print(f"\nTop 5 Wilayas (Rental):")
    print(df_rental['Wilaya'].value_counts().head())
    
    print("\nData cleaning completed successfully!")

if __name__ == "__main__":
    main()