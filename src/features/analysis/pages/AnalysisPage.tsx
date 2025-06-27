import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { 
  Music, 
  Download, 
  Share2, 
  Settings,
  ChevronRight,
  Layers,
  BarChart3,
  Home
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ErrorBoundary } from '../../../components/common/ErrorBoundary';
import { useAnalysisData } from '../hooks/useAnalysisData';
import { Waveform } from '../components/Waveform';
import { PlaybackControls } from '../components/PlaybackControls';
import { AnalysisLoadingSkeleton } from '../components/AnalysisLoadingSkeleton';
import { 
  EnergyTimelineChart, 
  SongStructureChart, 
  TempoChart, 
  ChordProgressionChart,
  LazyChartWrapper 
} from '../components/charts/LazyCharts';
import { usePlaybackStore } from '../stores/playbackStore';


export function AnalysisPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'details'>('overview');

  // Load analysis data
  const { data: analysisData, audioUrl, isLoading, isProcessing, error } = useAnalysisData(jobId || '');
  
  // Playback state
  const { currentTime, duration, seek } = usePlaybackStore();

  if (!jobId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">No analysis ID provided</p>
      </div>
    );
  }

  if (isLoading || isProcessing) {
    return <AnalysisLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Analysis</h2>
          <p className="text-gray-600">Unable to load analysis results. Please try again.</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Breadcrumb Navigation */}
              <nav className="flex items-center space-x-2 text-sm">
                <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
                  <Home className="h-4 w-4" />
                </Link>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <Link to="/upload" className="text-gray-500 hover:text-gray-700">
                  Upload
                </Link>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 font-medium">Analysis</span>
              </nav>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Music className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">{analysisData?.fileName || 'Track Analysis'}</h1>
                  <p className="text-sm text-gray-500">Job ID: {jobId}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Waveform Section */}
            <div className="bg-white border-b border-gray-200 p-6">
              {audioUrl ? (
                <Waveform
                  audioUrl={audioUrl}
                  height={160}
                  waveColor="#9333ea"
                  progressColor="#7c3aed"
                />
              ) : (
                <Card className="h-48 bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500">No audio available</p>
                </Card>
              )}
            </div>

            {/* Visualizations Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Tempo Analysis</h3>
                  {analysisData?.features?.get('tempo') ? (
                    <LazyChartWrapper height={250}>
                      <TempoChart
                        data={analysisData.features.get('tempo') || null}
                        currentTime={currentTime}
                        duration={duration || analysisData.duration}
                        onSeek={seek}
                        height={250}
                      />
                    </LazyChartWrapper>
                  ) : (
                    <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                      <p className="text-gray-500">No tempo data available</p>
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Harmonic Analysis</h3>
                  {analysisData?.features?.get('chords') || analysisData?.features?.get('chord_progression') ? (
                    <LazyChartWrapper height={120}>
                      <ChordProgressionChart
                        data={analysisData.features.get('chords') || analysisData.features.get('chord_progression') || null}
                        currentTime={currentTime}
                        duration={duration || analysisData.duration}
                        onSeek={seek}
                        height={120}
                        className="mt-8 mb-8"
                      />
                    </LazyChartWrapper>
                  ) : (
                    <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                      <p className="text-gray-500">No chord data available</p>
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Energy Analysis</h3>
                  {(analysisData?.features?.get('band_energy') || analysisData?.features?.get('energy')) ? (
                    <LazyChartWrapper height={250}>
                      <EnergyTimelineChart
                        data={analysisData.features.get('band_energy') || analysisData.features.get('energy') || null}
                        currentTime={currentTime}
                        duration={duration || analysisData.duration}
                        onSeek={seek}
                        height={250}
                      />
                    </LazyChartWrapper>
                  ) : (
                    <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                      <p className="text-gray-500">No energy data available</p>
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Structure Detection</h3>
                  {analysisData?.sections && analysisData.sections.length > 0 ? (
                    <LazyChartWrapper height={150}>
                      <SongStructureChart
                        sections={analysisData.sections}
                        currentTime={currentTime}
                        duration={duration || analysisData.duration}
                        onSeek={seek}
                        height={150}
                        className="mb-8"
                      />
                    </LazyChartWrapper>
                  ) : (
                    <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                      <p className="text-gray-500">No structure data available</p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside
            className={`bg-white border-l border-gray-200 overflow-hidden transition-all duration-300 ${
              isSidebarOpen ? 'w-80' : 'w-0'
            }`}
          >
            <div className="w-80 h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Controls</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Feature Selection */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">View Mode</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={activeView === 'overview' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setActiveView('overview')}
                        className="flex items-center gap-2"
                      >
                        <Layers className="h-4 w-4" />
                        Overview
                      </Button>
                      <Button
                        variant={activeView === 'details' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setActiveView('details')}
                        className="flex items-center gap-2"
                      >
                        <BarChart3 className="h-4 w-4" />
                        Details
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Stems</h3>
                    <Card className="p-4 bg-gray-50">
                      <p className="text-sm text-gray-500">Stem controls will appear here</p>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Features</h3>
                    <Card className="p-4 bg-gray-50">
                      <p className="text-sm text-gray-500">Feature filters will appear here</p>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Display Settings</h3>
                    <Card className="p-4 bg-gray-50">
                      <p className="text-sm text-gray-500">Display options will appear here</p>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Sidebar Toggle Button (when closed) */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-lg p-2 shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 animate-[fadeIn_0.3s_0.3s_forwards]"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Footer Timeline */}
        <footer className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-full mx-auto">
            <PlaybackControls className="bg-gray-50" />
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}