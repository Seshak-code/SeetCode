import { dbAll, dbRun } from './src/services/databaseService.js';

// Restore number-of-islands Python to full 300x300 constraints
// Safe because solveExpected uses BFS (no recursion), and the user's solution
// is what we're timing — not our reference implementation.
const numIslandsPy = `import sys
sys.setrecursionlimit(30000)
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
    """BFS — O(m*n), no recursion, safe for 300x300 grids."""
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
# Manual cases covering LeetCode examples and edge cases
tests.append({'input': [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]], 'name': '1. Example 1 (1 island)'})
tests.append({'input': [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]], 'name': '2. Example 2 (3 islands)'})
tests.append({'input': [["0","0"],["0","0"]], 'name': '3. All water'})
tests.append({'input': [["1"]], 'name': '4. Single land'})
tests.append({'input': [["0"]], 'name': '5. Single water'})
tests.append({'input': [["1","1","1"],["1","1","1"],["1","1","1"]], 'name': '6. Full 3x3 (1 island)'})
# Large edge cases testing full constraint bounds (300x300)
tests.append({'input': [["1"]*300 for _ in range(300)], 'name': '7. Max 300x300 all land (1 island)'})
tests.append({'input': [["0"]*300 for _ in range(300)], 'name': '8. Max 300x300 all water (0 islands)'})
# Checkerboard — maximum isolated islands
chk = [["1" if (i+j)%2==0 else "0" for j in range(100)] for i in range(100)]
tests.append({'input': chk, 'name': '9. Checkerboard 100x100'})
tests.append({'input': [["1","0"]*150 for _ in range(150)], 'name': '10. Striped 150x300'})

# Procedural tests scaled to full constraints (1 <= m, n <= 300)
random.seed(99999)
for i in range(len(tests), 50):
    m = random.randint(1, 300)
    n = random.randint(1, 300)
    # Keep density low to avoid insane output sizes
    density = random.randint(10, 40)
    g = [["1" if random.randint(0, 99) < density else "0" for _ in range(n)] for _ in range(m)]
    tests.append({'input': g, 'name': f'Random {i+1} ({m}x{n}, {density}% density)'})

if len(sys.argv) > 1:
    tests = tests[:int(sys.argv[1])]

passed = 0
start_time = time.perf_counter()
print("---TEST_RESULTS_START---")

for i, t in enumerate(tests):
    expected = solveExpected(copy.deepcopy(t['input']))
    usr_in = copy.deepcopy(t['input'])
    in_str = f"{t['name']}<br>grid size: {len(t['input'])}x{len(t['input'][0])}"
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
    console.log('Restored number-of-islands Python to full 300x300 constraints (BFS-based, recursion-safe).');
}
fix().catch(console.error);
