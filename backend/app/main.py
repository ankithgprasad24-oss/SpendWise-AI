from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.database import init_db
from app.services.expense_service import seed_sample_data_if_empty
from app.api.routes_health import router as health_router
from app.api.routes_expenses import router as expenses_router
from app.api.routes_insights import router as insights_router
from app.api.routes_ai import router as ai_router
from app.api.routes_budgets import router as budgets_router
from app.api.routes_savings import router as savings_router
from app.api.routes_currencies import router as currencies_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize SQLite schema & seed synthetic student data
    init_db()
    seed_sample_data_if_empty()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="SpendWise AI - Student Expense Intelligence & Financial Assistant Backend",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers with /api/v1 prefix
API_PREFIX = "/api/v1"
app.include_router(health_router, prefix=API_PREFIX)
app.include_router(expenses_router, prefix=API_PREFIX)
app.include_router(budgets_router, prefix=API_PREFIX)
app.include_router(savings_router, prefix=API_PREFIX)
app.include_router(insights_router, prefix=API_PREFIX)
app.include_router(ai_router, prefix=API_PREFIX)
app.include_router(currencies_router, prefix=API_PREFIX)


@app.get("/")
def root():
    return {
        "message": "SpendWise AI API is running",
        "documentation": "/docs",
        "health_check": f"{API_PREFIX}/health",
        "version": settings.APP_VERSION,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
