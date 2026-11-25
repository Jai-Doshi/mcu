import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="notfound">
      <h1>Lost in the multiverse</h1>
      <p>This page doesn’t exist on the Sacred Timeline.</p>
      <Link className="btn btn-primary" to="/">Back to the timeline</Link>
    </section>
  );
}
