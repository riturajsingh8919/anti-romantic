// Example of using custom toast functions in your project

import {
  showSuccess,
  showError,
  showLoading,
  showCustom,
  dismissToast,
} from "@/lib/toast";

// Example usage in a component:

export default function ExampleComponent() {
  const handleSuccess = () => {
    showSuccess("Operation completed successfully!");
  };

  const handleError = () => {
    showError("Something went wrong. Please try again.");
  };

  const handleLoading = () => {
    const toastId = showLoading("Processing your request...");

    // Simulate API call
    setTimeout(() => {
      dismissToast(toastId);
      showSuccess("Request processed successfully!");
    }, 3000);
  };

  const handleCustom = () => {
    showCustom("Custom message with your theme colors", {
      duration: 5000,
      icon: "⚡",
      style: {
        border: "2px solid #736C5F",
        fontWeight: "500",
      },
    });
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleSuccess}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Show Success
      </button>
      <button
        onClick={handleError}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Show Error
      </button>
      <button
        onClick={handleLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Show Loading
      </button>
      <button
        onClick={handleCustom}
        className="bg-purple-500 text-white px-4 py-2 rounded"
      >
        Show Custom
      </button>
    </div>
  );
}

// Available functions:
// - showSuccess(message)
// - showError(message)
// - showLoading(message)
// - showCustom(message, options)
// - dismissToast(toastId)
