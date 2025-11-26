import Link from 'next/link';

const algorithms = [
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'Graph',
    description: 'Find the shortest path between nodes in a weighted graph.',
    complexity: {
      time: 'O((V + E) log V)',
      space: 'O(V)',
    },
  },
  {
    id: 'bellman-ford',
    name: 'Bellman-Ford Algorithm',
    category: 'Graph',
    description: 'Find shortest paths from a source node. Handles negative weights and detects negative cycles.',
    complexity: {
      time: 'O(V * E)',
      space: 'O(V)',
    },
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'Searching',
    description: 'Efficiently find a target value in a sorted array by repeatedly dividing the search space in half.',
    complexity: {
      time: 'O(log n)',
      space: 'O(1)',
    },
  },
  {
    id: 'quicksort',
    name: 'QuickSort',
    category: 'Sorting',
    description: 'Divide-and-conquer sorting algorithm that picks a pivot and partitions the array around it.',
    complexity: {
      time: 'O(n log n)',
      space: 'O(log n)',
    },
  },
];

export default function VisualizerPage() {
  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-semibold text-white mb-3">Algorithms</h1>
          <p className="text-slate-500">
            Select an algorithm to visualize its execution step by step.
          </p>
        </div>

        <div className="space-y-4">
          {algorithms.map((algo) => (
            <Link
              key={algo.id}
              href={`/visualizer/${algo.id}`}
              className="group block bg-white/[0.03] rounded-xl p-6 border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-medium text-white">
                      {algo.name}
                    </h2>
                    <span className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded">
                      {algo.category}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mb-4">
                    {algo.description}
                  </p>
                  <div className="flex gap-6 text-xs text-slate-600">
                    <span>
                      Time: <span className="text-slate-400 font-mono">{algo.complexity.time}</span>
                    </span>
                    <span>
                      Space: <span className="text-slate-400 font-mono">{algo.complexity.space}</span>
                    </span>
                  </div>
                </div>
                <span className="text-slate-500 group-hover:text-white transition-colors">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
