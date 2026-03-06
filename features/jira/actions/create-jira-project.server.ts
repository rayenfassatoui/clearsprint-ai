'use server';

import { auth } from '@/lib/auth';
import { getValidJiraToken, createJiraProject as createJiraProjectApi, isValidJiraKey, getJiraAccount } from '@/lib/jira';
import { createProjectFromJira } from './jira.server';
import { headers } from 'next/headers';
import { z } from 'zod';

const createJiraProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  key: z.string().min(2, 'Key must be at least 2 characters').toUpperCase(),
  cloudId: z.string().min(1, 'Site is required'),
  template: z.enum(['scrum', 'kanban']),
});

export async function createJiraProject(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  const rawData = {
    name: formData.get('name'),
    key: formData.get('key'),
    cloudId: formData.get('cloudId'),
    template: formData.get('template'),
  };

  const validated = createJiraProjectSchema.safeParse(rawData);

  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  const { name, key, cloudId, template } = validated.data;

  if (!isValidJiraKey(key)) {
    return { success: false, error: 'Invalid project key format. Must be uppercase letters and numbers.' };
  }

  try {
    const accessToken = await getValidJiraToken(session.user.id);
    const jiraAccount = await getJiraAccount(session.user.id);

    if (!jiraAccount) {
        return { success: false, error: 'Jira account not found' };
    }

    // Map template to Jira template key
    const projectTemplateKey = template === 'scrum' 
      ? 'com.pyxis.greenhopper.jira:gh-scrum-template' 
      : 'com.pyxis.greenhopper.jira:gh-kanban-template';

    // Create project in Jira
    await createJiraProjectApi(accessToken, cloudId, {
      key,
      name,
      projectTypeKey: 'software',
      projectTemplateKey,
      leadAccountId: jiraAccount.accountId, // Use the connected user as lead
      assigneeType: 'PROJECT_LEAD',
    });

    // Auto-sync to our DB
    const syncResult = await createProjectFromJira(cloudId, key, name);

    if (syncResult.error) {
      return { success: true, warning: 'Project created in Jira but failed to sync locally: ' + syncResult.error };
    }

    return { success: true, projectId: syncResult.projectId };

  } catch (error) {
    console.error('Error creating Jira project:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create Jira project' };
  }
}
