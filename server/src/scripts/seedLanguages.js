import { dbRun, getProblemTestWrapper } from '../services/databaseService.js';

async function generateMultiLanguageWrappers() {
    console.log('Mounting JS, Python, and Java wrappers for Two Sum...');

    const twoSumJs = `
let twoSum;
let importError = null;
try {
    const sol = require('./solution.js');
    twoSum = sol.twoSum;
    if (!twoSum) importError = "Missing exported function twoSum";
} catch (e) {
    importError = e.name + ": " + e.message.replace(/\\n/g, ' ');
}

function vec2str(v) { return JSON.stringify(v); }

function main() {
    const args = process.argv.slice(2);
    const limit = args.length > 0 ? parseInt(args[0]) : 50;
    
    let tests = [
        {nums: [2, 7, 11, 15], target: 9, name: 'Basic Grid'},
        {nums: [3, 2, 4], target: 6, name: 'Basic Grid'},
        {nums: [3, 3], target: 6, name: 'Basic Grid'}
    ];
    
    for(let i = 3; i < 50; i++) {
        let size = Math.floor(Math.random() * 500) + 10;
        let nums = [];
        for(let j=0; j<size; j++) nums.push(Math.floor(Math.random()*200)-100);
        let i1 = Math.floor(Math.random() * size);
        let i2 = Math.floor(Math.random() * size);
        while(i1 === i2) i2 = Math.floor(Math.random() * size);
        tests.push({nums, target: nums[i1] + nums[i2], name: 'Procedural Grid'});
    }
    
    if (limit < tests.length) tests = tests.slice(0, limit);
    
    let passedCount = 0;
    const startTime = performance.now();
    
    console.log("---TEST_RESULTS_START---");
    for (let i = 0; i < tests.length; i++) {
        let nums = tests[i].nums;
        let target = tests[i].target;
        let inputStr = "nums =<br>" + vec2str(nums) + "<br>target =<br>" + target;
        
        if (importError) {
            console.log((i+1) + "|FAIL|" + inputStr + "|[]|" + importError);
            continue;
        }
        
        let res;
        try { res = twoSum(nums, target); } catch (err) {
            console.log((i+1) + "|FAIL|" + inputStr + "|[]|Runtime Error: " + err.name);
            continue;
        }
        
        let outStr = vec2str(res);
        if (!Array.isArray(res) || res.length !== 2) {
            console.log((i+1) + "|FAIL|" + inputStr + "|" + outStr + "|Expected 2 valid indices");
            continue;
        }
        
        let idx1 = res[0], idx2 = res[1];
        if (idx1 === idx2 || idx1 < 0 || idx2 < 0 || idx1 >= nums.length || idx2 >= nums.length) {
            console.log((i+1) + "|FAIL|" + inputStr + "|" + outStr + "|Invalid boundary indices returned");
            continue;
        }
        
        if (nums[idx1] + nums[idx2] !== target) {
            console.log((i+1) + "|FAIL|" + inputStr + "|" + outStr + "|Output does not sum to target box.");
            continue;
        }
        
        passedCount++;
        let expected = [];
        for(let x=0; x<nums.length; x++){
            for(let y=x+1; y<nums.length; y++){
                if(nums[x]+nums[y] === target){ expected = [x, y]; break; }
            }
            if(expected.length) break;
        }
        console.log((i+1) + "|PASS|" + inputStr + "|" + outStr + "|" + vec2str(expected));
    }
    console.log("---TEST_RESULTS_END---");
    console.log("SUMMARY|" + passedCount + "|" + tests.length + "|" + (performance.now() - startTime).toFixed(2));
}

main();
`;

    const twoSumPy = `
import sys, time

import_error = None
try:
    from solution import Solution
except BaseException as e:
    import_error = type(e).__name__ + ": " + str(e)

def vec2str(v): return str(v).replace(" ", "")

def main():
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 50
    tests = [
        {"nums": [2, 7, 11, 15], "target": 9},
        {"nums": [3, 2, 4], "target": 6},
        {"nums": [3, 3], "target": 6}
    ]
    import random
    random.seed(12345)
    for _ in range(3, 50):
        size = random.randint(10, 500)
        nums = [random.randint(-100, 100) for _ in range(size)]
        i1, i2 = random.sample(range(size), 2)
        tests.append({"nums": nums, "target": nums[i1] + nums[i2]})
        
    tests = tests[:limit]
    
    passed_count = 0
    start_time = time.time()
    
    sol = None
    if not import_error:
        try: sol = Solution()
        except BaseException as e: import_error = type(e).__name__ + ": " + str(e)

    print("---TEST_RESULTS_START---")
    for i, test in enumerate(tests):
        nums = test["nums"]
        target = test["target"]
        input_str = f"nums =<br>{vec2str(nums)}<br>target =<br>{target}"
        
        if import_error:
            print(f"{i+1}|FAIL|{input_str}|[]|Compilation Error: {import_error}")
            continue
            
        try: res = sol.twoSum(nums, target)
        except BaseException as e:
            print(f"{i+1}|FAIL|{input_str}|[]|Runtime Error: {type(e).__name__} - {str(e)}")
            continue
            
        out_str = vec2str(res)
        if not isinstance(res, list) or len(res) != 2:
            print(f"{i+1}|FAIL|{input_str}|{out_str}|Expected 2 valid indices")
            continue
            
        idx1, idx2 = res[0], res[1]
        if nums[idx1] + nums[idx2] != target:
            print(f"{i+1}|FAIL|{input_str}|{out_str}|Output does not sum to target block.")
            continue
            
        passed_count += 1
        expected = []
        for x in range(len(nums)):
            for y in range(x+1, len(nums)):
                if nums[x] + nums[y] == target:
                    expected = [x, y]
                    break
            if expected: break
            
        print(f"{i+1}|PASS|{input_str}|{out_str}|{vec2str(expected)}")
        
    print("---TEST_RESULTS_END---")
    duration = (time.time() - start_time) * 1000
    print(f"SUMMARY|{passed_count}|{len(tests)}|{duration:.2f}")

if __name__ == "__main__":
    main()
`;

    const twoSumJava = `
import java.util.*;

public class Main {
    public static void main(String[] args) {
        int limit = args.length > 0 ? Integer.parseInt(args[0]) : 50;
        
        class TestCase {
            int[] nums; int target;
            TestCase(int[] n, int t) { nums = n; target = t; }
        }
        
        List<TestCase> tests = new ArrayList<>();
        tests.add(new TestCase(new int[]{2, 7, 11, 15}, 9));
        tests.add(new TestCase(new int[]{3, 2, 4}, 6));
        tests.add(new TestCase(new int[]{3, 3}, 6));
        
        Random rand = new Random(12345);
        for(int i=3; i<50; i++) {
            int size = rand.nextInt(490) + 10;
            int[] nums = new int[size];
            for(int j=0; j<size; j++) nums[j] = rand.nextInt(200) - 100;
            int i1 = rand.nextInt(size);
            int i2 = rand.nextInt(size);
            while(i1 == i2) i2 = rand.nextInt(size);
            tests.add(new TestCase(nums, nums[i1] + nums[i2]));
        }
        
        if (limit < tests.size()) tests = tests.subList(0, limit);
        
        Solution sol = new Solution();
        int passedCount = 0;
        long startTime = System.nanoTime();
        
        System.out.println("---TEST_RESULTS_START---");
        for (int i = 0; i < tests.size(); i++) {
            int[] nums = tests.get(i).nums;
            int target = tests.get(i).target;
            String inputStr = "nums =<br>" + Arrays.toString(nums).replaceAll(" ", "") + "<br>target =<br>" + target;
            
            int[] res = null;
            try { res = sol.twoSum(nums, target); } catch (Exception e) {
                System.out.println((i+1) + "|FAIL|" + inputStr + "|[]|Runtime Error");
                continue;
            }
            
            String outStr = res != null ? Arrays.toString(res).replaceAll(" ", "") : "[]";
            if (res == null || res.length != 2) {
                System.out.println((i+1) + "|FAIL|" + inputStr + "|" + outStr + "|Expected 2 valid indices");
                continue;
            }
            
            if (nums[res[0]] + nums[res[1]] != target) {
                System.out.println((i+1) + "|FAIL|" + inputStr + "|" + outStr + "|Output does not sum to target block.");
                continue;
            }
            
            passedCount++;
            int[] expected = new int[2];
            boolean found = false;
            for(int x=0; x<nums.length; x++){
                for(int y=x+1; y<nums.length; y++){
                    if(nums[x]+nums[y] == target){
                        expected[0] = x; expected[1] = y;
                        found = true; break;
                    }
                }
                if(found) break;
            }
            
            System.out.println((i+1) + "|PASS|" + inputStr + "|" + outStr + "|" + Arrays.toString(expected).replaceAll(" ", ""));
        }
        System.out.println("---TEST_RESULTS_END---");
        double duration = (System.nanoTime() - startTime) / 1000000.0;
        System.out.println("SUMMARY|" + passedCount + "|" + tests.size() + "|" + String.format("%.2f", duration));
    }
}
`;

    // Fetch existing CPP wrappers
    let twoSumMeta = await getProblemTestWrapper('two-sum');
    if (twoSumMeta) {
        let wrappers = {
            cpp: twoSumMeta.test_wrappers ? JSON.parse(twoSumMeta.test_wrappers).cpp : twoSumMeta.mainCppTemplate, 
            javascript: twoSumJs,
            python: twoSumPy,
            java: twoSumJava
        };
        await dbRun('UPDATE problem_tests SET test_wrappers = ? WHERE problem_slug = ?', [JSON.stringify(wrappers), 'two-sum']);
        
        // Add starters
        let starters = {
            cpp: '#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};',
            javascript: 'function twoSum(nums, target) {\n  \n}\n\nmodule.exports = { twoSum };',
            python: 'class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        pass',
            java: 'import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}'
        };
        await dbRun('UPDATE problems SET starterCode = ? WHERE slug = ?', [JSON.stringify(starters), 'two-sum']);
    }

    console.log('Mounting JS, Python, and Java wrappers for Walls and Gates...');

    const wallsAndGatesJs = `
let wallsAndGates;
let importError = null;
try {
    const sol = require('./solution.js');
    wallsAndGates = sol.wallsAndGates;
    if (!wallsAndGates) importError = "Missing exported function wallsAndGates";
} catch (e) {
    importError = e.name + ": " + e.message.replace(/\\n/g, ' ');
}

function vec2str(v) { return JSON.stringify(v); }

function solveExpected(grid) {
    let m = grid.length;
    if (m === 0) return;
    let n = grid[0].length;
    let q = [];
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (grid[i][j] === 0) q.push([i, j]);
        }
    }
    const dirs = [[-1,0], [1,0], [0,-1], [0,1]];
    while (q.length > 0) {
        let [r, c] = q.shift();
        for (let [dr, dc] of dirs) {
            let nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === 2147483647) {
                grid[nr][nc] = grid[r][c] + 1;
                q.push([nr, nc]);
            }
        }
    }
}

function clone(grid) { return grid.map(row => [...row]); }

function main() {
    const args = process.argv.slice(2);
    const limit = args.length > 0 ? parseInt(args[0]) : 50;
    
    let tests = [
        {grid: [[2147483647, -1, 0, 2147483647], [2147483647, 2147483647, 2147483647, -1], [2147483647, -1, 2147483647, -1], [0, -1, 2147483647, 2147483647]], name: "1. Basic Grid"},
        {grid: [[2147483647]], name: "2. Empty Room"},
        {grid: [[0]], name: "3. Single Gate"}
    ];
    
    for(let i = tests.length; i < 50; i++) {
        let m = Math.floor(Math.random() * 20) + 2;
        let n = Math.floor(Math.random() * 20) + 2;
        let g = Array.from({length: m}, () => Array(n).fill(2147483647));
        for(let r = 0; r < m; r++) {
            for(let c = 0; c < n; c++) {
               let p = Math.random() * 100;
               if (p < 10) g[r][c] = 0;
               else if (p < 30) g[r][c] = -1;
            }
        }
        tests.push({grid: g, name: "Procedural Grid"});
    }
    
    if (limit < tests.length) tests = tests.slice(0, limit);
    
    let passedCount = 0;
    const startTime = performance.now();
    
    console.log("---TEST_RESULTS_START---");
    for (let i = 0; i < tests.length; i++) {
        let userGrid = clone(tests[i].grid);
        let expectedGrid = clone(tests[i].grid);
        solveExpected(expectedGrid);
        
        let inputStr = tests[i].name + "<br>rooms =<br>" + vec2str(tests[i].grid);
        
        if (importError) {
            console.log((i+1) + "|FAIL|" + inputStr + "|[]|" + importError);
            continue;
        }
        
        try {
            wallsAndGates(userGrid);
        } catch (err) {
            console.log((i+1) + "|FAIL|" + inputStr + "|[]|Runtime Error: " + err.name);
            continue;
        }
        
        let outStr = vec2str(userGrid);
        let expStr = vec2str(expectedGrid);
        if (outStr === expStr) {
            passedCount++;
            console.log((i+1) + "|PASS|" + inputStr + "|" + outStr + "|" + expStr);
        } else {
            console.log((i+1) + "|FAIL|" + inputStr + "|" + outStr + "|" + expStr);
        }
    }
    console.log("---TEST_RESULTS_END---");
    console.log("SUMMARY|" + passedCount + "|" + tests.length + "|" + (performance.now() - startTime).toFixed(2));
}

main();
`;

    const wallsAndGatesPy = `
import sys, time
from collections import deque

import_error = None
try:
    from solution import Solution
except BaseException as e:
    import_error = type(e).__name__ + ": " + str(e)

def vec2str(v): return str(v).replace(" ", "")

def solveExpected(grid):
    m = len(grid)
    if m == 0: return
    n = len(grid[0])
    q = deque()
    for i in range(m):
        for j in range(n):
            if grid[i][j] == 0: q.append((i, j))
            
    dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    while q:
        r, c = q.popleft()
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 2147483647:
                grid[nr][nc] = grid[r][c] + 1
                q.append((nr, nc))

def main():
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 50
    tests = [
        {"grid": [[2147483647, -1, 0, 2147483647], [2147483647, 2147483647, 2147483647, -1], [2147483647, -1, 2147483647, -1], [0, -1, 2147483647, 2147483647]], "name": "1. Basic Grid"},
        {"grid": [[2147483647]], "name": "2. Empty Room"}
    ]
    import random
    random.seed(12345)
    for _ in range(len(tests), 50):
        m, n = random.randint(2, 20), random.randint(2, 20)
        g = [[2147483647 for _ in range(n)] for _ in range(m)]
        for r in range(m):
            for c in range(n):
                p = random.randint(0, 99)
                if p < 10: g[r][c] = 0
                elif p < 30: g[r][c] = -1
        tests.append({"grid": g, "name": "Procedural Grid"})
        
    tests = tests[:limit]
    
    passed_count = 0
    start_time = time.time()
    
    sol = None
    if not import_error:
        try: sol = Solution()
        except BaseException as e: import_error = type(e).__name__ + ": " + str(e)

    print("---TEST_RESULTS_START---")
    for i, test in enumerate(tests):
        userGrid = [row[:] for row in test["grid"]]
        expectedGrid = [row[:] for row in test["grid"]]
        solveExpected(expectedGrid)
        
        input_str = test["name"] + "<br>rooms =<br>" + vec2str(test["grid"])
        
        if import_error:
            print(f"{i+1}|FAIL|{input_str}|[]|Compilation Error: {import_error}")
            continue
            
        try:
            sol.wallsAndGates(userGrid)
        except BaseException as e:
            print(f"{i+1}|FAIL|{input_str}|[]|Runtime Error: {type(e).__name__} - {str(e)}")
            continue
            
        out_str = vec2str(userGrid)
        exp_str = vec2str(expectedGrid)
        if out_str == exp_str:
            passed_count += 1
            print(f"{i+1}|PASS|{input_str}|{out_str}|{exp_str}")
        else:
            print(f"{i+1}|FAIL|{input_str}|{out_str}|{exp_str}")
            
    print("---TEST_RESULTS_END---")
    duration = (time.time() - start_time) * 1000
    print(f"SUMMARY|{passed_count}|{len(tests)}|{duration:.2f}")

if __name__ == "__main__":
    main()
`;

    const wallsAndGatesJava = `
import java.util.*;

public class Main {
    public static void solveExpected(int[][] grid) {
        int m = grid.length;
        if(m == 0) return;
        int n = grid[0].length;
        Queue<int[]> q = new LinkedList<>();
        for(int i=0; i<m; i++){
            for(int j=0; j<n; j++){
                if(grid[i][j] == 0) q.offer(new int[]{i, j});
            }
        }
        int[][] dirs = {{-1,0}, {1,0}, {0,-1}, {0,1}};
        while(!q.isEmpty()){
            int[] cell = q.poll();
            int r = cell[0], c = cell[1];
            for(int[] dir : dirs){
                int nr = r + dir[0], nc = c + dir[1];
                if(nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == 2147483647){
                    grid[nr][nc] = grid[r][c] + 1;
                    q.offer(new int[]{nr, nc});
                }
            }
        }
    }

    public static String vec2str(int[][] grid) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for(int i=0; i<grid.length; i++){
            sb.append(Arrays.toString(grid[i]).replaceAll(" ", ""));
            if(i < grid.length-1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
    
    public static int[][] cloneGrid(int[][] grid) {
        int[][] copy = new int[grid.length][];
        for(int i=0; i<grid.length; i++) copy[i] = grid[i].clone();
        return copy;
    }

    public static void main(String[] args) {
        int limit = args.length > 0 ? Integer.parseInt(args[0]) : 50;
        
        class TestCase {
            int[][] grid; String name;
            TestCase(int[][] g, String n) { grid = g; name = n; }
        }
        
        List<TestCase> tests = new ArrayList<>();
        tests.add(new TestCase(new int[][]{{2147483647, -1, 0}}, "Basic"));
        
        Random rand = new Random(12345);
        for(int i=1; i<50; i++) {
            int m = rand.nextInt(19) + 2;
            int n = rand.nextInt(19) + 2;
            int[][] g = new int[m][n];
            for(int r=0; r<m; r++){
                for(int c=0; c<n; c++){
                    g[r][c] = 2147483647;
                    int p = rand.nextInt(100);
                    if(p < 10) g[r][c] = 0;
                    else if(p < 30) g[r][c] = -1;
                }
            }
            tests.add(new TestCase(g, "Procedural Grid"));
        }
        
        if (limit < tests.size()) tests = tests.subList(0, limit);
        
        Solution sol = new Solution();
        int passedCount = 0;
        long startTime = System.nanoTime();
        
        System.out.println("---TEST_RESULTS_START---");
        for (int i = 0; i < tests.size(); i++) {
            int[][] userGrid = cloneGrid(tests.get(i).grid);
            int[][] expectedGrid = cloneGrid(tests.get(i).grid);
            solveExpected(expectedGrid);
            
            String inputStr = tests.get(i).name + "<br>rooms =<br>" + vec2str(tests.get(i).grid);
            
            try { sol.wallsAndGates(userGrid); } catch (Exception e) {
                System.out.println((i+1) + "|FAIL|" + inputStr + "|[]|Runtime Error");
                continue;
            }
            
            String outStr = vec2str(userGrid);
            String expStr = vec2str(expectedGrid);
            if (outStr.equals(expStr)) {
                passedCount++;
                System.out.println((i+1) + "|PASS|" + inputStr + "|" + outStr + "|" + expStr);
            } else {
                System.out.println((i+1) + "|FAIL|" + inputStr + "|" + outStr + "|" + expStr);
            }
        }
        System.out.println("---TEST_RESULTS_END---");
        double duration = (System.nanoTime() - startTime) / 1000000.0;
        System.out.println("SUMMARY|" + passedCount + "|" + tests.size() + "|" + String.format("%.2f", duration));
    }
}
`;

    let wgMeta = await getProblemTestWrapper('walls-and-gates');
    if (wgMeta) {
        let wrappers = {
            cpp: wgMeta.test_wrappers ? JSON.parse(wgMeta.test_wrappers).cpp : wgMeta.mainCppTemplate,
            javascript: wallsAndGatesJs,
            python: wallsAndGatesPy,
            java: wallsAndGatesJava
        };
        await dbRun('UPDATE problem_tests SET test_wrappers = ? WHERE problem_slug = ?', [JSON.stringify(wrappers), 'walls-and-gates']);

        let starters = {
            cpp: '#include <vector>\n#include <queue>\nusing namespace std;\n\nclass Solution {\npublic:\n    void wallsAndGates(vector<vector<int>>& rooms) {\n        \n    }\n};',
            javascript: 'function wallsAndGates(rooms) {\n  \n}\n\nmodule.exports = { wallsAndGates };',
            python: 'class Solution:\n    def wallsAndGates(self, rooms: list[list[int]]) -> None:\n        pass',
            java: 'import java.util.*;\n\nclass Solution {\n    public void wallsAndGates(int[][] rooms) {\n        \n    }\n}'
        };
        await dbRun('UPDATE problems SET starterCode = ? WHERE slug = ?', [JSON.stringify(starters), 'walls-and-gates']);
    }

    console.log('Successfully completed multi-language database restructuring.');
}

generateMultiLanguageWrappers().catch(console.error);
