import { useOutletContext } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import PersonalInfoTab from "./PersonalInfoTab";

const PersonalInfo = () => {
  const { user, setUser } = useAuth();
  const { isEditing, setIsEditing } = useOutletContext();

  return (
    <PersonalInfoTab
      user={user}
      setUser={setUser}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
    />
  );
};

export default PersonalInfo;
