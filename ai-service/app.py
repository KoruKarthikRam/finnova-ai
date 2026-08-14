from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="FinNova AI Service",
    description="Python Analytics and Machine Learning Microservice for FinNova AI",
    version="1.0.0"
)

# Enable CORS for frontend and backend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
def analyze_expenses():
    return {"success": True, "message": "Expense Analysis endpoint placeholder"}

@app.post("/classify")
def classify_transaction():
    return {"success": True, "message": "Auto-Expense Categorization endpoint placeholder"}

@app.post("/anomalies")
def detect_anomalies():
    return {"success": True, "message": "Anomaly Detection endpoint placeholder"}

@app.post("/forecast")
def forecast_expenses():
    return {"success": True, "message": "Expense Forecasting endpoint placeholder"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
