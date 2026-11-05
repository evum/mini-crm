import { Login } from '@/components/login/login';
import { SessionLoading } from '@/components/login/sessionLoading';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { AuthorizedWorkspace } from '@/components/workspace/authorizedWorkspace';
import { ProfileError } from '@/components/workspace/profileError';

export default function App() {
	const { session, initializing, sessionError, signIn, signOut } = useAuth();
	const profile = useProfile(session?.user.id);

	if (initializing || (session && profile.isPending))
		return <SessionLoading />;
	if (!session) return <Login signIn={signIn} sessionError={sessionError} />;
	if (profile.error || !profile.data) {
		return (
			<ProfileError
				error={profile.error}
				retry={() => void profile.refetch()}
				busy={profile.isFetching}
				signOut={signOut}
			/>
		);
	}

	return (
		<AuthorizedWorkspace
			key={session.user.id}
			profile={profile.data}
			signOut={signOut}
		/>
	);
}
