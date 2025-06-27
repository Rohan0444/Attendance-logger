import face_recognition
import numpy as np
import sys
from PIL import Image
from io import BytesIO
import base64
import json
from dotenv import load_dotenv
load_dotenv()
def generate_embedding(img_URL):
    response = base64.b64decode(img_URL)
    img = Image.open(BytesIO(response))
    if img.mode != 'RGB':
        img = img.convert('RGB')

    img_np = np.array(img)
    image_encodings = face_recognition.face_encodings(img_np)
    return image_encodings[0] if image_encodings else None

def main():
    payload = json.loads(sys.stdin.read())
    img_URL = payload.get("image")
    if not img_URL:
        print(json.dumps({"error": "No image provided"}))
        return
    if img_URL.startswith("data:"):
        img_URL = img_URL.split(",")[1]
    embedding = generate_embedding(img_URL)
    if embedding is None:
        print(json.dumps({"error": "No face detected in the image"}))
        return
    print(json.dumps(embedding.tolist()))

if __name__ == "__main__":
    main()