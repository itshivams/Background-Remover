import io
from typing import Optional, Literal

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from PIL import Image, ImageColor
from rembg import remove
from rembg.session_factory import new_session

import os
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]

app = FastAPI(title="Local Background Remover API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSION = new_session("u2net")

@app.get("/health")
async def health():
    return {"status": "ok"}

def _to_rgba(img: Image.Image) -> Image.Image:
    if img.mode != "RGBA":
        return img.convert("RGBA")
    return img

def _cover_resize(bg: Image.Image, target_w: int, target_h: int) -> Image.Image:
    # Resize background to cover target size, then center-crop.
    w, h = bg.size
    scale = max(target_w / w, target_h / h)
    new_w, new_h = int(w * scale), int(h * scale)
    resized = bg.resize((new_w, new_h), Image.LANCZOS)
    left = max(0, (new_w - target_w) // 2)
    top = max(0, (new_h - target_h) // 2)
    return resized.crop((left, top, left + target_w, top + target_h))

@app.post("/process")
async def process_image(
    image: UploadFile = File(..., description="Main image to remove background"),
    background_mode: Literal["transparent", "color", "image"] = Form("transparent"),
    color: str = Form("#FFFFFF"),
    background_image: Optional[UploadFile] = File(None, description="Optional background image"),
):
    try:
        img_bytes = await image.read()
        src = Image.open(io.BytesIO(img_bytes))
        src = _to_rgba(src)

        cutout = remove(src, session=SESSION)
        cutout = _to_rgba(cutout)

        if background_mode == "transparent":
            result = cutout
        elif background_mode == "color":
            try:
                rgb = ImageColor.getrgb(color)
            except ValueError:
                return JSONResponse({"error": "Invalid color value"}, status_code=400)
            bg = Image.new("RGBA", cutout.size, (*rgb, 255))
            bg.alpha_composite(cutout)
            result = bg
        elif background_mode == "image":
            if background_image is None:
                return JSONResponse({"error": "background_image is required for mode=image"}, status_code=400)
            bg_bytes = await background_image.read()
            bg = Image.open(io.BytesIO(bg_bytes))
            bg = _to_rgba(bg)
            bg_fitted = _cover_resize(bg, *cutout.size)
            bg_fitted.alpha_composite(cutout)
            result = bg_fitted
        else:
            result = cutout

        buf = io.BytesIO()
        result.save(buf, format="PNG")
        buf.seek(0)
        return Response(content=buf.getvalue(), media_type="image/png")
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
