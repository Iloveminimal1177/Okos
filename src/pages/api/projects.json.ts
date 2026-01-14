import type { APIRoute } from 'astro';
import fs from 'fs';
import { join } from 'path';

export const prerender = false;

const PROJECTS_DIR = join(process.cwd(), 'projects');

// Biztosítsd az projects könyvtár létét
if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, name, data } = body;

    if (action === 'save') {
      const filePath = join(PROJECTS_DIR, `${name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return new Response(JSON.stringify({ success: true, message: 'Projekt mentve' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'load') {
      const filePath = join(PROJECTS_DIR, `${name}.json`);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return new Response(JSON.stringify({ success: true, data: JSON.parse(content) }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ success: false, message: 'Projekt nem található' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'list') {
      const files = fs.existsSync(PROJECTS_DIR) 
        ? fs.readdirSync(PROJECTS_DIR).filter((f: string) => f.endsWith('.json')).map((f: string) => f.replace('.json', ''))
        : [];
      return new Response(JSON.stringify({ success: true, projects: files }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: false, message: 'Ismeretlen akció' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Szerver hiba', error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
