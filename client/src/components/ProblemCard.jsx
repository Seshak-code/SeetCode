import { Link } from 'react-router-dom';

function ProblemCard({ problem }) {
  return (
    <article className="problem-card">
      <div className="problem-card__header">
        <div>
          <h3>
            <Link to={`/problems/${problem.slug}`}>{problem.title}</Link>
          </h3>
          <p>{problem.summary}</p>
        </div>
        <span className={`badge badge--${problem.difficulty.toLowerCase()}`}>
          {problem.difficulty}
        </span>
      </div>

      <div className="problem-card__footer">
        <span>Acceptance: {problem.acceptanceRate}</span>
        <span>Topics: {problem.topics.join(', ')}</span>
      </div>
    </article>
  );
}

export default ProblemCard;
