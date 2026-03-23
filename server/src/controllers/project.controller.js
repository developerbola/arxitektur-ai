import { createClient } from '@supabase/supabase-js';

const getAuthenticatedClient = (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
};

export const getProjects = async (c) => {
  const userId = c.req.header('x-user-id');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const { data, error } = await getAuthenticatedClient(c)
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
};

export const createProject = async (c) => {
  const userId = c.req.header('x-user-id');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  
  const { data, error } = await getAuthenticatedClient(c)
    .from('projects')
    .insert([ { ...body, user_id: userId, created_at: new Date() } ])
    .select();

  if (error) return c.json({ error: error.message }, 400);
  return c.json(data[0], 201);
};

export const getProjectById = async (c) => {
  const id = c.req.param('id');
  const { data, error } = await getAuthenticatedClient(c)
    .from('projects')
    .select('*, canvas_elements(*)')
    .eq('id', id)
    .single();

  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
};
