import { getSupabase } from '@/lib/supabase';
import type { AppRole, Profile, ProfileStatus } from '@/features/auth';
import { mapProfileRow, type ProfileRow } from '@/features/auth/types';
import { friendlyError } from './adminMenuApi';

const COLS =
  'id,email,full_name,avatar_url,status,role,requested_at,last_seen_at';

/** Todas las cuentas que han intentado entrar (o solo las de un `status`). */
export async function fetchProfiles(
  status?: ProfileStatus
): Promise<Profile[]> {
  let query = getSupabase()
    .from('profiles')
    .select(COLS)
    .order('requested_at', { ascending: true });
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw friendlyError(error);
  return (data as ProfileRow[]).map(mapProfileRow);
}

/** Aprueba una solicitud y le asigna rol. */
export async function approveProfile(
  id: string,
  role: AppRole
): Promise<void> {
  const { error } = await getSupabase()
    .from('profiles')
    .update({
      status: 'approved',
      role,
      decided_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw friendlyError(error);
}

/** Deniega el acceso (reversible: puede volver a la lista de solicitudes). */
export async function denyProfile(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('profiles')
    .update({
      status: 'denied',
      role: null,
      decided_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw friendlyError(error);
}

/** Cambia el rol de una cuenta ya aprobada. */
export async function setProfileRole(
  id: string,
  role: AppRole
): Promise<void> {
  const { error } = await getSupabase()
    .from('profiles')
    .update({ role })
    .eq('id', id);
  if (error) throw friendlyError(error);
}

/** Devuelve una cuenta denegada a "pendiente" (vuelve a Solicitudes). */
export async function reopenProfile(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('profiles')
    .update({ status: 'pending', role: null, decided_at: null })
    .eq('id', id);
  if (error) throw friendlyError(error);
}
