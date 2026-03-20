import { dbAll, dbRun } from './src/services/databaseService.js';
import fs from 'fs';

async function finalCure() {
    const rows = await dbAll('SELECT problem_slug, test_wrappers FROM problem_tests');
    const initDb = fs.readFileSync('./src/scripts/initDb.js', 'utf8');

    function getCppTempl(name) {
        let rx = new RegExp(`const ${name} = \\\`([^]*?)\\\`;`);
        return initDb.match(rx)[1];
    }
    
    // We get the pristine two-sum wrapper that doesn't have any JSON escaping flaws
    const pristineTwoSum = getCppTempl('twoSumCppTemplate');

    for (let row of rows) {
        let slug = row.problem_slug;
        let w = JSON.parse(row.test_wrappers);

        if (slug === 'two-sum') {
            w.cpp = pristineTwoSum;
        }

        if (slug === 'number-of-islands') {
            // Cut the grid generation size down to max 30 to avoid 5MB maxBuffer stdout limit!
            w.cpp = w.cpp.replace(/int m = rand\(\) % 300 \+ 1, n = rand\(\) % 300 \+ 1;/g, 'int m = rand() % 30 + 1, n = rand() % 30 + 1;');
            w.cpp = w.cpp.replace(/if \(m > 100\) m = 100 \+ rand\(\) % 200;/g, ''); // strip the 300 logic
            w.python = w.python.replace(/import sys sys.setrecursionlimit\(20000\)/g, 'import sys\\nsys.setrecursionlimit(20000)');
            // Fallback if the space was weird
            w.python = w.python.replace(/import sys\\nsys\.setrecursionlimit\(20000\)/g, 'import sys\\nsys.setrecursionlimit(20000)'); 
            w.python = w.python.replace(/sys sys/g, 'sys\\nsys');
        }

        if (slug === 'max-area-of-island') {
            w.python = w.python.replace(/import sys sys.setrecursionlimit\(20000\)/g, 'import sys\\nsys.setrecursionlimit(20000)');
            w.python = w.python.replace(/import sys\\nsys\.setrecursionlimit\(20000\)/g, 'import sys\\nsys.setrecursionlimit(20000)');
            w.python = w.python.replace(/sys sys/g, 'sys\\nsys');
        }

        await dbRun('UPDATE problem_tests SET test_wrappers = ? WHERE problem_slug = ?', [JSON.stringify(w), slug]);
    }
    console.log("Surgical application complete.");
}
finalCure().catch(console.error);
