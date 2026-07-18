import { useRef } from "react";
import {
  FaTint,
  FaEdit,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaCamera,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../../lib/axiosInstance";

const ProfileHeader = ({
  user,
  setUser,
  isEditing,
  isUploadingAvatar,
  uploadStage,
  setIsUploadingAvatar,
  setUploadStage,
  onEdit,
  onCancel,
}) => {
  const fileInputRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    setUploadStage("uploading");
    try {
      const formData = new FormData();
      formData.append("image", file);

      const uploadRes = await axiosInstance.post("upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (uploadRes.data?.success) {
        setUploadStage("saving");
        const avatarUrl = uploadRes.data.data.url;
        const updateRes = await axiosInstance.patch("user/update", {
          avatar: avatarUrl,
        });

        if (updateRes.data?.success) {
          setUser(updateRes.data.data);
          toast.success("Avatar updated successfully!");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
      setUploadStage("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            {user.avatar ? (
              <div
                className={`avatar ${isUploadingAvatar ? "opacity-50" : ""}`}
              >
                <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={user.avatar} alt={user.name} />
                </div>
              </div>
            ) : (
              <div
                className={`avatar placeholder ${isUploadingAvatar ? "opacity-50" : ""}`}
              >
                <div className="bg-primary text-primary-content w-32 h-32 rounded-full">
                  <span className="text-4xl font-bold">
                    {getInitials(user.name)}
                  </span>
                </div>
              </div>
            )}

            {isUploadingAvatar && (
              <div className="absolute inset-0 w-32 h-32 rounded-full bg-black/60 flex flex-col items-center justify-center gap-1 z-10">
                <span className="loading loading-spinner loading-sm text-white"></span>
                <span className="text-white text-xs text-center leading-tight">
                  {uploadStage === "uploading"
                    ? "Uploading..."
                    : "Saving..."}
                </span>
              </div>
            )}

            {!isUploadingAvatar && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 w-32 h-32 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <FaCamera className="text-white text-2xl" />
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            {user.isAvailable && (
              <div className="absolute bottom-2 right-2 badge badge-success badge-sm gap-1">
                <FaCheckCircle className="w-3 h-3" /> Available
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-base-content/60 mt-1">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
              <div className="badge badge-primary badge-lg gap-1">
                <FaTint className="w-3 h-3" /> {user.bloodGroup}
              </div>
              {user.isVerified ? (
                <div className="badge badge-success badge-lg gap-1">
                  <FaCheckCircle className="w-3 h-3" /> Verified
                </div>
              ) : (
                <div className="badge badge-warning badge-lg gap-1">
                  <FaTimesCircle className="w-3 h-3" /> Unverified
                </div>
              )}
            </div>
          </div>

          <div>
            {!isEditing ? (
              <button onClick={onEdit} className="btn btn-primary gap-2">
                <FaEdit /> Edit Profile
              </button>
            ) : (
              <button onClick={onCancel} className="btn btn-ghost gap-2">
                <FaTimes /> Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
