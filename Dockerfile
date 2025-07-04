# Use an official Python runtime as a parent image
FROM python:3.13.3-slim-bookworm

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 8005 available to the world outside this container
EXPOSE 8005

# Run app.py when the container launches
# Use uvicorn to run the FastAPI application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8005"]
