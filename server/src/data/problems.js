export const problems = [
  {
    id: 1,
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    summary: 'Return indices of the two numbers such that they add up to a target.',
    description:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.',
    acceptanceRate: '49.2%',
    topics: ['Array', 'Hash Table'],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9.'
      }
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  const seen = new Map();\n\n  for (let index = 0; index < nums.length; index += 1) {\n    const value = nums[index];\n    const complement = target - value;\n\n    if (seen.has(complement)) {\n      return [seen.get(complement), index];\n    }\n\n    seen.set(value, index);\n  }\n\n  return [];\n}`
    }
  },
  {
    id: 2,
    slug: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    summary: 'Determine if the input string has valid open and close brackets.',
    description:
      'Given a string s containing just the characters parentheses, brackets, and braces, determine if the input string is valid.',
    acceptanceRate: '40.7%',
    topics: ['String', 'Stack'],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only'],
    examples: [
      {
        input: 's = "()[]{}"',
        output: 'true'
      }
    ],
    starterCode: {
      javascript: `function isValid(s) {\n  const stack = [];\n  const pairs = { ')': '(', ']': '[', '}': '{' };\n\n  for (const char of s) {\n    if (!pairs[char]) {\n      stack.push(char);\n      continue;\n    }\n\n    if (stack.pop() !== pairs[char]) {\n      return false;\n    }\n  }\n\n  return stack.length === 0;\n}`
    }
  },
  {
    id: 3,
    slug: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    summary: 'Find the length of the longest substring without duplicate characters.',
    description:
      'Given a string s, find the length of the longest substring without repeating characters.',
    acceptanceRate: '35.8%',
    topics: ['Hash Table', 'String', 'Sliding Window'],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces'],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      }
    ],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {\n  let left = 0;\n  let maxLength = 0;\n  const lastSeen = new Map();\n\n  for (let right = 0; right < s.length; right += 1) {\n    const char = s[right];\n\n    if (lastSeen.has(char) && lastSeen.get(char) >= left) {\n      left = lastSeen.get(char) + 1;\n    }\n\n    lastSeen.set(char, right);\n    maxLength = Math.max(maxLength, right - left + 1);\n  }\n\n  return maxLength;\n}`
    }
  }
];
