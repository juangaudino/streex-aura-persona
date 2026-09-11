import type { ReactNode } from "react";
import { ProfileDataContext } from "./profile-data-context";
import type { PrivateProfileData } from "./profile.server";

export function ProfileDataProvider({
  data,
  children,
}: {
  data: PrivateProfileData;
  children: ReactNode;
}) {
  return <ProfileDataContext.Provider value={data}>{children}</ProfileDataContext.Provider>;
}
