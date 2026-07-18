import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import axiosInstance from "../../lib/axiosInstance";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import {
  FaTint,
  FaPhone,
  FaWeight,
  FaVenusMars,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHeart,
  FaArrowLeft,
  FaPaperPlane,
} from "react-icons/fa";

const DonorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchDonor = async () => {
      try {
        const res = await axiosInstance.get(`donor/${id}`);
        if (res.data?.success) {
          setDonor(res.data.data);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load donor");
        navigate("/find-donor");
      } finally {
        setLoading(false);
      }
    };
    fetchDonor();
  }, [id, navigate]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await axiosInstance.post("donor/message", {
        receiver: donor._id,
        content: message.trim(),
      });
      if (res.data?.success) {
        toast.success("Message sent successfully!");
        setMessage("");
        setShowMessageModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (currentUser && currentUser._id === id) {
    return navigate("/profile");
  }

  if (!donor) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-base-200 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm gap-2 mb-6"
        >
          <FaArrowLeft /> Back
        </button>

        {/* Profile Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              {donor.avatar ? (
                <div className="avatar">
                  <div className="w-28 h-28 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src={donor.avatar} alt={donor.name} />
                  </div>
                </div>
              ) : (
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content w-28 h-28 rounded-full">
                    <span className="text-4xl font-bold">
                      {donor.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "?"}
                    </span>
                  </div>
                </div>
              )}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold">{donor.name}</h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                  <div className="badge badge-primary badge-lg gap-1">
                    <FaTint className="w-3 h-3" /> {donor.bloodGroup}
                  </div>
                  {donor.isEligible ? (
                    <div className="badge badge-success badge-lg gap-1">
                      <FaCheckCircle className="w-3 h-3" /> Eligible Donor
                    </div>
                  ) : (
                    <div className="badge badge-warning badge-lg gap-1">
                      <FaTimesCircle className="w-3 h-3" /> Not Eligible
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {donor.phone && (
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <FaPhone className="text-primary text-lg" />
                  <div>
                    <p className="text-xs text-base-content/60">Phone</p>
                    <p className="font-medium">{donor.phone}</p>
                  </div>
                </div>
              )}

              {donor.gender && (
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <FaVenusMars className="text-primary text-lg" />
                  <div>
                    <p className="text-xs text-base-content/60">Gender</p>
                    <p className="font-medium capitalize">{donor.gender}</p>
                  </div>
                </div>
              )}

              {donor.weight && (
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <FaWeight className="text-primary text-lg" />
                  <div>
                    <p className="text-xs text-base-content/60">Weight</p>
                    <p className="font-medium">{donor.weight} kg</p>
                  </div>
                </div>
              )}

              {donor.age && (
                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                  <FaCalendarAlt className="text-primary text-lg" />
                  <div>
                    <p className="text-xs text-base-content/60">Age</p>
                    <p className="font-medium">{donor.age} years</p>
                  </div>
                </div>
              )}
            </div>

            {/* Address */}
            {donor.address &&
              (donor.address.division ||
                donor.address.district ||
                donor.address.upazila) && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-primary" /> Address
                  </h3>
                  <div className="p-4 bg-base-200 rounded-lg">
                    <p>
                      {[
                        donor.address.upazila,
                        donor.address.district,
                        donor.address.division,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {donor.address.details && (
                      <p className="text-sm text-base-content/60 mt-1">
                        {donor.address.details}
                      </p>
                    )}
                  </div>
                </div>
              )}

            {/* Donation Info */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FaHeart className="text-primary" /> Donation History
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="stat bg-base-200 rounded-lg p-3">
                  <div className="stat-title text-xs">Total Donations</div>
                  <div className="stat-value text-primary text-2xl">
                    {donor.totalDonations || 0}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-3">
                  <div className="stat-title text-xs">Last Donation</div>
                  <div className="stat-value text-secondary text-lg">
                    {formatDate(donor.lastDonationDate)}
                  </div>
                </div>
                <div className="stat bg-base-200 rounded-lg p-3">
                  <div className="stat-title text-xs">Willing to Donate</div>
                  <div className="stat-value text-lg">
                    {donor.isWillingToDonate ? (
                      <span className="text-success">Yes</span>
                    ) : (
                      <span className="text-error">No</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {donor.bio && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Bio</h3>
                <p className="text-base-content/70 p-4 bg-base-200 rounded-lg">
                  {donor.bio}
                </p>
              </div>
            )}

            {/* Actions */}
            {currentUser && currentUser._id !== donor._id && (
              <div className="card-actions justify-end">
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="btn btn-primary gap-2"
                >
                  <FaPaperPlane /> Send Message
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message Modal */}
        {showMessageModal && (
          <dialog className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Message {donor.name}</h3>
              <form
                onSubmit={handleSendMessage}
                className="flex flex-col gap-4"
              >
                <textarea
                  className="textarea textarea-bordered h-32 w-full"
                  placeholder="Write your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
                <div className="modal-action">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setShowMessageModal(false);
                      setMessage("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-primary gap-2 ${sending ? "loading" : ""}`}
                    disabled={sending || !message.trim()}
                  >
                    <FaPaperPlane /> {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button onClick={() => setShowMessageModal(false)}>close</button>
            </form>
          </dialog>
        )}
      </div>
    </div>
  );
};

export default DonorProfile;
