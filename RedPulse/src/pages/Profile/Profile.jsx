import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "react-hook-form";
import axiosInstance from "../../lib/axiosInstance";
import { toast } from "react-toastify";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaTint,
  FaWeight,
  FaVenusMars,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaHeart,
  FaCheckCircle,
  FaTimesCircle,
  FaCamera,
} from "react-icons/fa";

const BD_API = "https://bdapis.com/api/v1.2";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genders = ["male", "female", "other"];

const Profile = () => {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadStage, setUploadStage] = useState("");
  const [activeTab, setActiveTab] = useState("info");
  const fileInputRef = useRef(null);

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [addressLoading, setAddressLoading] = useState({
    divisions: false,
    districts: false,
    upazilas: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bloodGroup: user?.bloodGroup || "",
      weight: user?.weight || "",
      gender: user?.gender || "",
      dateOfBirth: user?.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "",
      bio: user?.bio || "",
      address: {
        division: user?.address?.division || "",
        district: user?.address?.district || "",
        upazila: user?.address?.upazila || "",
        details: user?.address?.details || "",
      },
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedDivision = watch("address.division");
  const watchedDistrict = watch("address.district");

  useEffect(() => {
    const fetchDivisions = async () => {
      setAddressLoading((prev) => ({ ...prev, divisions: true }));
      try {
        const res = await fetch(`${BD_API}/divisions`);
        const data = await res.json();
        if (data.status?.code === 200) {
          setDivisions(data.data.map((d) => d.division));
        }
      } catch {
        toast.error("Failed to load divisions");
      } finally {
        setAddressLoading((prev) => ({ ...prev, divisions: false }));
      }
    };
    fetchDivisions();
  }, []);

  useEffect(() => {
    if (!watchedDivision) {
      setDistricts([]);
      return;
    }
    const fetchDistricts = async () => {
      setAddressLoading((prev) => ({ ...prev, districts: true }));
      setDistricts([]);
      setUpazilas([]);
      setValue("address.district", "", { shouldValidate: true });
      setValue("address.upazila", "", { shouldValidate: true });
      try {
        const res = await fetch(
          `${BD_API}/division/${encodeURIComponent(watchedDivision)}`,
        );
        const data = await res.json();
        if (data.status?.code === 200) {
          setDistricts(data.data.map((d) => d.district));
        }
      } catch {
        toast.error("Failed to load districts");
      } finally {
        setAddressLoading((prev) => ({ ...prev, districts: false }));
      }
    };
    fetchDistricts();
  }, [watchedDivision, setValue]);

  useEffect(() => {
    if (!watchedDistrict) {
      setUpazilas([]);
      return;
    }
    const fetchUpazilas = async () => {
      setAddressLoading((prev) => ({ ...prev, upazilas: true }));
      setUpazilas([]);
      setValue("address.upazila", "", { shouldValidate: true });
      try {
        const res = await fetch(
          `${BD_API}/district/${encodeURIComponent(watchedDistrict)}`,
        );
        const data = await res.json();
        if (data.status?.code === 200 && data.data?.length > 0) {
          const raw = data.data[0].upazillas || [];
          const names = raw.map((u) =>
            typeof u === "string" ? u : u.en || "",
          );
          setUpazilas(names);
        }
      } catch {
        toast.error("Failed to load upazilas");
      } finally {
        setAddressLoading((prev) => ({ ...prev, upazilas: false }));
      }
    };
    fetchUpazilas();
  }, [watchedDistrict, setValue]);

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
    reset({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bloodGroup: user?.bloodGroup || "",
      weight: user?.weight || "",
      gender: user?.gender || "",
      dateOfBirth: user?.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "",
      bio: user?.bio || "",
      address: {
        division: user?.address?.division || "",
        district: user?.address?.district || "",
        upazila: user?.address?.upazila || "",
        details: user?.address?.details || "",
      },
    });
    setIsEditing(true);

    if (user?.address?.division) {
      fetch(`${BD_API}/division/${encodeURIComponent(user.address.division)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.status?.code === 200) {
            setDistricts(data.data.map((d) => d.district));
          }
        })
        .catch(() => {});
    }
    if (user?.address?.district) {
      fetch(`${BD_API}/district/${encodeURIComponent(user.address.district)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.status?.code === 200 && data.data?.length > 0) {
            const raw = data.data[0].upazillas || [];
            const names = raw.map((u) =>
              typeof u === "string" ? u : u.en || "",
            );
            setUpazilas(names);
          }
        })
        .catch(() => {});
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  const onSubmit = async (data) => {
    setIsUpdating(true);
    try {
      const { address, ...rest } = data;

      const payload = {
        ...rest,
        weight: Number(rest.weight),
        address: {
          division: address.division || "",
          district: address.district || "",
          upazila: address.upazila || "",
          details: address.details || "",
        },
      };

      const res = await axiosInstance.patch("user/update", payload);
      if (res.data?.success) {
        setUser(res.data.data);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
    <div className="min-h-[calc(100vh-4rem)] bg-base-200 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
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

                {/* Loading overlay */}
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

                {/* Hover camera button */}
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

              {/* User Info */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-base-content/60 mt-1">{user.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                  <div className="badge badge-primary badge-lg gap-1">
                    <FaTint className="w-3 h-3" /> {user.bloodGroup}
                  </div>
                  {user.isVerified && (
                    <div className="badge badge-success badge-lg gap-1">
                      <FaCheckCircle className="w-3 h-3" /> Verified
                    </div>
                  )}
                  {!user.isVerified && (
                    <div className="badge badge-warning badge-lg gap-1">
                      <FaTimesCircle className="w-3 h-3" /> Unverified
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <div>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="btn btn-primary gap-2"
                  >
                    <FaEdit /> Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={handleCancel}
                    className="btn btn-ghost gap-2"
                  >
                    <FaTimes /> Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          className="tabs tabs-bordered mb-6 bg-base-100 rounded-box shadow-lg"
        >
          <button
            role="tab"
            className={`tab ${activeTab === "info" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            <FaUser className="mr-2" /> Personal Info
          </button>
          <button
            role="tab"
            className={`tab ${activeTab === "address" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("address")}
          >
            <FaMapMarkerAlt className="mr-2" /> Address
          </button>
          <button
            role="tab"
            className={`tab ${activeTab === "stats" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            <FaHeart className="mr-2" /> Donation Stats
          </button>
        </div>

        {/* Tab Content */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {isEditing ? (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                {activeTab === "info" && (
                  <>
                    {/* Name */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <FaUser className="text-primary" /> Full Name
                        </span>
                      </label>
                      <input
                        type="text"
                        className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`}
                        {...register("name", { required: "Name is required" })}
                      />
                      {errors.name && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {errors.name.message}
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Email */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <FaEnvelope className="text-primary" /> Email
                        </span>
                      </label>
                      <input
                        type="email"
                        className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Invalid email address",
                          },
                        })}
                      />
                      {errors.email && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {errors.email.message}
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text flex items-center gap-2">
                          <FaPhone className="text-primary" /> Phone Number
                        </span>
                      </label>
                      <input
                        type="tel"
                        className={`input input-bordered w-full ${errors.phone ? "input-error" : ""}`}
                        {...register("phone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^01\d{9}$/,
                            message: "Enter a valid 11-digit phone number",
                          },
                        })}
                      />
                      {errors.phone && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {errors.phone.message}
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Blood Group & Weight */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text flex items-center gap-2">
                            <FaTint className="text-primary" /> Blood Group
                          </span>
                        </label>
                        <select
                          className={`select select-bordered w-full ${errors.bloodGroup ? "select-error" : ""}`}
                          {...register("bloodGroup", {
                            required: "Blood group is required",
                          })}
                        >
                          <option value="" disabled>
                            Select
                          </option>
                          {bloodGroups.map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </select>
                        {errors.bloodGroup && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {errors.bloodGroup.message}
                            </span>
                          </label>
                        )}
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text flex items-center gap-2">
                            <FaWeight className="text-primary" /> Weight (kg)
                          </span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          className={`input input-bordered w-full ${errors.weight ? "input-error" : ""}`}
                          {...register("weight", {
                            required: "Weight is required",
                            min: {
                              value: 25,
                              message: "Minimum weight is 25 kg",
                            },
                          })}
                        />
                        {errors.weight && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {errors.weight.message}
                            </span>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Gender & DOB */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text flex items-center gap-2">
                            <FaVenusMars className="text-primary" /> Gender
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          {...register("gender")}
                        >
                          <option value="" disabled>
                            Select
                          </option>
                          {genders.map((g) => (
                            <option key={g} value={g}>
                              {g.charAt(0).toUpperCase() + g.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text flex items-center gap-2">
                            <FaCalendarAlt className="text-primary" /> Date of
                            Birth
                          </span>
                        </label>
                        <input
                          type="date"
                          className="input input-bordered w-full"
                          {...register("dateOfBirth")}
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Bio</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered h-24 w-full"
                        placeholder="Tell us about yourself..."
                        {...register("bio")}
                      ></textarea>
                    </div>
                  </>
                )}

                {activeTab === "address" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text flex items-center gap-2">
                            <FaMapMarkerAlt className="text-primary" /> Division
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          {...register("address.division")}
                          disabled={addressLoading.divisions}
                        >
                          <option value="">
                            {addressLoading.divisions
                              ? "Loading..."
                              : "Select Division"}
                          </option>
                          {divisions.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">District</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          {...register("address.district")}
                          disabled={
                            !watchedDivision || addressLoading.districts
                          }
                        >
                          <option value="">
                            {addressLoading.districts
                              ? "Loading..."
                              : watchedDivision
                                ? "Select District"
                                : "Select division first"}
                          </option>
                          {districts.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Upazila</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          {...register("address.upazila")}
                          disabled={!watchedDistrict || addressLoading.upazilas}
                        >
                          <option value="">
                            {addressLoading.upazilas
                              ? "Loading..."
                              : watchedDistrict
                                ? "Select Upazila"
                                : "Select district first"}
                          </option>
                          {upazilas.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Detailed Address</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered h-24 w-full"
                        placeholder="House no, street, area..."
                        {...register("address.details")}
                      ></textarea>
                    </div>
                  </>
                )}

                {activeTab === "stats" && (
                  <div className="text-center py-8">
                    <p className="text-base-content/60 mb-4">
                      Donation stats are view-only and cannot be edited here.
                    </p>
                  </div>
                )}

                {activeTab !== "stats" && (
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-ghost"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`btn btn-primary gap-2 ${isUpdating ? "loading" : ""}`}
                      disabled={isUpdating}
                    >
                      <FaSave /> {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </form>
            ) : (
              <>
                {/* Read-only view */}
                {activeTab === "info" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                        <FaUser className="text-primary text-xl" />
                        <div>
                          <p className="text-sm text-base-content/60">
                            Full Name
                          </p>
                          <p className="font-medium">
                            {user.name || "Not set"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                        <FaEnvelope className="text-primary text-xl" />
                        <div>
                          <p className="text-sm text-base-content/60">Email</p>
                          <p className="font-medium">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                        <FaPhone className="text-primary text-xl" />
                        <div>
                          <p className="text-sm text-base-content/60">Phone</p>
                          <p className="font-medium">
                            {user.phone || "Not set"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                        <FaTint className="text-primary text-xl" />
                        <div>
                          <p className="text-sm text-base-content/60">
                            Blood Group
                          </p>
                          <p className="font-medium">{user.bloodGroup}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                        <FaWeight className="text-primary text-xl" />
                        <div>
                          <p className="text-sm text-base-content/60">Weight</p>
                          <p className="font-medium">
                            {user.weight ? `${user.weight} kg` : "Not set"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                        <FaVenusMars className="text-primary text-xl" />
                        <div>
                          <p className="text-sm text-base-content/60">Gender</p>
                          <p className="font-medium">
                            {user.gender
                              ? user.gender.charAt(0).toUpperCase() +
                                user.gender.slice(1)
                              : "Not set"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                        <FaCalendarAlt className="text-primary text-xl" />
                        <div>
                          <p className="text-sm text-base-content/60">
                            Date of Birth
                          </p>
                          <p className="font-medium">
                            {formatDate(user.dateOfBirth)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {user.bio && (
                      <div className="p-4 bg-base-200 rounded-lg">
                        <p className="text-sm text-base-content/60 mb-2">Bio</p>
                        <p>{user.bio}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "address" && (
                  <div className="space-y-4">
                    {user.address &&
                    (user.address.division ||
                      user.address.district ||
                      user.address.upazila ||
                      user.address.details) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.address.division && (
                          <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                            <FaMapMarkerAlt className="text-primary text-xl" />
                            <div>
                              <p className="text-sm text-base-content/60">
                                Division
                              </p>
                              <p className="font-medium">
                                {user.address.division}
                              </p>
                            </div>
                          </div>
                        )}

                        {user.address.district && (
                          <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                            <FaMapMarkerAlt className="text-primary text-xl" />
                            <div>
                              <p className="text-sm text-base-content/60">
                                District
                              </p>
                              <p className="font-medium">
                                {user.address.district}
                              </p>
                            </div>
                          </div>
                        )}

                        {user.address.upazila && (
                          <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                            <FaMapMarkerAlt className="text-primary text-xl" />
                            <div>
                              <p className="text-sm text-base-content/60">
                                Upazila
                              </p>
                              <p className="font-medium">
                                {user.address.upazila}
                              </p>
                            </div>
                          </div>
                        )}

                        {user.address.details && (
                          <div className="p-4 bg-base-200 rounded-lg md:col-span-2">
                            <p className="text-sm text-base-content/60 mb-2">
                              Detailed Address
                            </p>
                            <p>{user.address.details}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-base-content/60">
                        <FaMapMarkerAlt className="text-4xl mx-auto mb-4 opacity-50" />
                        <p>No address information added yet.</p>
                        <p className="text-sm mt-1">
                          Click &quot;Edit Profile&quot; to add your address.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "stats" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="stat bg-base-200 rounded-lg p-4">
                      <div className="stat-title">Total Donations</div>
                      <div className="stat-value text-primary">
                        {user.totalDonations || 0}
                      </div>
                      <div className="stat-desc">
                        {user.totalDonations > 0
                          ? "Lives saved"
                          : "Start donating today"}
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
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
