import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export async function executeCodeInDocker(code, language, slug, isRunMode = false) {
  const runId = uuidv4();
  // Using a local folder because Docker Desktop file sharing works flawlessly with subfolders of the current project
  const projectTmpDir = path.join(process.cwd(), 'docker_tmp', `seetcode-${runId}`);
  
  try {
    await fs.mkdir(projectTmpDir, { recursive: true });
    
    // Fetch the dynamic wrapper from SQLite based on the slug.
    const { getProblemTestWrapper } = await import('./databaseService.js');
    const wrapperData = await getProblemTestWrapper(slug);
    
    if (!wrapperData || !wrapperData.test_wrappers) {
      throw new Error('Test template for this problem is not configured in the database yet.');
    }
    
    const wrappers = JSON.parse(wrapperData.test_wrappers);
    const wrapperCode = wrappers[language];
    if (!wrapperCode) {
      throw new Error(`Execution wrapper for language ${language} is not configured yet.`);
    }

    let dockerCmd = '';
    const limitArg = isRunMode ? ' 3' : '';
    
    if (language === 'cpp') {
        await fs.writeFile(path.join(projectTmpDir, 'solution.h'), code);
        await fs.writeFile(path.join(projectTmpDir, 'main.cpp'), wrapperCode);
        dockerCmd = `docker run --rm -v "${projectTmpDir}:/usr/src/app" -w /usr/src/app gcc:latest bash -c "g++ -O3 main.cpp -o main && timeout 10s ./main${limitArg}"`;
    } else if (language === 'javascript') {
        await fs.writeFile(path.join(projectTmpDir, 'solution.js'), code);
        await fs.writeFile(path.join(projectTmpDir, 'main.js'), wrapperCode);
        dockerCmd = `docker run --rm -v "${projectTmpDir}:/usr/src/app" -w /usr/src/app node:18 bash -c "timeout 10s node main.js${limitArg}"`;
    } else if (language === 'python') {
        await fs.writeFile(path.join(projectTmpDir, 'solution.py'), code);
        await fs.writeFile(path.join(projectTmpDir, 'main.py'), wrapperCode);
        dockerCmd = `docker run --rm -v "${projectTmpDir}:/usr/src/app" -w /usr/src/app python:3.9 bash -c "timeout 10s python main.py${limitArg}"`;
    } else if (language === 'java') {
        await fs.writeFile(path.join(projectTmpDir, 'Solution.java'), code);
        await fs.writeFile(path.join(projectTmpDir, 'Main.java'), wrapperCode);
        dockerCmd = `docker run --rm -v "${projectTmpDir}:/usr/src/app" -w /usr/src/app eclipse-temurin:17 bash -c "javac Main.java Solution.java && timeout 10s java Main${limitArg}"`;
    }
    
    const { stdout, stderr } = await execAsync(dockerCmd, { timeout: 15000 });
    
    let passed = 0;
    let total = 0;
    let executionTimeMs = '0.000';
    let testDetails = [];
    
    const lines = stdout.split('\n');
    let inTestResults = false;
    let isSuccess = false;
    
    for (const line of lines) {
       const cleanLine = line.trim();
       if (cleanLine === '---TEST_RESULTS_START---') { inTestResults = true; continue; }
       if (cleanLine === '---TEST_RESULTS_END---') { inTestResults = false; continue; }
       
       if (inTestResults) {
           const parts = cleanLine.split('|');
           const formatField = (str) => str ? str.replace(/<br>/g, '\n') : '';
           
           if (parts.length >= 5) {
               testDetails.push({ 
                 id: parts[0], 
                 status: parts[1], 
                 input: formatField(parts[2]), 
                 output: formatField(parts[3]), 
                 expected: formatField(parts[4]) 
               });
           } else if (parts.length >= 3) {
               testDetails.push({ id: parts[0], status: parts[1], message: formatField(parts.slice(2).join('|')) });
           }
       } else if (cleanLine.startsWith('SUMMARY|')) {
           const parts = cleanLine.split('|');
           if (parts.length >= 4) {
               passed = parseInt(parts[1], 10);
               total = parseInt(parts[2], 10);
               executionTimeMs = parseFloat(parts[3]).toFixed(3);
               isSuccess = (passed === total) && (total > 0);
           }
       }
    }
    
    // Algorithmic Optimizer Heuristics
    let feedback = [];
    if (slug === 'two-sum') {
       const forLoops = code.match(/for\s*\(/g) || [];
       
       // Naive loose nested check: a 'for' followed eventually by another 'for' before any closing brace that isn't balanced...
       // Since full AST parsing via Babel is for JS, we use heuristic string matching for C++ here.
       const usesMap = code.includes('unordered_map') || code.includes('Map');
       
       if (forLoops.length > 1 && !usesMap) {
          feedback.push('Optimization Potential: Multiple loops detected without a Hash Map. This implies O(N^2) complexity. Can you use a Hash table (`unordered_map`) to trade space for time and achieve O(N)?');
       } else if (forLoops.length > 1 && usesMap) {
          feedback.push('Good job using a Hash Map for O(N) complexity! However, you are currently executing a Two-Pass approach. Can you optimize this to a Single-Pass by checking the map and inserting new numbers simultaneously within the exact same loop?');
       } else if (forLoops.length === 1 && usesMap && isSuccess) {
          feedback.push('Exceptional! You implemented the optimal One-Pass Hash Map solution, achieving true O(N) time complexity with one traversal.');
       } else if (isSuccess && parseFloat(executionTimeMs) < 1.0) {
          feedback.push('Great job! Your solution operates highly efficiently under 1ms.');
       }
    } else if (slug === 'walls-and-gates') {
       const hasQueue = code.includes('queue') || code.includes('Queue') || code.includes('deque') || (code.includes('[]') && (code.includes('push') || code.includes('append')));
       const startsBfsInsideLoop = hasQueue && code.match(/for.*for.*(?:queue|deque|Queue|\[\s*\])/s);
       const usesDfs = code.includes('dfs') || code.includes('solve(') || code.includes('backtrack');
       const checksWalls = code.includes('-1');
       
       if (usesDfs && !hasQueue) {
          feedback.push('Optimization Potential: You are using DFS (Backtracking) on an unweighted grid pathfinding challenge. DFS forces massive redundant backtracking causing O(N*M * 4^(N*M)) time complexity on empty grids! Pathfinding is optimal using Breadth-First Search (BFS).');
       } else if (startsBfsInsideLoop) {
          feedback.push('Optimization Potential: Naive BFS detected! A common mistake is to run BFS from each empty room to find the nearest treasure, resulting in O((M*N)^2) time complexity. The optimal approach is Multi-source BFS starting from all treasures (0s) simultaneously, which processes each cell exactly once.');
       } else if (!checksWalls && !isSuccess) {
          feedback.push('Logic Pitfall: Not Distinguishing Walls from Unvisited Cells! Walls are represented by -1 and should never be added to the queue or updated. Confusing walls with empty rooms causes incorrect distances or loops.');
       } else if (isSuccess && hasQueue) {
          if (parseFloat(executionTimeMs) < 100.0) {
             feedback.push('Exceptional! You identified Multi-source BFS, seeding the queue globally upfront with all treasures. This allows the heat-map expansion to organically block redundant paths, achieving flawless O(M*N) time complexity.');
          } else {
             feedback.push('Good job using BFS! If your execution time is slow, make sure you are Updating Distance Before Adding to Queue. Updating the distance when a cell is popped instead of when it is discovered causes cells to be added to the queue multiple times!');
          }
       }
    } else if (slug === 'number-of-islands') {
       const usesQueue = code.includes('queue') || code.includes('Queue');
       const usesStack = code.includes('stack') || code.includes('Stack');
       const isRecursive = code.match(/dfs\s*\(/) || code.match(/solve\s*\(/) || code.match(/backtrack\s*\(/) || (code.match(/numIslands\s*\(/) && code.split('numIslands').length > 2);
       const modifiesGrid = code.includes('grid[') && code.includes("='0'");
       const usesVisited = code.includes('visited') || code.includes('vector<vector<bool>>');
       const usesUnionFind = code.includes('parent') && (code.includes('find(') || code.includes('union(') || code.includes('union_set(') || code.includes('UnionFind'));

       if (usesUnionFind) {
          feedback.push('Interesting approach! You are using Disjoint Set Union (Union-Find). This is a great way to solve the problem and easily scale to dynamically adding islands, although it has a slightly higher overhead than a simple BFS/DFS sweep.');
       } else if ((usesQueue || usesStack || isRecursive) && usesVisited) {
          feedback.push('Optimization Potential: You are using an external `visited` matrix which takes O(M*N) extra space. Can you optimize this to O(1) auxiliary space (excluding call stack) by modifying the input grid directly to sink the islands (e.g., `grid[i][j] = \\\'0\\\'`) as you visit them?');
       } else if ((usesQueue || usesStack || isRecursive) && modifiesGrid) {
          feedback.push('Exceptional! You achieved optimal O(1) auxiliary space capability by modifying the grid in-place ("sinking" the islands) instead of using an O(M*N) visited matrix.');
       }
       
       if (isRecursive && !usesVisited && !modifiesGrid && !isSuccess) {
          feedback.push('Logic Pitfall: Infinite Recursion! You are likely not marking cells as visited or sinking them to \\\'0\\\', causing your DFS to ping-pong back and forth between two adjacent \\\'1\\\' cells until a Stack Overflow occurs.');
       }
    }
    
    return {
      status: isSuccess ? 'Accepted' : 'Failed',
      isRunMode,
      stdout: stdout,
      stderr: stderr,
      executionTimeMs,
      passed,
      total,
      testDetails,
      feedback
    };
    
  } catch (error) {
    const errorLog = error.stderr || error.message || '';
    let feedback = [];
    let statusLabel = 'Compilation Error or Timeout';
    
    // Detect timeout (exit code 124 from Linux `timeout` utility)
    if (error.killed || errorLog.includes('timeout') || (error.code === 124)) {
      statusLabel = 'Time Limit Exceeded';
      feedback.push('Your solution exceeded the 10 second time limit. This usually means an infinite loop or an algorithm with excessive time complexity. Double-check your loop termination conditions!');
    }
    
    // Heuristic Compiler Error Analyzer (No LLMs Required!)
    if (errorLog.includes('was not declared in this scope')) {
       feedback.push('Syntax Hint: You used a variable or function that hasn\'t been declared. Did you misspell it or forget its type?');
    }
    if (errorLog.includes("expected ';'")) {
       feedback.push('Syntax Hint: Looks like you forgot a semicolon (;) on a previous line! Check the line number mentioned above.');
    }
    if (errorLog.includes('control reaches end of non-void function') || errorLog.includes('return-statement with no value')) {
       feedback.push('Logic Hint: Your function promises to return a `vector<int>`, but there is a path where it returns nothing at all. Make sure you return a strict default `{}` at the end!');
    }
    if (errorLog.includes('segmentation fault') || errorLog.includes('core dumped')) {
       feedback.push('Memory Hint: Segmentation Fault! You are probably trying to read an array or vector index that is negative, or greater than its bounds.');
    }
    if (errorLog.includes('expected unqualified-id before')) {
       feedback.push('Syntax Hint: You might have extra brackets `}` or missing brackets `{` which is deeply confusing the compiler.');
    }
    
    return {
      status: statusLabel,
      stdout: '',
      stderr: errorLog,
      executionTimeMs: 0,
      passed: 0,
      total: 0,
      testDetails: [],
      feedback: feedback
    };
  } finally {
    // Cleanup temporary files
    try {
      await execAsync(`rm -rf "${projectTmpDir}"`);
    } catch (e) {
      console.error("Cleanup error", e);
    }
  }
}
