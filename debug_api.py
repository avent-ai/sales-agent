import json
import os
import traceback
from typing import Optional

import uvicorn
from fastapi import FastAPI, Query, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Initialize FastAPI app
app = FastAPI()

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def say_hello():
    return {"message": "Hello World"}

class MessageList(BaseModel):
    session_id: str
    human_say: str

@app.post("/chat")
async def chat_with_sales_agent(req: MessageList, stream: bool = Query(False), authorization: Optional[str] = Header(None)):
    """
    Simple debug version of the chat endpoint
    """
    try:
        # Just echo back the request for now
        return {
            "response": f"You said: {req.human_say}",
            "bot_name": "Debug Bot",
            "conversational_stage": "Testing",
        }
    except Exception as e:
        # Capture and return the full error for debugging
        error_details = {
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print("Error in chat endpoint:", error_details)
        return JSONResponse(status_code=500, content=error_details)

# Main entry point
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8002)