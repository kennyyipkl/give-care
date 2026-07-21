FROM python:3.11-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependency files
COPY backend/pyproject.toml backend/uv.lock ./backend/

# Install dependencies
RUN cd backend && uv sync --no-dev

# Copy application code
COPY backend/ ./backend/

# Set environment variables
ENV IS_PRODUCTION=false
ENV DATABASE_URL="sqlite+aiosqlite:///data/pyworkflow.db"

# Create data directory for SQLite
RUN mkdir -p /data

# Expose port
EXPOSE 8000

# Start backend
CMD cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT