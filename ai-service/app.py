# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
# pyrefly: ignore [missing-import]
import pandas as pd
# pyrefly: ignore [missing-import]
import numpy as np

# pyrefly: ignore [missing-import]
from sklearn.feature_extraction.text import TfidfVectorizer
# pyrefly: ignore [missing-import]
from sklearn.naive_bayes import MultinomialNB
# pyrefly: ignore [missing-import]
from sklearn.pipeline import Pipeline

# Seed Training Data for Indian Merchants/Context
training_data = [
    # Food
    ("Zomato food delivery", "Food"),
    ("Swiggy order", "Food"),
    ("Dominos pizza", "Food"),
    ("McDonalds burger", "Food"),
    ("KFC chicken", "Food"),
    ("Dinner at restaurant", "Food"),
    ("Lunch at cafe", "Food"),
    ("Chai point tea", "Food"),
    ("Starbucks coffee", "Food"),
    ("Burger King meal", "Food"),
    ("Pizza Hut delivery", "Food"),
    ("Dhaba dinner", "Food"),
    ("Grocery supermarket bill", "Food"),
    ("Food court mall", "Food"),
    ("Swiggy Instamart groceries", "Food"),
    ("Blinkit grocery delivery", "Food"),
    ("Zepto grocery delivery", "Food"),
    
    # Transport
    ("Uber ride payment", "Transport"),
    ("Ola cab booking", "Transport"),
    ("Petrol pump fuel fill", "Transport"),
    ("Diesel for car", "Transport"),
    ("Metro card recharge", "Transport"),
    ("Auto rickshaw fare", "Transport"),
    ("Bus ticket fare", "Transport"),
    ("Train ticket booking IRCTC", "Transport"),
    ("Flight booking ticket", "Transport"),
    ("Toll plaza tax", "Transport"),
    ("Parking charges mall", "Transport"),
    ("Rapido bike taxi ride", "Transport"),
    ("Shell petrol station", "Transport"),
    
    # Rent
    ("House rent monthly", "Rent"),
    ("Flat owner rent", "Rent"),
    ("Apartment maintenance rent", "Rent"),
    ("PG rent accommodation", "Rent"),
    ("Office desk rent", "Rent"),
    ("Landlord monthly transfer", "Rent"),
    ("Brokerage fee flat", "Rent"),
    ("Security deposit rent", "Rent"),

    # Shopping
    ("Amazon purchase online", "Shopping"),
    ("Myntra clothing purchase", "Shopping"),
    ("Flipkart shopping order", "Shopping"),
    ("Ajio shoes retail", "Shopping"),
    ("Zara outlet clothes", "Shopping"),
    ("H&M dress shopping", "Shopping"),
    ("Decathlon sports gear", "Shopping"),
    ("Mall shopping clothes", "Shopping"),
    ("Electronics gadget Amazon", "Shopping"),
    ("Superdry jacket purchase", "Shopping"),
    ("Sneakers shoes buying", "Shopping"),
    ("Nykaa cosmetics beauty", "Shopping"),

    # Bills
    ("Electricity board payment", "Bills"),
    ("Wifi internet broadband bill", "Bills"),
    ("Gas cylinder booking Indane", "Bills"),
    ("Water tax utility payment", "Bills"),
    ("Airtel mobile recharge prepaid", "Bills"),
    ("Jio fiber internet bill", "Bills"),
    ("DTH TV subscription recharge", "Bills"),
    ("Tata Play subscription bill", "Bills"),
    ("Mobile bill postpaid Vodafone", "Bills"),
    ("Pipelines gas bill", "Bills"),

    # Entertainment
    ("Netflix monthly subscription", "Entertainment"),
    ("Spotify premium music plans", "Entertainment"),
    ("BookMyShow movie ticket", "Entertainment"),
    ("PVR cinema tickets popcorn", "Entertainment"),
    ("Hotstar premium subscription", "Entertainment"),
    ("Steam game purchase wallet", "Entertainment"),
    ("Gaming zone tickets", "Entertainment"),
    ("YouTube Premium monthly", "Entertainment"),
    ("PlayStation store purchases", "Entertainment"),
    ("Concert tickets booking", "Entertainment"),
    ("Amusement park entry fee", "Entertainment"),

    # Healthcare
    ("Apollo Pharmacy medicines", "Healthcare"),
    ("Hospital doctor consultation", "Healthcare"),
    ("Blood test laboratory diagnostic", "Healthcare"),
    ("Dentist clinic checkup", "Healthcare"),
    ("Medplus pharmacy prescription", "Healthcare"),
    ("Eye clinic spectacles", "Healthcare"),
    ("Health insurance premium", "Healthcare"),
    ("Physiotherapy sessions clinic", "Healthcare"),

    # Education
    ("Udemy online course purchase", "Education"),
    ("Coursera certificate program", "Education"),
    ("School term fees children", "Education"),
    ("College admission semester fee", "Education"),
    ("Textbooks bookstore purchase", "Education"),
    ("Stationery notebooks school", "Education"),
    ("Tuition classes monthly fee", "Education"),
    ("Exam registration fee", "Education"),

    # Others
    ("Cash withdrawal ATM", "Others"),
    ("Sent money to friend", "Others"),
    ("Gave cash to maid", "Others"),
    ("Laundry dry cleaning dryclean", "Others"),
    ("Gift card purchase gift", "Others"),
    ("Local general store shop", "Others"),
    ("Donation temple charity", "Others")
]

# Train the Text Classification Pipeline on Startup
descriptions = [item[0] for item in training_data]
categories = [item[1] for item in training_data]

pipeline = Pipeline([
    ('vectorizer', TfidfVectorizer(ngram_range=(1, 2), lowercase=True, stop_words='english')),
    ('classifier', MultinomialNB(alpha=0.1))
])
pipeline.fit(descriptions, categories)

app = FastAPI(
    title="FinNova AI Service",
    description="Python Analytics and Machine Learning Microservice for FinNova AI",
    version="1.0.0"
)

# Enable CORS for frontend and backend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials = True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TransactionItem(BaseModel):
    id: Optional[str] = None
    amount: float
    category: str
    type: str
    date: str
    description: Optional[str] = ""

class AnalysisRequest(BaseModel):
    transactions: List[TransactionItem]

@app.get("/")
def read_root():
    return {
        "success": True,
        "message": "FinNova AI FastAPI Service is running successfully!"
    }

@app.get("/health")
def health_check():
    return {
        "success": True,
        "status": "healthy"
    }

@app.post("/analyze")
def analyze_expenses(payload: AnalysisRequest):
    transactions = payload.transactions
    if not transactions:
        return {
            "success": True,
            "data": {
                "daily_average": 0.0,
                "top_category": {"category": "None", "amount": 0.0},
                "mom_trend": 0.0,
                "essential_ratio": 0.0,
                "non_essential_ratio": 0.0,
                "total_expense": 0.0
            }
        }

    # Load into Pandas DataFrame
    data = [t.model_dump() for t in transactions]
    df = pd.DataFrame(data)

    # Filter to expenses
    df_expenses = df[df["type"] == "expense"].copy()
    if df_expenses.empty:
        return {
            "success": True,
            "data": {
                "daily_average": 0.0,
                "top_category": {"category": "None", "amount": 0.0},
                "mom_trend": 0.0,
                "essential_ratio": 0.0,
                "non_essential_ratio": 0.0,
                "total_expense": 0.0
            }
        }

    # 1. Parse dates and calculate Daily Average
    df_expenses["date_parsed"] = pd.to_datetime(df_expenses["date"], errors="coerce")
    total_expense = float(df_expenses["amount"].sum())
    unique_days = int(df_expenses["date_parsed"].dt.date.nunique())
    daily_average = total_expense / max(1, unique_days)

    # 2. Top Spending Category
    category_sums = df_expenses.groupby("category")["amount"].sum()
    top_category_name = str(category_sums.idxmax())
    top_category_amount = float(category_sums.max())

    # 3. Month-over-Month (MoM) Trend
    # Group by calendar month
    df_expenses["year_month"] = df_expenses["date_parsed"].dt.to_period("M")
    monthly_expenses = df_expenses.groupby("year_month")["amount"].sum().sort_index()
    
    mom_trend = 0.0
    if len(monthly_expenses) >= 1:
        latest_period = monthly_expenses.index[-1]
        current_month_spending = float(monthly_expenses[latest_period])
        
        # Check if there is a previous month present
        prev_period = latest_period - 1
        if prev_period in monthly_expenses.index:
            prev_month_spending = float(monthly_expenses[prev_period])
            if prev_month_spending > 0:
                mom_trend = ((current_month_spending - prev_month_spending) / prev_month_spending) * 100
        else:
            mom_trend = 0.0

    # 4. Essential vs. Non-essential Classification
    non_essential_cats = {"shopping", "entertainment", "others", "gift", "travel", "restaurant", "leisure"}
    df_expenses["is_essential"] = ~df_expenses["category"].str.lower().str.strip().isin(non_essential_cats)
    
    essential_total = float(df_expenses[df_expenses["is_essential"]]["amount"].sum())
    non_essential_total = float(df_expenses[~df_expenses["is_essential"]]["amount"].sum())
    
    essential_ratio = (essential_total / total_expense * 100) if total_expense > 0 else 0.0
    non_essential_ratio = (non_essential_total / total_expense * 100) if total_expense > 0 else 0.0

    return {
        "success": True,
        "data": {
            "daily_average": round(daily_average, 2),
            "top_category": {
                "category": top_category_name,
                "amount": round(top_category_amount, 2)
            },
            "mom_trend": round(mom_trend, 2),
            "essential_ratio": round(essential_ratio, 2),
            "non_essential_ratio": round(non_essential_ratio, 2),
            "total_expense": round(total_expense, 2)
        }
    }

class ClassifyRequest(BaseModel):
    description: str

@app.post("/classify")
def classify_transaction(payload: ClassifyRequest):
    desc = payload.description.strip()
    if not desc:
        return {
            "success": True,
            "category": "Others",
            "confidence": 1.0
        }
    
    # Predict category
    predicted = pipeline.predict([desc])[0]
    
    # Get confidence
    probs = pipeline.predict_proba([desc])[0]
    max_idx = np.argmax(probs)
    confidence = float(probs[max_idx])
    
    return {
        "success": True,
        "category": str(predicted),
        "confidence": round(confidence, 2)
    }


from sklearn.ensemble import IsolationForest

class AnomalyRequest(BaseModel):
    transactions: List[TransactionItem]

@app.post("/anomalies")
def detect_anomalies(payload: AnomalyRequest):
    transactions = payload.transactions
    if not transactions:
        return {"success": True, "anomalies": []}

    # Load into Pandas DataFrame
    data = [t.model_dump() for t in transactions]
    df = pd.DataFrame(data)

    # Filter to expenses only
    df_expenses = df[df["type"] == "expense"].copy()
    
    # Check if there are at least 5 expenses
    if len(df_expenses) < 5:
        return {"success": True, "anomalies": []}

    # Safeguard: if all amounts are identical, Isolation Forest cannot run
    if df_expenses["amount"].nunique() <= 1:
        return {"success": True, "anomalies": []}

    try:
        # Prepare features: one-hot encode the category and include the amount
        X = pd.get_dummies(df_expenses[["category"]], dtype=float)
        X["amount"] = df_expenses["amount"].astype(float)

        # Train Isolation Forest (flag top 5% as outliers)
        clf = IsolationForest(contamination=0.05, random_state=42)
        preds = clf.fit_predict(X)

        # Outliers are predicted as -1
        df_expenses["is_anomaly"] = (preds == -1)

        # Extract anomalous transactions
        anomalies_df = df_expenses[df_expenses["is_anomaly"]]
        anomalies_list = []
        for _, row in anomalies_df.iterrows():
            anomalies_list.append({
                "id": row.get("id"),
                "amount": float(row["amount"]),
                "category": row["category"],
                "date": row["date"],
                "description": row["description"],
                "reason": "This transaction amount is unusually high or outlier compared to your other expenses."
            })

        return {
            "success": True,
            "anomalies": anomalies_list
        }
    except Exception as e:
        print("Anomaly detection failed:", str(e))
        return {
            "success": False,
            "error": str(e),
            "anomalies": []
        }

@app.post("/forecast")
def forecast_expenses():
    return {"success": True, "message": "Expense Forecasting endpoint placeholder"}

if __name__ == "__main__":
    # pyrefly: ignore [missing-import]
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
