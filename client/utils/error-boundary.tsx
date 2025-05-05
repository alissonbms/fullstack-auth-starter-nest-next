import CenteredContainer from "@/components/centered-container";
import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <CenteredContainer>
            <div className="p-10">
              <p className="text-center text-2xl">
                An error from server occurred, please contact support if the
                issue persists. 📩
              </p>
            </div>
          </CenteredContainer>
        )
      );
    }

    return this.props.children;
  }
}
