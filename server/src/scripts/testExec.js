import { executeCodeInDocker } from '../services/executionService.js';

async function run() {
    console.log("Testing Python Pipeline...");
    const pyCode = 'class Solution:\n    def twoSum(self, nums, target):\n        return [0, 1]';
    const resPy = await executeCodeInDocker(pyCode, 'python', 'two-sum', true);
    console.log(resPy.status, resPy.passed, resPy.total, resPy.stderr || '');

    console.log("Testing JS Pipeline...");
    const jsCode = 'function twoSum(nums, target) { return [0, 1]; }\nmodule.exports = { twoSum };';
    const resJs = await executeCodeInDocker(jsCode, 'javascript', 'two-sum', true);
    console.log(resJs.status, resJs.passed, resJs.total, resJs.stderr || '');
    
    console.log("Testing Java Pipeline...");
    const javaCode = 'class Solution { public int[] twoSum(int[] nums, int target) { return new int[]{0, 1}; } }';
    const resJava = await executeCodeInDocker(javaCode, 'java', 'two-sum', true);
    console.log(resJava.status, resJava.passed, resJava.total, resJava.stderr || '');
}

run().catch(console.error);
