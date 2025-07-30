/**
 * Demo script for Problem 4 - Sum to N implementations
 */

import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './index';

console.log('=== Problem 4: Sum to N - Three Implementations ===\n');

// Test cases
const testCases = [1, 5, 10, 50, 100, -5, 0];

console.log('Testing all three implementations:\n');

testCases.forEach(n => {
  console.log(`n = ${n}:`);
  console.log(`  Method A (Mathematical): ${sum_to_n_a(n)}`);
  console.log(`  Method B (Iterative):    ${sum_to_n_b(n)}`);
  console.log(`  Method C (Recursive):    ${sum_to_n_c(n)}`);
  console.log();
});

// Performance comparison
console.log('=== Performance Comparison ===\n');

const performanceTest = (n: number) => {
  console.log(`Testing with n = ${n}:`);
  
  // Method A
  const startA = performance.now();
  for (let i = 0; i < 100000; i++) {
    sum_to_n_a(n);
  }
  const endA = performance.now();
  console.log(`  Method A: ${(endA - startA).toFixed(3)}ms for 100,000 iterations`);
  
  // Method B
  const startB = performance.now();
  for (let i = 0; i < 100000; i++) {
    sum_to_n_b(n);
  }
  const endB = performance.now();
  console.log(`  Method B: ${(endB - startB).toFixed(3)}ms for 100,000 iterations`);
  
  // Method C (fewer iterations due to recursion overhead)
  const startC = performance.now();
  for (let i = 0; i < 10000; i++) {
    sum_to_n_c(n);
  }
  const endC = performance.now();
  console.log(`  Method C: ${(endC - startC).toFixed(3)}ms for 10,000 iterations (10x less due to recursion)`);
  console.log();
};

performanceTest(100);
performanceTest(1000);

console.log('\n=== Complexity Analysis ===');
console.log('Method A - O(1) constant time, O(1) space');
console.log('Method B - O(n) linear time, O(1) space');
console.log('Method C - O(n) linear time, O(n) space (call stack)');
console.log('\nMethod A is the most efficient for all inputs!');