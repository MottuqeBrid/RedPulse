import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const formatDate = (dateString) => {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const DonationStatsTab = ({ user }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="stat bg-base-200 rounded-lg p-4">
        <div className="stat-title">Total Donations</div>
        <div className="stat-value text-primary">
          {user.totalDonations || 0}
        </div>
        <div className="stat-desc">
          {user.totalDonations > 0 ? "Lives saved" : "Start donating today"}
        </div>
      </div>

      <div className="stat bg-base-200 rounded-lg p-4">
        <div className="stat-title">Last Donation</div>
        <div className="stat-value text-secondary text-2xl">
          {formatDate(user.lastDonationDate)}
        </div>
        <div className="stat-desc">
          {user.lastDonationDate
            ? `${Math.floor((new Date() - new Date(user.lastDonationDate)) / (1000 * 60 * 60 * 24))} days ago`
            : "No donations yet"}
        </div>
      </div>

      <div className="stat bg-base-200 rounded-lg p-4">
        <div className="stat-title">Donor Status</div>
        <div className="stat-value text-lg">
          {user.isAvailable ? (
            <span className="text-success flex items-center gap-2">
              <FaCheckCircle /> Available
            </span>
          ) : (
            <span className="text-error flex items-center gap-2">
              <FaTimesCircle /> Unavailable
            </span>
          )}
        </div>
        <div className="stat-desc">
          {user.isWillingToDonate
            ? "Willing to donate"
            : "Not willing to donate"}
        </div>
      </div>
    </div>
  );
};

export default DonationStatsTab;
