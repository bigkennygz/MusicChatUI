# MusicChat UI

> A modern React-based web interface for the MusicChat V2 music analysis system

MusicChat UI provides an intuitive interface for uploading, analyzing, and exploring music through advanced AI-powered analysis. It connects to the MusicChat backend API to deliver insights into rhythm, harmony, energy, mood, and structure of any audio file.

## 🚀 Features

### Current (Phase 1)
- ✅ JWT authentication with auto-refresh
- ✅ Responsive UI with Tailwind CSS
- ✅ Component library with accessibility
- ✅ Protected routes and navigation
- ✅ API client with comprehensive error handling
- ✅ WebSocket foundation for real-time updates
- ✅ TypeScript for type safety

### Upcoming (Phase 2-4)
- 📤 Drag-and-drop file upload with progress tracking
- 📊 Real-time visualization of 260+ audio features
- 🎵 Synchronized audio playback with waveforms
- 🔍 Natural language queries ("find the drop", "high energy sections")
- 📚 Track library management
- 🎛️ Stem separation controls (vocals, drums, bass, other)

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand (client) + React Query (server)
- **UI Components**: Radix UI for accessibility
- **Audio Visualization**: WaveSurfer.js (coming in Phase 3)
- **Charts**: Chart.js (coming in Phase 3)
- **Real-time**: Socket.io client

## 📋 Prerequisites

- Node.js 18+ and npm
- MusicChat backend running locally at `http://localhost:8000`
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🏃‍♂️ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/bigkennygz/MusicChatUI.git
   cd MusicChatUI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your backend URL if different from default.

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

5. **Login with demo credentials**
   - Username: `demo`
   - Password: `demo123`

## 🏗️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base components (Button, Input, etc.)
│   ├── layout/         # Layout components
│   └── common/         # Common components
├── features/           # Feature-based modules
│   ├── auth/          # Authentication
│   ├── upload/        # File upload (Phase 2)
│   ├── analysis/      # Analysis visualization (Phase 3)
│   └── query/         # Query interface (Phase 4)
├── lib/               # Core utilities
│   ├── api/          # API client and WebSocket
│   └── utils/        # Helper functions
├── types/            # TypeScript definitions
└── pages/            # Page components
```

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for formatting
- Conventional commits recommended

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

### Environment Variables

- `VITE_API_URL` - Backend API URL (default: `http://localhost:8000`)
- `VITE_WS_URL` - WebSocket URL (default: `ws://localhost:8000`)

## 📝 API Documentation

The MusicChat backend provides comprehensive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- MusicChat V2 backend team for the powerful analysis API
- React and Vite communities for excellent tools
- All contributors and testers

---

Built with ❤️ by Kent and the MusicChat team