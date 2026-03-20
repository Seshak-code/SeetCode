import { dbRun, createProblem } from '../services/databaseService.js';

function generateTestCases() {
  let tests = [
    '{{2, 7, 11, 15}, 9}',
    '{{3, 2, 4}, 6}',
    '{{3, 3}, 6}'
  ];
  
  // Programmatically generate 47 massive edge cases for performance profiling
  for(let i = 0; i < 47; i++) {
    let size = Math.floor(Math.random() * 5000) + 100; // Large arrays
    let nums = [];
    for(let j = 0; j < size; j++) {
      nums.push(Math.floor(Math.random() * 200000) - 100000);
    }
    
    // Pick two unique indices that construct the target
    let idx1 = Math.floor(Math.random() * size);
    let idx2 = Math.floor(Math.random() * size);
    while (idx2 === idx1) {
       idx2 = Math.floor(Math.random() * size);
    }
    let target = nums[idx1] + nums[idx2];
    
    tests.push(`{{${nums.join(',')}}, ${target}}`);
  }
  return tests.join(',\n        ');
}

async function init() {
  console.log('Re-initializing SQLite Database for full test suite...');

  // Wipe old tables to apply the fresh constraints
  await dbRun(`DROP TABLE IF EXISTS problem_tests`);
  await dbRun(`DROP TABLE IF EXISTS problems`);

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
      test_wrappers TEXT,
      FOREIGN KEY(problem_slug) REFERENCES problems(slug) ON DELETE CASCADE
    )
  `);

  console.log('Tables created. Generating 50 robust C++ assertions...');
  
  const descriptionHTML = `
Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.

You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.

You can return the answer in any order.

<br/><br/>
<strong>Follow-up:</strong> Can you come up with an algorithm that is less than <code>O(n<sup>2</sup>)</code> time complexity?
  `;

  const twoSumData = {
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    summary: 'Return indices of the two numbers such that they add up to a target.',
    description: descriptionHTML,
    acceptanceRate: '51.2%',
    topics: ['Array', 'Hash Table'],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    examples: [
      {
        image: '/example1.png',
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        image: '/example2.png',
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]'
      },
      {
        image: '/example3.png',
        input: 'nums = [3,3], target = 6',
        output: '[0,1]'
      }
    ],
    starterCode: {
      cpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};`,
      javascript: `function twoSum(nums, target) {\n  \n}`
    }
  };

  const mainCppTemplate = `
#include <iostream>
#include <vector>
#include <chrono>
#include "solution.h"

struct TestCase {
    std::vector<int> nums;
    int target;
};

std::string vec2str(const std::vector<int>& v) {
    std::string s = "[";
    for(int i=0; i<v.size(); ++i) { s += std::to_string(v[i]); if(i<v.size()-1) s += ","; }
    s += "]";
    return s;
}

int main(int argc, char* argv[]) {
    Solution sol;
    std::vector<TestCase> tests = {
        ${generateTestCases()}
    };
    
    int limit = tests.size();
    if (argc > 1) {
        limit = std::stoi(argv[1]);
        if (limit < tests.size()) {
            tests.resize(limit);
        }
    }
    
    auto start = std::chrono::high_resolution_clock::now();
    
    int passed_count = 0;
    std::cout << "---TEST_RESULTS_START---\\n";
    for (int i = 0; i < tests.size(); i++) {
        std::vector<int> res;
        std::string input_str = "nums =<br>" + vec2str(tests[i].nums) + "<br>target =<br>" + std::to_string(tests[i].target);
        try {
            res = sol.twoSum(tests[i].nums, tests[i].target);
        } catch (...) {
            std::cout << i+1 << "|FAIL|" << input_str << "|[]|Runtime Error\\n";
            continue;
        }
        
        std::string out_str = vec2str(res);
        if (res.size() != 2) {
            std::cout << i+1 << "|FAIL|" << input_str << "|" << out_str << "|Expected 2 valid indices\\n";
            continue;
        }
        if (res[0] == res[1] || res[0] < 0 || res[1] < 0 || res[0] >= tests[i].nums.size() || res[1] >= tests[i].nums.size()) {
            std::cout << i+1 << "|FAIL|" << input_str << "|" << out_str << "|Invalid boundary indices returned\\n";
            continue;
        }
        
        long long sum = (long long)tests[i].nums[res[0]] + tests[i].nums[res[1]];
        if (sum != tests[i].target) {
            std::cout << i+1 << "|FAIL|" << input_str << "|" << out_str << "|Output does not sum to target block.\\n";
            continue;
        }
        passed_count++;
        // Find expected by brute-force since it's just the C++ testing wrapper validating its own pair
        std::vector<int> expected;
        for(int x=0; x<tests[i].nums.size(); x++){
            for(int y=x+1; y<tests[i].nums.size(); y++){
                if(tests[i].nums[x] + tests[i].nums[y] == tests[i].target){
                    expected = {x, y};
                    break;
                }
            }
            if(!expected.empty()) break;
        }
        std::cout << i+1 << "|PASS|" << input_str << "|" << out_str << "|" << vec2str(expected) << "\\n";
    }
    std::cout << "---TEST_RESULTS_END---\\n";
    
    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> duration = end - start;
    
    std::cout << "SUMMARY|" << passed_count << "|" << tests.size() << "|" << duration.count() << "\\n";
    return 0;
}
`;

  const wallsAndGatesCppTemplate = `
#include <iostream>
#include <vector>
#include <chrono>
#include <queue>
#include <string>
#include <cstdlib>
#include "solution.h"

using namespace std;

string vec2str(const vector<vector<int>>& mat) {
    if (mat.empty()) return "[]";
    string s = "[";
    for (size_t i = 0; i < mat.size(); i++) {
        s += "[";
        for (size_t j = 0; j < mat[i].size(); j++) {
            s += to_string(mat[i][j]);
            if (j < mat[i].size() - 1) s += ",";
        }
        s += "]";
        if (i < mat.size() - 1) s += ",";
    }
    s += "]";
    return s;
}

void solveExpected(vector<vector<int>>& grid) {
    int m = grid.size();
    if (m == 0) return;
    int n = grid[0].size();
    queue<pair<int, int>> q;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == 0) q.push({i, j});
        }
    }
    vector<pair<int, int>> dirs = {{-1,0}, {1,0}, {0,-1}, {0,1}};
    while (!q.empty()) {
        auto p = q.front(); q.pop();
        int r = p.first, c = p.second;
        for (auto dir : dirs) {
            int nr = r + dir.first, nc = c + dir.second;
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == 2147483647) {
                grid[nr][nc] = grid[r][c] + 1;
                q.push({nr, nc});
            }
        }
    }
}

struct TestCase {
    vector<vector<int>> grid;
    string name;
};

int main(int argc, char* argv[]) {
    int limit = 50; 
    if (argc > 1) {
        limit = stoi(argv[1]);
    }

    vector<TestCase> tests;
    
    // Categorized Logic Gates
    tests.push_back({{{2147483647, -1, 0, 2147483647}, {2147483647, 2147483647, 2147483647, -1}, {2147483647, -1, 2147483647, -1}, {0, -1, 2147483647, 2147483647}}, "1. Basic Grid"});
    tests.push_back({{{2147483647}}, "2. Empty Room"});
    tests.push_back({{{0}}, "3. Single Gate"});
    tests.push_back({{{2147483647, 2147483647}, {2147483647, -1}}, "4. No Gates"});
    tests.push_back({{{0, 0}, {0, 0}}, "5. All Gates"});
    tests.push_back({{{0, -1, 2147483647}, {-1, -1, -1}, {2147483647, -1, 0}}, "6. Unreachable Rooms"});
    tests.push_back({{{0, 2147483647, -1, 2147483647}}, "7. Thin Grids 1xN"});
    tests.push_back({{{0, -1, 2147483647, 2147483647, 2147483647}, {2147483647, -1, 2147483647, -1, 2147483647}, {2147483647, -1, 2147483647, -1, 2147483647}, {2147483647, 2147483647, 2147483647, -1, 0}}, "8. The Maze"});
    
    vector<vector<int>> largeGrid(50, vector<int>(50, 2147483647));
    largeGrid[0][0] = 0;
    tests.push_back({largeGrid, "9. Large Empty Grid"});
    tests.push_back({{{-1, -1, -1}, {-1, 0, -1}, {-1, -1, -1}}, "10. Boundary Walls"});
    
    srand(12345);
    for(int i = tests.size(); i < 50; i++) {
        int m = rand() % 20 + 2, n = rand() % 20 + 2;
        vector<vector<int>> g(m, vector<int>(n, 2147483647));
        for(int r = 0; r < m; r++) {
            for(int c = 0; c < n; c++) {
               int p = rand() % 100;
               if (p < 10) g[r][c] = 0;
               else if (p < 30) g[r][c] = -1;
            }
        }
        tests.push_back({g, "Procedural Grid " + to_string(i+1)});
    }

    if (limit < tests.size()) tests.resize(limit);
    
    Solution sol;
    auto start = chrono::high_resolution_clock::now();
    int passed_count = 0;
    
    cout << "---TEST_RESULTS_START---\\n";
    for (int i = 0; i < tests.size(); i++) {
        vector<vector<int>> userGrid = tests[i].grid;
        vector<vector<int>> expectedGrid = tests[i].grid;
        solveExpected(expectedGrid);
        string input_str = tests[i].name + "<br>rooms =<br>" + vec2str(tests[i].grid);
        
        try { sol.wallsAndGates(userGrid); } catch (...) {
            cout << i+1 << "|FAIL|" << input_str << "|[]|Runtime Error\\n";
            continue;
        }
        
        string out_str = vec2str(userGrid);
        if (userGrid == expectedGrid) {
            passed_count++;
            cout << i+1 << "|PASS|" << input_str << "|" << out_str << "|" << vec2str(expectedGrid) << "\\n";
        } else {
            cout << i+1 << "|FAIL|" << input_str << "|" << out_str << "|" << vec2str(expectedGrid) << "\\n";
        }
    }
    cout << "---TEST_RESULTS_END---\\n";
    auto end = chrono::high_resolution_clock::now();
    chrono::duration<double, std::milli> duration = end - start;
    cout << "SUMMARY|" << passed_count << "|" << tests.size() << "|" << duration.count() << "\\n";
    return 0;
}
`;

  const wallsAndGatesData = {
    slug: 'walls-and-gates',
    title: '286. Walls and Gates',
    difficulty: 'Medium',
    summary: 'Fill each empty room with the algorithmic distance to its nearest reachable gate.',
    description: `
You are given an <code>m x n</code> grid initialized with three possible values:
<ul>
  <li><code>-1</code>: A wall or obstacle.</li>
  <li><code>0</code>: A gate.</li>
  <li><code>INF</code> (2147483647): An empty room.</li>
</ul>
<br/>
<strong>Your Task:</strong> Fill each empty room with the distance to its nearest gate. If an empty room cannot reach any gate (blocked by walls), it should remain <code>INF</code>.
    `,
    acceptanceRate: '64.1%',
    topics: ['Array', 'Breadth-First Search', 'Matrix'],
    constraints: [
      'm == rooms.length',
      'n == rooms[i].length',
      '1 <= m, n <= 250',
      'rooms[i][j] is either -1, 0, or 2147483647'
    ],
    examples: [
      {
        image: '/walls_gates_initial.png',
        input: 'rooms = [[2147483647,-1,0,2147483647],[2147483647,2147483647,2147483647,-1],[2147483647,-1,2147483647,-1],[0,-1,2147483647,2147483647]]',
        output: '[[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]',
        explanation: 'The resulting heat map maps boundaries and distances efficiently using BFS pathfinding.'
      },
      {
        image: '/walls_gates_final.png',
        input: 'rooms = [[0,-1,2147483647]]',
        output: '[[0,-1,2147483647]]',
        explanation: 'The final room is fully blocked off by a solid wall, remaining completely unreachable.'
      }
    ],
    starterCode: {
      cpp: `#include <vector>\n#include <queue>\nusing namespace std;\n\nclass Solution {\npublic:\n    void wallsAndGates(vector<vector<int>>& rooms) {\n        \n    }\n};`,
      javascript: `function wallsAndGates(rooms) {\n  \n}`
    }
  };

  await createProblem(twoSumData, { test_wrappers: { cpp: mainCppTemplate } });
  await createProblem(wallsAndGatesData, { test_wrappers: { cpp: wallsAndGatesCppTemplate } });
  
  console.log('Seeded problem "two-sum" & "walls-and-gates" with 100 massive testing blocks securely embedded into the Docker payload.');
  console.log('Initialization complete.');
}

init().catch(console.error);
