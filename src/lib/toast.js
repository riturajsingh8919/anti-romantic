import { toast, Toaster as HotToaster } from "react-hot-toast";

// Theme colors from your project
const themeColors = {
  primary: "#736C5F", // textclr - main brand color
  secondary: "#28251F", // dark brown
  text: "#312D26", // darker text
  lightText: "#656056", // lighter text
  border: "#D0C9BE", // border color
  background: "#F7F5EB", // light background
  muted: "#827C71", // muted text
  success: "#91B3C7", // blue for success
  cream: "#E4DFD3", // cream color
};

// Custom toast styles
const toastStyles = {
  success: {
    style: {
      background: themeColors.cream,
      color: themeColors.secondary,
      border: `1px solid ${themeColors.success}`,
      borderRadius: "8px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "400",
      fontFamily: "Arboria, sans-serif",
    },
    iconTheme: {
      primary: themeColors.success,
      secondary: themeColors.cream,
    },
  },
  error: {
    style: {
      background: themeColors.cream,
      color: themeColors.secondary,
      border: `1px solid ${themeColors.muted}`,
      borderRadius: "8px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "400",
      fontFamily: "Arboria, sans-serif",
    },
    iconTheme: {
      primary: themeColors.muted,
      secondary: themeColors.cream,
    },
  },
  loading: {
    style: {
      background: themeColors.background,
      color: themeColors.text,
      border: `1px solid ${themeColors.border}`,
      borderRadius: "8px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "400",
      fontFamily: "Arboria, sans-serif",
    },
    iconTheme: {
      primary: themeColors.primary,
      secondary: themeColors.background,
    },
  },
};

// Custom toast functions
export const showSuccess = (message) => {
  return toast.success(message, toastStyles.success);
};

export const showError = (message) => {
  return toast.error(message, toastStyles.error);
};

export const showLoading = (message) => {
  return toast.loading(message, toastStyles.loading);
};

export const showCustom = (message, options = {}) => {
  const defaultStyle = {
    background: themeColors.background,
    color: themeColors.text,
    border: `1px solid ${themeColors.border}`,
    borderRadius: "8px",
    padding: "16px",
    fontSize: "14px",
    fontWeight: "400",
    fontFamily: "Arboria, sans-serif",
    ...options.style,
  };

  return toast(message, {
    style: defaultStyle,
    ...options,
  });
};

// Toast dismiss function
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Custom Toaster component with theme configuration
export const CustomToaster = () => {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: themeColors.background,
          color: themeColors.text,
          border: `1px solid ${themeColors.border}`,
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "400",
          fontFamily: "Arboria, sans-serif",
        },
        success: toastStyles.success,
        error: toastStyles.error,
        loading: toastStyles.loading,
      }}
      containerStyle={{
        top: 20,
        right: 20,
      }}
    />
  );
};

export default toast;
