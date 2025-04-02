import React, { createContext, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { checkAuth } from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/utils/types";

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  userIsLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

//context for accessing the user
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const loadUser = async () => {
    const user = await AsyncStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      //check that the token is not expired
      const isValidUser = await checkAuth(parsedUser.token);
      if (isValidUser) {
        setUser(parsedUser);
      } else {
        await AsyncStorage.removeItem("user");
      }
    }
    return null;
  };
  //check if there is a user in the local storage, and check if the user is valid, if so then set the user
  const { isLoading: userIsLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => loadUser(),
    enabled: !!AsyncStorage,
  });

  const value = {
    user,
    setUser,
    userIsLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
