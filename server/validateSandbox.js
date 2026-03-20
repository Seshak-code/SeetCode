import { dbAll, dbRun } from './src/services/databaseService.js';
import { executeCodeInDocker } from './src/services/executionService.js';

async function validate() {
    console.log("Starting full sandbox validation (28 combinations)...\n");
    const problems = await dbAll('SELECT slug FROM problems');
    const slugs = problems.map(p => p.slug);
    const languages = ['cpp', 'javascript', 'python', 'java'];
    
    const starterRows = await dbAll('SELECT slug, starterCode FROM problems');
    const starters = {};
    for (let r of starterRows) starters[r.slug] = JSON.parse(r.starterCode);

    let totalCombos = slugs.length * languages.length;
    let successCount = 0;
    let failedCombos = [];

    for (let slug of slugs) {
        console.log(`Testing problem: ${slug}`);
        for (let lang of languages) {
            const code = starters[slug]?.[lang];
            if (!code) {
                console.log(`  ❌ [${lang}] MISSING STARTER CODE`);
                failedCombos.push(`${slug} - ${lang}`);
                continue;
            }
            process.stdout.write(`  [${lang}] Executing... `);
            try {
                const result = await executeCodeInDocker(code, lang, slug, false);
                const hasCompileProblem = result.status === 'Compilation Error' || 
                    (result.stderr && (
                        result.stderr.toLowerCase().includes('compilation error') ||
                        result.stderr.toLowerCase().includes('syntaxerror') ||
                        result.stderr.toLowerCase().includes('syntax error') ||
                        result.stderr.includes('maxBuffer') ||
                        result.stderr.toLowerCase().includes('traceback')
                    ));
                
                if (hasCompileProblem) {
                    console.log(`❌ COMPILE/RUNTIME ERROR: ${result.stderr?.substring(0, 80).replace(/\n/g, ' ')}`);
                    failedCombos.push(`${slug} - ${lang}`);
                } else if (result.total > 0) {
                    // Tests ran — sandbox working correctly. Some may "pass" from default returns, that's fine.
                    console.log(`✅ SANDBOX OK (${result.passed}/${result.total} tests passed from starter, ${result.executionTimeMs}ms)`);
                    successCount++;
                } else {
                    console.log(`⚠️  No tests executed — status: ${result.status}`);
                    failedCombos.push(`${slug} - ${lang}`);
                }
            } catch (err) {
                console.log(`❌ CRASH: ${err.message}`);
                failedCombos.push(`${slug} - ${lang}`);
            }
        }
    }

    console.log(`\n--- VALIDATION SUMMARY ---`);
    console.log(`Sandbox fully operational: ${successCount} / ${totalCombos}`);
    if (failedCombos.length > 0) {
        console.log(`Problems still needing fixes:`);
        failedCombos.forEach(c => console.log(` - ${c}`));
    } else {
        console.log("🔥 ALL 28 SANDBOX ENVIRONMENTS FULLY OPERATIONAL!");
    }
}

validate().catch(console.error);
