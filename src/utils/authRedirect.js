export function redirectAfterLogin(navigate, profile, from, redirectAfterAuth) {
  if (!profile.country || !profile.city) {
    navigate('/complete-profile', { replace: true, state: { from } });
    return;
  }
  redirectAfterAuth();
}
