import { pullFromLinear } from './features/linear-sync/actions/pull-sync.server';
import { db } from './lib/db';
import { workspaceProjects } from './lib/db/schema';

async function testPull() {
  const projects = await db.select().from(workspaceProjects);
  if (projects.length === 0) {
    console.log('No workspace projects found in db!');
    return;
  }
  
  const proj = projects[0];
  console.log(`Pulling for user ${proj.userId}, project ${proj.id} (Linear ID: ${proj.linearProjectId})`);
  
  const result = await pullFromLinear(proj.id);
  console.log('Result:', result);
}

testPull().catch(console.error);
