import { useState, useEffect } from "react";
import {
  FaHandHoldingMedical,
  FaTrash,
  FaEye,
  FaEnvelopeOpen,
  FaCheck,
  FaTimes,
  FaPaperPlane,
  FaInbox,
  FaTint,
  FaPhone,
} from "react-icons/fa";
import axiosInstance from "../../lib/axiosInstance";
import { toast } from "react-toastify";
import swal from "sweetalert2";

const formatDate = (dateString) => {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const statusColors = {
  pending: "badge-warning",
  accepted: "badge-success",
  rejected: "badge-error",
};

const RequestsTab = () => {
  const [activeSubTab, setActiveSubTab] = useState("received");
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeSubTab === "sent") {
          const res = await axiosInstance.get("request/send");
          if (!cancelled && res.data?.success) {
            setSentRequests(res.data.data);
          }
        } else {
          const res = await axiosInstance.get("request/receive");
          if (!cancelled && res.data?.success) {
            setReceivedRequests(res.data.data);
          }
        }
      } catch (err) {
        if (!cancelled && err.response?.status !== 404) {
          toast.error(
            err.response?.data?.message || "Failed to load requests",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [activeSubTab]);

  const handleMarkAsRead = async (requestId) => {
    setActionId(requestId);
    try {
      const res = await axiosInstance.patch(`request/${requestId}/read`);
      if (res.data?.success) {
        setReceivedRequests((prev) =>
          prev.map((req) =>
            req._id === requestId ? { ...req, isRead: true } : req,
          ),
        );
        toast.success("Request marked as read");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to mark as read",
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (requestId) => {
    try {
      const result = await swal.fire({
        title: "Are you sure?",
        text: "This request will be deleted permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });
      if (!result.isConfirmed) return;

      setActionId(requestId);
      const res = await axiosInstance.delete(`request/${requestId}`);
      if (res.data?.success) {
        setSentRequests((prev) => prev.filter((r) => r._id !== requestId));
        setReceivedRequests((prev) => prev.filter((r) => r._id !== requestId));
        toast.success("Request deleted successfully");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete request");
    } finally {
      setActionId(null);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    setActionId(requestId);
    try {
      const res = await axiosInstance.patch(`request/${requestId}/status`, {
        status,
      });
      if (res.data?.success) {
        setReceivedRequests((prev) =>
          prev.map((req) =>
            req._id === requestId ? { ...req, status } : req,
          ),
        );
        toast.success(`Request ${status}`);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update status",
      );
    } finally {
      setActionId(null);
    }
  };

  const renderRequestCard = (req, type) => {
    const person = type === "sent" ? req.receiver : req.sender;
    const isRead = req.isRead;
    const isPending = req.status === "pending";

    return (
      <div
        key={req._id}
        className={`p-4 rounded-lg border transition-colors ${
          isRead
            ? "bg-base-200/50 border-base-200"
            : "bg-primary/5 border-primary/20"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {!isRead && type === "received" && (
                <span className="badge badge-primary badge-xs">New</span>
              )}
              <span
                className={`badge badge-xs ${statusColors[req.status] || "badge-ghost"}`}
              >
                {req.status?.charAt(0).toUpperCase() + req.status?.slice(1)}
              </span>
              <span className="text-xs text-base-content/50">
                {formatDate(req.createdAt)}
              </span>
            </div>

            <p className="text-sm whitespace-pre-wrap break-words mt-1">
              {req.message}
            </p>

            {person && (
              <div className="mt-3 p-3 bg-base-200/80 rounded-lg">
                <p className="text-xs font-medium text-base-content/70 mb-2">
                  {type === "sent" ? "Sent to" : "Requested by"}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold">{person.name}</span>
                  {person.bloodGroup && (
                    <span className="badge badge-primary badge-xs gap-1">
                      <FaTint className="w-2 h-2" /> {person.bloodGroup}
                    </span>
                  )}
                  {person.phone && (
                    <span className="text-xs text-base-content/50 flex items-center gap-1">
                      <FaPhone className="w-2 h-2" /> {person.phone}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {type === "received" && !isRead && (
              <button
                onClick={() => handleMarkAsRead(req._id)}
                className="btn btn-ghost btn-xs"
                disabled={actionId === req._id}
                title="Mark as read"
              >
                {actionId === req._id ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <FaEnvelopeOpen className="w-3 h-3" />
                )}
              </button>
            )}
            {type === "received" && isRead && (
              <span className="text-success" title="Read">
                <FaEye className="w-3 h-3" />
              </span>
            )}

            {type === "received" && isPending && (
              <>
                <button
                  onClick={() => handleStatusUpdate(req._id, "accepted")}
                  className="btn btn-ghost btn-xs text-success"
                  disabled={actionId === req._id}
                  title="Accept"
                >
                  <FaCheck className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleStatusUpdate(req._id, "rejected")}
                  className="btn btn-ghost btn-xs text-error"
                  disabled={actionId === req._id}
                  title="Reject"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </>
            )}

            {type === "sent" && (
              <button
                onClick={() => handleDelete(req._id)}
                className="btn btn-ghost btn-xs text-error"
                disabled={actionId === req._id}
                title="Delete request"
              >
                {actionId === req._id ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <FaTrash className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const currentList =
    activeSubTab === "sent" ? sentRequests : receivedRequests;

  return (
    <div>
      <div role="tablist" className="tabs tabs-bordered mb-4">
        <button
          role="tab"
          className={`tab ${activeSubTab === "received" ? "tab-active" : ""}`}
          onClick={() => setActiveSubTab("received")}
        >
          <FaInbox className="mr-2" /> Received
          {receivedRequests.filter((r) => !r.isRead).length > 0 && (
            <span className="badge badge-primary badge-sm ml-2">
              {receivedRequests.filter((r) => !r.isRead).length}
            </span>
          )}
        </button>
        <button
          role="tab"
          className={`tab ${activeSubTab === "sent" ? "tab-active" : ""}`}
          onClick={() => setActiveSubTab("sent")}
        >
          <FaPaperPlane className="mr-2" /> Sent
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-12 text-base-content/60">
          <FaHandHoldingMedical className="text-5xl mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No requests found</p>
          <p className="text-sm mt-1">
            {activeSubTab === "sent"
              ? "You haven't sent any blood requests yet."
              : "No blood requests received yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((req) =>
            renderRequestCard(req, activeSubTab),
          )}
        </div>
      )}
    </div>
  );
};

export default RequestsTab;
