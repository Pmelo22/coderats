"use client";
import UserRepositories from "@/components/user-repositories";
import { FC } from "react";

const UserPublicRepositories: FC<{ username: string }> = ({ username }) => {
  return <UserRepositories username={username} />;
};

export default UserPublicRepositories;
