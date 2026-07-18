import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaCalendarAlt,
  FaSearch,
} from "react-icons/fa";
import axiosInstance from "../../lib/axiosInstance";
import { toast } from "react-toastify";
import swal from "sweetalert2";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const MyBlogsTab = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("blog/my");
        if (res.data?.success) {
          setBlogs(res.data.data);
        }
      } catch {
        toast.error("Failed to load blogs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (blogId, title) => {
    const result = await swal.fire({
      title: "Delete Blog?",
      text: `"${title}" will be permanently deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
    });
    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(`blog/${blogId}`);
      toast.success("Blog deleted");
      setBlogs((prev) => prev.filter((b) => b._id !== blogId));
    } catch {
      toast.error("Failed to delete blog");
    }
  };

  const filtered = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-lg">My Blogs</h3>
        <Link to="/profile/blogs/create" className="btn btn-primary btn-sm gap-2">
          <FaPlus /> New Blog
        </Link>
      </div>

      {blogs.length > 0 && (
        <div className="form-control">
          <div className="input input-bordered input-sm flex items-center gap-2">
            <FaSearch className="text-base-content/40 text-xs" />
            <input
              type="text"
              placeholder="Search..."
              className="grow bg-transparent outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {blogs.length === 0 ? (
        <div className="text-center py-8 text-base-content/60">
          <FaEdit className="text-4xl mx-auto mb-4 opacity-40" />
          <p>You haven&apos;t written any blogs yet.</p>
          <Link to="/profile/blogs/create" className="btn btn-primary btn-sm mt-4 gap-2">
            <FaPlus /> Write your first blog
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-6 text-base-content/60">
          No blogs match your search.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((blog) => (
            <div
              key={blog._id}
              className="card bg-base-200/50 border border-base-200"
            >
              <div className="card-body p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{blog.title}</h4>
                      {blog.isPublished ? (
                        <span className="badge badge-success badge-sm gap-1">
                          <FaEye className="text-[10px]" /> Published
                        </span>
                      ) : (
                        <span className="badge badge-ghost badge-sm gap-1">
                          <FaEyeSlash className="text-[10px]" /> Draft
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-base-content/60 line-clamp-1">
                      {blog.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-base-content/50">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt /> {formatDate(blog.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaEye /> {blog.visitor || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      to={`/profile/blogs/edit/${blog._id}`}
                      className="btn btn-ghost btn-xs"
                      title="Edit"
                    >
                      <FaEdit className="w-3 h-3" />
                    </Link>
                    <button
                      onClick={() => handleDelete(blog._id, blog.title)}
                      className="btn btn-ghost btn-xs text-error"
                      title="Delete"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBlogsTab;
