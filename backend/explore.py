import pandas as pd

df = pd.read_csv("Heart_csv.csv", sep=";")


print("Shape (rows, columns):", df.shape)
print("\nColumn names:", df.columns.tolist())
print("\nFirst 5 rows:")
print(df.head())
print("\nMissing values per column:")
print(df.isnull().sum())
print("\nBasic statistics:")
print(df.describe())