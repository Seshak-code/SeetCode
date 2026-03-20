import { dbRun, createProblem } from '../services/databaseService.js';
import { problems } from '../data/problems.js';

async function init() {
  console.log('Creating database tables...');

  await dbRun(`
    CREATE TABLE IF NOT EXISTS problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE,
      title TEXT,
      difficulty TEXT,
      summary TEXT,
      description TEXT,
      acceptanceRate TEXT,
      topics TEXT,
      constraints TEXT,
      examples TEXT,
      starterCode TEXT
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS problem_tests (
      problem_slug TEXT PRIMARY KEY,
      mainCppTemplate TEXT,
      FOREIGN KEY(problem_slug) REFERENCES problems(slug)
    )
  `);

  console.log('Tables verified. Seeding two-sum...');
  
  const twoSum = problems.find(p => p.slug === 'two-sum');
  if (twoSum) {
    const mainCppTemplate = `
#include <iostream>
#include <vector>
#include <chrono>
#include "solution.h"

int main() {
    Solution sol;
    std::vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    
    auto start = std::chrono::high_resolution_clock::now();
    std::vector<int> res = sol.twoSum(nums, target);
    auto end = std::chrono::high_resolution_clock::now();
    
    std::chrono::duration<double, std::milli> duration = end - start;
    
    if (res.size() == 2 && res[0] == 0 && res[1] == 1) {
        std::cout << "SUCCESS|" << duration.count() << "\\n";
    } else {
        std::cout << "FAILURE|" << duration.count() << "\\n";
    }
    return 0;
}
`;
    await createProblem(twoSum, { mainCppTemplate });
    console.log('Seeded problem "two-sum".');
  }

  console.log('Initialization complete.');
}

init().catch(console.error);
