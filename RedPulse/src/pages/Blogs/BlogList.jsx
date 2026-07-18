import { useState, useEffect } from "react";
import { Link } from "react-router";
import { FaSearch, FaCalendarAlt, FaUser, FaEye } from "react-icons/fa";
import axiosInstance from "../../lib/axiosInstance";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axiosInstance.get("blog");
        if (res.data?.success) {
          setBlogs(res.data.data);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) return;

    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axiosInstance.get(
          `blog/search/${encodeURIComponent(searchQuery.trim())}`,
        );
        if (res.data?.success) {
          setSearchResults(res.data.data);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const displayBlogs = searchResults !== null ? searchResults : blogs;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-base-200 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Blog</h1>

        <div className="form-control mb-8">
          <div className="input input-bordered flex items-center gap-2">
            <FaSearch className="text-base-content/40" />
            <input
              type="text"
              placeholder="Search blogs..."
              className="grow bg-transparent outline-none"
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                if (!value.trim()) setSearchResults(null);
              }}
            />
            {(searchQuery || searching) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults(null);
                }}
                className="btn btn-ghost btn-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {searching && (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}

        {!searching && displayBlogs.length === 0 && (
          <div className="text-center py-12 text-base-content/60">
            <FaSearch className="text-5xl mx-auto mb-4 opacity-40" />
            <p className="text-lg">
              {searchResults !== null
                ? "No blogs match your search."
                : "No blog posts yet."}
            </p>
          </div>
        )}

        {!searching && displayBlogs.length > 0 && (
          <div className="space-y-4">
            {displayBlogs.map((blog) => (
              <Link
                key={blog._id}
                to={`/blogs/${blog._id}`}
                className="block"
              >
                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                  {blog.thumbnail && (
                    <figure>
                      <img
                        src={blog.thumbnail}
                        alt={blog.title}
                        className="w-full h-48 object-cover"
                      />
                    </figure>
                  )}
                  <div className="card-body">
                    <h2 className="card-title text-xl hover:text-primary transition-colors">
                      {blog.title}
                    </h2>
                    <p className="text-base-content/70 line-clamp-2">
                      {blog.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-base-content/60">
                      {blog.author && (
                        <span className="flex items-center gap-1">
                          <FaUser className="text-xs" />
                          {blog.author.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-xs" />
                        {formatDate(blog.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaEye className="text-xs" />
                        {blog.visitor || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
