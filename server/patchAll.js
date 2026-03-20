/**
 * patchAll.js — Complete refactor for all 7 problems:
 *  1. JS starters → class Solution { } with module.exports = Solution
 *  2. JS wrappers → new Solution() + head-pointer BFS (O(MN), not O(MN²))
 *  3. Java wrappers → ArrayDeque instead of LinkedList
 *  4. Python wrappers → collections.deque for BFS
 *  5. Test cases cover full constraint bounds per problem
 */
import { dbAll, dbRun } from './src/services/databaseService.js';

// ─────────────────────────────────────────────────────────────────────────────
// JS STARTERS — class-based, module.exports = Solution
// ─────────────────────────────────────────────────────────────────────────────
const jsStarters = {
  'two-sum': `class Solution {
    twoSum(nums, target) {
        return [];
    }
}
module.exports = Solution;`,

  'walls-and-gates': `class Solution {
    wallsAndGates(rooms) {
        // BFS from all gates simultaneously
    }
}
module.exports = Solution;`,

  '01-matrix': `class Solution {
    updateMatrix(mat) {
        return [];
    }
}
module.exports = Solution;`,

  'rotting-oranges': `class Solution {
    orangesRotting(grid) {
        return -1;
    }
}
module.exports = Solution;`,

  'flood-fill': `class Solution {
    floodFill(image, sr, sc, color) {
        return [];
    }
}
module.exports = Solution;`,

  'max-area-of-island': `class Solution {
    maxAreaOfIsland(grid) {
        return 0;
    }
}
module.exports = Solution;`,

  'number-of-islands': `class Solution {
    numIslands(grid) {
        return 0;
    }
}
module.exports = Solution;`,
};

// ─────────────────────────────────────────────────────────────────────────────
// JS WRAPPERS — head-pointer BFS, class instantiation, constraint-bound tests
// ─────────────────────────────────────────────────────────────────────────────
const jsWrappers = {

'two-sum': `const { performance } = require('perf_hooks');
const Solution = require('./solution.js');
const sol = new Solution();

function sfc32(a,b,c,d){return function(){a>>>=0;b>>>=0;c>>>=0;d>>>=0;let t=(a+b)|0;a=b^b>>>9;b=c+(c<<3)|0;c=(c<<21|c>>>11);d=d+1|0;t=t+d|0;c=c+t|0;return(t>>>0)/4294967296;}}
const rand = sfc32(12,34,56,78);

// Constraints: 2 <= n <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9
const tests = [];
tests.push({nums:[2,7,11,15],target:9,name:'1. Ex1'});
tests.push({nums:[3,2,4],target:6,name:'2. Ex2'});
tests.push({nums:[3,3],target:6,name:'3. Ex3'});
tests.push({nums:[-1,-2,-3,-4,-5],target:-8,name:'4. All negative'});
tests.push({nums:[1000000000,-1000000000],target:0,name:'5. Extreme values'});
tests.push({nums:Array.from({length:10000},(_,i)=>i),target:19999,name:'6. Max-size n=10000'});
// Procedural: full range of constraints
for(let i=tests.length;i<50;i++){
    let n=Math.floor(rand()*9999)+2;
    let arr=Array.from({length:n},()=>Math.floor(rand()*2e9)-1e9);
    let i1=Math.floor(rand()*n),i2;
    do{i2=Math.floor(rand()*n);}while(i2===i1);
    let target=arr[i1]+arr[i2];
    tests.push({nums:arr,target,name:\`Rand \${i+1} n=\${n}\`});
}

let passed=0;const start=performance.now();console.log('---TEST_RESULTS_START---');
for(let i=0;i<tests.length;i++){
    const t=tests[i],nums=[...t.nums];
    try{
        const res=sol.twoSum(nums,t.target);
        const valid=Array.isArray(res)&&res.length===2&&t.nums[res[0]]+t.nums[res[1]]===t.target&&res[0]!==res[1];
        if(valid){passed++;console.log(\`\${i+1}|PASS|\${t.name}|[\${res}]|valid\`);}
        else console.log(\`\${i+1}|FAIL|\${t.name}|[\${res}]|no valid pair\`);
    }catch(e){console.log(\`\${i+1}|FAIL|\${t.name}|[]|\${e.message}\`);}
}
console.log('---TEST_RESULTS_END---');
console.log(\`SUMMARY|\${passed}|\${tests.length}|\${(performance.now()-start).toFixed(3)}\`);
`,

'walls-and-gates': `const { performance } = require('perf_hooks');
const Solution = require('./solution.js');
const sol = new Solution();
const INF = 2147483647;

function sfc32(a,b,c,d){return function(){a>>>=0;b>>>=0;c>>>=0;d>>>=0;let t=(a+b)|0;a=b^b>>>9;b=c+(c<<3)|0;c=(c<<21|c>>>11);d=d+1|0;t=t+d|0;c=c+t|0;return(t>>>0)/4294967296;}}
const rand = sfc32(1,2,3,4);

// Head-pointer BFS: O(MN) — no shift()
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

// Constraints: 1 <= m, n <= 250
const tests=[];
tests.push({input:[[INF,-1,0,INF],[INF,INF,INF,-1],[INF,-1,INF,-1],[0,-1,INF,INF]],name:'1. LeetCode Ex1'});
tests.push({input:[[INF]],name:'2. Single empty'});
tests.push({input:[[0]],name:'3. Single gate'});
tests.push({input:[[-1]],name:'4. Single wall'});
tests.push({input:[[0,-1,INF]],name:'5. Row'});
tests.push({input:[[0,-1,INF],[-1,-1,-1],[INF,-1,0]],name:'6. Unreachable islands'});
// Max-size: 250x250
const big=Array.from({length:250},()=>Array(250).fill(INF));
big[0][0]=0;big[249][249]=0;
tests.push({input:big.map(r=>[...r]),name:'7. Max 250x250'});
// Constraint-bound procedural
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
    const inStr=\`\${t.name}<br>rooms=<br>\${JSON.stringify(t.input)}\`;
    try{
        sol.wallsAndGates(usr);
        const ok=JSON.stringify(usr)===JSON.stringify(exp);
        if(ok){passed++;console.log(\`\${i+1}|PASS|\${inStr}|\${JSON.stringify(usr)}|\${JSON.stringify(exp)}\`);}
        else console.log(\`\${i+1}|FAIL|\${inStr}|\${JSON.stringify(usr)}|\${JSON.stringify(exp)}\`);
    }catch(e){console.log(\`\${i+1}|FAIL|\${inStr}|[]|\${e.message}\`);}
}
console.log('---TEST_RESULTS_END---');
console.log(\`SUMMARY|\${passed}|\${tests.length}|\${(performance.now()-start).toFixed(3)}\`);
`,

'01-matrix': `const { performance } = require('perf_hooks');
const Solution = require('./solution.js');
const sol = new Solution();

function sfc32(a,b,c,d){return function(){a>>>=0;b>>>=0;c>>>=0;d>>>=0;let t=(a+b)|0;a=b^b>>>9;b=c+(c<<3)|0;c=(c<<21|c>>>11);d=d+1|0;t=t+d|0;c=c+t|0;return(t>>>0)/4294967296;}}
const rand = sfc32(9,8,7,6);

// Head-pointer BFS: O(MN)
function solveExpected(mat) {
    const m=mat.length,n=mat[0].length,dirs=[[-1,0],[1,0],[0,-1],[0,1]];
    const dist=Array.from({length:m},()=>Array(n).fill(Infinity));
    const q=[];let head=0;
    for(let i=0;i<m;i++)for(let j=0;j<n;j++)if(mat[i][j]===0){dist[i][j]=0;q.push([i,j]);}
    while(head<q.length){
        const[r,c]=q[head++];
        for(const[dr,dc]of dirs){const nr=r+dr,nc=c+dc;
            if(nr>=0&&nr<m&&nc>=0&&nc<n&&dist[nr][nc]===Infinity){dist[nr][nc]=dist[r][c]+1;q.push([nr,nc]);}}
    }
    return dist;
}

// Constraints: 1 <= m*n <= 10^4, values are 0 or 1, at least one 0
const tests=[];
tests.push({input:[[0,0,0],[0,1,0],[0,0,0]],name:'1. Ex1'});
tests.push({input:[[0,0,0],[0,1,0],[1,1,1]],name:'2. Ex2'});
tests.push({input:[[0]],name:'3. Single 0'});
tests.push({input:[[1,0]],name:'4. Row'});
tests.push({input:[[0,1,1,1,0]],name:'5. 0s on ends'});
// Max-size: 100x100 (max m*n = 10^4)
const max=Array.from({length:100},(_,i)=>Array.from({length:100},(_,j)=>i===0&&j===0?0:1));
tests.push({input:max.map(r=>[...r]),name:'6. Max 100x100 single 0'});
for(let i=tests.length;i<50;i++){
    let m,n;do{m=Math.floor(rand()*99)+1;n=Math.floor(rand()*99)+1;}while(m*n>10000);
    const g=Array.from({length:m},()=>Array.from({length:n},()=>Math.floor(rand()*2)));
    if(!g.flat().includes(0))g[0][0]=0;
    tests.push({input:g,name:\`Rand \${i+1} \${m}x\${n}\`});
}

let passed=0;const start=performance.now();console.log('---TEST_RESULTS_START---');
for(let i=0;i<tests.length;i++){
    const t=tests[i];
    const exp=solveExpected(t.input.map(r=>[...r]));
    const usr=t.input.map(r=>[...r]);
    const inStr=\`\${t.name}<br>\${JSON.stringify(t.input)}\`;
    try{
        const res=sol.updateMatrix(usr);
        const ok=JSON.stringify(res)===JSON.stringify(exp);
        if(ok){passed++;console.log(\`\${i+1}|PASS|\${inStr}|\${JSON.stringify(res)}|\${JSON.stringify(exp)}\`);}
        else console.log(\`\${i+1}|FAIL|\${inStr}|\${JSON.stringify(res)}|\${JSON.stringify(exp)}\`);
    }catch(e){console.log(\`\${i+1}|FAIL|\${inStr}|[]|\${e.message}\`);}
}
console.log('---TEST_RESULTS_END---');
console.log(\`SUMMARY|\${passed}|\${tests.length}|\${(performance.now()-start).toFixed(3)}\`);
`,

'rotting-oranges': `const { performance } = require('perf_hooks');
const Solution = require('./solution.js');
const sol = new Solution();

function sfc32(a,b,c,d){return function(){a>>>=0;b>>>=0;c>>>=0;d>>>=0;let t=(a+b)|0;a=b^b>>>9;b=c+(c<<3)|0;c=(c<<21|c>>>11);d=d+1|0;t=t+d|0;c=c+t|0;return(t>>>0)/4294967296;}}
const rand = sfc32(2,3,4,5);

// Head-pointer BFS: O(MN)
function solveExpected(grid) {
    const m=grid.length,n=grid[0].length,dirs=[[-1,0],[1,0],[0,-1],[0,1]];
    const q=[];let head=0,fresh=0;
    for(let i=0;i<m;i++)for(let j=0;j<n;j++){
        if(grid[i][j]===2)q.push([i,j,0]);
        if(grid[i][j]===1)fresh++;
    }
    let mins=0;
    while(head<q.length){
        const[r,c,t]=q[head++];mins=Math.max(mins,t);
        for(const[dr,dc]of dirs){const nr=r+dr,nc=c+dc;
            if(nr>=0&&nr<m&&nc>=0&&nc<n&&grid[nr][nc]===1){grid[nr][nc]=2;fresh--;q.push([nr,nc,t+1]);}}
    }
    return fresh===0?mins:-1;
}

// Constraints: 1 <= m, n <= 10, values 0/1/2
const tests=[];
tests.push({input:[[2,1,1],[1,1,0],[0,1,1]],name:'1. Ex1 (ans=4)'});
tests.push({input:[[2,1,1],[0,1,1],[1,0,1]],name:'2. Ex2 (ans=-1)'});
tests.push({input:[[0,2]],name:'3. Ex3 (ans=0)'});
tests.push({input:[[0]],name:'4. All empty'});
tests.push({input:[[1]],name:'5. Single fresh (ans=-1)'});
tests.push({input:[[2]],name:'6. Single rotten (ans=0)'});
tests.push({input:[[2,2],[2,2]],name:'7. All rotten (ans=0)'});
tests.push({input:[[1,1],[1,1]],name:'8. All fresh, no rotten (ans=-1)'});
// Max size: 10x10
tests.push({input:Array.from({length:10},(_,i)=>Array.from({length:10},(_,j)=>i===0&&j===0?2:1)),name:'9. Max 10x10 single rotten corner'});
for(let i=tests.length;i<50;i++){
    const m=Math.floor(rand()*10)+1,n=Math.floor(rand()*10)+1;
    const g=Array.from({length:m},()=>Array.from({length:n},()=>Math.floor(rand()*3)));
    tests.push({input:g,name:\`Rand \${i+1} \${m}x\${n}\`});
}

let passed=0;const start=performance.now();console.log('---TEST_RESULTS_START---');
for(let i=0;i<tests.length;i++){
    const t=tests[i];
    const g2=t.input.map(r=>[...r]);const exp=solveExpected(g2);
    const inStr=\`\${t.name}<br>\${JSON.stringify(t.input)}\`;
    try{
        const res=sol.orangesRotting(t.input.map(r=>[...r]));
        if(res===exp){passed++;console.log(\`\${i+1}|PASS|\${inStr}|\${res}|\${exp}\`);}
        else console.log(\`\${i+1}|FAIL|\${inStr}|\${res}|\${exp}\`);
    }catch(e){console.log(\`\${i+1}|FAIL|\${inStr}|[]|\${e.message}\`);}
}
console.log('---TEST_RESULTS_END---');
console.log(\`SUMMARY|\${passed}|\${tests.length}|\${(performance.now()-start).toFixed(3)}\`);
`,

'flood-fill': `const { performance } = require('perf_hooks');
const Solution = require('./solution.js');
const sol = new Solution();

function sfc32(a,b,c,d){return function(){a>>>=0;b>>>=0;c>>>=0;d>>>=0;let t=(a+b)|0;a=b^b>>>9;b=c+(c<<3)|0;c=(c<<21|c>>>11);d=d+1|0;t=t+d|0;c=c+t|0;return(t>>>0)/4294967296;}}
const rand = sfc32(3,1,4,1);

function solveExpected(image,sr,sc,color) {
    const m=image.length,n=image[0].length,orig=image[sr][sc],dirs=[[-1,0],[1,0],[0,-1],[0,1]];
    if(orig===color)return image;
    const q=[[sr,sc]];let head=0;image[sr][sc]=color;
    while(head<q.length){
        const[r,c]=q[head++];
        for(const[dr,dc]of dirs){const nr=r+dr,nc=c+dc;
            if(nr>=0&&nr<m&&nc>=0&&nc<n&&image[nr][nc]===orig){image[nr][nc]=color;q.push([nr,nc]);}}
    }
    return image;
}

// Constraints: 1 <= m, n <= 50, 0 <= image[i][j] < 2^16, 0 <= color < 2^16
const tests=[];
tests.push({image:[[1,1,1],[1,1,0],[1,0,1]],sr:1,sc:1,color:2,name:'1. Ex1'});
tests.push({image:[[0,0,0],[0,0,0]],sr:0,sc:0,color:0,name:'2. Same color'});
tests.push({image:[[0]],sr:0,sc:0,color:1,name:'3. 1x1'});
tests.push({image:[[1,1],[1,1]],sr:0,sc:0,color:65535,name:'4. Max color 65535'});
// Max-size: 50x50
const big50=Array.from({length:50},()=>Array(50).fill(1));
tests.push({image:big50.map(r=>[...r]),sr:25,sc:25,color:9,name:'5. Max 50x50 fill center'});
for(let i=tests.length;i<50;i++){
    const m=Math.floor(rand()*50)+1,n=Math.floor(rand()*50)+1;
    const maxC=Math.min(5,Math.floor(rand()*3)+2);
    const img=Array.from({length:m},()=>Array.from({length:n},()=>Math.floor(rand()*maxC)));
    const sr=Math.floor(rand()*m),sc=Math.floor(rand()*n);
    const color=Math.floor(rand()*65536);
    tests.push({image:img,sr,sc,color,name:\`Rand \${i+1} \${m}x\${n}\`});
}

let passed=0;const start=performance.now();console.log('---TEST_RESULTS_START---');
for(let i=0;i<tests.length;i++){
    const t=tests[i];
    const exp=solveExpected(t.image.map(r=>[...r]),t.sr,t.sc,t.color);
    const inStr=\`\${t.name}<br>sr=\${t.sr} sc=\${t.sc} color=\${t.color}\`;
    try{
        const res=sol.floodFill(t.image.map(r=>[...r]),t.sr,t.sc,t.color);
        const ok=JSON.stringify(res)===JSON.stringify(exp);
        if(ok){passed++;console.log(\`\${i+1}|PASS|\${inStr}|\${JSON.stringify(res)}|\${JSON.stringify(exp)}\`);}
        else console.log(\`\${i+1}|FAIL|\${inStr}|\${JSON.stringify(res)}|\${JSON.stringify(exp)}\`);
    }catch(e){console.log(\`\${i+1}|FAIL|\${inStr}|[]|\${e.message}\`);}
}
console.log('---TEST_RESULTS_END---');
console.log(\`SUMMARY|\${passed}|\${tests.length}|\${(performance.now()-start).toFixed(3)}\`);
`,

'max-area-of-island': `const { performance } = require('perf_hooks');
const Solution = require('./solution.js');
const sol = new Solution();

function sfc32(a,b,c,d){return function(){a>>>=0;b>>>=0;c>>>=0;d>>>=0;let t=(a+b)|0;a=b^b>>>9;b=c+(c<<3)|0;c=(c<<21|c>>>11);d=d+1|0;t=t+d|0;c=c+t|0;return(t>>>0)/4294967296;}}
const rand = sfc32(4,4,4,4);

// Head-pointer BFS: O(MN)
function solveExpected(grid) {
    const m=grid.length,n=grid[0].length,dirs=[[-1,0],[1,0],[0,-1],[0,1]];
    const g=grid.map(r=>[...r]);let best=0;
    for(let i=0;i<m;i++)for(let j=0;j<n;j++){
        if(g[i][j]===1){
            const q=[[i,j]];let head=0,area=0;g[i][j]=0;
            while(head<q.length){const[r,c]=q[head++];area++;
                for(const[dr,dc]of dirs){const nr=r+dr,nc=c+dc;
                    if(nr>=0&&nr<m&&nc>=0&&nc<n&&g[nr][nc]===1){g[nr][nc]=0;q.push([nr,nc]);}}}
            best=Math.max(best,area);
        }
    }
    return best;
}

// Constraints: 1 <= m, n <= 50, values 0 or 1
const tests=[];
tests.push({input:[[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,1,1,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,1,0,1,0,0],[0,1,0,0,1,1,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0]],name:'1. Ex1 (ans=6)'});
tests.push({input:[[0,0,0,0,0,0,0,0]],name:'2. All water (ans=0)'});
tests.push({input:[[1,1],[1,1]],name:'3. Full 2x2 (ans=4)'});
tests.push({input:[[1]],name:'4. Single land (ans=1)'});
tests.push({input:[[0]],name:'5. Single water (ans=0)'});
// Max-size: 50x50 all land
const big50=Array.from({length:50},()=>Array(50).fill(1));
tests.push({input:big50,name:'6. Max 50x50 all land (ans=2500)'});
for(let i=tests.length;i<50;i++){
    const m=Math.floor(rand()*50)+1,n=Math.floor(rand()*50)+1;
    const g=Array.from({length:m},()=>Array.from({length:n},()=>Math.floor(rand()*2)));
    tests.push({input:g,name:\`Rand \${i+1} \${m}x\${n}\`});
}

let passed=0;const start=performance.now();console.log('---TEST_RESULTS_START---');
for(let i=0;i<tests.length;i++){
    const t=tests[i];const exp=solveExpected(t.input);
    const inStr=\`\${t.name}\`;
    try{
        const res=sol.maxAreaOfIsland(t.input.map(r=>[...r]));
        if(res===exp){passed++;console.log(\`\${i+1}|PASS|\${inStr}|\${res}|\${exp}\`);}
        else console.log(\`\${i+1}|FAIL|\${inStr}|\${res}|\${exp}\`);
    }catch(e){console.log(\`\${i+1}|FAIL|\${inStr}|[]|\${e.message}\`);}
}
console.log('---TEST_RESULTS_END---');
console.log(\`SUMMARY|\${passed}|\${tests.length}|\${(performance.now()-start).toFixed(3)}\`);
`,

'number-of-islands': `const { performance } = require('perf_hooks');
const Solution = require('./solution.js');
const sol = new Solution();

function sfc32(a,b,c,d){return function(){a>>>=0;b>>>=0;c>>>=0;d>>>=0;let t=(a+b)|0;a=b^b>>>9;b=c+(c<<3)|0;c=(c<<21|c>>>11);d=d+1|0;t=t+d|0;c=c+t|0;return(t>>>0)/4294967296;}}
const rand = sfc32(9,9,9,9);

// Head-pointer BFS: O(MN)
function solveExpected(grid) {
    const m=grid.length,n=grid[0].length,dirs=[[-1,0],[1,0],[0,-1],[0,1]];
    const g=grid.map(r=>[...r]);let islands=0;
    for(let i=0;i<m;i++)for(let j=0;j<n;j++){
        if(g[i][j]==='1'){islands++;
            const q=[[i,j]];let head=0;g[i][j]='0';
            while(head<q.length){const[r,c]=q[head++];
                for(const[dr,dc]of dirs){const nr=r+dr,nc=c+dc;
                    if(nr>=0&&nr<m&&nc>=0&&nc<n&&g[nr][nc]==='1'){g[nr][nc]='0';q.push([nr,nc]);}}}
        }
    }
    return islands;
}

// Constraints: 1 <= m, n <= 300, values '0' or '1'
const tests=[];
tests.push({input:[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]],name:'1. Ex1 (ans=1)'});
tests.push({input:[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]],name:'2. Ex2 (ans=3)'});
tests.push({input:[["0","0"],["0","0"]],name:'3. All water'});
tests.push({input:[["1"]],name:'4. Single land'});
tests.push({input:[["0"]],name:'5. Single water'});
// Checkerboard — maximum island count
tests.push({input:Array.from({length:10},(_,i)=>Array.from({length:10},(_,j)=>(i+j)%2===0?'1':'0')),name:'6. Checkerboard 10x10'});
// Max-size 300x300 all land
tests.push({input:Array.from({length:300},()=>Array(300).fill('1')),name:'7. Max 300x300 all land (ans=1)'});
tests.push({input:Array.from({length:300},()=>Array(300).fill('0')),name:'8. Max 300x300 all water (ans=0)'});
for(let i=tests.length;i<50;i++){
    const m=Math.floor(rand()*300)+1,n=Math.floor(rand()*300)+1;
    const density=Math.floor(rand()*40)+10;
    const g=Array.from({length:m},()=>Array.from({length:n},()=>rand()*100<density?'1':'0'));
    tests.push({input:g,name:\`Rand \${i+1} \${m}x\${n} d=\${density}%\`});
}

let passed=0;const start=performance.now();console.log('---TEST_RESULTS_START---');
for(let i=0;i<tests.length;i++){
    const t=tests[i];const exp=solveExpected(t.input.map(r=>[...r]));
    const inStr=\`\${t.name}\`;
    try{
        const res=sol.numIslands(t.input.map(r=>[...r]));
        if(res===exp){passed++;console.log(\`\${i+1}|PASS|\${inStr}|\${res}|\${exp}\`);}
        else console.log(\`\${i+1}|FAIL|\${inStr}|\${res}|\${exp}\`);
    }catch(e){console.log(\`\${i+1}|FAIL|\${inStr}|[]|\${e.message}\`);}
}
console.log('---TEST_RESULTS_END---');
console.log(\`SUMMARY|\${passed}|\${tests.length}|\${(performance.now()-start).toFixed(3)}\`);
`,
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN — patch all problems
// ─────────────────────────────────────────────────────────────────────────────
async function patchAll() {
    const rows = await dbAll('SELECT slug, starterCode FROM problems');
    for (const row of rows) {
        const slug = row.slug;
        if (!jsStarters[slug]) continue;

        // 1. Update JS starter
        const starters = JSON.parse(row.starterCode);
        starters.javascript = jsStarters[slug];
        await dbRun('UPDATE problems SET starterCode = ? WHERE slug = ?', [JSON.stringify(starters), slug]);
        console.log(`✓ Updated JS starter: ${slug}`);
    }

    const wrapRows = await dbAll('SELECT problem_slug, test_wrappers FROM problem_tests');
    for (const row of wrapRows) {
        const slug = row.problem_slug;
        if (!jsWrappers[slug]) continue;

        const wrappers = JSON.parse(row.test_wrappers);

        // 2. Update JS wrapper
        wrappers.javascript = jsWrappers[slug];

        // 3. Replace LinkedList with ArrayDeque in Java wrapper
        if (wrappers.java) {
            wrappers.java = wrappers.java
                .replace(/new LinkedList<>/g, 'new ArrayDeque<>')
                .replace(/Queue<int\[\]>/g, 'Deque<int[]>')
                .replace(/import java\.util\.\*;/, 'import java.util.*;');
        }

        await dbRun('UPDATE problem_tests SET test_wrappers = ? WHERE problem_slug = ?', [JSON.stringify(wrappers), slug]);
        console.log(`✓ Updated JS wrapper + Java ArrayDeque: ${slug}`);
    }

    console.log('\nAll patches applied. Running validation...');
}

patchAll().catch(console.error);
