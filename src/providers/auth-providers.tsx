import {
  baseUrl,
  useErrorToastHandler,
  type ResponseModel,
} from "@/hooks/use-api";
import axios from "axios";
import { createContext, useEffect, useState } from "react";

export type User = {
  uuid: number;
  email: string;
  roles: ("ADMIN" | "NEWS_EDITOR" | "ADS_EDITOR" | "DELETED")[];
  full_name: string;
};

type AuthContext = {
  status: "loading" | "unauthenticated" | "authenticated";
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContext>({
  status: "loading",
  user: null,
  login: async () => {},
  logout: () => {},
});

const authAxios = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<
    "loading" | "unauthenticated" | "authenticated"
  >("loading");

  const errorHandler = useErrorToastHandler();

  const login = async (email: string, password: string) => {
    await axios.post<ResponseModel>(
      baseUrl + "/users/login",
      {
        email,
        password,
      },
      {
        withCredentials: true,
      },
    );

    const response = await axios.get<ResponseModel<User>>(
      baseUrl + "/users/me",
      {
        withCredentials: true,
      },
    );

    setUser(response.data.response.data);
    setStatus("authenticated");
  };

  const logout = () => {
    setUser(null);
    setStatus("unauthenticated");

    axios
      .post(
        baseUrl + "/users/logout",
        {},
        {
          withCredentials: true,
        },
      )
      .catch((error) => errorHandler(error));
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAxios.get<ResponseModel<User>>("/users/me");
        setUser(response.data.response.data);
        setStatus("authenticated");
      } catch (error) {
        setStatus("unauthenticated");
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
