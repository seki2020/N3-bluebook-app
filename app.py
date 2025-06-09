from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import sqlite3
import json
import os
import csv
from datetime import datetime

app = FastAPI()

CONTACT_CSV_FILE = "data/contact_submissions.csv"

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["creatorlens.asia", "http://127.0.0.1:9001", "http://localhost:9001"], # Added localhost:5173 for Vite dev server
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_status():
    return {"status": "online"}


@app.post("/submit-contact")
async def submit_contact(email: str = Body(...), wechat: Optional[str] = Body(None)):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data = [timestamp, email, wechat]

    # Ensure the data directory exists
    os.makedirs(os.path.dirname(CONTACT_CSV_FILE), exist_ok=True)

    try:
        with open(CONTACT_CSV_FILE, "a", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)
            # Write header if file is empty
            if csvfile.tell() == 0:
                writer.writerow(["Timestamp", "Email", "WeChat"])
            writer.writerow(data)
        print(f"Saved contact submission to {CONTACT_CSV_FILE}: {data}")
        return {"message": "Contact information received successfully!"}
    except Exception as e:
        print(f"Error saving contact submission: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to save contact information: {e}"
        )


@app.get("/quiz")
@app.get("/quiz/{chNo}")
async def read_quiz(chNo: Optional[int] = None):
    try:
        if chNo is None:
            all_quizzes = []
            quiz_dir = "data/quiz"
            if not os.path.exists(quiz_dir):
                raise HTTPException(status_code=404, detail="Quiz data directory not found.")
            for filename in os.listdir(quiz_dir):
                if filename.endswith(".json"):
                    try:
                        with open(os.path.join(quiz_dir, filename), "r", encoding="utf-8") as f:
                            quiz_data = json.load(f)
                            all_quizzes.append(quiz_data)
                    except Exception as e:
                        print(f"Error loading quiz file {filename}: {e}")
                        continue
            return all_quizzes
        else:
            with open(f"data/quiz/{chNo}.json", "r", encoding="utf-8") as f:
                quiz_data = json.load(f)
            return quiz_data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Quiz data not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")


@app.get("/chapters")
@app.get("/chapters/{chapterNo}")
async def get_available_chapters(chapterNo: Optional[int] = None):
    try:
        if chapterNo is None:
            all_chapters_data = []
            grammers_dir = "data/grammers"
            if not os.path.exists(grammers_dir):
                raise HTTPException(status_code=404, detail="Grammar data directory not found.")
            for filename in os.listdir(grammers_dir):
                if filename.endswith(".json"):
                    try:
                        with open(os.path.join(grammers_dir, filename), "r", encoding="utf-8") as f:
                            chapter_data = json.load(f)
                            all_chapters_data.append(chapter_data)
                    except Exception as e:
                        print(f"Error loading chapter file {filename}: {e}")
                        continue
            return all_chapters_data
        else:
            with open(f"data/grammers/{chapterNo}.json", "r", encoding="utf-8") as f:
                chapter_data = json.load(f)
            return chapter_data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Chapter data not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8005)
