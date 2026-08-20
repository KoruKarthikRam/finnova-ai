# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="FinNova AI Microservice",
    description="Python FastAPI service handling data analysis, ML classification, and anomaly detection",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict to internal networks / backend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "FinNova AI Microservice",
        "version": "1.0.0"
    }

@app.post("/analyze")
def analyze_expenses():
    # Placeholder for Day 12
    return {"message": "Expense Analysis endpoint placeholder"}

@app.post("/classify")
def classify_transaction():
    # Placeholder for Day 13
    return {"message": "Auto-Expense Categorization endpoint placeholder"}

@app.post("/anomalies")
def detect_anomalies():
    # Placeholder for Day 14
    return {"message": "Anomaly Detection endpoint placeholder"}

@app.post("/forecast")
def forecast_expenses():
    # Placeholder for Day 15
    return {"message": "Expense Forecasting endpoint placeholder"}
