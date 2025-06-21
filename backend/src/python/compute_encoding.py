# python/compute_encoding.py
import face_recognition
import argparse
import json
import sys

def main():
    parser = argparse.ArgumentParser(description="Compute face encoding for an image.")
    parser.add_argument("--image", type=str, required=True, help="Path to image file")
    args = parser.parse_args()

    img_path = args.image
    try:
        # Load the image
        image = face_recognition.load_image_file(img_path)
        # Find face encodings (list of arrays)
        encodings = face_recognition.face_encodings(image)
        if not encodings:
            print(json.dumps([]))  # No face found
            sys.exit(0)
        # Take the first face’s encoding (128 floats)
        first_encoding = encodings[0]
        # Convert to list of floats
        enc_list = first_encoding.tolist()
        print(json.dumps(enc_list))
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
