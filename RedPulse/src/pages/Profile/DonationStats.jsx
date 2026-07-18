import { useAuth } from "../../hooks/useAuth";
import DonationStatsTab from "./DonationStatsTab";

const DonationStats = () => {
  const { user, setUser } = useAuth();

  return <DonationStatsTab user={user} setUser={setUser} />;
};

export default DonationStats;
