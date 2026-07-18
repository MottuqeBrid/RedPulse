import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaTint,
  FaWeight,
  FaVenusMars,
  FaCalendarAlt,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { useForm } from "react-hook-form";
import axiosInstance from "../../lib/axiosInstance";
import { toast } from "react-toastify";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genders = ["male", "female", "other"];

const PersonalInfoTab = ({ user, setUser, isEditing, setIsEditing }) => {
  const {
    register,
    handleSubmit,
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
      lastDonationDate: user?.lastDonationDate
        ? new Date(user.lastDonationDate).toISOString().split("T")[0]
        : "",
    },
  });

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, weight: Number(data.weight) };
      const res = await axiosInstance.patch("user/update", payload);
      if (res.data?.success) {
        setUser(res.data.data);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <FaVenusMars className="text-primary" /> Gender
              </span>
            </label>
            <select className="select select-bordered w-full" {...register("gender")}>
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
                <FaCalendarAlt className="text-primary" /> Date of Birth
              </span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              {...register("dateOfBirth")}
            />
          </div>
        </div>

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

        <div className="form-control">
          <label className="label">
            <span className="label-text flex items-center gap-2">
              <FaCalendarAlt className="text-primary" /> Last Donation Date
            </span>
          </label>
          <input
            type="date"
            className="input input-bordered w-full"
            max={new Date().toISOString().split("T")[0]}
            {...register("lastDonationDate")}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="btn btn-ghost"
          >
            <FaTimes /> Cancel
          </button>
          <button type="submit" className="btn btn-primary gap-2">
            <FaSave /> Save Changes
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
          <FaUser className="text-primary text-xl" />
          <div>
            <p className="text-sm text-base-content/60">Full Name</p>
            <p className="font-medium">{user.name || "Not set"}</p>
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
            <p className="font-medium">{user.phone || "Not set"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
          <FaTint className="text-primary text-xl" />
          <div>
            <p className="text-sm text-base-content/60">Blood Group</p>
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
                ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                : "Not set"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
          <FaCalendarAlt className="text-primary text-xl" />
          <div>
            <p className="text-sm text-base-content/60">Date of Birth</p>
            <p className="font-medium">{formatDate(user.dateOfBirth)}</p>
          </div>
        </div>
      </div>

      {user.bio && (
        <div className="p-4 bg-base-200 rounded-lg">
          <p className="text-sm text-base-content/60 mb-2">Bio</p>
          <p>{user.bio}</p>
        </div>
      )}

      <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
        <FaCalendarAlt className="text-primary text-xl" />
        <div>
          <p className="text-sm text-base-content/60">Last Donation Date</p>
          <p className="font-medium">{formatDate(user.lastDonationDate)}</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
