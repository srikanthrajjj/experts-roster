import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ExpertProfileDeepLink() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate('/roster/planning?view=list', { replace: true });
      return;
    }
    navigate(`/roster/planning?view=list&profile=${id}`, { replace: true });
  }, [id, navigate]);

  return null;
}
