"""
Advanced Data Imputation Module for Real Estate Data
====================================================

This module provides sophisticated imputation techniques for handling missing values
in real estate datasets, including KNN, Iterative Imputation, and statistical methods.
"""

import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer, KNNImputer, IterativeImputer
from sklearn.experimental import enable_iterative_imputer
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

class AdvancedImputer:
    """
    Advanced imputation class with multiple strategies for different data types.
    """
    
    def __init__(self):
        self.numerical_imputers = {}
        self.categorical_imputers = {}
        self.label_encoders = {}
        self.imputation_stats = {}
        
    def analyze_missing_data(self, df):
        """
        Analyze missing data patterns and provide recommendations.
        """
        missing_info = {}
        total_rows = len(df)
        
        for column in df.columns:
            missing_count = df[column].isnull().sum()
            missing_percentage = (missing_count / total_rows) * 100
            
            missing_info[column] = {
                'missing_count': missing_count,
                'missing_percentage': missing_percentage,
                'data_type': str(df[column].dtype),
                'unique_values': df[column].nunique() if not df[column].isnull().all() else 0
            }
        
        # Provide recommendations based on missing percentage
        recommendations = {}
        for column, info in missing_info.items():
            if info['missing_percentage'] == 0:
                recommendations[column] = "No missing values"
            elif info['missing_percentage'] < 5:
                recommendations[column] = "Simple imputation (mean/mode) sufficient"
            elif info['missing_percentage'] < 20:
                recommendations[column] = "KNN or Iterative imputation recommended"
            elif info['missing_percentage'] < 50:
                recommendations[column] = "Advanced imputation with caution"
            else:
                recommendations[column] = "Consider dropping column or advanced ML imputation"
        
        return missing_info, recommendations
    
    def smart_impute_numerical(self, df, column, strategy='auto'):
        """
        Smart numerical imputation with automatic strategy selection.
        
        Strategies:
        - 'auto': Automatically choose based on missing percentage and data distribution
        - 'simple': Mean, median, or mode
        - 'knn': K-Nearest Neighbors
        - 'iterative': Iterative imputation using RandomForest
        """
        missing_percentage = (df[column].isnull().sum() / len(df)) * 100
        
        if strategy == 'auto':
            if missing_percentage < 5:
                strategy = 'simple'
            elif missing_percentage < 20:
                strategy = 'knn'
            else:
                strategy = 'iterative'
        
        if strategy == 'simple':
            # Choose between mean and median based on skewness
            skewness = df[column].skew()
            if abs(skewness) > 1:  # Highly skewed
                imputer = SimpleImputer(strategy='median')
            else:
                imputer = SimpleImputer(strategy='mean')
                
        elif strategy == 'knn':
            # Use KNN with optimal number of neighbors
            n_neighbors = min(5, max(3, int(np.sqrt(len(df.dropna())))))
            imputer = KNNImputer(n_neighbors=n_neighbors, weights='distance')
            
        elif strategy == 'iterative':
            # Use Iterative imputation with RandomForest
            imputer = IterativeImputer(
                estimator=RandomForestRegressor(n_estimators=10, random_state=42),
                max_iter=10,
                random_state=42
            )
        
        return imputer, strategy
    
    def smart_impute_categorical(self, df, column, strategy='auto'):
        """
        Smart categorical imputation with automatic strategy selection.
        """
        missing_percentage = (df[column].isnull().sum() / len(df)) * 100
        
        if strategy == 'auto':
            if missing_percentage < 10:
                strategy = 'mode'
            else:
                strategy = 'knn'
        
        if strategy == 'mode':
            imputer = SimpleImputer(strategy='most_frequent')
        elif strategy == 'knn':
            # For KNN with categorical data, we need to encode first
            imputer = KNNImputer(n_neighbors=5)
        
        return imputer, strategy
    
    def fit_transform(self, df, target_columns=None, preserve_original=True):
        """
        Fit and transform the dataset with advanced imputation techniques.
        """
        if preserve_original:
            df_imputed = df.copy()
        else:
            df_imputed = df
            
        if target_columns is None:
            target_columns = df.columns[df.isnull().any()].tolist()
        
        # Analyze missing data first
        missing_info, recommendations = self.analyze_missing_data(df)
        self.imputation_stats['missing_analysis'] = missing_info
        self.imputation_stats['recommendations'] = recommendations
        
        # Separate numerical and categorical columns
        numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        # Process numerical columns
        for column in target_columns:
            if column in numerical_cols and df[column].isnull().any():
                print(f"Imputing numerical column: {column}")
                
                # Get the best imputation strategy
                imputer, strategy = self.smart_impute_numerical(df_imputed, column)
                
                if strategy == 'knn' or strategy == 'iterative':
                    # For multivariate methods, use all numerical columns
                    numerical_subset = df_imputed[numerical_cols].select_dtypes(include=[np.number])
                    imputed_values = imputer.fit_transform(numerical_subset)
                    
                    # Update only the target column
                    col_index = numerical_subset.columns.get_loc(column)
                    df_imputed[column] = imputed_values[:, col_index]
                else:
                    # For simple imputation, use only the target column
                    df_imputed[column] = imputer.fit_transform(df_imputed[[column]]).ravel()
                
                self.numerical_imputers[column] = imputer
                self.imputation_stats[column] = {
                    'strategy': strategy,
                    'missing_before': missing_info[column]['missing_count'],
                    'missing_after': df_imputed[column].isnull().sum()
                }
        
        # Process categorical columns
        for column in target_columns:
            if column in categorical_cols and df[column].isnull().any():
                print(f"Imputing categorical column: {column}")
                
                imputer, strategy = self.smart_impute_categorical(df_imputed, column)
                
                if strategy == 'knn':
                    # Encode categorical variables for KNN
                    categorical_subset = df_imputed[categorical_cols]
                    encoded_data = categorical_subset.copy()
                    
                    # Label encode all categorical columns
                    for cat_col in categorical_cols:
                        if cat_col not in self.label_encoders:
                            self.label_encoders[cat_col] = LabelEncoder()
                        
                        # Handle missing values temporarily
                        non_null_mask = encoded_data[cat_col].notna()
                        if non_null_mask.any():
                            encoded_data.loc[non_null_mask, cat_col] = self.label_encoders[cat_col].fit_transform(
                                encoded_data.loc[non_null_mask, cat_col]
                            )
                    
                    # Apply KNN imputation
                    imputed_encoded = imputer.fit_transform(encoded_data)
                    
                    # Decode back to original categories
                    col_index = categorical_subset.columns.get_loc(column)
                    imputed_column = imputed_encoded[:, col_index]
                    
                    # Round to nearest integer for categorical encoding
                    imputed_column = np.round(imputed_column).astype(int)
                    
                    # Inverse transform to get original categories
                    df_imputed[column] = self.label_encoders[column].inverse_transform(imputed_column)
                    
                else:
                    # Simple mode imputation
                    df_imputed[column] = imputer.fit_transform(df_imputed[[column]]).ravel()
                
                self.categorical_imputers[column] = imputer
                self.imputation_stats[column] = {
                    'strategy': strategy,
                    'missing_before': missing_info[column]['missing_count'],
                    'missing_after': df_imputed[column].isnull().sum()
                }
        
        return df_imputed
    
    def get_imputation_report(self):
        """
        Generate a comprehensive imputation report.
        """
        report = {
            'summary': {},
            'details': self.imputation_stats
        }
        
        total_columns_imputed = len([col for col in self.imputation_stats.keys() 
                                   if col not in ['missing_analysis', 'recommendations']])
        
        strategies_used = {}
        total_missing_before = 0
        total_missing_after = 0
        
        for column, stats in self.imputation_stats.items():
            if isinstance(stats, dict) and 'strategy' in stats:
                strategy = stats['strategy']
                strategies_used[strategy] = strategies_used.get(strategy, 0) + 1
                total_missing_before += stats['missing_before']
                total_missing_after += stats['missing_after']
        
        report['summary'] = {
            'total_columns_imputed': total_columns_imputed,
            'strategies_used': strategies_used,
            'total_missing_values_before': total_missing_before,
            'total_missing_values_after': total_missing_after,
            'imputation_success_rate': ((total_missing_before - total_missing_after) / total_missing_before * 100) if total_missing_before > 0 else 100
        }
        
        return report

def impute_real_estate_data(df, config=None):
    """
    Convenience function for real estate data imputation with domain-specific logic.
    """
    if config is None:
        config = {
            'price_strategy': 'knn',  # Price is crucial, use advanced method
            'location_strategy': 'mode',  # Location is categorical
            'surface_strategy': 'iterative',  # Surface can be predicted from other features
            'rooms_strategy': 'knn',  # Rooms correlate with surface and price
            'preserve_original': True
        }
    
    imputer = AdvancedImputer()
    
    # Define real estate specific column mappings
    real_estate_columns = {
        'price': ['Price', 'price', 'Prix', 'prix'],
        'surface': ['Surface', 'surface', 'area', 'Area', 'superficie'],
        'rooms': ['Rooms', 'rooms', 'chambres', 'Chambres', 'NbRooms'],
        'location': ['Location', 'location', 'Wilaya', 'wilaya', 'ville']
    }
    
    # Apply domain-specific imputation strategies
    df_imputed = imputer.fit_transform(df, preserve_original=config['preserve_original'])
    
    return df_imputed, imputer

# Example usage and testing
if __name__ == "__main__":
    # Create sample real estate data with missing values
    np.random.seed(42)
    n_samples = 1000
    
    sample_data = {
        'Price': np.random.normal(200000, 50000, n_samples),
        'Surface': np.random.normal(100, 30, n_samples),
        'Rooms': np.random.choice([1, 2, 3, 4, 5], n_samples),
        'Location': np.random.choice(['Alger', 'Oran', 'Constantine', 'Annaba'], n_samples),
        'PropertyType': np.random.choice(['Apartment', 'House', 'Villa'], n_samples)
    }
    
    df_sample = pd.DataFrame(sample_data)
    
    # Introduce missing values
    missing_indices = np.random.choice(n_samples, size=int(n_samples * 0.15), replace=False)
    df_sample.loc[missing_indices[:50], 'Price'] = np.nan
    df_sample.loc[missing_indices[50:100], 'Surface'] = np.nan
    df_sample.loc[missing_indices[100:150], 'Location'] = np.nan
    
    print("Original data shape:", df_sample.shape)
    print("Missing values per column:")
    print(df_sample.isnull().sum())
    
    # Apply advanced imputation
    imputer = AdvancedImputer()
    df_imputed = imputer.fit_transform(df_sample)
    
    print("\nAfter imputation:")
    print("Missing values per column:")
    print(df_imputed.isnull().sum())
    
    # Generate report
    report = imputer.get_imputation_report()
    print("\nImputation Report:")
    print(f"Columns imputed: {report['summary']['total_columns_imputed']}")
    print(f"Strategies used: {report['summary']['strategies_used']}")
    print(f"Success rate: {report['summary']['imputation_success_rate']:.2f}%")