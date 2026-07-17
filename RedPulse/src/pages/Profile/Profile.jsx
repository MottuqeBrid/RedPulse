import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user && !loading) {
    return navigate("/login");
  }
  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
    </div>
  );
};

export default Profile;
