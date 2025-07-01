import streamlit as st
import pandas as pd
import numpy as np
import rinex_parser
import position_solver
import anomaly_detection

st.title('GNSS Spoofing Detection Dashboard')

obs_file = st.file_uploader('Upload RINEX Observation File (.obs)')
nav_file = st.file_uploader('Upload RINEX Navigation File (.nav)')

if obs_file and nav_file:
    obs = rinex_parser.load_rinex_obs(obs_file)
    nav = rinex_parser.load_rinex_nav(nav_file)
    obs_data = rinex_parser.extract_obs_data(obs)
    # For demonstration, use only the first 10 epochs and satellites
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
    # Spoofing checks
    jump_idxs = anomaly_detection.detect_position_jumps(positions)
    pdop_flags = [anomaly_detection.check_geometry_consistency(d) for d in dops]
    flagged = set(jump_idxs.tolist() + [i for i, f in enumerate(pdop_flags) if f])
    st.write('Flagged Epochs:', flagged)
    st.write('Position Jumps:', jump_idxs)
    st.write('High PDOP:', [i for i, f in enumerate(pdop_flags) if f])
    st.line_chart(pdops, height=200)
else:
    st.info('Please upload both RINEX observation and navigation files.')
