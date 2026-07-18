import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  FaCalendarAlt,
  FaUser,
  FaEye,
  FaArrowLeft,
  FaImage,
} from "react-icons/fa";
import axiosInstance from "../../lib/axiosInstance";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const BlogView = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axiosInstance.get(`blog/${id}`);
        if (res.data?.success) {
          setBlog(res.data.data);
        }
      } catch {
        setError("Blog not found");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-base-200 py-8 px-4">
        <div className="max-w-3xl mx-auto text-center py-12">
          <p className="text-lg text-base-content/60 mb-4">
            {error || "Blog not found"}
          </p>
          <Link to="/blogs" className="btn btn-primary">
            <FaArrowLeft /> Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-base-200 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/blogs"
          className="btn btn-ghost btn-sm gap-2 mb-6"
        >
          <FaArrowLeft /> Back to Blogs
        </Link>

        <article className="card bg-base-100 shadow-xl">
          {blog.thumbnail && (
            <figure>
              <img
                src={blog.thumbnail}
                alt={blog.title}
                className="w-full max-h-96 object-cover"
              />
            </figure>
          )}
          <div className="card-body">
            <h1 className="text-3xl font-bold">{blog.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/60 mt-2">
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
                {blog.visitor || 0} views
              </span>
            </div>

            <div className="divider"></div>

            <div className="prose prose-lg max-w-none whitespace-pre-wrap break-words">
              {blog.content}
            </div>

            {blog.images && blog.images.length > 0 && (
              <>
                <div className="divider"></div>
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <FaImage /> Gallery
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {blog.images.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Blog image ${i + 1}`}
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setLightboxImage(url)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </article>
      </div>

      {lightboxImage && (
        <dialog
          className="modal modal-open"
          onClick={() => setLightboxImage(null)}
        >
          <div className="modal-box max-w-4xl p-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt="Full size"
              className="w-full rounded-lg"
            />
            <div className="modal-action">
              <button
                className="btn btn-sm"
                onClick={() => setLightboxImage(null)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default BlogView;
