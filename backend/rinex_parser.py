import georinex as gr
import numpy as np
import pandas as pd

def load_rinex_obs(obs_path):
    """Load RINEX observation file."""
    obs = gr.load(obs_path)
    return obs

def load_rinex_nav(nav_path):
    """Load RINEX navigation file."""
    nav = gr.load(nav_path)
    return nav

def extract_obs_data(obs, signals=['C1C', 'S1C', 'D1C']):
    """Extract pseudorange, SNR, and Doppler for each satellite and epoch."""
    data = {}
    for sig in signals:
        if sig in obs:
            data[sig] = obs[sig].to_pandas()
        else:
            data[sig] = None
    return data

def get_satellite_positions(nav, times, svs):
    """Stub for satellite position computation (to be implemented in position_solver)."""
    # This will be filled in by position_solver.py
    pass
