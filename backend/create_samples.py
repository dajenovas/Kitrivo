import os
import urllib.request
from app.core.database import SessionLocal
from app.models import Product

def create_sample_files_and_update_db():
    uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(uploads_dir, exist_ok=True)

    # 1. Download/Ensure Sample Demo Video MP4
    video_filename = "sample_demo_video.mp4"
    video_path = os.path.join(uploads_dir, video_filename)
    if not os.path.exists(video_path) or os.path.getsize(video_path) == 0:
        print("Downloading sample MP4 video...")
        req = urllib.request.Request(
            "https://www.w3schools.com/html/mov_bbb.mp4",
            headers={"User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(req) as resp, open(video_path, "wb") as f:
            f.write(resp.read())
        print(f"Downloaded video to {video_path} ({os.path.getsize(video_path)} bytes)")
    else:
        print(f"Video already exists at {video_path} ({os.path.getsize(video_path)} bytes)")

    # 2. Create Sample Lab Manual PDF
    pdf_filename = "sample_lab_manual.pdf"
    pdf_path = os.path.join(uploads_dir, pdf_filename)
    
    pdf_content = (
        b"%PDF-1.4\n"
        b"1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n"
        b"2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n"
        b"3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>> >> endobj\n"
        b"4 0 obj <</Length 680>> stream\n"
        b"BT\n"
        b"/F1 20 Tf 50 730 Td (KITRIVO LABORATORY MANUAL) Tj\n"
        b"/F1 13 Tf 0 -28 Td (Model: DICT-9000X | Advanced Digital IC Trainer Kit) Tj\n"
        b"/F1 10 Tf 0 -22 Td (Department of Electronics & Communication Engineering) Tj\n"
        b"/F1 12 Tf 0 -35 Td (LIST OF EXPERIMENTS:) Tj\n"
        b"/F1 10 Tf 0 -20 Td (1. Verification of Truth Tables of Basic Logic Gates (AND, OR, NOT, NAND, NOR, XOR)) Tj\n"
        b"/F1 10 Tf 0 -20 Td (2. Design and Implementation of Half Adder and Full Adder Circuits) Tj\n"
        b"/F1 10 Tf 0 -20 Td (3. Realization of Multiplexers and Demultiplexers using TTL 74 Series ICs) Tj\n"
        b"/F1 10 Tf 0 -20 Td (4. Study of Synchronous and Asynchronous Binary Counters) Tj\n"
        b"/F1 10 Tf 0 -20 Td (5. Design of 4-bit Shift Registers and Ring Counters) Tj\n"
        b"/F1 12 Tf 0 -35 Td (SAFETY INSTRUCTIONS & OPERATING PROCEDURES:) Tj\n"
        b"/F1 10 Tf 0 -20 Td (- Ensure 230V AC main supply is properly grounded before powering on the kit.) Tj\n"
        b"/F1 10 Tf 0 -20 Td (- Never apply external DC supply higher than +5V to TTL logic IC breadboard socket.) Tj\n"
        b"/F1 10 Tf 0 -20 Td (- Use provided patch cords for making connections between logic switches and LED indicators.) Tj\n"
        b"ET\n"
        b"endstream endobj\n"
        b"5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold>> endobj\n"
        b"xref\n"
        b"0 6\n"
        b"0000000000 65535 f \n"
        b"0000000010 00000 n \n"
        b"0000000060 00000 n \n"
        b"0000000117 00000 n \n"
        b"0000000245 00000 n \n"
        b"0000000978 00000 n \n"
        b"trailer <</Size 6 /Root 1 0 R>>\n"
        b"startxref\n"
        b"1053\n"
        b"%%EOF\n"
    )
    with open(pdf_path, "wb") as f:
        f.write(pdf_content)
    print(f"Created PDF lab manual at {pdf_path} ({os.path.getsize(pdf_path)} bytes)")

    # 3. Update Database for PRD-DIG-001
    db = SessionLocal()
    try:
        product = db.query(Product).filter(Product.product_id == "PRD-DIG-001").first()
        if not product:
            print("Product PRD-DIG-001 not found! Creating/searching first product...")
            product = db.query(Product).first()

        if product:
            # We set the URL relative / absolute static upload URL
            # FastAPI serves uploads at http://localhost:8000/uploads/
            product.lab_manual = {
                "title": "Advanced Digital IC Trainer Practical Lab Manual & Experiment Guide",
                "url": f"http://localhost:8000/uploads/{pdf_filename}",
                "file_type": "pdf"
            }
            product.demo_video = {
                "title": "DICT-9000X Equipment Overview & Practical Setup Demo Video",
                "url": f"http://localhost:8000/uploads/{video_filename}",
                "file_type": "mp4"
            }
            db.commit()
            db.refresh(product)
            print(f"Successfully updated product '{product.product_name}' ({product.product_id}) with lab_manual and demo_video!")
            print("Lab Manual:", product.lab_manual)
            print("Demo Video:", product.demo_video)
        else:
            print("No products found in DB.")
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_files_and_update_db()
