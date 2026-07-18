import { useState, useEffect } from "react";
import { FaEnvelope, FaTrash, FaEye, FaEnvelopeOpen } from "react-icons/fa";
import axiosInstance from "../../lib/axiosInstance";
import { toast } from "react-toastify";

const formatDate = (dateString) => {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const MessagesTab = () => {
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [markingReadId, setMarkingReadId] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const res = await axiosInstance.get("message");
        console.log("Fetched messages:", res.data);
        if (res.data?.success) {
          setMessages(res.data.data);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setMessages([]);
        } else {
          toast.error(err.response?.data?.message || "Failed to load messages");
        }
      } finally {
        setMessagesLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (messageId) => {
    setMarkingReadId(messageId);
    try {
      const res = await axiosInstance.patch(`message/${messageId}/read`);
      if (res.data?.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, isRead: true } : msg,
          ),
        );
        toast.success("Message marked as read");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to mark message as read",
      );
    } finally {
      setMarkingReadId(null);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    setDeletingMessageId(messageId);
    try {
      const res = await axiosInstance.delete(`message/${messageId}`);
      if (res.data?.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        toast.success("Message deleted successfully");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete message");
    } finally {
      setDeletingMessageId(null);
    }
  };

  if (messagesLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-base-content/60">
        <FaEnvelope className="text-5xl mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No messages yet</p>
        <p className="text-sm mt-1">Messages from donors will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <div
          key={msg._id}
          className={`p-4 rounded-lg border transition-colors ${
            msg.isRead
              ? "bg-base-200/50 border-base-200"
              : "bg-primary/5 border-primary/20"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {!msg.isRead && (
                  <span className="badge badge-primary badge-xs">New</span>
                )}
                <span className="text-xs text-base-content/50">
                  {formatDate(msg.createdAt)}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap break-words">
                {msg.content}
              </p>
              {msg.sender && (
                <p className="text-xs text-base-content/40 mt-2">
                  From: {msg.sender.name || msg.sender}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!msg.isRead && (
                <button
                  onClick={() => handleMarkAsRead(msg._id)}
                  className="btn btn-ghost btn-xs"
                  disabled={markingReadId === msg._id}
                  title="Mark as read"
                >
                  {markingReadId === msg._id ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <FaEnvelopeOpen className="w-3 h-3" />
                  )}
                </button>
              )}
              {msg.isRead && (
                <span className="text-success" title="Read">
                  <FaEye className="w-3 h-3" />
                </span>
              )}
              <button
                onClick={() => handleDeleteMessage(msg._id)}
                className="btn btn-ghost btn-xs text-error"
                disabled={deletingMessageId === msg._id}
                title="Delete message"
              >
                {deletingMessageId === msg._id ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <FaTrash className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessagesTab;
