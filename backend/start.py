"""
SentinelAI Backend Startup Script
"""

import uvicorn

if __name__ == "__main__":
    print("Starting SentinelAI AI Threat Detection Backend...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, log_level="info", reload=True)
