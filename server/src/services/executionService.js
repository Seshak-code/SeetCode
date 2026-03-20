import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export async function executeCppInDocker(code, slug) {
  const runId = uuidv4();
  // Using a local folder because Docker Desktop file sharing works flawlessly with subfolders of the current project
  const projectTmpDir = path.join(process.cwd(), 'docker_tmp', `seetcode-${runId}`);
  
  try {
    await fs.mkdir(projectTmpDir, { recursive: true });
    
    // Write user's code to solution.h
    await fs.writeFile(path.join(projectTmpDir, 'solution.h'), code);

    // Fetch the dynamic main.cpp wrapper from SQLite based on the slug.
    const { getProblemTestWrapper } = await import('./databaseService.js');
    const testWrapper = await getProblemTestWrapper(slug);
    
    if (!testWrapper || !testWrapper.mainCppTemplate) {
      throw new Error('Test template for this problem is not configured in the database yet.');
    }
    
    const mainCpp = testWrapper.mainCppTemplate;
    
    await fs.writeFile(path.join(projectTmpDir, 'main.cpp'), mainCpp);

    // Run docker to compile and execute
    const dockerCmd = `docker run --rm -v "${projectTmpDir}:/usr/src/app" -w /usr/src/app gcc:latest bash -c "g++ -O3 main.cpp -o main && ./main"`;
    
    const { stdout, stderr } = await execAsync(dockerCmd, { timeout: 15000 });
    
    const [resultStr, timeStr] = stdout.trim().split('|');
    const timeMs = parseFloat(timeStr) || 0;
    
    // Simple Heuristic Optimization analyzer
    let feedback = [];
    if (code.includes('for') && code.match(/for.*for/s)) {
       feedback.push('Optimization Potential: Nested loops detected! O(N^2) complexity. Can you use a Hash Map (unordered_map) to achieve O(N)?');
    } else if (resultStr === 'SUCCESS' && timeMs < 1.0) {
       feedback.push('Great job! Your solution is optimally taking advantage of O(N) patterns.');
    }
    
    return {
      status: resultStr === 'SUCCESS' ? 'Accepted' : 'Failed',
      stdout: stdout,
      stderr: stderr,
      executionTimeMs: timeMs.toFixed(3),
      feedback: feedback
    };
    
  } catch (error) {
    return {
      status: 'Compilation Error or Timeout',
      stdout: '',
      stderr: error.stderr || error.message,
      executionTimeMs: 0,
      feedback: []
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
