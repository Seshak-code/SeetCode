import { dbAll, dbRun } from './src/services/databaseService.js';

// Raise recursion limit to cover worst-case DFS on a 300x300 all-land grid:
// max DFS depth = m * n = 300 * 300 = 90,000 frames
// We use 150,000 to give a safe buffer above the worst-case constraint.
async function fix() {
    const rows = await dbAll("SELECT test_wrappers FROM problem_tests WHERE problem_slug = 'number-of-islands'");
    let w = JSON.parse(rows[0].test_wrappers);
    w.python = w.python.replace(
        'sys.setrecursionlimit(30000)',
        'sys.setrecursionlimit(150000)'
    );
    await dbRun("UPDATE problem_tests SET test_wrappers = ? WHERE problem_slug = 'number-of-islands'", [JSON.stringify(w)]);
    console.log("Raised recursion limit to 150,000 (covers 300x300 worst-case DFS for user solutions).");
}
fix().catch(console.error);
