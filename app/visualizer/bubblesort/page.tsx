'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { bubbleSort, generateRandomArray, BubbleSortStep } from '@/lib/bubbleSort';

export default function BubbleSortVisualizerPage() {
  const [array, setArray] = useState<number[]>(() => generateRandomArray(12));
  const [steps, setSteps] = useState<BubbleSortStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(500);
  const [arraySize, setArraySize] = useState<string>('12');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length
    ? steps[currentStepIndex]
    : null;

  const displayArray = currentStep ? currentStep.array : array;
  const maxValue = Math.max(...displayArray, 1);

  // Auto-play effect
  useEffect(() => {
    if (isPlaying && isRunning) {
      intervalRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isRunning, speed, steps.length]);

  const handleGenerateArray = useCallback(() => {
    const size = Math.min(Math.max(parseInt(arraySize) || 12, 4), 20);
    setArray(generateRandomArray(size));
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsRunning(false);
    setIsPlaying(false);
  }, [arraySize]);

  const handleRunSort = useCallback(() => {
    const result = bubbleSort(array);
    setSteps(result.steps);
    setCurrentStepIndex(0);
    setIsRunning(true);
    setIsPlaying(false);
  }, [array]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleStepForward = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }, [currentStepIndex, steps.length]);

  const handleStepBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  const handleReset = useCallback(() => {
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsRunning(false);
    setIsPlaying(false);
  }, []);

  const getBarStyle = (index: number) => {
    if (!currentStep) return 'bg-blue-500';

    if (currentStep.sorted.includes(index)) {
      return 'bg-green-500';
    }
    if (currentStep.swapping.includes(index)) {
      return 'bg-red-500';
    }
    if (currentStep.comparing.includes(index)) {
      return 'bg-yellow-500';
    }
    return 'bg-blue-500';
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-900 flex">
      {/* Sidebar */}
      <div className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Array Size */}
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Array Size</h3>
          <div className="flex gap-2">
            <input
              type="number"
              min="4"
              max="20"
              value={arraySize}
              onChange={(e) => setArraySize(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleGenerateArray}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Generate
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">Range: 4-20 elements</p>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Controls</h3>
          <div className="space-y-2">
            <button
              onClick={handleRunSort}
              disabled={isRunning}
              className="w-full px-3 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              Run Bubble Sort
            </button>
            <button
              onClick={handleGenerateArray}
              className="w-full px-3 py-2 text-sm font-medium rounded-lg bg-slate-600 text-white hover:bg-slate-500 transition-colors"
            >
              New Array
            </button>
          </div>
        </div>

        {/* Playback */}
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Playback</h3>
          {isRunning && (
            <p className="text-sm text-slate-400 mb-3">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
          )}

          {/* Auto-play button */}
          {isRunning && (
            <button
              onClick={handlePlayPause}
              disabled={currentStepIndex >= steps.length - 1}
              className={`w-full mb-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isPlaying
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed`}
            >
              {isPlaying ? 'Pause' : 'Auto Play'}
            </button>
          )}

          {/* Speed control */}
          {isRunning && (
            <div className="mb-3">
              <label className="block text-xs text-slate-500 mb-1">
                Speed: {speed}ms
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                step="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Fast</span>
                <span>Slow</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleStepBack}
              disabled={!isRunning || currentStepIndex <= 0 || isPlaying}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-slate-700 text-white hover:bg-slate-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleStepForward}
              disabled={!isRunning || currentStepIndex >= steps.length - 1 || isPlaying}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-slate-700 text-white hover:bg-slate-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
          {isRunning && (
            <button
              onClick={handleReset}
              className="w-full mt-2 px-3 py-2 text-sm font-medium rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="p-4 mt-auto">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Legend</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className="text-slate-400">Comparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-slate-400">Swapping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-slate-400">Unsorted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-slate-400">Sorted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Step Description */}
        {currentStep && (
          <div className="p-4 bg-slate-800 border-b border-slate-700">
            <p className="text-sm text-slate-300">
              <span className="text-slate-500">Step {currentStepIndex + 1}:</span>{' '}
              {currentStep.description}
            </p>
          </div>
        )}

        {/* Array Visualization */}
        <div className="flex-1 flex items-end justify-center p-8 gap-1">
          {displayArray.map((value, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div
                className={`w-10 rounded-t-lg transition-all duration-300 ${getBarStyle(index)}`}
                style={{
                  height: `${(value / maxValue) * 300}px`,
                  minHeight: '20px',
                }}
              >
                <div className="text-xs text-white text-center pt-1 font-medium">
                  {value}
                </div>
              </div>
              <span className="text-xs text-slate-500">{index}</span>
            </div>
          ))}
        </div>

        {/* Bottom Panel - Complexity Info */}
        <div className="h-48 p-4 bg-slate-800 border-t border-slate-700">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Complexity */}
            <div className="bg-slate-900 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Complexity</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Time (avg)</span>
                  <span className="text-red-400 font-mono">O(n²)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Time (best)</span>
                  <span className="text-green-400 font-mono">O(n)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Space</span>
                  <span className="text-slate-400 font-mono">O(1)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Array Size</span>
                  <span className="text-slate-400">{displayArray.length} elements</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-slate-900 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Algorithm Info</h3>
              {currentStep ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Pass</span>
                    <span className="text-slate-300">{currentStep.pass}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sorted Elements</span>
                    <span className="text-green-400">{currentStep.sorted.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Remaining</span>
                    <span className="text-blue-400">{displayArray.length - currentStep.sorted.length}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Run the algorithm to see details.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
