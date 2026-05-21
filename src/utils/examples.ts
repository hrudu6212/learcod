import { CodeSnippet } from '../types';

export const CODE_EXAMPLES: CodeSnippet[] = [
  {
    id: 'bubble-sort',
    title: 'The Bubble Sort Race',
    language: 'javascript',
    category: 'Algorithms',
    difficulty: 'Beginner',
    initialDescription: 'Watch how slow numbers bubble their way up to the top, like gas bubbles escaping a deep ocean trench.',
    code: `function bubbleSort(arr) {
  let len = arr.length;
  let swapped;
  
  do {
    swapped = false;
    for (let i = 0; i < len - 1; i++) {
      // Compare neighboring items
      if (arr[i] > arr[i + 1]) {
        // Swap them if they are out of order
        let temp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = temp;
        swapped = true;
      }
    }
    // Optimization: decrease search area as largest is at the end
    len--;
  } while (swapped);
  
  return arr;
}`
  },
  {
    id: 'fibonacci-recursion',
    title: 'The Recursive Fibonacci Echo',
    language: 'python',
    category: 'Algorithms',
    difficulty: 'Intermediate',
    initialDescription: 'A journey through a hall of mirrors where each reflection calls two smaller reflections to solve a mystery.',
    code: `def fibonacci(n):
    # Base Case: The foundation of the portal
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    
    # Recursive Step: Splitting the quest into two sub-quests
    else:
        left_path = fibonacci(n - 1)
        right_path = fibonacci(n - 2)
        return left_path + right_path`
  },
  {
    id: 'async-fetch',
    title: 'The Fetch Quest (API Call)',
    language: 'javascript',
    category: 'Web Dev',
    difficulty: 'Beginner',
    initialDescription: 'A messenger is dispatched to a distant castle to fetch treasure. It handles storms, empty chests, and coordinates response data.',
    code: `async function retrieveDragonTreasure(lootId) {
  const url = \`https://api.dragonslair.com/treasures/\${lootId}\`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Lair closed! Dragon is awake!");
    }
    
    const treasure = await response.json();
    return {
      success: true,
      gold: treasure.goldAmount,
      relic: treasure.relicName
    };
  } catch (error) {
    console.error("Quest Failed:", error.message);
    return { success: false, error: error.message };
  }
}`
  },
  {
    id: 'binary-search',
    title: 'The Binary Search Portal',
    language: 'cpp',
    category: 'Algorithms',
    difficulty: 'Intermediate',
    initialDescription: 'Finding a hidden item in a sorted treasure library by repeatedly cutting the remaining search area in half.',
    code: `int binarySearch(int arr[], int size, int target) {
    int low = 0;
    int high = size - 1;
    
    while (low <= high) {
        int mid = low + (high - low) / 2;
        
        // Target is found in the magical middle chamber
        if (arr[mid] == target) {
            return mid;
        }
        // If target is larger, ignore left half
        if (arr[mid] < target) {
            low = mid + 1;
        }
        // If target is smaller, ignore right half
        else {
            high = mid - 1;
        }
    }
    
    // Target was not found in the library
    return -1;
}`
  },
  {
    id: 'sql-join',
    title: 'The Grand Wedding (SQL Joins)',
    language: 'sql',
    category: 'Databases',
    difficulty: 'Beginner',
    initialDescription: 'Merging two isolated clans, the Customer House and the Order House, using their shared lineage of customer keys.',
    code: `SELECT 
    Customers.customer_id,
    Customers.name AS bride_name,
    Orders.order_id,
    Orders.total_amount AS dowry_value
FROM 
    Customers
INNER JOIN 
    Orders 
ON 
    Customers.customer_id = Orders.customer_id
WHERE 
    Orders.order_date >= '2026-01-01'
ORDER BY 
    Orders.total_amount DESC;`
  }
];
