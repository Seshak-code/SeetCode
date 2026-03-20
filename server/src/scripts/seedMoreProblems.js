import { dbRun, createProblem } from '../services/databaseService.js';

const matrix01Data = {
  "slug": "01-matrix",
  "title": "542. 01 Matrix",
  "difficulty": "Medium",
  "summary": "Given an m x n binary matrix mat, return the distance of the nearest 0 for each cell.",
  "description": "Given an <code>m x n</code> binary matrix <code>mat</code>, return the distance of the nearest 0 for each cell.\n\nThe distance between two adjacent cells is 1.",
  "themes": [
    "Array",
    "Dynamic Programming",
    "Breadth-First Search",
    "Matrix"
  ],
  "topics": [
    "Array",
    "Dynamic Programming",
    "Breadth-First Search",
    "Matrix"
  ],
  "constraints": [
    "m == mat.length",
    "n == mat[i].length",
    "1 <= m, n <= 100",
    "mat[i][j] is either 0 or 1",
    "There is at least one 0 in mat."
  ],
  "examples": [
    {
      "input": "mat = [[0,0,0],[0,1,0],[0,0,0]]",
      "output": "[[0,0,0],[0,1,0],[0,0,0]]"
    },
    {
      "input": "mat = [[0,0,0],[0,1,0],[1,1,1]]",
      "output": "[[0,0,0],[0,1,0],[1,2,1]]"
    }
  ],
  "starterCode": {
    "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> updateMatrix(vector<vector<int>>& mat) {\n        \n    }\n};",
    "javascript": "function updateMatrix(mat) {\n  \n}"
  }
};

const matrix01CppTemplate = `#include <iostream>
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

void solveExpected(vector<vector<int>>& mat, vector<vector<int>>& expected) {
    int m = mat.size(), n = mat[0].size();
    expected.assign(m, vector<int>(n, 100000));
    queue<pair<int, int>> q;
    for(int i = 0; i < m; i++) {
        for(int j = 0; j < n; j++) {
            if(mat[i][j] == 0) { expected[i][j] = 0; q.push({i, j}); }
        }
    }
    int dirs[4][2] = {{-1,0}, {1,0}, {0,-1}, {0,1}};
    while(!q.empty()) {
        auto p = q.front(); q.pop();
        int r = p.first, c = p.second;
        for(auto& d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if(nr >= 0 && nr < m && nc >= 0 && nc < n && expected[nr][nc] > expected[r][c] + 1) {
                expected[nr][nc] = expected[r][c] + 1;
                q.push({nr, nc});
            }
        }
    }
}

struct TestCase {
    vector<vector<int>> mat;
    string name;
};

int main(int argc, char* argv[]) {
    int limit = 50; 
    if (argc > 1) limit = stoi(argv[1]);

    vector<TestCase> tests;
    
    // Manual edge cases
    tests.push_back({{{0}}, "1. Single Cell 0"});
    tests.push_back({{{0,0,0},{0,0,0},{0,0,0}}, "2. All Zeros"});
    tests.push_back({{{1,1,1},{1,0,1},{1,1,1}}, "3. One Zero Center"});
    tests.push_back({{{0,1,1,1},{1,1,1,1},{1,1,1,1}}, "4. One Zero Corner"});
    tests.push_back({{{0,0,0},{0,1,0},{1,1,1}}, "5. Basic 2"});
    tests.push_back({{{0,0,0},{0,1,0},{0,0,0}}, "6. Basic 1"});
    vector<vector<int>> largeEmpty(100, vector<int>(100, 1)); largeEmpty[0][0] = 0;
    tests.push_back({largeEmpty, "7. Max Size Single Zero"});
    tests.push_back({{{0,1},{1,1}}, "8. 2x2 Basic"});
    tests.push_back({{{1},{1},{1},{0},{1}}, "9. 1xN Thin"});
    tests.push_back({{{0,1,1,1,1}}, "10. Nx1 Thin"});

    srand(12345);
    for(int i = tests.size(); i < 50; i++) {
        int m = rand() % 50 + 2, n = rand() % 50 + 2;
        vector<vector<int>> g(m, vector<int>(n, 1));
        int zeros = rand() % (m*n/2) + 1;
        for(int j=0; j<zeros; j++) {
            g[rand()%m][rand()%n] = 0;
        }
        tests.push_back({g, "Random Grid " + to_string(i+1)});
    }
    if (limit < tests.size()) tests.resize(limit);
    
    Solution sol;
    auto start = chrono::high_resolution_clock::now();
    int passed_count = 0;
    
    cout << "---TEST_RESULTS_START---
";
    for (int i = 0; i < tests.size(); i++) {
        vector<vector<int>> userGrid = tests[i].mat;
        vector<vector<int>> expectedGrid;
        solveExpected(tests[i].mat, expectedGrid);
        
        string input_str = tests[i].name + "<br>mat =<br>" + vec2str(tests[i].mat);
        vector<vector<int>> res;
        try { res = sol.updateMatrix(userGrid); } catch (...) {
            cout << i+1 << "|FAIL|" << input_str << "|[]|Runtime Error
";
            continue;
        }
        string out_str = vec2str(res);
        if (res == expectedGrid) {
            passed_count++;
            cout << i+1 << "|PASS|" << input_str << "|" << out_str << "|" << vec2str(expectedGrid) << "
";
        } else {
            cout << i+1 << "|FAIL|" << input_str << "|" << out_str << "|" << vec2str(expectedGrid) << "
";
        }
    }
    cout << "---TEST_RESULTS_END---
";
    auto end = chrono::high_resolution_clock::now();
    chrono::duration<double, std::milli> duration = end - start;
    cout << "SUMMARY|" << passed_count << "|" << tests.size() << "|" << duration.count() << "
";
    return 0;
}
`;

const rottingOrangesData = {
  "slug": "rotting-oranges",
  "title": "994. Rotting Oranges",
  "difficulty": "Medium",
  "summary": "Find minimum minutes to rot all oranges.",
  "description": "You are given an <code>m x n</code> grid where each cell can have one of three values:\n\n<code>0</code> representing an empty cell,\n<code>1</code> representing a fresh orange, or\n<code>2</code> representing a rotten orange.\nEvery minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.\n\nReturn the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.",
  "themes": [
    "Array",
    "Breadth-First Search",
    "Matrix"
  ],
  "topics": [
    "Array",
    "Breadth-First Search",
    "Matrix"
  ],
  "constraints": [
    "m == grid.length",
    "n == grid[i].length",
    "1 <= m, n <= 10",
    "grid[i][j] is 0, 1, or 2."
  ],
  "examples": [
    {
      "input": "grid = [[2,1,1],[1,1,0],[0,1,1]]",
      "output": "4"
    },
    {
      "input": "grid = [[2,1,1],[0,1,1],[1,0,1]]",
      "output": "-1"
    },
    {
      "input": "grid = [[0,2]]",
      "output": "0"
    }
  ],
  "starterCode": {
    "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int orangesRotting(vector<vector<int>>& grid) {\n        \n    }\n};",
    "javascript": "function orangesRotting(grid) {\n  \n}"
  }
};

const rottingOrangesCppTemplate = `#include <iostream>
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

int solveExpected(vector<vector<int>> grid) {
    int m = grid.size(), n = grid[0].size();
    queue<pair<int, int>> q;
    int fresh = 0;
    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < n; ++j) {
            if (grid[i][j] == 2) q.push({i, j});
            else if (grid[i][j] == 1) fresh++;
        }
    }
    if (fresh == 0) return 0;
    int mins = 0;
    int dirs[4][2] = {{-1,0},{1,0},{0,-1},{0,1}};
    while (!q.empty()) {
        int sz = q.size();
        bool rotted = false;
        while (sz--) {
            auto p = q.front(); q.pop();
            for (auto d : dirs) {
                int r = p.first + d[0], c = p.second + d[1];
                if (r >= 0 && r < m && c >= 0 && c < n && grid[r][c] == 1) {
                    grid[r][c] = 2;
                    fresh--;
                    rotted = true;
                    q.push({r, c});
                }
            }
        }
        if (rotted) mins++;
    }
    return fresh == 0 ? mins : -1;
}

struct TestCase {
    vector<vector<int>> grid;
    string name;
};

int main(int argc, char* argv[]) {
    int limit = 50; 
    if (argc > 1) limit = stoi(argv[1]);

    vector<TestCase> tests;
    
    // Manual edge cases
    tests.push_back({{{2,1,1},{1,1,0},{0,1,1}}, "1. Example 1"});
    tests.push_back({{{2,1,1},{0,1,1},{1,0,1}}, "2. Example 2 - Impossible"});
    tests.push_back({{{0,2}}, "3. Example 3 - Zero Mins"});
    tests.push_back({{{0}}, "4. Empty 0"});
    tests.push_back({{{1}}, "5. Impossible 1"});
    tests.push_back({{{2}}, "6. Solved 2"});
    tests.push_back({{{2,1,1,1,1,1,1,1,1,1}}, "7. Thin Grid"});
    tests.push_back({{{2},{1},{1},{1},{1}}, "8. Thin Grid Vert"});
    vector<vector<int>> maxGrid(10, vector<int>(10, 1)); maxGrid[0][0] = 2;
    tests.push_back({maxGrid, "9. Max Size 10x10"});
    tests.push_back({{{1,1},{2,2}}, "10. Mixed initial rots"});

    srand(6789);
    for(int i = tests.size(); i < 50; i++) {
        int m = rand() % 10 + 1, n = rand() % 10 + 1;
        vector<vector<int>> g(m, vector<int>(n, 0));
        for(int r = 0; r < m; r++) {
            for(int c = 0; c < n; c++) {
               int p = rand() % 100;
               if (p < 50) g[r][c] = 1;
               else if (p < 80) g[r][c] = 0;
               else g[r][c] = 2;
            }
        }
        tests.push_back({g, "Random Grid " + to_string(i+1)});
    }
    if (limit < tests.size()) tests.resize(limit);
    
    Solution sol;
    auto start = chrono::high_resolution_clock::now();
    int passed_count = 0;
    
    cout << "---TEST_RESULTS_START---
";
    for (int i = 0; i < tests.size(); i++) {
        vector<vector<int>> userGrid = tests[i].grid;
        int expected = solveExpected(userGrid);
        
        string input_str = tests[i].name + "<br>grid =<br>" + vec2str(tests[i].grid);
        int res;
        try { res = sol.orangesRotting(userGrid); } catch (...) {
            cout << i+1 << "|FAIL|" << input_str << "|[]|Runtime Error
";
            continue;
        }
        string out_str = to_string(res);
        if (res == expected) {
            passed_count++;
            cout << i+1 << "|PASS|" << input_str << "|" << out_str << "|" << expected << "
";
        } else {
            cout << i+1 << "|FAIL|" << input_str << "|" << out_str << "|" << expected << "
";
        }
    }
    cout << "---TEST_RESULTS_END---
";
    auto end = chrono::high_resolution_clock::now();
    chrono::duration<double, std::milli> duration = end - start;
    cout << "SUMMARY|" << passed_count << "|" << tests.size() << "|" << duration.count() << "
";
    return 0;
}
`;

const floodFillData = {
  "slug": "flood-fill",
  "title": "733. Flood Fill",
  "difficulty": "Easy",
  "summary": "Perform a flood fill on the image starting from the given pixel.",
  "description": "An image is represented by an <code>m x n</code> integer grid image where <code>image[i][j]</code> represents the pixel value of the image.\n\nYou are also given three integers <code>sr</code>, <code>sc</code>, and <code>color</code>. You should perform a flood fill on the image starting from the pixel <code>image[sr][sc]</code>.",
  "themes": [
    "Array",
    "Depth-First Search",
    "Breadth-First Search",
    "Matrix"
  ],
  "topics": [
    "Array",
    "Depth-First Search",
    "Breadth-First Search",
    "Matrix"
  ],
  "constraints": [
    "m == image.length",
    "n == image[i].length",
    "1 <= m, n <= 50",
    "0 <= image[i][j], color < 65536",
    "0 <= sr < m",
    "0 <= sc < n"
  ],
  "examples": [
    {
      "input": "image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2",
      "output": "[[2,2,2],[2,2,0],[2,0,1]]"
    },
    {
      "input": "image = [[0,0,0],[0,0,0]], sr = 0, sc = 0, color = 0",
      "output": "[[0,0,0],[0,0,0]]"
    }
  ],
  "starterCode": {
    "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {\n        \n    }\n};",
    "javascript": "function floodFill(image, sr, sc, color) {\n  \n}"
  }
};

const floodFillCppTemplate = `#include <iostream>
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

void solveExpected(vector<vector<int>>& image, int sr, int sc, int newColor) {
    int m = image.size(), n = image[0].size();
    int oldColor = image[sr][sc];
    if (oldColor == newColor) return;
    queue<pair<int, int>> q;
    q.push({sr, sc});
    image[sr][sc] = newColor;
    int dirs[4][2] = {{-1,0}, {1,0}, {0,-1}, {0,1}};
    while(!q.empty()) {
        auto p = q.front(); q.pop();
        for(auto& d : dirs) {
            int r = p.first + d[0], c = p.second + d[1];
            if(r >= 0 && r < m && c >= 0 && c < n && image[r][c] == oldColor) {
                image[r][c] = newColor;
                q.push({r, c});
            }
        }
    }
}

struct TestCase {
    vector<vector<int>> image;
    int sr;
    int sc;
    int color;
    string name;
};

int main(int argc, char* argv[]) {
    int limit = 50; 
    if (argc > 1) limit = stoi(argv[1]);

    vector<TestCase> tests;
    
    tests.push_back({{{1,1,1},{1,1,0},{1,0,1}}, 1, 1, 2, "1. Example 1"});
    tests.push_back({{{0,0,0},{0,0,0}}, 0, 0, 0, "2. Example 2 - Same color"});
    tests.push_back({{{0}}, 0, 0, 1, "3. Single pixel change"});
    tests.push_back({{{0}}, 0, 0, 0, "4. Single pixel noop"});
    vector<vector<int>> l(50, vector<int>(50, 1));
    tests.push_back({l, 25, 25, 2, "5. Max Size 50x50 full fill"});
    l[25][25] = 0;
    tests.push_back({l, 25, 25, 2, "6. Max Size 50x50 center only"});
    
    // Add 44 random ones
    srand(54321);
    for(int i = tests.size(); i < 50; i++) {
        int m = rand() % 50 + 1, n = rand() % 50 + 1;
        vector<vector<int>> g(m, vector<int>(n, 0));
        for(int r = 0; r < m; r++) {
            for(int c = 0; c < n; c++) {
               g[r][c] = rand() % 5;
            }
        }
        int sr = rand() % m, sc = rand() % n, color = rand() % 10;
        tests.push_back({g, sr, sc, color, "Random Grid " + to_string(i+1)});
    }
    if (limit < tests.size()) tests.resize(limit);
    
    Solution sol;
    auto start = chrono::high_resolution_clock::now();
    int passed_count = 0;
    
    cout << "---TEST_RESULTS_START---
";
    for (int i = 0; i < tests.size(); i++) {
        vector<vector<int>> userGrid = tests[i].image;
        vector<vector<int>> expectedGrid = tests[i].image;
        solveExpected(expectedGrid, tests[i].sr, tests[i].sc, tests[i].color);
        
        string input_str = tests[i].name + "<br>image =<br>" + vec2str(tests[i].image) + "<br>sr=" + to_string(tests[i].sr) + ", sc=" + to_string(tests[i].sc) + ", color=" + to_string(tests[i].color);
        vector<vector<int>> res;
        try { res = sol.floodFill(userGrid, tests[i].sr, tests[i].sc, tests[i].color); } catch (...) {
            cout << i+1 << "|FAIL|" << input_str << "|[]|Runtime Error
";
            continue;
        }
        string out_str = vec2str(res);
        if (res == expectedGrid) {
            passed_count++;
            cout << i+1 << "|PASS|" << input_str << "|" << out_str << "|" << vec2str(expectedGrid) << "
";
        } else {
            cout << i+1 << "|FAIL|" << input_str << "|" << out_str << "|" << vec2str(expectedGrid) << "
";
        }
    }
    cout << "---TEST_RESULTS_END---
";
    auto end = chrono::high_resolution_clock::now();
    chrono::duration<double, std::milli> duration = end - start;
    cout << "SUMMARY|" << passed_count << "|" << tests.size() << "|" << duration.count() << "
";
    return 0;
}
`;

const maxAreaOfIslandData = {
  "slug": "max-area-of-island",
  "title": "695. Max Area of Island",
  "difficulty": "Medium",
  "summary": "Return the maximum area of an island in grid.",
  "description": "You are given an <code>m x n</code> binary matrix <code>grid</code>. An island is a group of <code>1</code>'s (representing land) connected 4-directionally (horizontal or vertical). You may assume all four edges of the grid are surrounded by water.\n\nThe area of an island is the number of cells with a value <code>1</code> in the island.\n\nReturn the maximum area of an island in <code>grid</code>. If there is no island, return 0.",
  "themes": [
    "Array",
    "Depth-First Search",
    "Breadth-First Search",
    "Union Find",
    "Matrix"
  ],
  "topics": [
    "Array",
    "Depth-First Search",
    "Breadth-First Search",
    "Union Find",
    "Matrix"
  ],
  "constraints": [
    "m == grid.length",
    "n == grid[i].length",
    "1 <= m, n <= 50",
    "grid[i][j] is either 0 or 1"
  ],
  "examples": [
    {
      "input": "grid = [[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,1,1,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,1,0,1,0,0],[0,1,0,0,1,1,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0]]",
      "output": "6"
    },
    {
      "input": "grid = [[0,0,0,0,0,0,0,0]]",
      "output": "0"
    }
  ],
  "starterCode": {
    "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxAreaOfIsland(vector<vector<int>>& grid) {\n        \n    }\n};",
    "javascript": "function maxAreaOfIsland(grid) {\n  \n}"
  }
};

const maxAreaOfIslandCppTemplate = `#include <iostream>
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

int dfs(vector<vector<int>>& grid, int r, int c) {
    if(r < 0 || r >= grid.size() || c < 0 || c >= grid[0].size() || grid[r][c] == 0) return 0;
    grid[r][c] = 0;
    return 1 + dfs(grid, r+1, c) + dfs(grid, r-1, c) + dfs(grid, r, c+1) + dfs(grid, r, c-1);
}

int solveExpected(vector<vector<int>> grid) {
    int maxArea = 0;
    for(int i=0; i<grid.size(); i++) {
        for(int j=0; j<grid[0].size(); j++) {
            if(grid[i][j] == 1) maxArea = max(maxArea, dfs(grid, i, j));
        }
    }
    return maxArea;
}

struct TestCase {
    vector<vector<int>> grid;
    string name;
};

int main(int argc, char* argv[]) {
    int limit = 50; 
    if (argc > 1) limit = stoi(argv[1]);

    vector<TestCase> tests;
    
    vector<vector<int>> ex1 = {
        {0,0,1,0,0,0,0,1,0,0,0,0,0},
        {0,0,0,0,0,0,0,1,1,1,0,0,0},
        {0,1,1,0,1,0,0,0,0,0,0,0,0},
        {0,1,0,0,1,1,0,0,1,0,1,0,0},
        {0,1,0,0,1,1,0,0,1,1,1,0,0},
        {0,0,0,0,0,0,0,0,0,0,1,0,0},
        {0,0,0,0,0,0,0,1,1,1,0,0,0},
        {0,0,0,0,0,0,0,1,1,0,0,0,0}
    };
    tests.push_back({ex1, "1. Example 1"});
    tests.push_back({{{0,0,0,0,0,0,0,0}}, "2. Example 2 - Zero"});
    tests.push_back({{{1}}, "3. Single Land"});
    tests.push_back({{{0}}, "4. Single Water"});
    tests.push_back({{{1,1,1},{1,1,1},{1,1,1}}, "5. Full Grid 9"});
    vector<vector<int>> large(50, vector<int>(50, 1));
    tests.push_back({large, "6. Max Size 50x50"});
    
    // Add 44 random ones
    srand(112233);
    for(int i = tests.size(); i < 50; i++) {
        int m = rand() % 50 + 1, n = rand() % 50 + 1;
        vector<vector<int>> g(m, vector<int>(n, 0));
        for(int r = 0; r < m; r++) {
            for(int c = 0; c < n; c++) {
               if(rand() % 100 < 40) g[r][c] = 1;
            }
        }
        tests.push_back({g, "Random Grid " + to_string(i+1)});
    }
    if (limit < tests.size()) tests.resize(limit);
    
    Solution sol;
    auto start = chrono::high_resolution_clock::now();
    int passed_count = 0;
    
    cout << "---TEST_RESULTS_START---
";
    for (int i = 0; i < tests.size(); i++) {
        vector<vector<int>> userGrid = tests[i].grid;
        int expected = solveExpected(userGrid);
        
        string input_str = tests[i].name + "<br>grid =<br>" + vec2str(tests[i].grid);
        int res;
        try { res = sol.maxAreaOfIsland(userGrid); } catch (...) {
            cout << i+1 << "|FAIL|" << input_str << "|[]|Runtime Error
";
            continue;
        }
        string out_str = to_string(res);
        if (res == expected) {
            passed_count++;
            cout << i+1 << "|PASS|" << input_str << "|" << out_str << "|" << expected << "
";
        } else {
            cout << i+1 << "|FAIL|" << input_str << "|" << out_str << "|" << expected << "
";
        }
    }
    cout << "---TEST_RESULTS_END---
";
    auto end = chrono::high_resolution_clock::now();
    chrono::duration<double, std::milli> duration = end - start;
    cout << "SUMMARY|" << passed_count << "|" << tests.size() << "|" << duration.count() << "
";
    return 0;
}
`;

const numberOfIslandsData = {
  "slug": "number-of-islands",
  "title": "200. Number of Islands",
  "difficulty": "Medium",
  "summary": "Return the number of islands in a 2D binary grid.",
  "description": "Given an <code>m x n</code> 2D binary grid <code>grid</code> which represents a map of <code>'1'</code>s (land) and <code>'0'</code>s (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
  "themes": [
    "Array",
    "Depth-First Search",
    "Breadth-First Search",
    "Union Find",
    "Matrix"
  ],
  "topics": [
    "Array",
    "Depth-First Search",
    "Breadth-First Search",
    "Union Find",
    "Matrix"
  ],
  "constraints": [
    "m == grid.length",
    "n == grid[i].length",
    "1 <= m, n <= 300",
    "grid[i][j] is '0' or '1'"
  ],
  "examples": [
    {
      "input": "grid = [[\\\"1\\\",\\\"1\\\",\\\"1\\\",\\\"1\\\",\\\"0\\\"],[\\\"1\\\",\\\"1\\\",\\\"0\\\",\\\"1\\\",\\\"0\\\"],[\\\"1\\\",\\\"1\\\",\\\"0\\\",\\\"0\\\",\\\"0\\\"],[\\\"0\\\",\\\"0\\\",\\\"0\\\",\\\"0\\\",\\\"0\\\"]]",
      "output": "1"
    },
    {
      "input": "grid = [[\\\"1\\\",\\\"1\\\",\\\"0\\\",\\\"0\\\",\\\"0\\\"],[\\\"1\\\",\\\"1\\\",\\\"0\\\",\\\"0\\\",\\\"0\\\"],[\\\"0\\\",\\\"0\\\",\\\"1\\\",\\\"0\\\",\\\"0\\\"],[\\\"0\\\",\\\"0\\\",\\\"0\\\",\\\"1\\\",\\\"1\\\"]]",
      "output": "3"
    }
  ],
  "starterCode": {
    "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        \n    }\n};",
    "javascript": "function numIslands(grid) {\n  \n}"
  }
};

const numberOfIslandsCppTemplate = `#include <iostream>
#include <vector>
#include <chrono>
#include <queue>
#include <string>
#include <cstdlib>
#include "solution.h"

using namespace std;

string vec2str(const vector<vector<char>>& mat) {
    if (mat.empty()) return "[]";
    string s = "[";
    for (size_t i = 0; i < mat.size(); i++) {
        s += "[";
        for (size_t j = 0; j < mat[i].size(); j++) {
            s += "\"";
            s += mat[i][j];
            s += "\"";
            if (j < mat[i].size() - 1) s += ",";
        }
        s += "]";
        if (i < mat.size() - 1) s += ",";
    }
    s += "]";
    return s;
}

void dfs(vector<vector<char>>& grid, int r, int c) {
    if(r < 0 || r >= grid.size() || c < 0 || c >= grid[0].size() || grid[r][c] == '0') return;
    grid[r][c] = '0';
    dfs(grid, r+1, c); dfs(grid, r-1, c); dfs(grid, r, c+1); dfs(grid, r, c-1);
}

int solveExpected(vector<vector<char>> grid) {
    int count = 0;
    for(int i=0; i<grid.size(); i++) {
        for(int j=0; j<grid[0].size(); j++) {
            if(grid[i][j] == '1') {
                count++;
                dfs(grid, i, j);
            }
        }
    }
    return count;
}

struct TestCase {
    vector<vector<char>> grid;
    string name;
};

int main(int argc, char* argv[]) {
    int limit = 50; 
    if (argc > 1) limit = stoi(argv[1]);

    vector<TestCase> tests;
    
    vector<vector<char>> ex1 = {
        {'1','1','1','1','0'},
        {'1','1','0','1','0'},
        {'1','1','0','0','0'},
        {'0','0','0','0','0'}
    };
    tests.push_back({ex1, "1. Example 1"});
    
    vector<vector<char>> ex2 = {
        {'1','1','0','0','0'},
        {'1','1','0','0','0'},
        {'0','0','1','0','0'},
        {'0','0','0','1','1'}
    };
    tests.push_back({ex2, "2. Example 2"});
    tests.push_back({{{'0','0'},{'0','0'}}, "3. Zero"});
    tests.push_back({{{'1'}}, "4. Single Land"});
    tests.push_back({{{'0'}}, "5. Single Water"});
    tests.push_back({{{'1','1','1'},{'1','1','1'},{'1','1','1'}}, "6. Full Grid 1"});
    vector<vector<char>> large(150, vector<char>(150, '1'));
    tests.push_back({large, "7. Max Size 150x150"});
    
    srand(99999);
    for(int i = tests.size(); i < 50; i++) {
        int m = rand() % 300 + 1, n = rand() % 300 + 1;
        
        // cap total area to avoid taking too much memory in tests (limit to bounds ~300 max length)
        if (m > 100) m = 100 + rand() % 200;
        if (n > 100) n = 100 + rand() % 200;
        if (m * n > 50000) { m = 200; n = 200; } // ensure reasonable speed
        
        vector<vector<char>> g(m, vector<char>(n, '0'));
        for(int r = 0; r < m; r++) {
            for(int c = 0; c < n; c++) {
               if(rand() % 100 < 30) g[r][c] = '1';
            }
        }
        tests.push_back({g, "Random Grid " + to_string(i+1)});
    }
    if (limit < tests.size()) tests.resize(limit);
    
    Solution sol;
    auto start = chrono::high_resolution_clock::now();
    int passed_count = 0;
    
    cout << "---TEST_RESULTS_START---
";
    for (int i = 0; i < tests.size(); i++) {
        vector<vector<char>> userGrid = tests[i].grid;
        int expected = solveExpected(userGrid);
        
        string input_str = tests[i].name + "<br>grid =<br>" + vec2str(tests[i].grid);
        int res;
        try { res = sol.numIslands(userGrid); } catch (...) {
            cout << i+1 << "|FAIL|" << input_str << "|[]|Runtime Error
";
            continue;
        }
        string out_str = to_string(res);
        if (res == expected) {
            passed_count++;
            cout << i+1 << "|PASS|" << input_str << "|" << out_str << "|" << expected << "
";
        } else {
            cout << i+1 << "|FAIL|" << input_str << "|" << out_str << "|" << expected << "
";
        }
    }
    cout << "---TEST_RESULTS_END---
";
    auto end = chrono::high_resolution_clock::now();
    chrono::duration<double, std::milli> duration = end - start;
    cout << "SUMMARY|" << passed_count << "|" << tests.size() << "|" << duration.count() << "
";
    return 0;
}
`;


async function init() {
  console.log('Seeding 5 new graph & matrix problems...');
  await createProblem(matrix01Data, { test_wrappers: { cpp: matrix01CppTemplate } });
  await createProblem(rottingOrangesData, { test_wrappers: { cpp: rottingOrangesCppTemplate } });
  await createProblem(floodFillData, { test_wrappers: { cpp: floodFillCppTemplate } });
  await createProblem(maxAreaOfIslandData, { test_wrappers: { cpp: maxAreaOfIslandCppTemplate } });
  await createProblem(numberOfIslandsData, { test_wrappers: { cpp: numberOfIslandsCppTemplate } });
  console.log('Seeding complete.');
}
init().catch(console.error);
