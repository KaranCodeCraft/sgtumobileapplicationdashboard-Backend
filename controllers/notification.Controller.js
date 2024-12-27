const Notification = require("../models/Notification"); // Import the model

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

module.exports = {
  getNotifications,
  addNotification,
};
