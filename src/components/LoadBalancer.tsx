import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, Upload, Download, TrendingUp, Plus, Minus } from 'lucide-react';
import CSVUpload from './shared/CSVUpload';
import WorkloadChart from './charts/WorkloadChart';
import InsightsCard from './shared/InsightsCard';
import ResultsTable from './shared/ResultsTable';
import { mockLoadBalancerAnalysis, mockLoadBalancerOptimization } from '../utils/mockData';

interface StationData {
  station: string;
  workload: number;
}

const LoadBalancer: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [inputMethod, setInputMethod] = useState<'csv' | 'manual'>('csv');
  const [manualStations, setManualStations] = useState<StationData[]>([
    { station: 'Station A', workload: 0 },
    { station: 'Station B', workload: 0 },
    { station: 'Station C', workload: 0 }
  ]);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [optimizedData, setOptimizedData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setAnalysisData(null);
    setOptimizedData(null);
  };

  const addStation = () => {
    const newStationNumber = manualStations.length + 1;
    setManualStations([...manualStations, { 
      station: `Station ${String.fromCharCode(64 + newStationNumber)}`, 
      workload: 0 
    }]);
  };

  const removeStation = (index: number) => {
    if (manualStations.length > 2) {
      setManualStations(manualStations.filter((_, i) => i !== index));
    }
  };

  const updateStationWorkload = (index: number, workload: number) => {
    const updated = [...manualStations];
    updated[index].workload = Math.max(0, workload);
    setManualStations(updated);
  };

  const updateStationName = (index: number, name: string) => {
    const updated = [...manualStations];
    updated[index].station = name;
    setManualStations(updated);
  };

  const handleAnalyze = async () => {
    if (inputMethod === 'csv' && !uploadedFile) return;
    if (inputMethod === 'manual' && manualStations.every(s => s.workload === 0)) return;
    
    setIsAnalyzing(true);
    // Simulate backend analysis
    setTimeout(() => {
      if (inputMethod === 'manual') {
        // Generate analysis based on manual input
        const totalWorkload = manualStations.reduce((sum, s) => sum + s.workload, 0);
        const avgWorkload = totalWorkload / manualStations.length;
        const overloadedStations = manualStations.filter(s => s.workload > avgWorkload * 1.2);
        const underutilizedStations = manualStations.filter(s => s.workload < avgWorkload * 0.8);
        
        setAnalysisData({
          workloadData: manualStations,
          insights: [
            `${overloadedStations.length} station(s) overloaded above 20% of average`,
            `${underutilizedStations.length} station(s) underutilized below 80% of average`,
            `Average workload: ${avgWorkload.toFixed(1)} orders per station`,
            `Total orders to process: ${totalWorkload}`
          ],
          metrics: [
            `Total stations: ${manualStations.length}`,
            `Peak station workload: ${Math.max(...manualStations.map(s => s.workload))} orders`,
            `Minimum station workload: ${Math.min(...manualStations.map(s => s.workload))} orders`,
            `Workload variance: ${(Math.max(...manualStations.map(s => s.workload)) - Math.min(...manualStations.map(s => s.workload)))} orders`
          ]
        });
      } else {
        setAnalysisData(mockLoadBalancerAnalysis);
      }
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleOptimize = async () => {
    if (!analysisData) return;
    
    setIsOptimizing(true);
    // Simulate backend optimization
    setTimeout(() => {
      setOptimizedData(mockLoadBalancerOptimization);
      setIsOptimizing(false);
    }, 3000);
  };

  const handleDownload = () => {
    if (!optimizedData) return;
    
    const csvContent = optimizedData.assignments.map((row: any) => 
      Object.values(row).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized_workload.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-blue-800 rounded-lg transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <BarChart3 size={28} />
                E1 – Packing Station Load Balancer
              </h1>
              <p className="text-blue-100 mt-1">Balance workloads across packing stations for optimal efficiency</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Data Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Input Order Data</h2>
          
          {/* Input Method Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setInputMethod('csv')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                inputMethod === 'csv' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              CSV Upload
            </button>
            <button
              onClick={() => setInputMethod('manual')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                inputMethod === 'manual' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Manual Input
            </button>
          </div>

          {inputMethod === 'csv' ? (
            <>
              <CSVUpload 
                onFileUpload={handleFileUpload}
                acceptedFileTypes=".csv"
                description="Upload your order and station assignment data in CSV format"
              />
              
              {uploadedFile && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">File Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">File:</span>
                      <span className="ml-2 font-medium">{uploadedFile.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <span className="ml-2 font-medium">{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">Enter the current workload for each packing station:</p>
              
              {manualStations.map((station, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={station.station}
                    onChange={(e) => updateStationName(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Station name"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Orders:</label>
                    <input
                      type="number"
                      min="0"
                      value={station.workload}
                      onChange={(e) => updateStationWorkload(index, parseInt(e.target.value) || 0)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                    />
                  </div>
                  {manualStations.length > 2 && (
                    <button
                      onClick={() => removeStation(index)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={addStation}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Add Station
              </button>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Stations:</span>
                    <span className="ml-2 font-medium">{manualStations.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Orders:</span>
                    <span className="ml-2 font-medium">{manualStations.reduce((sum, s) => sum + s.workload, 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Section */}
        {(uploadedFile || (inputMethod === 'manual' && manualStations.some(s => s.workload > 0))) && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Workload Analysis</h2>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (inputMethod === 'manual' && manualStations.every(s => s.workload === 0))}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <BarChart3 size={20} />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Analyze Current Workload'}
              </button>
            </div>

            {analysisData && (
              <div className="space-y-8">
                <WorkloadChart 
                  data={analysisData.workloadData} 
                  title="Current Workload Distribution"
                />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <InsightsCard
                    title="Workload Analysis"
                    insights={analysisData.insights}
                    type="warning"
                  />
                  <InsightsCard
                    title="Performance Metrics"
                    insights={analysisData.metrics}
                    type="info"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Optimization Section */}
        {analysisData && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Load Balancer Optimization</h2>
              <button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                {isOptimizing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <TrendingUp size={20} />
                )}
                {isOptimizing ? 'Optimizing...' : 'Run Load Balancer'}
              </button>
            </div>

            {optimizedData && (
              <div className="space-y-8">
                <ResultsTable 
                  data={optimizedData.assignments}
                  columns={[
                    { key: 'orderId', title: 'Order ID' },
                    { key: 'originalStation', title: 'Original Station' },
                    { key: 'newStation', title: 'New Station' },
                    { key: 'packingTime', title: 'Packing Time (min)' }
                  ]}
                />

                <WorkloadChart 
                  data={optimizedData.newWorkloadData} 
                  title="Balanced Workload Distribution"
                />

                <div className="grid md:grid-cols-3 gap-6">
                  <InsightsCard
                    title="Optimization Results"
                    insights={optimizedData.results}
                    type="success"
                  />
                  <InsightsCard
                    title="Efficiency Gains"
                    insights={optimizedData.efficiency}
                    type="info"
                  />
                  <InsightsCard
                    title="Bottlenecks Resolved"
                    insights={optimizedData.bottlenecks}
                    type="success"
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleDownload}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download size={20} />
                    Download Optimized Data (CSV)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default LoadBalancer;