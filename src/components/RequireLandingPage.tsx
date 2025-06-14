
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Wrapper to ensure the landing page is shown before accessing the rest of the app.
 * If "invoicecraft-has-visited" is not 'true', redirect to "/".
 */
const RequireLandingPage = ({ children }: { children: React.ReactNode }) => {
  const hasVisited = localStorage.getItem("invoicecraft-has-visited") === "true";
  if (!hasVisited) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default RequireLandingPage;
