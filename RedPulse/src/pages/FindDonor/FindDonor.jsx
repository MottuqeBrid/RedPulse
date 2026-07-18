import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import axiosInstance from "../../lib/axiosInstance";
import { toast } from "react-toastify";
import {
  FaTint,
  FaMapMarkerAlt,
  FaSearch,
  FaUser,
  FaPhone,
  FaWeight,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const BD_API = "https://bdapis.com/api/v1.2";
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const FindDonor = () => {
  const [bloodGroup, setBloodGroup] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);

  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingUpazilas, setLoadingUpazilas] = useState(false);

  const [donors, setDonors] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchDivisions = async () => {
      setLoadingDivisions(true);
      try {
        const res = await fetch(`${BD_API}/divisions`);
        const data = await res.json();
        if (data.status?.code === 200) {
          setDivisions(data.data.map((d) => d.division));
        }
      } catch {
        toast.error("Failed to load divisions");
      } finally {
        setLoadingDivisions(false);
      }
    };
    fetchDivisions();
  }, []);

  useEffect(() => {
    if (!division) return;
    let cancelled = false;
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const res = await fetch(
          `${BD_API}/division/${encodeURIComponent(division)}`,
        );
        const data = await res.json();
        if (!cancelled && data.status?.code === 200) {
          setDistricts(data.data.map((d) => d.district));
        }
      } catch {
        if (!cancelled) toast.error("Failed to load districts");
      } finally {
        if (!cancelled) setLoadingDistricts(false);
      }
    };
    fetchDistricts();
    return () => {
      cancelled = true;
    };
  }, [division]);

  useEffect(() => {
    if (!district) return;
    let cancelled = false;
    const fetchUpazilas = async () => {
      setLoadingUpazilas(true);
      try {
        const res = await fetch(
          `${BD_API}/district/${encodeURIComponent(district)}`,
        );
        const data = await res.json();
        if (!cancelled && data.status?.code === 200 && data.data?.length > 0) {
          const raw = data.data[0].upazillas || [];
          setUpazilas(raw.map((u) => (typeof u === "string" ? u : u.en || "")));
        }
      } catch {
        if (!cancelled) toast.error("Failed to load upazilas");
      } finally {
        if (!cancelled) setLoadingUpazilas(false);
      }
    };
    fetchUpazilas();
    return () => {
      cancelled = true;
    };
  }, [district]);

  const searchDonors = useCallback(
    async (pageNum = 1) => {
      if (!bloodGroup) {
        toast.error("Please select a blood group");
        return;
      }
      setSearching(true);
      setHasSearched(true);
      try {
        const params = new URLSearchParams({
          bloodGroup,
          page: pageNum,
          limit: 12,
        });
        if (division) params.append("division", division);
        if (district) params.append("district", district);
        if (upazila) params.append("upazila", upazila);

        const res = await axiosInstance.get(
          `donor/search?${params.toString()}`,
        );
        if (res.data?.success) {
          setDonors(res.data.data);
          setTotal(res.data.total);
          setTotalPages(res.data.pages);
          setPage(pageNum);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to search donors");
        setDonors([]);
      } finally {
        setSearching(false);
      }
    },
    [bloodGroup, division, district, upazila],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    searchDonors(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-base-200 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <FaTint className="text-primary" /> Find a Donor
          </h1>
          <p className="text-base-content/60 mt-2">
            Search for available blood donors near you
          </p>
        </div>

        {/* Search Form */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Blood Group */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <FaTint className="text-primary" /> Blood Group *
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select blood group
                  </option>
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <FaMapMarkerAlt className="text-primary" /> Division
                    </span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={division}
                    onChange={(e) => {
                      setDivision(e.target.value);
                      setDistrict("");
                      setDistricts([]);
                      setUpazila("");
                      setUpazilas([]);
                    }}
                    disabled={loadingDivisions}
                  >
                    <option value="">
                      {loadingDivisions ? "Loading..." : "All Divisions"}
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
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setUpazila("");
                      setUpazilas([]);
                    }}
                    disabled={!division || loadingDistricts}
                  >
                    <option value="">
                      {loadingDistricts
                        ? "Loading..."
                        : division
                          ? "All Districts"
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
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    disabled={!district || loadingUpazilas}
                  >
                    <option value="">
                      {loadingUpazilas
                        ? "Loading..."
                        : district
                          ? "All Upazilas"
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

              <button
                type="submit"
                className={`btn btn-primary gap-2 ${searching ? "loading" : ""}`}
                disabled={searching}
              >
                <FaSearch /> {searching ? "Searching..." : "Search Donors"}
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        {searching && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        {!searching && hasSearched && donors.length === 0 && (
          <div className="text-center py-12">
            <FaUser className="text-5xl mx-auto mb-4 opacity-30" />
            <p className="text-lg text-base-content/60">
              No donors found for this search.
            </p>
            <p className="text-sm text-base-content/40 mt-1">
              Try broadening your search criteria.
            </p>
          </div>
        )}

        {!searching && donors.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-base-content/60">
                Found <span className="font-semibold">{total}</span> donor
                {total !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {donors.map((donor) => (
                <div
                  key={donor._id}
                  className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className="card-body p-5">
                    <div className="flex items-center gap-3 mb-3">
                      {donor.avatar ? (
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-full">
                            <img src={donor.avatar} alt={donor.name} />
                          </div>
                        </div>
                      ) : (
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content w-12 h-12 rounded-full">
                            <span className="text-lg font-bold">
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
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{donor.name}</h3>
                        <div className="flex items-center gap-2">
                          <div className="badge badge-primary badge-sm">
                            {donor.bloodGroup}
                          </div>
                          {donor.isAvailable ? (
                            <div className="badge badge-success badge-sm gap-1">
                              <FaCheckCircle className="w-2.5 h-2.5" />{" "}
                              Available
                            </div>
                          ) : (
                            <div className="badge badge-error badge-sm gap-1">
                              <FaTimesCircle className="w-2.5 h-2.5" />{" "}
                              Unavailable
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {donor.gender && (
                        <div className="flex items-center gap-2 text-base-content/70">
                          <FaUser className="w-3.5 h-3.5" />
                          <span className="capitalize">{donor.gender}</span>
                          {donor.weight && (
                            <span className="text-base-content/40">|</span>
                          )}
                          {donor.weight && (
                            <>
                              <FaWeight className="w-3.5 h-3.5" />
                              <span>{donor.weight} kg</span>
                            </>
                          )}
                        </div>
                      )}

                      {donor.phone && (
                        <div className="flex items-center gap-2 text-base-content/70">
                          <FaPhone className="w-3.5 h-3.5" />
                          <span>{donor.phone}</span>
                        </div>
                      )}

                      {donor.address &&
                        (donor.address.district || donor.address.upazila) && (
                          <div className="flex items-center gap-2 text-base-content/70">
                            <FaMapMarkerAlt className="w-3.5 h-3.5" />
                            <span className="truncate">
                              {[donor.address.upazila, donor.address.district]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </div>
                        )}

                      <div className="flex items-center gap-2 text-base-content/70">
                        <FaCalendarAlt className="w-3.5 h-3.5" />
                        <span>
                          Last donated: {formatDate(donor.lastDonationDate)}
                        </span>
                      </div>
                    </div>

                    <div className="card-actions justify-end mt-3">
                      <Link
                        to={`/donor/${donor._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  className="btn btn-sm btn-outline"
                  disabled={page <= 1}
                  onClick={() => searchDonors(page - 1)}
                >
                  <FaChevronLeft /> Prev
                </button>
                <span className="btn btn-sm btn-ghost no-animation">
                  {page} / {totalPages}
                </span>
                <button
                  className="btn btn-sm btn-outline"
                  disabled={page >= totalPages}
                  onClick={() => searchDonors(page + 1)}
                >
                  Next <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FindDonor;
