# check=error=true

FROM python:3.14.0b3-slim AS base
WORKDIR /dashboard-backend
COPY ./requirements.txt .
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

FROM base AS test
WORKDIR /dashboard-backend
EXPOSE 8000
RUN ["python", "manage.py", "test", "--parallel"]


FROM test AS final
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
