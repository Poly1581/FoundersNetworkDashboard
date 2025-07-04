# Use python base image
FROM python:3.14.0b3-slim

# Create directory
RUN mkdir /dashboard-backend

# Set workdir
WORKDIR /dashboard-backend

# Copy project files
COPY . /dashboard-backend

# Don't write pyc files to disk
ENV PYTHONDONTWRITEBYTECODE=1

# Don't buffer outputs
ENV PYTHONUNBUFFERED=1

# Indstall dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

# Start server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
