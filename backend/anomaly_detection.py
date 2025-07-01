import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.svm import OneClassSVM

def check_geometry_consistency(dop_values, pdop_threshold=10):
    """Flag if PDOP is above a threshold (unrealistic geometry)."""
    return dop_values['PDOP'] > pdop_threshold

def detect_position_jumps(positions, jump_threshold=50):
    """Detect sudden jumps in position (meters)."""
    jumps = np.linalg.norm(np.diff(positions, axis=0), axis=1)
    return np.where(jumps > jump_threshold)[0] + 1  # indices of jumps

def check_satellite_count(sat_counts, min_sats=4):
    """Flag epochs with too few satellites."""
    return np.where(sat_counts < min_sats)[0]

def ml_anomaly_detection(features, method='isoforest'):
    """Apply ML anomaly detection (Isolation Forest or One-Class SVM)."""
    if method == 'isoforest':
        clf = IsolationForest(contamination=0.05, random_state=42)
    else:
        clf = OneClassSVM(nu=0.05, kernel='rbf', gamma='scale')
    preds = clf.fit_predict(features)
    return np.where(preds == -1)[0]  # indices of anomalies
