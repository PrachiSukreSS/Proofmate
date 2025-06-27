/**
 * Integration Manager for External Services
 * Handles calendar, task management, and collaboration integrations
 */

/**
 * Export action items to Google Calendar
 */
export const exportToGoogleCalendar = async (actionItems, title) => {
  try {
    // This would integrate with Google Calendar API
    // For now, we'll create a calendar event URL
    const eventDetails = {
      text: title,
      details: actionItems.join("\n"),
      dates: formatDateForCalendar(new Date()),
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventDetails.text
    )}&details=${encodeURIComponent(eventDetails.details)}`;

    window.open(calendarUrl, "_blank");
    return { success: true, url: calendarUrl };
  } catch (error) {
    console.error("Google Calendar export error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Export to Todoist
 */
export const exportToTodoist = async (
  actionItems,
  title,
  priority = "medium"
) => {
  try {
    // Create Todoist quick add URL
    const taskText = `${title}: ${actionItems.join(", ")}`;
    const todoistUrl = `https://todoist.com/showTask?content=${encodeURIComponent(
      taskText
    )}`;

    window.open(todoistUrl, "_blank");
    return { success: true, url: todoistUrl };
  } catch (error) {
    console.error("Todoist export error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate shareable link for memory
 */
export const generateShareableLink = async (memory) => {
  try {
    // Create a shareable summary
    const shareData = {
      title: memory.title,
      summary: memory.summary,
      actionItems: memory.action_items || [],
      tags: memory.tags || [],
      createdAt: memory.created_at,
    };

    // In a real implementation, this would create a secure share link
    const shareUrl = `${window.location.origin}/shared/${memory.id}`;

    return {
      success: true,
      url: shareUrl,
      data: shareData,
    };
  } catch (error) {
    console.error("Share link generation error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Export memory as PDF
 */
export const exportAsPDF = async (memory) => {
  try {
    // Create formatted content for PDF
    const content = `
# ${memory.title}

**Created:** ${new Date(memory.created_at).toLocaleDateString()}
**Category:** ${memory.category || "General"}
**Priority:** ${memory.priority || "Medium"}

## Summary
${memory.summary}

## Action Items
${(memory.action_items || []).map((item) => `• ${item}`).join("\n")}

## Tags
${(memory.tags || []).join(", ")}

## Original Transcript
${memory.transcript}
    `;

    // Create downloadable text file (in real implementation, use PDF library)
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${memory.title.replace(/[^a-z0-9]/gi, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("PDF export error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send to Slack/Teams (webhook integration)
 */
export const sendToSlack = async (memory, webhookUrl) => {
  try {
    const slackMessage = {
      text: `New ProofMate Memory: ${memory.title}`,
      attachments: [
        {
          color: getPriorityColor(memory.priority),
          fields: [
            {
              title: "Summary",
              value: memory.summary,
              short: false,
            },
            {
              title: "Action Items",
              value: (memory.action_items || []).join("\n"),
              short: false,
            },
            {
              title: "Tags",
              value: (memory.tags || []).join(", "),
              short: true,
            },
            {
              title: "Priority",
              value: memory.priority || "Medium",
              short: true,
            },
          ],
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackMessage),
    });

    return { success: response.ok };
  } catch (error) {
    console.error("Slack integration error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Utility functions
 */
const formatDateForCalendar = (date) => {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

const getPriorityColor = (priority) => {
  const colors = {
    urgent: "#ff4444",
    high: "#ff8800",
    medium: "#ffaa00",
    low: "#00aa00",
  };
  return colors[priority] || colors.medium;
};

/**
 * Copy to clipboard utility
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    console.error("Clipboard error:", error);
    return { success: false, error: error.message };
  }
};
