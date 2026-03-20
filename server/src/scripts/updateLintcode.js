import { dbRun, getProblem } from '../services/databaseService.js';

async function syncLintcode() {
    console.log('Syncing LintCode Problem 663 (Walls and Gates) to SQLite Database...');

    const descriptionHTML = `
<p>You are given a <code>m x n</code> 2D grid initialized with three possible values. Fill each empty room with the distance to its nearest gate. If it is impossible to reach a gate, that room should remain filled with <code>INF</code>.</p>
<br/>
<p><strong>Rules & Values</strong></p>
<ul>
  <li><code>-1</code>: A wall or an obstacle.</li>
  <li><code>0</code>: A gate.</li>
  <li><code>INF</code>: Infinity means an empty room. We use the value <code>2^31 - 1 = 2147483647</code> to represent <code>INF</code>.</li>
</ul>
<p>You may assume that the distance to a gate is less than <code>2147483647</code>.</p>
    `;

    const constraints = [
      'The grid size is m x n.',
      'Room values are limited to -1, 0, and 2147483647.',
      'Any room unreachable from a gate must remain INF.',
      'You can assume that any path distance to a gate will be less than 2147483647.'
    ];

    const examples = [
      {
        image: '/walls_gates_initial_1773978022683.png',
        input: 'rooms = [[2147483647,-1,0,2147483647],[2147483647,2147483647,2147483647,-1],[2147483647,-1,2147483647,-1],[0,-1,2147483647,2147483647]]',
        output: '[[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]',
        explanation: 'The 2D grid is:\\nINF  -1  0  INF\\nINF INF INF  -1\\nINF  -1 INF  -1\\n  0  -1 INF INF\\nAfter filling:\\n  3  -1   0   1\\n  2   2   1  -1\\n  1  -1   2  -1\\n  0  -1   3   4'
      },
      {
        input: 'rooms = [[0,-1],[2147483647,2147483647]]',
        output: '[[0,-1],[1,2]]'
      }
    ];

    await dbRun(
        'UPDATE problems SET description = ?, constraints = ?, examples = ? WHERE slug = ?',
        [descriptionHTML, JSON.stringify(constraints), JSON.stringify(examples), 'walls-and-gates']
    );

    console.log('Successfully synchronized LintCode 663!');
}

syncLintcode().catch(console.error);
