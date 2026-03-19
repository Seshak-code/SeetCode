import { useEffect, useMemo, useState } from 'react';
import ProblemTable from '../components/ProblemTable';
import { fetchProblems } from '../services/problemService';

function HomePage() {
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProblems() {
      try {
        const data = await fetchProblems();
        setProblems(data);
      } finally {
        setLoading(false);
      }
    }

    loadProblems();
  }, []);

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesDifficulty = difficulty === 'All' || problem.difficulty === difficulty;
      const matchesSearch = `${problem.title} ${problem.summary}`
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesDifficulty && matchesSearch;
    });
  }, [difficulty, problems, search]);

  return (
    <section className="page-stack">
      <div className="hero-card">
        <h1>Sharpen your problem solving</h1>
        <p>Browse curated coding challenges, read the prompt, and practice with starter code.</p>
      </div>

      <div className="filters-row">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search problems"
        />

        <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
          <option>All</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>

      {loading ? <div className="loading-state">Loading problems...</div> : <ProblemTable problems={filteredProblems} />}
    </section>
  );
}

export default HomePage;
