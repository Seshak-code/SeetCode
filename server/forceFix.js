import { dbAll, dbRun } from './src/services/databaseService.js';

async function forceFix() {
    const rows = await dbAll('SELECT problem_slug, test_wrappers FROM problem_tests');
    for (let row of rows) {
        let slug = row.problem_slug;
        let w = JSON.parse(row.test_wrappers);

        if (w.python) {
            // Fix the exact bug trace from Python output: `import sys sys.setrecursionlimit(20000)`
            w.python = w.python.split('import sys sys.setrecursionlimit(20000)').join('import sys\\nsys.setrecursionlimit(20000)');
        }

        if (w.cpp) {
            // Consolidate any excessive backslashes (\\\\n) into single proper string backslash (\\n)
            w.cpp = w.cpp.split('\\\\\\\\n').join('\\n');
            w.cpp = w.cpp.split('\\\\n').join('\\n');

            // Now, change the specific known literal string newlines into correct C++ escaped ones
            w.cpp = w.cpp.split('cout << "---TEST_RESULTS_START---\n";').join('cout << "---TEST_RESULTS_START---\\n";');
            w.cpp = w.cpp.split('std::cout << "---TEST_RESULTS_START---\n";').join('std::cout << "---TEST_RESULTS_START---\\n";');
            w.cpp = w.cpp.split('cout << "---TEST_RESULTS_END---\n";').join('cout << "---TEST_RESULTS_END---\\n";');
            w.cpp = w.cpp.split('std::cout << "---TEST_RESULTS_END---\n";').join('std::cout << "---TEST_RESULTS_END---\\n";');
            
            // Fix dynamically built strings ending with a literal newline before the semicolon
            w.cpp = w.cpp.split('\n";').join('\\n";');
            w.cpp = w.cpp.split('\n\\n";').join('\\n";'); // in case of overlaps
        }

        await dbRun('UPDATE problem_tests SET test_wrappers = ? WHERE problem_slug = ?', [JSON.stringify(w), slug]);
    }
    console.log("Applied final strict replacement sequence.");
}

forceFix().catch(console.error);
