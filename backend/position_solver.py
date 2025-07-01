import numpy as np

def least_squares_position(sat_positions, pseudoranges, approx_pos=None, max_iter=10):
    """
    Estimate receiver position using least-squares from satellite positions and pseudoranges.
    sat_positions: Nx3 array of satellite ECEF positions
    pseudoranges: N array of pseudoranges
    approx_pos: Initial guess (ECEF), default at Earth's center
    Returns: receiver ECEF position (x, y, z), clock bias
    """
    if approx_pos is None:
        approx_pos = np.array([0, 0, 0, 0], dtype=float)  # x, y, z, clock bias
    x = approx_pos.copy()
    c = 299792458.0  # speed of light (m/s)
    for _ in range(max_iter):
        diffs = sat_positions - x[:3]
        ranges = np.linalg.norm(diffs, axis=1)
        H = np.hstack([
            -(diffs / ranges[:, None]),
            np.ones((len(sat_positions), 1))
        ])
        y = pseudoranges - (ranges + x[3])
        dx, *_ = np.linalg.lstsq(H, y, rcond=None)
        x += dx
        if np.linalg.norm(dx) < 1e-4:
            break
    return x[:3], x[3]

def compute_dop(sat_positions, receiver_pos):
    """
    Compute DOP values from satellite positions and receiver position.
    Returns: dict with GDOP, PDOP, HDOP, VDOP
    """
    diffs = sat_positions - receiver_pos
    ranges = np.linalg.norm(diffs, axis=1)
    H = np.hstack([
        -(diffs / ranges[:, None]),
        np.ones((len(sat_positions), 1))
    ])
    Q = np.linalg.inv(H.T @ H)
    GDOP = np.sqrt(np.trace(Q))
    PDOP = np.sqrt(Q[0,0] + Q[1,1] + Q[2,2])
    HDOP = np.sqrt(Q[0,0] + Q[1,1])
    VDOP = np.sqrt(Q[2,2])
    return {'GDOP': GDOP, 'PDOP': PDOP, 'HDOP': HDOP, 'VDOP': VDOP}

def compute_satellite_positions(nav, times, svs):
    """
    Stub for satellite ECEF position computation from navigation data.
    To be implemented using precise ephemeris equations.
    """
    # Placeholder: return zeros
    return np.zeros((len(svs), 3))
