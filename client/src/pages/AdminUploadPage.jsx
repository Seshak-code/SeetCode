import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function AdminUploadPage() {
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    difficulty: 'Easy',
    summary: '',
    description: '',
    acceptanceRate: '0%',
    topics: '["Array"]',
    constraints: '["1 <= constraints <= 100"]',
    examples: '[{"input": "in", "output": "out"}]',
    starterCodeCpp: '#include <iostream>\\n#include <vector>\\nusing namespace std;\\n\\nclass Solution {\\npublic:\\n    void solve() {\\n    }\\n};',
    mainCppTemplate: '#include <iostream>\\n#include <chrono>\\n#include "solution.h"\\n\\nint main() {\\n    Solution sol;\\n    \\n    auto start = std::chrono::high_resolution_clock::now();\\n    // Run sol.solve() here\\n    auto end = std::chrono::high_resolution_clock::now();\\n    \\n    std::chrono::duration<double, std::milli> duration = end - start;\\n    \\n    // evaluate condition\\n    bool success = true; \\n    if (success) {\\n        std::cout << "SUCCESS|" << duration.count() << "\\\\n";\\n    } else {\\n        std::cout << "FAILURE|" << duration.count() << "\\\\n";\\n    }\\n    return 0;\\n}'
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setStatus('Uploading to Engine...');
    
    // Parse JSON strings securely
    let parsedTopics, parsedConstraints, parsedExamples;
    try {
      parsedTopics = JSON.parse(formData.topics);
      parsedConstraints = JSON.parse(formData.constraints);
      parsedExamples = JSON.parse(formData.examples);
    } catch (e) {
      return setStatus('Error: Invalid JSON format for topics, constraints, or examples.');
    }

    const payload = {
      problemData: {
        slug: formData.slug,
        title: formData.title,
        difficulty: formData.difficulty,
        summary: formData.summary,
        description: formData.description,
        acceptanceRate: formData.acceptanceRate,
        topics: parsedTopics,
        constraints: parsedConstraints,
        examples: parsedExamples,
        starterCode: { cpp: formData.starterCodeCpp }
      },
      testWrapperData: {
        mainCppTemplate: formData.mainCppTemplate
      }
    };

    try {
      const res = await fetch('http://localhost:5005/api/problems/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setStatus('Success! Problem Integrated successfully into SQLite.');
      } else {
        setStatus('Error during upload payload.');
      }
    } catch (err) {
      console.error(err);
      setStatus('Failed to connect to backend.');
    }
  };

  return (
    <section className="problem-layout" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div className="panel panel--content">
        <Link to="/" className="back-link">← Back to homepage</Link>
        <h1 style={{ marginTop: '10px' }}>Upload New Challenge</h1>
        <p style={{ color: '#8b949e', lineHeight: '1.5' }}>This form injects a new problem and its dynamic C++ Docker test execution wrapper directly into the local abstract SQLite Engine.</p>
        
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <input name="title" placeholder="Title (e.g. Valid Parentheses)" onChange={handleChange} value={formData.title} required style={{ padding: '10px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }}/>
          <input name="slug" placeholder="URL Slug (e.g. valid-parentheses)" onChange={handleChange} value={formData.slug} required style={{ padding: '10px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }}/>
          
          <select name="difficulty" onChange={handleChange} value={formData.difficulty} style={{ padding: '10px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          
          <input name="summary" placeholder="Short Summary" onChange={handleChange} value={formData.summary} required style={{ padding: '10px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }}/>
          <textarea name="description" placeholder="Full Markdown/HTML Description" onChange={handleChange} value={formData.description} required rows="4" style={{ padding: '10px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }} />
          
          <input name="acceptanceRate" placeholder="Acceptance Rate (e.g. 55.4%)" onChange={handleChange} value={formData.acceptanceRate} style={{ padding: '10px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }}/>
          
          <div>
            <label style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px', display: 'block' }}>Topics (JSON Array)</label>
            <input name="topics" onChange={handleChange} value={formData.topics} style={{ width: '100%', padding: '10px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }}/>
          </div>
          <div>
            <label style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px', display: 'block' }}>Constraints (JSON Array)</label>
            <input name="constraints" onChange={handleChange} value={formData.constraints} style={{ width: '100%', padding: '10px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }}/>
          </div>
          <div>
            <label style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px', display: 'block' }}>Examples (JSON Array)</label>
            <textarea name="examples" onChange={handleChange} value={formData.examples} rows="4" style={{ width: '100%', padding: '10px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }}/>
          </div>
          
          <div>
            <label style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px', display: 'block' }}>C++ Starter Code (The code the user sees first)</label>
            <textarea name="starterCodeCpp" onChange={handleChange} value={formData.starterCodeCpp} rows="8" style={{ width: '100%', padding: '10px', fontFamily: 'monospace', background: '#252932', color: '#e6edf3', border: '1px solid #30363d', borderRadius: '4px' }}/>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px', display: 'block' }}>C++ Test Execution Wrapper (main.cpp injected into Docker)</label>
            <p style={{ fontSize: '0.8rem', color: '#8b949e', margin: '-2px 0 8px 0' }}>Must `#include "solution.h"` and print `SUCCESS|time` or `FAILURE|time`.</p>
            <textarea name="mainCppTemplate" onChange={handleChange} value={formData.mainCppTemplate} rows="15" style={{ width: '100%', padding: '10px', fontFamily: 'monospace', background: '#3b2326', color: '#ffa657', border: '1px solid #cb2431', borderRadius: '4px' }}/>
          </div>

          <button type="submit" style={{ padding: '12px', background: '#2ea44f', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', borderRadius: '4px', marginTop: '10px' }}>
            Inject Problem to Engine
          </button>
        </form>
        {status && <div style={{ marginTop: '20px', padding: '15px', background: status.includes('Success') ? '#2ea44f22' : '#cb243122', border: status.includes('Success') ? '1px solid #2ea44f' : '1px solid #cb2431', borderRadius: '4px', color: '#e6edf3' }}>{status}</div>}
      </div>
    </section>
  );
}

export default AdminUploadPage;
