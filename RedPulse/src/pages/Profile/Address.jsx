import { useOutletContext } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import AddressTab from "./AddressTab";

const Address = () => {
  const { user, setUser } = useAuth();
  const { isEditing, setIsEditing } = useOutletContext();

  return (
    <AddressTab
      user={user}
      setUser={setUser}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
    />
  );
};

export default Address;
