from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.agent_routes import router as agent_router
from routes.call_routes import router as call_router
from routes.webhook_routes import router as webhook_router  # ✅ new import

app = FastAPI(title="AI Voice Agent Backend")

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(agent_router)
app.include_router(call_router)
app.include_router(webhook_router)

@app.get("/")
def root():
    return {"message": "AI Voice Agent Backend is running!"}
