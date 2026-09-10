import os
import uuid
import shutil
from typing import List
from fastapi import APIRouter, File, UploadFile, HTTPException, Request
from app.core.response import api_response

router = APIRouter(prefix="/upload", tags=["Uploads"])

# Path to backend uploads folder
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)


@router.post("/file")
async def upload_single_file(request: Request, file: UploadFile = File(...)):
    """
    Upload a single file (image, catalog PDF, document) to local storage.
    Returns public file URL.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    ext = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOADS_DIR, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    base_url = str(request.base_url).rstrip("/")
    file_url = f"{base_url}/uploads/{unique_filename}"

    return api_response(
        data={
            "url": file_url,
            "filename": file.filename,
            "saved_name": unique_filename,
            "file_type": ext.lstrip("."),
        },
        message="File uploaded successfully.",
    )


@router.post("/files")
async def upload_multiple_files(request: Request, files: List[UploadFile] = File(...)):
    """
    Upload multiple files (product images) to local storage.
    Returns list of public file URLs.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    uploaded_items = []
    base_url = str(request.base_url).rstrip("/")

    for file in files:
        if not file.filename:
            continue
        ext = os.path.splitext(file.filename)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOADS_DIR, unique_filename)

        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file {file.filename}: {str(e)}")

        file_url = f"{base_url}/uploads/{unique_filename}"
        uploaded_items.append({
            "url": file_url,
            "filename": file.filename,
            "saved_name": unique_filename,
            "file_type": ext.lstrip("."),
        })

    return api_response(
        data=uploaded_items,
        message=f"Successfully uploaded {len(uploaded_items)} files.",
    )
