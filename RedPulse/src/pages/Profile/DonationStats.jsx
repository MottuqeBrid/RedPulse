import { useAuth } from "../../hooks/useAuth";
import DonationStatsTab from "./DonationStatsTab";

const DonationStats = () => {
  const { user } = useAuth();

  return <DonationStatsTab user={user} />;
};

export default DonationStats;
