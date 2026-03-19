import ProblemCard from './ProblemCard';

function ProblemTable({ problems }) {
  if (!problems.length) {
    return <div className="empty-state">No problems found.</div>;
  }

  return (
    <section className="problem-grid">
      {problems.map((problem) => (
        <ProblemCard key={problem.id} problem={problem} />
      ))}
    </section>
  );
}

export default ProblemTable;
