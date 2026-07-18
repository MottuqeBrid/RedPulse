import { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaCamera,
  FaTimes,
  FaEdit,
  FaHistory,
} from "react-icons/fa";
import { useForm } from "react-hook-form";
import axiosInstance from "../../lib/axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const formatDate = (dateString) => {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const DonationStatsTab = ({ user, setUser }) => {
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donations, setDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);

  const fetchDonations = async () => {
    try {
      const res = await axiosInstance.get("user/donations");
      if (res.data?.success) {
        setDonations(res.data.data);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error(err.response?.data?.message || "Failed to load donations");
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setDonationsLoading(true);
      await fetchDonations();
      if (!cancelled) setDonationsLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEditDonation = (donation) => {
    setEditingDonation(donation);
    setShowDonationForm(true);
  };

  return (
    <div className="space-y-6">
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

      <div className="divider"></div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <FaCalendarAlt className="text-primary" /> Log Donation
        </h3>
        <button
          onClick={() => {
            setEditingDonation(null);
            setShowDonationForm(!showDonationForm);
          }}
          className="btn btn-primary btn-sm gap-2"
        >
          {showDonationForm ? (
            <>
              <FaTimes /> Cancel
            </>
          ) : (
            "New Donation"
          )}
        </button>
      </div>

      {showDonationForm && (
        <DonationForm
          user={user}
          donation={editingDonation}
          onSuccess={(updatedUser) => {
            setShowDonationForm(false);
            setEditingDonation(null);
            if (updatedUser) setUser(updatedUser);
            fetchDonations();
          }}
        />
      )}

      <div className="divider"></div>

      <div>
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <FaHistory className="text-primary" /> Donation History
        </h3>

        {donationsLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-8 text-base-content/60">
            <FaHistory className="text-4xl mx-auto mb-4 opacity-50" />
            <p>No donation history yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map((donation) => (
              <DonationCard
                key={donation._id}
                donation={donation}
                onEdit={handleEditDonation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DonationCard = ({ donation, onEdit }) => {
  return (
    <div className="card bg-base-200/50 border border-base-200">
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <FaCalendarAlt className="text-primary text-sm" />
              <span className="font-medium">{formatDate(donation.date)}</span>
            </div>
            {donation.description && (
              <p className="text-sm text-base-content/70 mb-2">
                {donation.description}
              </p>
            )}
            {donation.images && donation.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {donation.images.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Donation ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => window.open(url, "_blank")}
                  />
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => onEdit(donation)}
            className="btn btn-ghost btn-xs"
            title="Edit donation"
          >
            <FaEdit className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

const DonationForm = ({ user, donation, onSuccess }) => {
  const isEditing = !!donation;
  const [images, setImages] = useState(donation?.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      lastDonationDate: donation?.date
        ? new Date(donation.date).toISOString().split("T")[0]
        : user?.lastDonationDate
          ? new Date(user.lastDonationDate).toISOString().split("T")[0]
          : "",
      description: donation?.description || "",
    },
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          toast.error("Please select image files only");
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image must be less than 5MB");
          continue;
        }
        const formData = new FormData();
        formData.append("image", file);
        const res = await axiosInstance.post("upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data?.success) {
          uploaded.push(res.data.data.url);
        }
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch {
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (isEditing) {
        const res = await axiosInstance.patch(
          `user/donations/${donation._id}`,
          {
            date: data.lastDonationDate,
            images,
            description: data.description,
          },
        );
        if (res.data?.success) {
          toast.success("Donation updated successfully!");
          onSuccess(null);
          navigate(0); // Refresh the page to reflect changes
        }
      } else {
        const res = await axiosInstance.patch("user/update/donation", {
          lastDonationDate: data.lastDonationDate,
          images,
          description: data.description,
        });
        if (res.data?.success) {
          toast.success("Donation logged successfully!");
          onSuccess(res.data.data);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save donation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="card bg-base-200 p-4 flex flex-col gap-4"
    >
      <h4 className="font-semibold">
        {isEditing ? "Edit Donation" : "Log New Donation"}
      </h4>

      <div className="form-control">
        <label className="label">
          <span className="label-text flex items-center gap-2">
            <FaCalendarAlt className="text-primary" /> Donation Date
          </span>
        </label>
        <input
          type="date"
          className={`input input-bordered w-full ${errors.lastDonationDate ? "input-error" : ""}`}
          max={new Date().toISOString().split("T")[0]}
          {...register("lastDonationDate", {
            required: "Donation date is required",
          })}
        />
        {errors.lastDonationDate && (
          <label className="label">
            <span className="label-text-alt text-error">
              {errors.lastDonationDate.message}
            </span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Description (optional)</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-20 w-full"
          placeholder="Where did you donate? Any notes..."
          {...register("description")}
        ></textarea>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text flex items-center gap-2">
            <FaCamera className="text-primary" /> Photos (optional)
          </span>
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          className="file-input file-input-bordered w-full"
          onChange={handleImageUpload}
          disabled={uploading}
        />
        {uploading && (
          <div className="flex items-center gap-2 mt-2">
            <span className="loading loading-spinner loading-sm"></span>
            <span className="text-sm text-base-content/60">Uploading...</span>
          </div>
        )}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={url}
                  alt={`Donation ${i + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaTimes className="w-2 h-2" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onSuccess(null)}
          className="btn btn-ghost btn-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-sm gap-2"
          disabled={saving || uploading}
        >
          {saving ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : isEditing ? (
            "Update Donation"
          ) : (
            "Save Donation"
          )}
        </button>
      </div>
    </form>
  );
};

export default DonationStatsTab;
