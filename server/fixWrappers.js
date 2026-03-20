import { dbRun, dbAll, getProblemBySlug } from './src/services/databaseService.js';
import fs from 'fs';

async function fixWrappers() {
  const problems = await dbAll('SELECT problem_slug, test_wrappers FROM problem_tests');
  for (let row of problems) {
    let w = JSON.parse(row.test_wrappers);
    let slug = row.problem_slug;

    if (w.cpp) {
        w.cpp = w.cpp.replace(/"---TEST_RESULTS_START---\\n/g, '"---TEST_RESULTS_START---\\\\n');
        w.cpp = w.cpp.replace(/"---TEST_RESULTS_END---\\n/g, '"---TEST_RESULTS_END---\\\\n');
        w.cpp = w.cpp.replace(/cout << i\+1 << "\\|PASS\\|" << input_str << "\\|" << out_str << "\\|" << vec2str\(expectedGrid\) << "\\n";/g, 
                              'cout << i+1 << "|PASS|" << input_str << "|" << out_str << "|" << vec2str(expectedGrid) << "\\\\n";');
        w.cpp = w.cpp.replace(/cout << i\+1 << "\\|FAIL\\|" << input_str << "\\|" << out_str << "\\|" << vec2str\(expectedGrid\) << "\\n";/g, 
                              'cout << i+1 << "|FAIL|" << input_str << "|" << out_str << "|" << vec2str(expectedGrid) << "\\\\n";');
        w.cpp = w.cpp.replace(/cout << i\+1 << "\\|FAIL\\|" << input_str << "\\|\\[\\]\\|Runtime Error\\n";/g, 
                              'cout << i+1 << "|FAIL|" << input_str << "|[]|Runtime Error\\\\n";');
        w.cpp = w.cpp.replace(/cout << "SUMMARY\\|" << passed_count << "\\|" << tests.size\(\) << "\\|" << duration.count\(\) << "\\n";/g, 
                              'cout << "SUMMARY|" << passed_count << "|" << tests.size() << "|" << duration.count() << "\\\\n";');
        w.cpp = w.cpp.replace(/\n";/g, '\\\\n";');
    }

    if (w.java) {
        w.java = w.java.replace(/for\(int r=0;/g, 'for(int r_idx=0;');
        w.java = w.java.replace(/r<m;/g, 'r_idx<m;');
        w.java = w.java.replace(/r\+\+/g, 'r_idx++');
        w.java = w.java.replace(/usr\[r\] = /g, 'usr[r_idx] = ');
        w.java = w.java.replace(/\.mat\[r\]/g, '.mat[r_idx]');
        w.java = w.java.replace(/g\[r\]/g, 'g[r_idx]');
    }

    if (slug === 'max-area-of-island' || slug === 'number-of-islands') {
        if (w.python) w.python = w.python.replace(/import sys/g, 'import sys\\nsys.setrecursionlimit(20000)');
        if (w.javascript) {
            if (slug === 'max-area-of-island') {
                w.javascript = w.javascript.replace(
                    /function dfs[\s\S]*?return ans;\n\}/g,
                    `let ans=0;
    for(let i=0; i<grid.length; i++){
        for(let j=0; j<grid[0].length; j++){
            if(grid[i][j]===1) {
                let area = 0; let q = [[i,j]]; grid[i][j]=0;
                while(q.length>0) {
                    let [r,c] = q.shift(); area++;
                    let dirs=[[-1,0],[1,0],[0,-1],[0,1]];
                    for(let d of dirs) {
                        let nr=r+d[0], nc=c+d[1];
                        if(nr>=0&&nr<grid.length&&nc>=0&&nc<grid[0].length&&grid[nr][nc]===1){
                            grid[nr][nc]=0; q.push([nr,nc]);
                        }
                    }
                }
                ans=Math.max(ans, area);
            }
        }
    }
    return ans;
}`
                );
            }
            if (slug === 'number-of-islands') {
                w.javascript = w.javascript.replace(
                    /function dfs[\s\S]*?return ans;\n\}/g,
                    `let ans=0;
    for(let i=0; i<grid.length; i++){
        for(let j=0; j<grid[0].length; j++){
            if(grid[i][j]==='1') {
                ans++; let q = [[i,j]]; grid[i][j]='0';
                while(q.length>0) {
                    let [r,c] = q.shift();
                    let dirs=[[-1,0],[1,0],[0,-1],[0,1]];
                    for(let d of dirs) {
                        let nr=r+d[0], nc=c+d[1];
                        if(nr>=0&&nr<grid.length&&nc>=0&&nc<grid[0].length&&grid[nr][nc]==='1'){
                            grid[nr][nc]='0'; q.push([nr,nc]);
                        }
                    }
                }
            }
        }
    }
    return ans;
}`
                );
            }
        }
        
        if (w.java) {
            if (slug === 'max-area-of-island') {
                w.java = w.java.replace(
                    /static int dfs[\s\S]*?return ans;\n    \}/g,
                    w.java.match(/static int dfs[\s\S]*?return ans;\n    \}/) ? `    static int solveExpected(int[][] grid) {
        int ans=0; int m=grid.length, n=grid[0].length;
        int[][] dirs={{-1,0},{1,0},{0,-1},{0,1}};
        for(int i=0;i<m;i++){
            for(int j=0;j<n;j++){
                if(grid[i][j]==1) {
                    int area=0; Queue<int[]> q = new LinkedList<>();
                    q.offer(new int[]{i,j}); grid[i][j]=0;
                    while(!q.isEmpty()){
                        int[] p=q.poll(); area++;
                        for(int[] d:dirs) {
                            int nr=p[0]+d[0], nc=p[1]+d[1];
                            if(nr>=0&&nr<m&&nc>=0&&nc<n&&grid[nr][nc]==1){
                                grid[nr][nc]=0; q.offer(new int[]{nr,nc});
                            }
                        }
                    }
                    ans=Math.max(ans, area);
                }
            }
        }
        return ans;
    }` : ''
                );
            }
            if (slug === 'number-of-islands') {
                w.java = w.java.replace(
                    /static void dfs[\s\S]*?return ans;\n    \}/g,
                    w.java.match(/static void dfs[\s\S]*?return ans;\n    \}/) ? `    static int solveExpected(char[][] grid) {
        int ans=0; int m=grid.length, n=grid[0].length;
        int[][] dirs={{-1,0},{1,0},{0,-1},{0,1}};
        for(int i=0;i<m;i++){
            for(int j=0;j<n;j++){
                if(grid[i][j]=='1') {
                    ans++; Queue<int[]> q = new LinkedList<>();
                    q.offer(new int[]{i,j}); grid[i][j]='0';
                    while(!q.isEmpty()){
                        int[] p=q.poll();
                        for(int[] d:dirs) {
                            int nr=p[0]+d[0], nc=p[1]+d[1];
                            if(nr>=0&&nr<m&&nc>=0&&nc<n&&grid[nr][nc]=='1'){
                                grid[nr][nc]='0'; q.offer(new int[]{nr,nc});
                            }
                        }
                    }
                }
            }
        }
        return ans;
    }` : ''
                );
            }
        }
    }

    await dbRun('UPDATE problem_tests SET test_wrappers = ? WHERE problem_slug = ?', [JSON.stringify(w), slug]);
  }
  console.log('Fixed all runtime wrappers.');
}

fixWrappers().catch(console.error);
