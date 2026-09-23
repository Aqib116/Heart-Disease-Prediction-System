import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import joblib
import json 

df = pd.read_csv("Heart_csv.csv")

print("Before cleaning:", df.shape)



# Data prepare

df = df[(df['ap_hi'] >= 60) & (df['ap_hi'] <= 250)]
df = df[(df['ap_lo'] >= 40) & (df['ap_lo'] <= 180)]


df = df[(df['height'] >= 100) & (df['height'] <= 250)]
df = df[(df['weight'] >= 20) & (df['weight'] <= 300)]


df = df[df['ap_hi'] >= df['ap_lo']]

print("After cleaning:", df.shape)


#Days to Years
df['age_years'] = (df['age'] / 365).astype(int)


# BMI (Body Mass Index) calculate 
df['bmi'] = df['weight'] / ((df['height'] / 100) ** 2)

df = df[(df['bmi'] >= 12) & (df['bmi'] <= 60)]

print("\nAfter BMI cleaning:", df.shape)
print(df['bmi'].describe())



print(df[['age', 'age_years', 'height', 'weight', 'bmi']].head())





# Features (X) Model Inputs
feature_cols = ['age_years', 'gender', 'height', 'weight', 'ap_hi', 'ap_lo',
                 'cholesterol', 'gluc', 'smoke', 'alco', 'active', 'bmi']
X = df[feature_cols]

# Target (y) Model Predictions
y = df['cardio']



X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("Training set size:", X_train.shape)
print("Testing set size:", X_test.shape)






# testing
def evaluate_model(name, y_true, y_pred):
    print(f"\n{'='*40}")
    print(f"{name}")
    print('='*40)
    acc = accuracy_score(y_true, y_pred)
    print(f"Accuracy: {acc * 100:.2f}%")
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_true, y_pred))
    print("\nClassification Report:")
    print(classification_report(y_true, y_pred))
    return acc






# Random Forest 
rf_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
rf_model.fit(X_train, y_train)
rf_acc = evaluate_model("Random Forest", y_test, rf_model.predict(X_test))
joblib.dump(rf_model, 'model_random_forest.joblib')

# Logistic Regression 
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

lr_model = LogisticRegression(max_iter=1000)
lr_model.fit(X_train_scaled, y_train)
lr_acc = evaluate_model("Logistic Regression", y_test, lr_model.predict(X_test_scaled))
joblib.dump(lr_model, 'model_logistic.joblib')
joblib.dump(scaler, 'scaler_logistic.joblib')

# Decision Tree 
dt_model = DecisionTreeClassifier(max_depth=10, random_state=42)
dt_model.fit(X_train, y_train)
dt_acc = evaluate_model("Decision Tree", y_test, dt_model.predict(X_test))
joblib.dump(dt_model, 'model_decision_tree.joblib')

# SVM 
sample_size = 8000
svm_model = SVC(kernel='rbf', probability=True)
svm_model.fit(X_train_scaled[:sample_size], y_train[:sample_size])
svm_acc = evaluate_model("SVM", y_test, svm_model.predict(X_test_scaled))
joblib.dump(svm_model, 'model_svm.joblib')



# Comparison Summary

print("\n" + "="*40)
print("SUMMARY — All Models Compared")
print("="*40)
print(f"Random Forest:        {rf_acc*100:.2f}%")
print(f"Logistic Regression:  {lr_acc*100:.2f}%")
print(f"Decision Tree:        {dt_acc*100:.2f}%")
print(f"SVM:                  {svm_acc*100:.2f}%")


metrics = {
    "random_forest": round(rf_acc * 100, 2),
    "logistic": round(lr_acc * 100, 2),
    "decision_tree": round(dt_acc * 100, 2),
    "svm": round(svm_acc * 100, 2),
}

with open("model_metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

print("\nMetrics saved to model_metrics.json:", metrics)