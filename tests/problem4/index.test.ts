import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from '../../src/problem4';

describe('sum_to_n implementations', () => {
  const testCases: [number, number][] = [
    [1, 1],
    [2, 3],
    [3, 6],
    [4, 10],
    [5, 15],
    [10, 55],
    [100, 5050],
    [0, 0],
    [-5, -15], // negative numbers: -5 + -4 + -3 + -2 + -1 = -15
  ];

  describe('sum_to_n_a (Mathematical Formula)', () => {
    test.each(testCases)('sum_to_n_a(%i) should return %i', (n, expected) => {
      expect(sum_to_n_a(n)).toBe(expected);
    });
  });

  describe('sum_to_n_b (Iterative)', () => {
    test.each(testCases)('sum_to_n_b(%i) should return %i', (n, expected) => {
      expect(sum_to_n_b(n)).toBe(expected);
    });
  });

  describe('sum_to_n_c (Recursive)', () => {
    test.each(testCases)('sum_to_n_c(%i) should return %i', (n, expected) => {
      expect(sum_to_n_c(n)).toBe(expected);
    });
  });

  describe('Performance comparison', () => {
    it('all implementations should produce the same result', () => {
      const testValues = [1, 5, 10, 50, 100, 500, 1000];

      testValues.forEach((n) => {
        const resultA = sum_to_n_a(n);
        const resultB = sum_to_n_b(n);
        const resultC = sum_to_n_c(n);

        expect(resultB).toBe(resultA);
        expect(resultC).toBe(resultA);
      });
    });
  });
});
