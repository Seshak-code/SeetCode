// Completely regenerate C++ for two-sum and walls-and-gates from scratch
import { dbAll, dbRun } from './src/services/databaseService.js';

const twoSumCpp = `#include <iostream>
#include <vector>
#include <chrono>
#include <unordered_map>
#include <string>
#include <cstdlib>
#include "solution.h"

using namespace std;

string vec2str(const vector<int>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) {
        s += to_string(v[i]);
        if (i < v.size() - 1) s += ",";
    }
    s += "]";
    return s;
}

vector<int> solveExpected(vector<int>& nums, int target) {
    unordered_map<int,int> mp;
    for (int i = 0; i < (int)nums.size(); i++) {
        int comp = target - nums[i];
        if (mp.count(comp)) return {mp[comp], i};
        mp[nums[i]] = i;
    }
    return {};
}

struct TestCase { vector<int> nums; int target; string name; };

int main(int argc, char* argv[]) {
    int limit = 50;
    if (argc > 1) limit = stoi(argv[1]);

    vector<TestCase> tests;
    tests.push_back({{2,7,11,15}, 9, "1. Example 1"});
    tests.push_back({{3,2,4}, 6, "2. Example 2"});
    tests.push_back({{3,3}, 6, "3. Example 3"});
    tests.push_back({{1,2,3,4,5}, 9, "4. Last two"});
    tests.push_back({{-3,4,3,90}, 0, "5. Negatives"});

    srand(42);
    for (int i = tests.size(); i < 50; i++) {
        int sz = rand() % 5000 + 100;
        vector<int> nums(sz);
        for (auto& x : nums) x = rand() % 200001 - 100000;
        int id1 = rand() % sz, id2 = rand() % sz;
        while (id1 == id2) id2 = rand() % sz;
        int target = nums[id1] + nums[id2];
        tests.push_back({nums, target, "Random " + to_string(i+1)});
    }
    if (limit < (int)tests.size()) tests.resize(limit);

    Solution sol;
    auto t0 = chrono::high_resolution_clock::now();
    int passed = 0;

    cout << "---TEST_RESULTS_START---\\n";
    for (int i = 0; i < (int)tests.size(); i++) {
        auto& t = tests[i];
        auto nums2 = t.nums;
        string in_str = t.name + "<br>nums=[" + to_string(nums2.size()) + " elems]<br>target=" + to_string(t.target);
        try {
            auto res = sol.twoSum(nums2, t.target);
            bool ok = res.size() == 2 && nums2[res[0]] + nums2[res[1]] == t.target && res[0] != res[1];
            if (ok) {
                passed++;
                cout << i+1 << "|PASS|" << in_str << "|" << vec2str(res) << "|valid\\n";
            } else {
                cout << i+1 << "|FAIL|" << in_str << "|" << vec2str(res) << "|sum does not equal target\\n";
            }
        } catch (...) {
            cout << i+1 << "|FAIL|" << in_str << "|[]|Runtime Error\\n";
        }
    }
    cout << "---TEST_RESULTS_END---\\n";
    auto t1 = chrono::high_resolution_clock::now();
    chrono::duration<double,std::milli> dur = t1 - t0;
    cout << "SUMMARY|" << passed << "|" << tests.size() << "|" << dur.count() << "\\n";
    return 0;
}
`;

const wallsAndGatesCpp = `#include <iostream>
#include <vector>
#include <chrono>
#include <queue>
#include <string>
#include <cstdlib>
#include <climits>
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
    s += "]"; return s;
}

void solveExpected(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    queue<pair<int,int>> q;
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            if (grid[i][j] == 0) q.push({i, j});
    int dirs[4][2] = {{-1,0},{1,0},{0,-1},{0,1}};
    while (!q.empty()) {
        auto [r,c] = q.front(); q.pop();
        for (auto& d : dirs) {
            int nr = r+d[0], nc = c+d[1];
            if (nr>=0 && nr<m && nc>=0 && nc<n && grid[nr][nc] == INT_MAX) {
                grid[nr][nc] = grid[r][c] + 1;
                q.push({nr, nc});
            }
        }
    }
}

struct TestCase { vector<vector<int>> grid; string name; };

int main(int argc, char* argv[]) {
    int limit = 50;
    if (argc > 1) limit = stoi(argv[1]);
    const int INF = INT_MAX;

    vector<TestCase> tests;
    tests.push_back({{{INF,-1,0,INF},{INF,INF,INF,-1},{INF,-1,INF,-1},{0,-1,INF,INF}}, "1. Example 1"});
    tests.push_back({{{INF}}, "2. Single Empty"});
    tests.push_back({{{0}}, "3. Single Gate"});
    tests.push_back({{{-1}}, "4. Single Wall"});
    tests.push_back({{{0,-1,INF}}, "5. Thin"});
    tests.push_back({{{0,-1,INF},{-1,-1,-1},{INF,-1,0}}, "6. Unreachable"});

    srand(1234);
    for (int i = tests.size(); i < 50; i++) {
        int m = rand()%20+2, n = rand()%20+2;
        vector<vector<int>> g(m, vector<int>(n, INF));
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) {
                int p = rand()%100;
                if (p < 10) g[r][c] = 0;
                else if (p < 30) g[r][c] = -1;
            }
        tests.push_back({g, "Random " + to_string(i+1)});
    }
    if (limit < (int)tests.size()) tests.resize(limit);

    Solution sol;
    auto t0 = chrono::high_resolution_clock::now();
    int passed = 0;

    cout << "---TEST_RESULTS_START---\\n";
    for (int i = 0; i < (int)tests.size(); i++) {
        auto expected = tests[i].grid;
        solveExpected(expected);
        auto userGrid = tests[i].grid;
        string in_str = tests[i].name + "<br>rooms=<br>" + vec2str(tests[i].grid);
        try {
            sol.wallsAndGates(userGrid);
            if (userGrid == expected) {
                passed++;
                cout << i+1 << "|PASS|" << in_str << "|" << vec2str(userGrid) << "|" << vec2str(expected) << "\\n";
            } else {
                cout << i+1 << "|FAIL|" << in_str << "|" << vec2str(userGrid) << "|" << vec2str(expected) << "\\n";
            }
        } catch (...) {
            cout << i+1 << "|FAIL|" << in_str << "|[]|Runtime Error\\n";
        }
    }
    cout << "---TEST_RESULTS_END---\\n";
    auto t1 = chrono::high_resolution_clock::now();
    chrono::duration<double,std::milli> dur = t1 - t0;
    cout << "SUMMARY|" << passed << "|" << tests.size() << "|" << dur.count() << "\\n";
    return 0;
}
`;

async function regenerate() {
    const rows = await dbAll('SELECT problem_slug, test_wrappers FROM problem_tests');
    for (let row of rows) {
        let w = JSON.parse(row.test_wrappers);
        if (row.problem_slug === 'two-sum') {
            w.cpp = twoSumCpp;
            await dbRun('UPDATE problem_tests SET test_wrappers = ? WHERE problem_slug = ?', [JSON.stringify(w), row.problem_slug]);
            console.log('Regenerated two-sum C++');
        }
        if (row.problem_slug === 'walls-and-gates') {
            w.cpp = wallsAndGatesCpp;
            await dbRun('UPDATE problem_tests SET test_wrappers = ? WHERE problem_slug = ?', [JSON.stringify(w), row.problem_slug]);
            console.log('Regenerated walls-and-gates C++');
        }
    }
    console.log('Done.');
}

regenerate().catch(console.error);
