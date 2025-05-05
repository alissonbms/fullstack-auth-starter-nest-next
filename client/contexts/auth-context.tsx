import { useSessionChecker } from "@/hooks/useSessionChecker";
import { api } from "@/lib/api";
import { handleError } from "@/lib/handleError";
import { createContext, useContext } from "react";

type AuthContextType = ReturnType<typeof useSessionChecker> & {
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    refetchSession,
    enableSessionCheck,
    disableSessionCheck,
  } = useSessionChecker();

  const logout = async () => {
    try {
      await api.post("auth/logout");
    } catch (error) {
      handleError(error);
    } finally {
      disableSessionCheck();
      await refetchSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        refetchSession,
        enableSessionCheck,
        disableSessionCheck,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  const contextErrorMessage =
    "We encountered an issue while checking your authentication status. Please try again or contact support if the problem persists. 📩";

  if (!context) {
    handleError({
      title: "Authentication Error! 🔒",
      message: contextErrorMessage,
      type: "error",
    });

    throw new Error(contextErrorMessage);
  }

  return context;
};
