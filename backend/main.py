from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.agent_routes import router as agent_router

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

@app.get("/")
def root():
    return {"message": "AI Voice Agent Backend is running!"}
