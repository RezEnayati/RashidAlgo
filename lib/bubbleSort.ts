export interface BubbleSortStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  pass: number;
  description: string;
}

export interface BubbleSortResult {
  steps: BubbleSortStep[];
  sortedArray: number[];
}

export function bubbleSort(inputArray: number[]): BubbleSortResult {
  const steps: BubbleSortStep[] = [];
  const array = [...inputArray];
  const n = array.length;
  const sorted: Set<number> = new Set();

  function addStep(
    comparing: number[],
    swapping: number[],
    pass: number,
    description: string
  ) {
    steps.push({
      array: [...array],
      comparing: [...comparing],
      swapping: [...swapping],
      sorted: Array.from(sorted),
      pass,
      description,
    });
  }

  if (n === 0) {
    return { steps, sortedArray: array };
  }

  addStep([], [], 0, `Starting Bubble Sort on array of ${n} elements`);

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    addStep([], [], i + 1, `Pass ${i + 1}: Bubbling largest unsorted element to position ${n - 1 - i}`);

    for (let j = 0; j < n - i - 1; j++) {
      addStep([j, j + 1], [], i + 1, `Comparing ${array[j]} and ${array[j + 1]}`);

      if (array[j] > array[j + 1]) {
        addStep([], [j, j + 1], i + 1, `${array[j]} > ${array[j + 1]}, swapping`);
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        swapped = true;
      } else {
        addStep([], [], i + 1, `${array[j]} <= ${array[j + 1]}, no swap needed`);
      }
    }

    // Mark the last position of this pass as sorted
    sorted.add(n - 1 - i);
    addStep([], [], i + 1, `Element ${array[n - 1 - i]} is now in its final position`);

    // Early termination if no swaps occurred
    if (!swapped) {
      // Mark all remaining elements as sorted
      for (let k = 0; k < n - i - 1; k++) {
        sorted.add(k);
      }
      addStep([], [], i + 1, `No swaps in this pass - array is sorted early!`);
      break;
    }
  }

  // Ensure first element is marked sorted
  sorted.add(0);
  addStep([], [], n - 1, `Array is now fully sorted`);

  return {
    steps,
    sortedArray: array,
  };
}

// Generate a random array
export function generateRandomArray(size: number, max: number = 50): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 1);
}
