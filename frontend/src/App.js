import React, { useState } from 'react';
import { Container, Card, CardContent, Typography, Button, Box, Alert, LinearProgress, Grid } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function App() {
  const [obsFile, setObsFile] = useState(null);
  const [navFile, setNavFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!obsFile || !navFile) {
      setError('Please select both .obs and .nav files.');
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);
    const formData = new FormData();
    formData.append('obs_file', obsFile);
    formData.append('nav_file', navFile);
    try {
      const res = await fetch('http://localhost:8000/process', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data);
      } else {
        setError(data.error || 'Processing failed.');
      }
    } catch (err) {
      setError('Network or server error.');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Card elevation={6} sx={{ borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, color: '#1976d2' }}>
            GNSS Spoofing Detection
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button variant="contained" component="label" fullWidth color="primary">
                  Upload RINEX Observation (.obs or .24o)
                  <input type="file" accept=".obs,.24o" hidden onChange={e => handleFileChange(e, setObsFile)} />
                </Button>
                {obsFile && <Typography variant="body2" sx={{ mt: 1 }}>{obsFile.name}</Typography>}
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" component="label" fullWidth color="primary">
                  Upload RINEX Navigation (.nav or .24n)
                  <input type="file" accept=".nav,.24n" hidden onChange={e => handleFileChange(e, setNavFile)} />
                </Button>
                {navFile && <Typography variant="body2" sx={{ mt: 1 }}>{navFile.name}</Typography>}
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="success" fullWidth size="large" disabled={loading} sx={{ mt: 2 }}>
                  {loading ? 'Processing...' : 'Upload & Analyze'}
                </Button>
              </Grid>
            </Grid>
          </Box>
          {loading && <Box sx={{ width: '100%', mt: 2 }}><LinearProgress /></Box>}
          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
          {results && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>Results</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1"><b>Flagged Epochs</b></Typography>
                    <Typography variant="body2">{results.flagged_epochs.join(', ') || 'None'}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1"><b>Position Jumps</b></Typography>
                    <Typography variant="body2">{results.position_jumps.join(', ') || 'None'}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1"><b>High PDOP</b></Typography>
                    <Typography variant="body2">{results.high_pdop.join(', ') || 'None'}</Typography>
                  </Card>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}><b>PDOP Chart</b></Typography>
                <PDOPChart pdopValues={results.pdop_values} />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
      <Box sx={{ mt: 4, textAlign: 'center', color: '#888' }}>
        <Typography variant="caption">&copy; {new Date().getFullYear()} GNSS Spoofing Detection Dashboard</Typography>
      </Box>
    </Container>
  );
}

function PDOPChart({ pdopValues }) {
  if (!pdopValues || pdopValues.length === 0) return null;
  const data = pdopValues.map((v, i) => ({ epoch: i + 1, PDOP: v }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="epoch" label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5 }} />
        <YAxis label={{ value: 'PDOP', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="PDOP" stroke="#1976d2" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default App;
