from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn
import json
import sys
import os

# Import calculation functions from calculator.py
sys.path.append(os.path.dirname(__file__))
from calculator import create_baseline_projection, create_education_projection, create_job_projection, create_military_projection

app = FastAPI()

@app.post("/api/calculate/financial-projection")
async def calculate_baseline(request: Request):
    try:
        input_data = await request.json()
        result = create_baseline_projection(input_data)
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/api/calculate/education-projection")
async def calculate_education(request: Request):
    try:
        body = await request.json()
        input_data = body.get("input_data", {})
        college_id = body.get("college_id")
        occupation_id = body.get("occupation_id")
        if not college_id or not occupation_id:
            return JSONResponse(content={"error": "college_id and occupation_id are required"}, status_code=400)
        result = create_education_projection(input_data, college_id, occupation_id)
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/api/calculate/job-projection")
async def calculate_job(request: Request):
    try:
        body = await request.json()
        input_data = body.get("input_data", {})
        occupation_id = body.get("occupation_id")
        if not occupation_id:
            return JSONResponse(content={"error": "occupation_id is required"}, status_code=400)
        result = create_job_projection(input_data, occupation_id)
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/api/calculate/military-projection")
async def calculate_military(request: Request):
    try:
        body = await request.json()
        input_data = body.get("input_data", {})
        branch = body.get("branch")
        occupation_id = body.get("occupation_id")
        if not branch:
            return JSONResponse(content={"error": "branch is required"}, status_code=400)
        result = create_military_projection(input_data, branch, occupation_id)
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000) 