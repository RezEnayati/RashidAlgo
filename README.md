# RashidAlgo

An interactive algorithm visualization platform built with Next.js. Learn algorithms through step-by-step visualizations and an AI-powered tutor.

## Features

- **Algorithm Visualizations** - Step through algorithms with interactive controls and auto-play
- **AI Tutor** - Ask questions about algorithms, complexity, and implementations (powered by Gemini)
- **Dark Theme** - Clean, modern dark interface

### Supported Algorithms

| Algorithm | Category | Time Complexity |
|-----------|----------|-----------------|
| Dijkstra's | Graph | O((V + E) log V) |
| Bellman-Ford | Graph | O(V * E) |
| Binary Search | Searching | O(log n) |
| QuickSort | Sorting | O(n log n) |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Graph Visualization**: React Flow
- **AI**: Google Gemini 1.5 Flash

## Getting Started

### Prerequisites

- Node.js 18+
- Google AI API key ([get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rashidalgo.git
cd rashidalgo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your GOOGLE_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/chat/        # AI chat API endpoint
│   ├── chat/            # AI tutor page
│   ├── visualizer/      # Algorithm visualizers
│   │   ├── dijkstra/
│   │   ├── bellman-ford/
│   │   ├── binary-search/
│   │   └── quicksort/
│   └── page.tsx         # Homepage
├── components/          # React components
├── lib/                 # Algorithm implementations
└── types/               # TypeScript types
```

## License

MIT
