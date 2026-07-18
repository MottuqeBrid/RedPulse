import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import {
  FaImage,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";
import axiosInstance from "../../lib/axiosInstance";
import { toast } from "react-toastify";

const EditBlogTab = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [thumbnail, setThumbnail] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axiosInstance.get(`blog/my`);
        if (res.data?.success) {
          const found = res.data.data.find((b) => b._id === id);
          if (found) {
            setBlog(found);
            setImages(found.images || []);
            setThumbnail(found.thumbnail || "");
            reset({
              title: found.title,
              content: found.content,
              isPublished: found.isPublished,
            });
          } else {
            toast.error("Blog not found");
            navigate("/profile/blogs");
          }
        }
      } catch {
        toast.error("Failed to load blog");
        navigate("/profile/blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, navigate, reset]);

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

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axiosInstance.post("upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        setThumbnail(res.data.data.url);
      }
    } catch {
      toast.error("Failed to upload thumbnail");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await axiosInstance.patch(`blog/${id}`, {
        title: data.title,
        content: data.content,
        images,
        thumbnail,
        isPublished: data.isPublished || false,
      });
      if (res.data?.success) {
        toast.success("Blog updated successfully!");
        navigate("/profile/blogs");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update blog");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/profile/blogs")}
          className="btn btn-ghost btn-sm"
        >
          <FaArrowLeft />
        </button>
        <h3 className="font-semibold text-lg">Edit Blog</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Title *</span>
          </label>
          <input
            type="text"
            placeholder="Blog title"
            className={`input input-bordered w-full ${errors.title ? "input-error" : ""}`}
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <label className="label">
              <span className="label-text-alt text-error">
                {errors.title.message}
              </span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Content *</span>
          </label>
          <textarea
            placeholder="Write your blog content..."
            className={`textarea textarea-bordered h-64 w-full ${errors.content ? "input-error" : ""}`}
            {...register("content", { required: "Content is required" })}
          ></textarea>
          {errors.content && (
            <label className="label">
              <span className="label-text-alt text-error">
                {errors.content.message}
              </span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium flex items-center gap-2">
              <FaImage /> Thumbnail
            </span>
          </label>
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full"
            onChange={handleThumbnailUpload}
            disabled={uploading}
          />
          {uploading && (
            <div className="flex items-center gap-2 mt-2">
              <span className="loading loading-spinner loading-sm"></span>
              <span className="text-sm text-base-content/60">Uploading...</span>
            </div>
          )}
          {thumbnail && (
            <div className="relative inline-block mt-2">
              <img
                src={thumbnail}
                alt="Thumbnail"
                className="w-32 h-20 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setThumbnail("")}
                className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
              >
                <FaTimes className="w-2 h-2" />
              </button>
            </div>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium flex items-center gap-2">
              <FaImage /> Gallery Images
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
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((url, i) => (
                <div key={i} className="relative group">
                  <img
                    src={url}
                    alt={`Image ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTimes className="w-2 h-2" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              {...register("isPublished")}
            />
            <span className="label-text">Published</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={() => navigate("/profile/blogs")}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary gap-2"
            disabled={saving || uploading}
          >
            {saving && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBlogTab;
