import pytest
from fastapi.testclient import TestClient
from app import app
import app as main_app # Import app as main_app to access its global variables
import os
import csv
import json

# Define the path to the dummy quiz data for testing
TEST_QUIZ_DATA_DIR = "data/quiz"
TEST_CONTACT_CSV_FILE = "data/test_contact_submissions.csv"

@pytest.fixture(scope="module", autouse=True)
def setup_and_teardown_quiz_data():
    """
    Sets up dummy quiz data for testing and cleans up afterwards.
    """
    # Ensure the test quiz data directory exists
    os.makedirs(TEST_QUIZ_DATA_DIR, exist_ok=True)

    # Create dummy quiz files
    dummy_quiz_ch01 = [{"question": "Q1", "answer": "A1"}]
    dummy_quiz_ch02 = [{"question": "Q2", "answer": "A2"}]
    dummy_quiz_ch03 = [{"question": "Q3", "answer": "A3"}]

    with open(os.path.join(TEST_QUIZ_DATA_DIR, "ch01.json"), "w", encoding="utf-8") as f:
        json.dump(dummy_quiz_ch01, f)
    with open(os.path.join(TEST_QUIZ_DATA_DIR, "ch02.json"), "w", encoding="utf-8") as f:
        json.dump(dummy_quiz_ch02, f)
    with open(os.path.join(TEST_QUIZ_DATA_DIR, "ch03.json"), "w", encoding="utf-8") as f:
        json.dump(dummy_quiz_ch03, f)

    yield

    # Clean up dummy quiz files
    os.remove(os.path.join(TEST_QUIZ_DATA_DIR, "ch01.json"))
    os.remove(os.path.join(TEST_QUIZ_DATA_DIR, "ch02.json"))
    os.remove(os.path.join(TEST_QUIZ_DATA_DIR, "ch03.json"))
    # Optionally remove the directory if it's empty
    if not os.listdir(TEST_QUIZ_DATA_DIR):
        os.rmdir(TEST_QUIZ_DATA_DIR)

@pytest.fixture(scope="module", autouse=True)
def setup_and_teardown_contact_csv():
    """
    Sets up a dummy contact CSV file for testing and cleans up afterwards.
    """
    # Temporarily change the CONTACT_CSV_FILE path for testing
    original_contact_csv_file = main_app.CONTACT_CSV_FILE
    main_app.CONTACT_CSV_FILE = TEST_CONTACT_CSV_FILE

    yield

    # Clean up the dummy CSV file
    if os.path.exists(TEST_CONTACT_CSV_FILE):
        os.remove(TEST_CONTACT_CSV_FILE)
    
    # Restore the original CONTACT_CSV_FILE path
    main_app.CONTACT_CSV_FILE = original_contact_csv_file


client = TestClient(app)

def test_read_status():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "online"}

def test_submit_contact():
    response = client.post("/submit-contact", json={"email": "test@example.com", "wechat": "testwechat"})
    assert response.status_code == 200
    assert response.json() == {"message": "Contact information received successfully!"}

    # Verify content of the CSV file
    with open(TEST_CONTACT_CSV_FILE, "r", newline="", encoding="utf-8") as csvfile:
        reader = csv.reader(csvfile)
        rows = list(reader)
        assert len(rows) == 2  # Header + one data row
        assert rows[0] == ["Timestamp", "Email", "WeChat"]
        assert rows[1][1] == "test@example.com"
        assert rows[1][2] == "testwechat"

def test_read_quiz_success():
    response = client.get("/quiz/1")
    assert response.status_code == 200
    assert response.json() == [{"question": "Q1", "answer": "A1"}]

def test_read_quiz_not_found():
    response = client.get("/quiz/99")
    assert response.status_code == 404
    assert response.json() == {"detail": "Quiz data not found."}

def test_get_available_chapters_all():
    response = client.get("/chapters/0")
    assert response.status_code == 200
    assert response.json() == list(range(1, 21)) # Based on dummy data and existing files (ch01.json to ch20.json)

def test_get_available_chapters_specific_success():
    response = client.get("/chapters/1")
    assert response.status_code == 200
    assert response.json() == [{"question": "Q1", "answer": "A1"}]

def test_get_available_chapters_specific_not_found():
    response = client.get("/chapters/99")
    assert response.status_code == 404
    assert response.json() == {"detail": "Chapter data not found."}
