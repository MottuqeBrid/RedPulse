import { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import ProfileHeader from "./ProfileHeader";
import ProfileSidebar from "./ProfileSidebar";
import axiosInstance from "../../lib/axiosInstance";
import { toast } from "react-toastify";
import swal from "sweetalert2";
import { FaTrash } from "react-icons/fa";

const Profile = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadStage, setUploadStage] = useState("");

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    try {
      const result = await swal.fire({
        title: "Delete Account?",
        text: "This action cannot be undone. All your data will be permanently deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete my account",
      });
      if (!result.isConfirmed) return;

      const res = await axiosInstance.delete("user/delete");
      if (res.data?.success) {
        toast.success("Account deleted successfully");
        logout();
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-base-200 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <ProfileHeader
          user={user}
          isEditing={isEditing}
          isUploadingAvatar={isUploadingAvatar}
          uploadStage={uploadStage}
          setIsUploadingAvatar={setIsUploadingAvatar}
          setUploadStage={setUploadStage}
          onEdit={handleEdit}
          onCancel={handleCancel}
        />

        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          <div className="lg:w-64 shrink-0 space-y-4">
            <ProfileSidebar unreadCount={0} />

            <div className="bg-base-100 rounded-box shadow-xl p-2">
              <button
                onClick={handleDeleteAccount}
                className="btn btn-ghost btn-sm text-error w-full justify-start gap-3"
              >
                <FaTrash className="text-lg" />
                Delete Account
              </button>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <Outlet context={{ isEditing, setIsEditing }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
