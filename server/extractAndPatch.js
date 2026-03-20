import { dbAll, dbRun } from './src/services/databaseService.js';
import fs from 'fs';

async function restore() {
    // 1. Read files to memory to extract the raw template strings safely without executing them
    const initDb = fs.readFileSync('./src/scripts/initDb.js', 'utf8');
    const seedMb = fs.readFileSync('./src/scripts/seedMoreProblems.js', 'utf8');
    
    // We will parse out the C++ templates Using a simple regex
    function extractTemplate(fileStr, templateName) {
        let regex = new RegExp(`const ${templateName} = \\\`([^]*?)\\\`;`);
        let match = fileStr.match(regex);
        return match ? match[1] : null;
    }

    const templates = {
        'two-sum': extractTemplate(initDb, 'twoSumCppTemplate'),
        'walls-and-gates': extractTemplate(initDb, 'wallsAndGatesCppTemplate'),
        '01-matrix': extractTemplate(seedMb, 'matrix01CppTemplate'),
        'rotting-oranges': extractTemplate(seedMb, 'rottingOrangesCppTemplate'),
        'flood-fill': extractTemplate(seedMb, 'floodFillCppTemplate'),
        'max-area-of-island': extractTemplate(seedMb, 'maxAreaOfIslandCppTemplate'),
        'number-of-islands': extractTemplate(seedMb, 'numberOfIslandsCppTemplate')
    };

    const rows = await dbAll('SELECT problem_slug, test_wrappers FROM problem_tests');
    for (let row of rows) {
        let slug = row.problem_slug;
        let w = JSON.parse(row.test_wrappers);
        
        // Restore pristine C++
        if (templates[slug]) {
            w.cpp = templates[slug];
        }

        // Fix Python formatting
        if (w.python) {
            w.python = w.python.replace(/import sys sys\.setrecursionlimit\(20000\)/g, "import sys\\nsys.setrecursionlimit(20000)");
        }

        await dbRun('UPDATE problem_tests SET test_wrappers = ? WHERE problem_slug = ?', [JSON.stringify(w), slug]);
    }
    console.log("Database perfectly patched with pristine C++ strings and fixed Python limits!");
}

restore().catch(console.error);
