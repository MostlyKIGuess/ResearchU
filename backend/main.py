import uvicorn
from src.api.app import create_app
from src.api.routes import router
from src.utils.logging import setup_logging

app = create_app()
app.include_router(router)
setup_logging()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
