from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import shutil
import os
import rinex_parser
import position_solver
import anomaly_detection
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/process")
async def process_rinex(obs_file: UploadFile = File(...), nav_file: UploadFile = File(...)):
    obs_path = os.path.join(UPLOAD_DIR, obs_file.filename)
    nav_path = os.path.join(UPLOAD_DIR, nav_file.filename)
    with open(obs_path, "wb") as f:
        shutil.copyfileobj(obs_file.file, f)
    with open(nav_path, "wb") as f:
        shutil.copyfileobj(nav_file.file, f)
    try:
        obs = rinex_parser.load_rinex_obs(obs_path)
        nav = rinex_parser.load_rinex_nav(nav_path)
        obs_data = rinex_parser.extract_obs_data(obs)
        epochs = obs.time.values[:10]
        svs = list(obs.sv.values)[:6]
        pseudo = obs_data['C1C'].iloc[:10, :6].values
        sat_pos = position_solver.compute_satellite_positions(nav, epochs, svs)
        positions = []
        dops = []
        for i in range(len(epochs)):
            pos, clk = position_solver.least_squares_position(sat_pos, pseudo[i])
            positions.append(pos)
            dops.append(position_solver.compute_dop(sat_pos, pos))
        positions = np.array(positions)
        pdops = [d['PDOP'] for d in dops]
        jump_idxs = anomaly_detection.detect_position_jumps(positions)
        pdop_flags = [anomaly_detection.check_geometry_consistency(d) for d in dops]
        flagged = list(set(jump_idxs.tolist()).union([i for i, f in enumerate(pdop_flags) if f]))
        return JSONResponse({
            "flagged_epochs": flagged,
            "position_jumps": jump_idxs.tolist(),
            "high_pdop": [i for i, f in enumerate(pdop_flags) if f],
            "pdop_values": pdops
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
