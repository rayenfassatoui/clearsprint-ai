'use server';

import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects, tickets } from '@/lib/db/schema';

const UpdateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export async function updateProject(projectId: number, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
  };

  const validatedFields = UpdateProjectSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    await db
      .update(projects)
      .set({
        name: validatedFields.data.name,
        description: validatedFields.data.description,
      })
      .where(eq(projects.id, projectId));

    revalidatePath('/dashboard/projects-list');
    return { success: true };
  } catch (error) {
    console.error('Update Project Error:', error);
    return { error: 'Failed to update project' };
  }
}

export async function deleteProject(projectId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    // First delete related tickets
    // Note: In a real app, we might want to use ON DELETE CASCADE in the DB
    // But let's be safe and delete manually if not set up
    await db.delete(tickets).where(eq(tickets.projectId, projectId));

    // Delete the project
    await db.delete(projects).where(eq(projects.id, projectId));

    revalidatePath('/dashboard/projects-list');
    return { success: true };
  } catch (error) {
    console.error('Delete Project Error:', error);
    return { error: 'Failed to delete project' };
  }
}
