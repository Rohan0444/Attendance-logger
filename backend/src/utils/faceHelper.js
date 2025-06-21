// utils/faceHelper.js
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

/**
 * computeEncoding:
 *   - Accepts either a local file path to an image (e.g. "./uploads/img123.jpg"),
 *     or a Buffer/base64 image saved temporarily.
 *   - Returns a Promise that resolves to an array of ~128 floats (face‐embedding).
 */
export function computeEncoding(imagePath) {
  return new Promise((resolve, reject) => {
    // Path to Python script
    const pythonScript = path.join(__dirname, "../python/compute_encoding.py");
    // Spawn Python process: `python compute_encoding.py --image <imagePath>`
    const proc = spawn("python3", [pythonScript, "--image", imagePath]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`Python script exited with ${code}: ${stderr}`));
      }
      // Python script prints a JSON array of floats
      try {
        const enc = JSON.parse(stdout);
        if (!Array.isArray(enc) || enc.length < 100) {
          return reject(new Error("Invalid encoding returned by Python"));
        }
        resolve(enc);
      } catch (err) {
        reject(err);
      }
    });
  });
}
