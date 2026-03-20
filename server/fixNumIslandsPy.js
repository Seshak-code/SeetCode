import { dbAll, dbRun } from './src/services/databaseService.js';

const numIslandsPy = `import sys
sys.setrecursionlimit(20000)
import time, json, random, copy
from collections import deque

try:
    import solution
    sol = solution.Solution()
except Exception as e:
    print(e)
    sys.exit(1)

def vec2str(mat):
    return json.dumps(mat, separators=(',', ':'))

def solveExpected(grid):
    m, n = len(grid), len(grid[0])
    ans = 0
    dirs = [(-1,0),(1,0),(0,-1),(0,1)]
    for i in range(m):
        for j in range(n):
            if grid[i][j] == '1':
                ans += 1
                q = deque([(i, j)])
                grid[i][j] = '0'
                while q:
                    r, c = q.popleft()
                    for dr, dc in dirs:
                        nr, nc = r+dr, c+dc
                        if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == '1':
                            grid[nr][nc] = '0'
                            q.append((nr, nc))
    return ans

tests = []
tests.append({'input': [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]], 'name': '1. Example 1'})
tests.append({'input': [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]], 'name': '2. Example 2'})
tests.append({'input': [["0","0"],["0","0"]], 'name': '3. Zero'})
tests.append({'input': [["1"]], 'name': '4. Single'})
tests.append({'input': [["0"]], 'name': '5. Blank'})
tests.append({'input': [["1","1","1"],["1","1","1"],["1","1","1"]], 'name': '6. Full Grid'})
tests.append({'input': [["1"]*30 for _ in range(30)], 'name': '7. Max Size'})

random.seed(99999)
for i in range(len(tests), 50):
    m = random.randint(1, 30)
    n = random.randint(1, 30)
    g = [["1" if random.randint(0, 99) < 30 else "0" for _ in range(n)] for _ in range(m)]
    tests.append({'input': g, 'name': f'Random {i+1}'})

if len(sys.argv) > 1:
    tests = tests[:int(sys.argv[1])]

passed = 0
start_time = time.perf_counter()
print("---TEST_RESULTS_START---")

for i, t in enumerate(tests):
    expected = solveExpected(copy.deepcopy(t['input']))
    usr_in = copy.deepcopy(t['input'])
    in_str = f"{t['name']}<br>grid =<br>{vec2str(t['input'])}"
    try:
        if hasattr(sol, 'numIslands'):
            res = sol.numIslands(usr_in)
        else:
            res = solution.numIslands(usr_in)
        out_str = str(res)
        exp_str = str(expected)
        if res == expected:
            passed += 1
            print(f"{i+1}|PASS|{in_str}|{out_str}|{exp_str}")
        else:
            print(f"{i+1}|FAIL|{in_str}|{out_str}|{exp_str}")
    except Exception as e:
        print(f"{i+1}|FAIL|{in_str}|[]|Runtime Error: {str(e)}")

print("---TEST_RESULTS_END---")
dur = (time.perf_counter() - start_time) * 1000
print(f"SUMMARY|{passed}|{len(tests)}|{dur:.3f}")
`;

async function fix() {
    const rows = await dbAll("SELECT test_wrappers FROM problem_tests WHERE problem_slug = 'number-of-islands'");
    let w = JSON.parse(rows[0].test_wrappers);
    w.python = numIslandsPy;
    await dbRun("UPDATE problem_tests SET test_wrappers = ? WHERE problem_slug = 'number-of-islands'", [JSON.stringify(w)]);
    console.log('Fixed number-of-islands Python: switched to BFS + capped grids to 30x30.');
}
fix().catch(console.error);
