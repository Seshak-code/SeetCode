import { dbAll, dbRun } from './src/services/databaseService.js';

const fixedWrapper = `const { performance } = require('perf_hooks');
const Solution = require('./solution.js');
const sol = new Solution();
const INF = 2147483647;

function sfc32(a,b,c,d){return function(){a>>>=0;b>>>=0;c>>>=0;d>>>=0;let t=(a+b)|0;a=b^b>>>9;b=c+(c<<3)|0;c=(c<<21|c>>>11);d=d+1|0;t=t+d|0;c=c+t|0;return(t>>>0)/4294967296;}}
const rand = sfc32(1,2,3,4);

// Head-pointer BFS: O(MN)
function solveExpected(grid) {
    const m=grid.length,n=grid[0].length,dirs=[[-1,0],[1,0],[0,-1],[0,1]];
    const q=[];let head=0;
    for(let i=0;i<m;i++)for(let j=0;j<n;j++)if(grid[i][j]===0)q.push([i,j]);
    while(head<q.length){
        const[r,c]=q[head++];
        for(const[dr,dc]of dirs){const nr=r+dr,nc=c+dc;
            if(nr>=0&&nr<m&&nc>=0&&nc<n&&grid[nr][nc]===INF){grid[nr][nc]=grid[r][c]+1;q.push([nr,nc]);}}
    }
}

// Truncate large matrix output for display — compare full for correctness
function safeStr(mat) {
    const s = JSON.stringify(mat);
    return s.length > 300 ? s.slice(0, 300) + '...(truncated)' : s;
}

// Constraints: 1 <= m, n <= 250
const tests=[];
tests.push({input:[[INF,-1,0,INF],[INF,INF,INF,-1],[INF,-1,INF,-1],[0,-1,INF,INF]],name:'1. LeetCode Ex1'});
tests.push({input:[[INF]],name:'2. Single empty'});
tests.push({input:[[0]],name:'3. Single gate'});
tests.push({input:[[-1]],name:'4. Single wall'});
tests.push({input:[[0,-1,INF]],name:'5. Row'});
tests.push({input:[[0,-1,INF],[-1,-1,-1],[INF,-1,0]],name:'6. Unreachable'});
// Max-size: 250x250
const big=Array.from({length:250},()=>Array(250).fill(INF));
big[0][0]=0;big[249][249]=0;
tests.push({input:big.map(r=>[...r]),name:'7. Max 250x250 two gates'});
// Procedural tests at full constraint bounds
for(let i=tests.length;i<50;i++){
    const m=Math.floor(rand()*249)+1,n=Math.floor(rand()*249)+1;
    const g=Array.from({length:m},()=>Array(n).fill(INF));
    for(let r=0;r<m;r++)for(let c=0;c<n;c++){const p=rand()*100;if(p<10)g[r][c]=0;else if(p<30)g[r][c]=-1;}
    tests.push({input:g,name:\`Rand \${i+1} \${m}x\${n}\`});
}

let passed=0;const start=performance.now();console.log('---TEST_RESULTS_START---');
for(let i=0;i<tests.length;i++){
    const t=tests[i];
    const exp=t.input.map(r=>[...r]);solveExpected(exp);
    const usr=t.input.map(r=>[...r]);
    const inStr=\`\${t.name}<br>\${t.input.length}x\${t.input[0].length} grid\`;
    try{
        sol.wallsAndGates(usr);
        const ok=JSON.stringify(usr)===JSON.stringify(exp);
        if(ok){passed++;console.log(\`\${i+1}|PASS|\${inStr}|\${safeStr(usr)}|\${safeStr(exp)}\`);}
        else console.log(\`\${i+1}|FAIL|\${inStr}|\${safeStr(usr)}|\${safeStr(exp)}\`);
    }catch(e){console.log(\`\${i+1}|FAIL|\${inStr}|[]|\${e.message.slice(0,200)}\`);}
}
console.log('---TEST_RESULTS_END---');
console.log(\`SUMMARY|\${passed}|\${tests.length}|\${(performance.now()-start).toFixed(3)}\`);
`;

async function fix() {
    const rows = await dbAll("SELECT test_wrappers FROM problem_tests WHERE problem_slug = 'walls-and-gates'");
    const w = JSON.parse(rows[0].test_wrappers);
    w.javascript = fixedWrapper;
    await dbRun("UPDATE problem_tests SET test_wrappers = ? WHERE problem_slug = 'walls-and-gates'", [JSON.stringify(w)]);
    console.log('Fixed walls-and-gates JS: added safeStr() truncation to avoid stdout overflow on 250x250 grids.');
}
fix().catch(console.error);
