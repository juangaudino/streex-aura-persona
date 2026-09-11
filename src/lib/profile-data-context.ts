import { createContext, useContext } from "react";
import type { PrivateProfileData } from "./profile.server";

export const ProfileDataContext = createContext<PrivateProfileData | null>(null);

export function useProfileData(): PrivateProfileData {
  const data = useContext(ProfileDataContext);
  if (!data) throw new Error("useProfileData must be used inside ProfileDataProvider");
  return data;
}
