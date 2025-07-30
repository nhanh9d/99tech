/**
 * Implementation 1: Mathematical Formula (Gauss's Formula)
 * Time Complexity: O(1) - Constant time
 * Space Complexity: O(1) - Constant space
 *
 * This is the most efficient implementation using the mathematical formula
 * for the sum of an arithmetic sequence: n * (n + 1) / 2
 * It directly calculates the result without any iteration.
 * For negative numbers, it calculates the negative of the sum from 1 to |n|.
 */
export function sum_to_n_a(n: number): number {
  if (n >= 0) {
    return (n * (n + 1)) / 2;
  } else {
    // For negative n, sum from n to -1
    // This is equivalent to -(sum from 1 to |n|)
    const absN = Math.abs(n);
    return -((absN * (absN + 1)) / 2);
  }
}

/**
 * Implementation 2: Iterative Approach
 * Time Complexity: O(n) - Linear time
 * Space Complexity: O(1) - Constant space
 *
 * This implementation uses a simple loop to add each number.
 * For positive n: sums from 1 to n
 * For negative n: sums from n to -1
 * While less efficient than the mathematical formula, it's straightforward
 * and easy to understand.
 */
export function sum_to_n_b(n: number): number {
  let sum = 0;
  if (n >= 0) {
    for (let i = 1; i <= n; i++) {
      sum += i;
    }
  } else {
    for (let i = n; i <= -1; i++) {
      sum += i;
    }
  }
  return sum;
}

/**
 * Implementation 3: Recursive Approach
 * Time Complexity: O(n) - Linear time
 * Space Complexity: O(n) - Linear space (due to call stack)
 *
 * This implementation uses recursion to calculate the sum.
 * It's the least efficient due to the overhead of function calls
 * and the risk of stack overflow for large values of |n|.
 * However, it demonstrates a functional programming approach.
 */
export function sum_to_n_c(n: number): number {
  if (n === 0) {
    return 0;
  } else if (n > 0) {
    return n + sum_to_n_c(n - 1);
  } else {
    // For negative n, sum from n to -1
    return n + sum_to_n_c(n + 1);
  }
}
