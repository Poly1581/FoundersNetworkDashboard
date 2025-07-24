FROM python:3.14.0b3-slim AS base
WORKDIR /dashboard-backend
COPY ./requirements.txt .
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

FROM base AS test
WORKDIR /dashboard-backend
RUN ["python", "manage.py", "test"]


from test AS final
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
