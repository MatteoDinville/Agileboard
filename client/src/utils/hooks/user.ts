import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { userService } from "../../services/user";
import type { UpdateProfileData, ChangePasswordData, IUser } from "../../services/user";

export function useProfile()
{
	const { setUser } = useContext(AuthContext);
	const queryClient = useQueryClient();

	const profileQuery = useQuery({
		queryKey: ["profile"],
		queryFn: () => userService.getProfile(),
		enabled: !!setUser,
		staleTime: 5 * 60 * 1000,
	});

	const updateProfileMutation = useMutation({
		mutationFn: (data: UpdateProfileData) => userService.updateProfile(data),
		onSuccess: (response) =>
		{
			queryClient.setQueryData(["profile"], response.user);
			if (setUser)
			{
				setUser(response.user);
				localStorage.setItem("user", JSON.stringify(response.user));
			}
		},
	});

	const changePasswordMutation = useMutation({
		mutationFn: (data: ChangePasswordData) => userService.changePassword(data),
	});

	return {
		user: profileQuery.data,
		isLoading: profileQuery.isLoading,
		error: profileQuery.error,
		refetch: profileQuery.refetch,
		updateProfile: updateProfileMutation,
		changePassword: changePasswordMutation,
	};
}
export function useAllUsers()
{
	const { user } = useContext(AuthContext);

	return useQuery<IUser[], Error>({
		queryKey: ["users"],
		queryFn: () => userService.getAllUsers(),
		enabled: !!user,
		staleTime: 5 * 60 * 1000,
	});
}