import { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaSave, FaTimes } from "react-icons/fa";
import { useForm } from "react-hook-form";
import axiosInstance from "../../lib/axiosInstance";
import { toast } from "react-toastify";

const BD_API = "https://bdapis.com/api/v1.2";

const AddressTab = ({ user, setUser, isEditing, setIsEditing }) => {
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
    watch,
    setValue,
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      address: {
        division: user?.address?.division || "",
        district: user?.address?.district || "",
        upazila: user?.address?.upazila || "",
        details: user?.address?.details || "",
      },
    },
  });

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

  useEffect(() => {
    if (!isEditing) return;
    reset({
      address: {
        division: user?.address?.division || "",
        district: user?.address?.district || "",
        upazila: user?.address?.upazila || "",
        details: user?.address?.details || "",
      },
    });

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
  }, [isEditing, user, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        address: {
          division: data.address.division || "",
          district: data.address.district || "",
          upazila: data.address.upazila || "",
          details: data.address.details || "",
        },
      };
      const res = await axiosInstance.patch("user/update", payload);
      if (res.data?.success) {
        setUser(res.data.data);
        setIsEditing(false);
        toast.success("Address updated successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update address.");
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                {addressLoading.divisions ? "Loading..." : "Select Division"}
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
              disabled={!watchedDivision || addressLoading.districts}
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
                <p className="text-sm text-base-content/60">Division</p>
                <p className="font-medium">{user.address.division}</p>
              </div>
            </div>
          )}

          {user.address.district && (
            <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
              <FaMapMarkerAlt className="text-primary text-xl" />
              <div>
                <p className="text-sm text-base-content/60">District</p>
                <p className="font-medium">{user.address.district}</p>
              </div>
            </div>
          )}

          {user.address.upazila && (
            <div className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
              <FaMapMarkerAlt className="text-primary text-xl" />
              <div>
                <p className="text-sm text-base-content/60">Upazila</p>
                <p className="font-medium">{user.address.upazila}</p>
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
  );
};

export default AddressTab;
