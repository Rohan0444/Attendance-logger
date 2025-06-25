import cv2
import numpy as np
import face_recognition
from datetime import datetime
import json
import sys
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
load_dotenv()
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client['attendance_db']
collection_Students = db['Students']
collection_Course = db["Course"]

def start_attendance(course_code):
    course = collection_Course.find_one({"code": course_code})
    if not course:
        print(json.dumps({"error": "Course not found"}))
        return
    video_capture = cv2.VideoCapture(0)
    students = collection_Students.find({"registeredCourses": course["_id"]})
    known_face_encodings = []
    known_face_roll_nos = []
    marked_students = []
    for student in students:
        roll_no = student["rollno"]
        encoding = np.array(student["faceEncoding"])
        if encoding is not None:
            known_face_encodings.append(encoding)
            known_face_roll_nos.append(roll_no)
    records = []
    while True:
        # Grab a single frame of video
        ret, frame = video_capture.read()
        # <-- make it contiguous here! -->
        rgb_frame = np.ascontiguousarray(frame[:, :, ::-1])

        face_locations = face_recognition.face_locations(rgb_frame)

        if face_locations:
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
        else:
            face_encodings = []



        # Loop through each face in this frame of video
        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            # See if the face is a match for the known face(s)
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding)

            name = "Unknown"

            #If a match was found in known_face_encodings, just use the first one.
            if True in matches:
                first_match_index = matches.index(True)
                name = known_face_roll_nos[first_match_index]
                if name not in marked_students:
                    marked_students.append(name)
                    attendance_record = {
                        "course":course["_id"],
                        "date": datetime.now().date(),
                        "status": "Present"
                    }
                    stud = collection_Students.find_one({"rollno": name})
                    records.append({
                        "student": stud["_id"],
                        "status": "Present"
                    })
                    collection_Students.update_one({"rollno": name}, {"$push": {"attendanceRecords": attendance_record}})
                else:     
                    name = "Already Marked"
            # Or instead, use the known face with the smallest distance to the new face
            # face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
            # best_match_index = np.argmin(face_distances)
            # if matches[best_match_index]:
            #     name = known_face_names[best_match_index]

            # Draw a box around the face
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)

            # Draw a label with a name below the face
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
            font = cv2.FONT_HERSHEY_DUPLEX
            cv2.putText(frame, name+" is marked", (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)

        # Display the resulting image
        cv2.imshow('Video', frame)

        # Hit 'q' on the keyboard to quit!
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    for student in students:
        if student["rollno"] not in marked_students:
            attendance_record = {
                "course": course["_id"],
                "date": datetime.now().date(),
                "status": "Absent"
            }
            stud = collection_Students.find_one({"rollno": student["rollno"]})
            records.append({
                "student": stud["_id"],
                "status": "Absent"
            })
            collection_Students.update_one({"rollno": student["rollno"]}, {"$push": {"attendanceRecords": attendance_record}})
    session = {
        "date" : datetime.now().date(),
        "time" : datetime.now().time(),
        "records": records,
    }
    collection_Course.update_one({"_id": course["_id"]}, {"$push": {"attendanceSessions": records}})
    # Release handle to the webcam
    video_capture.release()
    cv2.destroyAllWindows()




def main():
    payload = json.loads(sys.stdin.read())
    course_code = payload.get("coursecode")
    start_attendance(course_code)
    print(json.dumps({"status": "success"}))
    
    