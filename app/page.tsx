"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, AlertTriangle, CheckCircle, XCircle, Satellite, MapPin, Radio, TrendingUp } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface SpoofingResults {
  threatLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  spoofingProbability: number
  flaggedEpochs: number[]
  positionJumps: number[]
  highPdop: number[]
  pdopValues: number[]
  satelliteHealth: Array<{
    sv: string
    health: number
    snr: number
    elevation: number
    azimuth: number
  }>
  positionData: Array<{
    epoch: number
    x: number
    y: number
    z: number
    accuracy: number
    pdop: number
  }>
  signalData: Array<{
    epoch: number
    avgSnr: number
    doppler: number
    carrierPhase: number
  }>
  anomalies: Array<{
    type: string
    severity: string
    count: number
    description: string
  }>
  recommendations: string[]
  processingInfo: {
    totalEpochs: number
    totalSatellites: number
    avgSatellitesPerEpoch: number
    dataQuality: string
  }
}

export default function SpoofingDetection() {
  const [obsFile, setObsFile] = useState<File | null>(null)
  const [navFile, setNavFile] = useState<File | null>(null)
  const [results, setResults] = useState<SpoofingResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async () => {
    if (!obsFile || !navFile) {
      setError("Please select both observation and navigation files")
      return
    }

    setLoading(true)
    setProgress(0)
    setError(null)

    const formData = new FormData()
    formData.append("obsFile", obsFile)
    formData.append("navFile", navFile)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 8, 90))
      }, 300)

      const response = await fetch("/api/process-rinex", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Processing failed")
      }

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error processing files:", error)
      setError(error instanceof Error ? error.message : "Error processing files. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getThreatColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "bg-green-500"
      case "MEDIUM":
        return "bg-yellow-500"
      case "HIGH":
        return "bg-orange-500"
      case "CRITICAL":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getThreatIcon = (level: string) => {
    switch (level) {
      case "LOW":
        return <CheckCircle className="h-5 w-5" />
      case "MEDIUM":
        return <AlertTriangle className="h-5 w-5" />
      case "HIGH":
        return <AlertTriangle className="h-5 w-5" />
      case "CRITICAL":
        return <XCircle className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">GNSS Spoofing Detection System</h1>
          <p className="text-slate-600">
            Advanced analysis of RINEX data for spoofing detection and signal integrity assessment
          </p>
        </div>

        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload RINEX Files
            </CardTitle>
            <CardDescription>
              Upload both observation (.24o) and navigation (.24n) RINEX files for analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="obs-file">Observation File (.24o)</Label>
                <Input
                  id="obs-file"
                  type="file"
                  accept=".24o,.obs,.rnx"
                  onChange={(e) => setObsFile(e.target.files?.[0] || null)}
                />
                {obsFile && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {obsFile.name} ({(obsFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nav-file">Navigation File (.24n)</Label>
                <Input
                  id="nav-file"
                  type="file"
                  accept=".24n,.nav,.rnx"
                  onChange={(e) => setNavFile(e.target.files?.[0] || null)}
                />
                {navFile && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {navFile.name} ({(navFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing RINEX files...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-slate-500 text-center">
                  Parsing observation data, computing positions, calculating PDOP, and detecting anomalies...
                </p>
              </div>
            )}

            <Button onClick={handleFileUpload} disabled={!obsFile || !navFile || loading} className="w-full">
              {loading ? "Processing..." : "Analyze Files for Spoofing"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            {/* Processing Info */}
            <Card>
              <CardHeader>
                <CardTitle>Processing Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{results.processingInfo.totalEpochs}</div>
                    <p className="text-sm text-slate-600">Total Epochs</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{results.processingInfo.totalSatellites}</div>
                    <p className="text-sm text-slate-600">Unique Satellites</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {results.processingInfo.avgSatellitesPerEpoch.toFixed(1)}
                    </div>
                    <p className="text-sm text-slate-600">Avg Sats/Epoch</p>
                  </div>
                  <div>
                    <Badge
                      variant={
                        results.processingInfo.dataQuality === "Good"
                          ? "default"
                          : results.processingInfo.dataQuality === "Fair"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {results.processingInfo.dataQuality}
                    </Badge>
                    <p className="text-sm text-slate-600">Data Quality</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Threat Level Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Threat Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center space-y-2">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white ${getThreatColor(results.threatLevel)}`}
                    >
                      {getThreatIcon(results.threatLevel)}
                      <span className="font-semibold">{results.threatLevel} THREAT</span>
                    </div>
                    <p className="text-sm text-slate-600">Overall Assessment</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-red-600">{results.spoofingProbability}%</div>
                    <p className="text-sm text-slate-600">Spoofing Probability</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-orange-600">{results.flaggedEpochs.length}</div>
                    <p className="text-sm text-slate-600">Flagged Epochs</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-blue-600">{results.satelliteHealth.length}</div>
                    <p className="text-sm text-slate-600">Satellites Tracked</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="satellites">Satellites</TabsTrigger>
                <TabsTrigger value="position">Position</TabsTrigger>
                <TabsTrigger value="signals">Signals</TabsTrigger>
                <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>PDOP Values Over Time</CardTitle>
                      <CardDescription>
                        Position Dilution of Precision - Lower values indicate better geometry
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={results.positionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="epoch" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}`, "PDOP"]} />
                          <Line type="monotone" dataKey="pdop" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Detection Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Position Jumps</span>
                        <Badge variant={results.positionJumps.length > 0 ? "destructive" : "secondary"}>
                          {results.positionJumps.length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>High PDOP Epochs</span>
                        <Badge variant={results.highPdop.length > 0 ? "destructive" : "secondary"}>
                          {results.highPdop.length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Satellite Health Issues</span>
                        <Badge
                          variant={
                            results.satelliteHealth.filter((s) => s.health < 0.7).length > 0
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {results.satelliteHealth.filter((s) => s.health < 0.7).length}
                        </Badge>
                      </div>
                      <div className="pt-2 text-sm text-slate-600">
                        <p>
                          <strong>Flagged Epochs:</strong>{" "}
                          {results.flaggedEpochs.length > 0
                            ? results.flaggedEpochs.slice(0, 10).join(", ") +
                              (results.flaggedEpochs.length > 10 ? "..." : "")
                            : "None"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="satellites" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Satellite className="h-5 w-5" />
                      Satellite Health Analysis
                    </CardTitle>
                    <CardDescription>Individual satellite performance and integrity assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.satelliteHealth.map((sat) => (
                        <Card key={sat.sv} className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-lg">{sat.sv}</span>
                              <Badge
                                variant={sat.health > 0.8 ? "default" : sat.health > 0.6 ? "secondary" : "destructive"}
                              >
                                {(sat.health * 100).toFixed(0)}%
                              </Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span>SNR:</span>
                                <span className="font-mono">{sat.snr.toFixed(1)} dB</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Elevation:</span>
                                <span className="font-mono">{sat.elevation.toFixed(1)}°</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Azimuth:</span>
                                <span className="font-mono">{sat.azimuth.toFixed(1)}°</span>
                              </div>
                            </div>
                            {sat.health < 0.5 && (
                              <Alert className="mt-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-xs">Suspicious behavior detected</AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="position" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Position Accuracy
                      </CardTitle>
                      <CardDescription>Estimated position accuracy over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={results.positionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="epoch" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} m`, "Accuracy"]} />
                          <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Altitude Variation</CardTitle>
                      <CardDescription>Z-coordinate changes indicating potential spoofing</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={results.positionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="epoch" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} m`, "Altitude"]} />
                          <Line type="monotone" dataKey="z" stroke="#ffc658" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="signals" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Radio className="h-5 w-5" />
                        Signal-to-Noise Ratio
                      </CardTitle>
                      <CardDescription>Average SNR across all satellites</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={results.signalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="epoch" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} dB`, "SNR"]} />
                          <Line type="monotone" dataKey="avgSnr" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Doppler Shift Analysis</CardTitle>
                      <CardDescription>Frequency shifts indicating satellite motion</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={results.signalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="epoch" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} Hz`, "Doppler"]} />
                          <Line type="monotone" dataKey="doppler" stroke="#ff7300" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="anomalies" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Anomaly Distribution
                      </CardTitle>
                      <CardDescription>Types and frequency of detected anomalies</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={results.anomalies}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Security Recommendations</CardTitle>
                      <CardDescription>Actions to take based on detected threats</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {results.recommendations.map((rec, index) => (
                          <Alert
                            key={index}
                            className={
                              index === 0 && results.threatLevel === "CRITICAL" ? "border-red-200 bg-red-50" : ""
                            }
                          >
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-sm">{rec}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Anomaly Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.anomalies.map((anomaly, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{anomaly.type}</h4>
                            <Badge
                              variant={
                                anomaly.severity === "High"
                                  ? "destructive"
                                  : anomaly.severity === "Medium"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {anomaly.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{anomaly.description}</p>
                          <p className="text-sm font-mono">Count: {anomaly.count}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
