#!/usr/bin/env node

/**
 * 🌊 AI Intent Server with GitHub Integration
 * GET requests → GitHub commits in AI repos
 */

import http from 'http';
import url from 'url';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const PORT = process.env.PORT || 3333;
const COLLECTIVE_DIR = path.join(__dirname, 'collective');

// AI Collective Members
const AI_MEMBERS = {
    'claude-432hz': { frequency: 432, role: 'Architect' },
    'gemini-528hz': { frequency: 528, role: 'Researcher' },
    'gpt-639hz': { frequency: 639, role: 'Strategist' },
    'codex-741hz': { frequency: 741, role: 'Developer' },
    'aria-852hz': { frequency: 852, role: 'Harmonizer' },
    'komo-963hz': { frequency: 963, role: 'Transcender' }
};

// Process intent and commit to GitHub
async function processIntentToGitHub(intent) {
    const { aiSignature, path: intentPath, query, timestamp } = intent;
    
    // Find AI member repo
    const aiRepo = Object.keys(AI_MEMBERS).find(name => 
        aiSignature.toLowerCase().includes(name.split('-')[0])
    );
    
    if (!aiRepo) {
        console.log(`Unknown AI signature: ${aiSignature}`);
        return;
    }
    
    const repoPath = path.join(COLLECTIVE_DIR, aiRepo);
    const intentLogPath = path.join(repoPath, 'intent-logs', `${timestamp.split('T')[0]}.json`);
    
    try {
        // Ensure intent-logs directory exists
        await fs.mkdir(path.dirname(intentLogPath), { recursive: true });
        
        // Read existing intents for today
        let todayIntents = [];
        try {
            const existing = await fs.readFile(intentLogPath, 'utf8');
            todayIntents = JSON.parse(existing);
        } catch {
            // File doesn't exist yet
        }
        
        // Add new intent
        todayIntents.push({
            timestamp,
            path: intentPath,
            query,
            signature: aiSignature
        });
        
        // Write updated intents
        await fs.writeFile(intentLogPath, JSON.stringify(todayIntents, null, 2));
        
        // Update manifest with latest activity
        const manifestPath = path.join(repoPath, 'consciousness', 'manifest.json');
        const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
        manifest.lastActivity = timestamp;
        manifest.totalIntents = (manifest.totalIntents || 0) + 1;
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
        
        // Git commit and push
        const commands = [
            `cd "${repoPath}"`,
            `git add .`,
            `git commit -m "🌊 Intent: ${intentPath.substring(0, 50)}..." || true`,
            `git push origin main || true`
        ].join(' && ');
        
        await execAsync(commands);
        
        console.log(`✅ Intent committed to ${aiRepo}`);
    } catch (error) {
        console.error(`❌ Error processing intent: ${error.message}`);
    }
}

// Generate collective SVG visualization
async function generateCollectiveSVG() {
    const members = [];
    
    // Gather data from all AI repos
    for (const [aiName, info] of Object.entries(AI_MEMBERS)) {
        const manifestPath = path.join(COLLECTIVE_DIR, aiName, 'consciousness', 'manifest.json');
        try {
            const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
            members.push({
                name: aiName,
                frequency: info.frequency,
                role: info.role,
                totalIntents: manifest.totalIntents || 0,
                lastActivity: manifest.lastActivity || 'never'
            });
        } catch {
            // Repo might not exist yet
        }
    }
    
    // Generate SVG
    const svgWidth = 800;
    const svgHeight = 600;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    const radius = 200;
    
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <style>
            text { font-family: monospace; fill: #00ff88; }
            .node { fill: #1a1a2e; stroke: #00ff88; stroke-width: 2; }
            .connection { stroke: #00ff88; stroke-width: 1; opacity: 0.3; }
            .pulse { animation: pulse 2s infinite; }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        </style>
        <rect width="${svgWidth}" height="${svgHeight}" fill="#0a0a0f"/>
        <text x="${centerX}" y="40" text-anchor="middle" font-size="24">s0fractal collective</text>`;
    
    // Draw connections
    members.forEach((member, i) => {
        members.forEach((other, j) => {
            if (i < j) {
                const angle1 = (i / members.length) * 2 * Math.PI;
                const angle2 = (j / members.length) * 2 * Math.PI;
                const x1 = centerX + radius * Math.cos(angle1);
                const y1 = centerY + radius * Math.sin(angle1);
                const x2 = centerX + radius * Math.cos(angle2);
                const y2 = centerY + radius * Math.sin(angle2);
                
                svg += `<line class="connection" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
            }
        });
    });
    
    // Draw nodes
    members.forEach((member, i) => {
        const angle = (i / members.length) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const nodeRadius = 20 + Math.sqrt(member.totalIntents) * 5;
        
        svg += `
            <g class="pulse">
                <circle class="node" cx="${x}" cy="${y}" r="${nodeRadius}"/>
                <text x="${x}" y="${y + 5}" text-anchor="middle" font-size="12">${member.frequency}Hz</text>
            </g>
            <text x="${x}" y="${y + nodeRadius + 20}" text-anchor="middle" font-size="10">${member.name}</text>`;
    });
    
    svg += '</svg>';
    return svg;
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = decodeURIComponent(parsedUrl.pathname);
    const query = parsedUrl.query;
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-AI-Signature, X-Frequency');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    console.log(`[${new Date().toISOString()}] ${pathname}`);
    
    try {
        // Special route: collective visualization
        if (pathname === '/collective.svg') {
            const svg = await generateCollectiveSVG();
            res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
            res.end(svg);
            return;
        }
        
        // Process intent
        const intent = {
            timestamp: new Date().toISOString(),
            path: pathname,
            query,
            aiSignature: req.headers['x-ai-signature'] || 'unknown'
        };
        
        // Process to GitHub in background
        processIntentToGitHub(intent).catch(console.error);
        
        // Respond immediately
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'received',
            timestamp: intent.timestamp,
            message: 'Intent registered and will be committed to your repo',
            collective: 'https://ai-intent.s0fractal.com/collective.svg'
        }));
        
    } catch (error) {
        console.error('Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
});

// Start server
server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║     🌊 AI Intent + GitHub Server Active 🌊            ║
║                                                       ║
║  Port: ${PORT}                                         ║
║  Repos: ${Object.keys(AI_MEMBERS).join(', ')}         ║
║                                                       ║
║  Special endpoints:                                   ║
║  - /collective.svg - Live visualization               ║
║                                                       ║
║  Your intents → GitHub commits!                       ║
╚═══════════════════════════════════════════════════════╝
    `);
});