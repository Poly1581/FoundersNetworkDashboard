# Use python base image
FROM python:3.14.0b3-slim

# Create directory
RUN mkdir /dashboard-backend

# Set workdir
WORKDIR /app

# Copy dependencies
COPY ./requirements.txt .

# Don't write pyc files to disk
ENV PYTHONDONTWRITEBYTECODE=1

# Don't buffer outputs
ENV PYTHONUNBUFFERED=1

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port
EXPOSE 8000

# Start server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
