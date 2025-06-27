# MusicChat Web UI

> A comprehensive web interface for MusicChat V2 music analysis system with real-time visualization and playback

MusicChat UI provides an intuitive interface for uploading, analyzing, and exploring music through advanced AI-powered analysis. Features professional-grade visualizations, real-time audio playback, and comprehensive music analysis tools for musicians, producers, and audio engineers.

## 🚀 Project Status

### ✅ Phase 1: Authentication & Foundation (Complete)
- JWT authentication with refresh tokens
- Protected routes and navigation
- Component library (Button, Input, Card, etc.)
- API client with error handling
- Comprehensive TypeScript types

### ✅ Phase 2: File Upload & Analysis (Complete)
- Drag-drop file upload with validation
- Real-time progress via WebSocket
- Job management with status cards
- Browser and toast notifications
- Error recovery UI

### ✅ Phase 3: Visualization & Playback (Complete)
- **WaveSurfer.js Audio Playback**: Interactive waveform visualization and playback controls
- **Four Music Analysis Charts**:
  - **Energy Timeline**: Multi-band frequency analysis (sub-bass, bass, mids, highs)
  - **Song Structure**: Interactive section navigation (intro, verse, chorus, bridge)
  - **Tempo Track**: BPM analysis with confidence bands and reference grid
  - **Chord Progression**: Harmonic analysis with major/minor color coding and Roman numerals
- **Real-time Synchronization**: Playhead position across all visualizations
- **Performance Optimized**: Lazy loading, code splitting, 644KB total bundle
- **Mobile Support**: Touch-friendly interactions and responsive design
- **Type Safe**: Zero `as any` assertions with proper type guards
- **Comprehensive Testing**: Full test coverage for all chart components

### 🎯 Phase 4: Query Interface & Library (Next)
- Smart query system for music search
- Music library with organization features
- Advanced analytics and insights
- Export and sharing capabilities

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite with optimized chunking
- **Styling**: Tailwind CSS
- **State Management**: Zustand (client) + React Query (server)
- **Audio Visualization**: WaveSurfer.js
- **Charts**: Chart.js with react-chartjs-2
- **Real-time**: Native WebSocket (replaced socket.io)
- **Testing**: Vitest with comprehensive coverage

## 📋 Prerequisites

- **Node.js 18+** and npm
- **MusicChat backend** running at `http://localhost:8000`
- **Modern browser** with WebAudio API support

## 🏃‍♂️ Quick Start

1. **Clone and install**
   ```bash
   git clone https://github.com/your-repo/musicchat-ui.git
   cd musicchat-ui
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Update .env with your backend URL if different
   ```

3. **Start development**
   ```bash
   npm run dev
   ```
   App available at `http://localhost:5173`

4. **Login with demo credentials**
   - Username: `demo`
   - Password: `demo123`

## 📊 Features

### Audio Analysis Visualizations
- **Energy Timeline**: Real-time frequency content across 4 bands with smooth curves
- **Song Structure**: Interactive timeline showing sections with click-to-navigate
- **Tempo Analysis**: BPM tracking with confidence indicators and common tempo references
- **Chord Progression**: Complete harmonic analysis with chord labels and Roman numerals

### Audio Playback System
- **Interactive Waveform**: Click anywhere to seek, visual playback position
- **Professional Controls**: Play/pause, volume, speed (0.5x-2x), loop functionality
- **Real-time Sync**: All visualizations update with current position at 60fps
- **Multi-format Support**: MP3, WAV, FLAC, M4A, OGG up to 500MB

### File Management
- **Drag & Drop Upload**: Intuitive file selection with progress tracking
- **Real-time Progress**: WebSocket updates with detailed analysis stages
- **Job Management**: View active, completed, and failed analyses
- **Error Recovery**: Automatic retry with user-friendly error messages

## 🏗️ Architecture

### Component Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base components (Button, Input, etc.)
│   ├── layout/          # Layout components
│   └── common/          # Shared components
├── features/
│   ├── auth/            # Authentication system
│   ├── upload/          # File upload and job management
│   └── analysis/        # Visualization and playback
│       ├── components/  # Chart components and audio controls
│       ├── hooks/       # Custom hooks for data and WebSocket
│       ├── stores/      # Zustand state management
│       └── utils/       # Data processing and optimization
├── lib/                 # Core utilities and API clients
└── types/               # TypeScript type definitions
```

### Performance Features
- **Lazy Loading**: Charts load on-demand to minimize initial bundle
- **Code Splitting**: 16 optimized chunks for progressive loading
- **Data Decimation**: LTTB algorithm for smooth rendering of large datasets
- **Bundle Optimization**: 644KB total with strategic dependency management
- **WebSocket Efficiency**: Native WebSocket for minimal overhead

## 🔌 API Integration

### Authentication
```javascript
// Login
POST /api/v1/auth/login
{
  "username": "demo",
  "password": "demo123"
}

// All requests include:
Authorization: Bearer <access_token>
```

### File Upload
```javascript
// Submit audio file (note: 'files' field name)
POST /api/v1/analyze
Content-Type: multipart/form-data
files: <audio_file>
```

### WebSocket Updates
```javascript
// Real-time progress updates
ws://localhost:8000/ws/analyze/{job_id}?token={access_token}

// Message types:
// - progress: { percentage, current_stage, current_activity }
// - job_complete: { track_id }
// - error: { error }
```

## 🧪 Testing

### Available Scripts
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

### Test Coverage
- **Unit Tests**: All chart components, hooks, and utilities
- **Integration Tests**: Upload flow, WebSocket handling, error scenarios
- **Performance Tests**: Chart rendering with large datasets
- **Current Coverage**: 90%+ for critical paths

## 🚀 Deployment

### Build Process
```bash
# Production build
npm run build

# Preview build locally
npm run preview

# Analyze bundle size
npm run build:analyze
```

### Environment Variables
```bash
# API endpoints
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000

# Build configuration
NODE_ENV=production
```

### Performance Metrics
- **Initial Load**: ~100KB (core app)
- **Time to Interactive**: <3 seconds
- **Chart Load**: ~300ms (lazy loaded)
- **Bundle Total**: 644KB optimized

## 📱 Browser Support

### Requirements
- **WebAudio API**: For audio playback
- **WebSocket**: For real-time updates
- **Canvas 2D**: For chart rendering
- **ES2020+**: Modern JavaScript features

### Tested Browsers
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

## 📖 Documentation

- **[Phase 3 Completion Report](./docs/PHASE_3_COMPLETION.md)**: Detailed technical implementation
- **[API Integration Guide](../API_GUIDE.md)**: Backend integration details
- **[Component Documentation](./src/components/README.md)**: Reusable component guide

## 🤝 Contributing

### Development Guidelines
- **TypeScript First**: All code must be properly typed
- **Test Coverage**: Write tests for new components and features
- **Performance**: Consider bundle size and runtime performance
- **Accessibility**: Ensure ARIA labels and keyboard navigation

### Code Standards
- ESLint + Prettier for code quality
- Conventional commits recommended
- Pre-commit hooks with Husky
- Comprehensive error handling

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- MusicChat V2 backend team for the powerful analysis API
- React, Vite, and Chart.js communities for excellent tools
- All contributors and testers who made Phase 3 possible

---

**MusicChat Web UI** - Empowering musicians and audio engineers with professional-grade analysis and visualization tools 🎵