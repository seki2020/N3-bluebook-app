from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from typing import Optional
import sqlite3
import json
import os

app = FastAPI()

@app.get("/")
async def read_root():
    """Serves the index.html file from the root directory."""
    return FileResponse("index.html")

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/questions", StaticFiles(directory="questions"), name="questions")

DATABASE_NAME = 'grammar.db'

def get_db_connection():
    """Establishes a connection to the SQLite database."""
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row  # This allows accessing columns by name
    return conn

@app.get("/grammar_rules")
async def get_all_grammar_rules():
    """Fetches all grammar rules from the database."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM grammar_rules")
        rules = cursor.fetchall()
        
        # Convert rows to a list of dictionaries, handling JSON fields
        result = []
        for row in rules:
            rule_dict = dict(row)
            # Deserialize JSON strings back to Python objects
            for key in ['sub_patterns', 'notes', 'meaning_notes']:
                if rule_dict.get(key):
                    try:
                        rule_dict[key] = json.loads(rule_dict[key])
                    except json.JSONDecodeError:
                        rule_dict[key] = None # Handle potential decoding errors
            result.append(rule_dict)
        return result
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        if conn:
            conn.close()

@app.get("/grammar_rules/chapter/{chapter}")
async def get_grammar_rules_by_chapter(chapter: int):
    """Fetches grammar rules for a specific chapter from the database."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM grammar_rules WHERE chapter = ?"
        cursor.execute(query, (chapter,))
        rules = cursor.fetchall()
        
        # Convert rows to a list of dictionaries, handling JSON fields
        result = []
        for row in rules:
            rule_dict = dict(row)
            # Deserialize JSON strings back to Python objects
            for key in ['sub_patterns', 'notes', 'meaning_notes']:
                if rule_dict.get(key):
                    try:
                        rule_dict[key] = json.loads(rule_dict[key])
                    except json.JSONDecodeError:
                        rule_dict[key] = None # Handle potential decoding errors
            result.append(rule_dict)
        return result
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        if conn:
            conn.close()

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
                    chapter_num = int(filename[2:-5]) # Extract number from 'chXX.json'
                    chapters.append(chapter_num)
                except ValueError:
                    continue # Skip files that don't match the pattern
        chapters.sort()
        return chapters
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Questions directory not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while listing chapters: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
