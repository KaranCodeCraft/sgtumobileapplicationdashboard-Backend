const Notification = require("../models/Notification"); 
const {z} = require("zod")

const allowedTags = ["exam", "general", "result"];

const notificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  tags: z.array(z.string().refine(tag => allowedTags.includes(tag),{
    message: "Invalid tag"
  })).min(1, "At least one tag is required"),
})

// Get all notifications
const getNotifications = async (req, res) => {
  try {
    // Fetch notifications sorted by creation date in descending order
    const notifications = await Notification.find().sort({ createdAt: -1 });

    // Return the response with the fetched notifications
    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error fetching notifications:", error);
    // Return an error response
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications. Please try again later.",
    });
  }
};

// Add a new notification
const addNotification = async (req, res) => {
  try {
    const { title, message, tags } = req.body;

    // Validate the required fields
    if (!title || !message || !tags || !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: "Title, message, and tags are required fields.",
      });
    }

    try {
      notificationSchema.parse(req.body);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }

    // Create a new notification instance
    const newNotification = new Notification({
      title,
      message,
      tags,
    });

    // Save the notification to the database
    await newNotification.save();

    // Return a success response with the newly created notification
    return res.status(201).json({
      success: true,
      message: "Notification added successfully.",
      notification: newNotification,
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error adding notification:", error);

    // Return an error response
    return res.status(500).json({
      success: false,
      message: "Failed to add notification. Please try again later.",
    });
  }
};

// Patch a notification
const patchNotification = async (req, res) => {
    try {
      const {id} = req.params;
      const {title, message, tags} = req.body;
      // Validate the required fields
      try {
        notificationSchema.parse(req.body);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.errors[0].message,
        });
      }
      const notification = await Notification.findByIdAndUpdate(id,{title, message, tags},{new: true});
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found.",
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Notification updated successfully.",
        notification,
      });


    } catch (error) {
      console.error("Error updating notification:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update notification. Please try again later.",
      });
    }
}

// delete a notification
const deleteNotification = async (req, res) => {
  try {
    const {id} = req.params;
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
      notification,
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification. Please try again later.",
    });
  }
}

// Export the controller functions
module.exports = {
  getNotifications,
  addNotification,
  patchNotification,
  deleteNotification,
};
