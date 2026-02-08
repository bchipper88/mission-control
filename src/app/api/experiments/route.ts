import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  status: 'planned' | 'running' | 'completed' | 'failed';
  startDate: string | null;
  endDate: string | null;
  metrics: {
    name: string;
    target: number;
    current: number;
    unit: string;
  }[];
  notes: string;
  outcome?: 'success' | 'failure' | 'inconclusive';
}

async function loadExperimentsFromWorkspace(): Promise<Experiment[]> {
  try {
    // Try to read from workspace experiments directory
    const experimentsDir = join(process.cwd(), '..', 'experiments');
    const files = await readdir(experimentsDir);
    const experiments: Experiment[] = [];

    for (const file of files) {
      if (file.endsWith('.md') || file.endsWith('.json')) {
        try {
          const filePath = join(experimentsDir, file);
          const content = await readFile(filePath, 'utf-8');
          
          if (file.endsWith('.json')) {
            // Parse JSON experiment files
            const data = JSON.parse(content);
            experiments.push({
              id: data.id || file.replace('.json', ''),
              name: data.name || file.replace('.json', ''),
              hypothesis: data.hypothesis || '',
              status: data.status || 'planned',
              startDate: data.startDate || null,
              endDate: data.endDate || null,
              metrics: data.metrics || [],
              notes: data.notes || '',
              outcome: data.outcome,
            });
          } else {
            // Parse markdown experiment files
            const nameMatch = content.match(/^#\s+(.+)$/m);
            const hypothesisMatch = content.match(/hypothesis:\s*(.+)$/mi) || 
                                   content.match(/>\s*(.+)$/m);
            const statusMatch = content.match(/status:\s*(\w+)/i);
            const outcomeMatch = content.match(/outcome:\s*(\w+)/i);
            
            experiments.push({
              id: file.replace('.md', ''),
              name: nameMatch?.[1]?.trim() || file.replace('.md', ''),
              hypothesis: hypothesisMatch?.[1]?.trim() || 'No hypothesis defined',
              status: (statusMatch?.[1]?.toLowerCase() as Experiment['status']) || 'planned',
              startDate: null,
              endDate: null,
              metrics: [],
              notes: content,
              outcome: outcomeMatch?.[1]?.toLowerCase() as Experiment['outcome'],
            });
          }
        } catch (e) {
          console.error(`Failed to parse experiment file ${file}:`, e);
        }
      }
    }

    return experiments;
  } catch {
    // Directory doesn't exist or can't be read
    return [];
  }
}

export async function GET() {
  try {
    const experiments = await loadExperimentsFromWorkspace();
    
    return NextResponse.json({
      experiments,
      count: experiments.length,
      stats: {
        planned: experiments.filter(e => e.status === 'planned').length,
        running: experiments.filter(e => e.status === 'running').length,
        completed: experiments.filter(e => e.status === 'completed').length,
        failed: experiments.filter(e => e.status === 'failed').length,
      },
    });
  } catch (error) {
    console.error('Experiments fetch error:', error);
    return NextResponse.json({
      experiments: [],
      count: 0,
      stats: { planned: 0, running: 0, completed: 0, failed: 0 },
    });
  }
}
