import { Link } from "react-router";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] text-center px-4">
      <h1 className="text-7xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-base-content/70 mb-8">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="btn btn-primary">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
