import { useSearchParams, Navigate } from 'react-router-dom';

export default function RosterRedirect() {
  const [searchParams] = useSearchParams();
  const params = new URLSearchParams({ view: 'list' });
  const search = searchParams.get('search');
  const layout = searchParams.get('layout');
  const profile = searchParams.get('profile');

  if (search) params.set('search', search);
  if (layout) params.set('layout', layout);
  if (profile) params.set('profile', profile);

  return <Navigate to={`/roster/planning?${params.toString()}`} replace />;
}
