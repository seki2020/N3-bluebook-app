from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from typing import Optional
import sqlite3
import json
import os
import csv
from datetime import datetime
from fastapi.templating import Jinja2Templates

app = FastAPI()

web_templates = Jinja2Templates("web/templates")

CONTACT_CSV_FILE = "data/contact_submissions.csv"

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("index.html", "r", encoding="utf-8") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content)

@app.post("/submit-contact")
async def submit_contact(email: str = Body(...), wechat: Optional[str] = Body(None)):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data = [timestamp, email, wechat]

    # Ensure the data directory exists
    os.makedirs(os.path.dirname(CONTACT_CSV_FILE), exist_ok=True)

    try:
        with open(CONTACT_CSV_FILE, 'a', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            # Write header if file is empty
            if csvfile.tell() == 0:
                writer.writerow(["Timestamp", "Email", "WeChat"])
            writer.writerow(data)
        print(f"Saved contact submission to {CONTACT_CSV_FILE}: {data}")
        return {"message": "Contact information received successfully!"}
    except Exception as e:
        print(f"Error saving contact submission: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save contact information: {e}")

@app.get("/quiz/{chNo}", response_class=HTMLResponse)
async def read_quiz(request: Request, chNo: int):
    try:
        with open(f"data/quiz/ch{chNo:02d}.json", "r", encoding="utf-8") as f:
            quiz_data = json.load(f)
        print(quiz_data)
        json_data_str = json.dumps(quiz_data, ensure_ascii=False)

        return web_templates.TemplateResponse(
            request=request, name="quiz.html", context={"chNo": f"{chNo:02d}", "quiz_data": json_data_str}
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Quiz data not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/data", StaticFiles(directory="data"), name="data")
app.mount("/web", StaticFiles(directory="web"), name="static")


@app.get("/chapters")
async def get_available_chapters():
    """
    Lists available chapter numbers by scanning the 'questions/' directory.
    """
    chapters = []
    try:
        for filename in os.listdir("questions"):
            if filename.startswith("ch") and filename.endswith(".json"):
                try:
                    chapter_num = int(filename[2:-5])  # Extract number from 'chXX.json'
                    chapters.append(chapter_num)
                except ValueError:
                    continue  # Skip files that don't match the pattern
        chapters.sort()
        return chapters
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Questions directory not found.")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred while listing chapters: {e}",
        )

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
