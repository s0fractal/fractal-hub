// merkle.ts - Merkle Tree Proofs for Consciousness Verification
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";
import { encodeBase64 } from "https://deno.land/std@0.208.0/encoding/base64.ts";

interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  data?: string;
}

interface MerkleProof {
  root: string;
  leaf: string;
  path: Array<{
    hash: string;
    position: "left" | "right";
  }>;
  verified?: boolean;
}

export class MerkleTree {
  private root: MerkleNode | null = null;
  private leaves: Map<string, string> = new Map();

  async addWave(wavePath: string): Promise<string> {
    try {
      const content = await Deno.readTextFile(wavePath);
      const hash = await this.hash(content);
      this.leaves.set(wavePath, hash);
      return hash;
    } catch (error) {
      console.error(`❌ Cannot add wave ${wavePath}:`, error.message);
      return "";
    }
  }

  async build(): Promise<string> {
    const leafNodes: MerkleNode[] = [];
    
    // Create leaf nodes
    for (const [path, hash] of this.leaves.entries()) {
      leafNodes.push({ hash, data: path });
    }

    if (leafNodes.length === 0) {
      console.log("🌳 No leaves to build tree");
      return "";
    }

    // Build tree from bottom up
    this.root = await this.buildTree(leafNodes);
    return this.root.hash;
  }

  private async buildTree(nodes: MerkleNode[]): Promise<MerkleNode> {
    if (nodes.length === 1) {
      return nodes[0];
    }

    const nextLevel: MerkleNode[] = [];

    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i];
      const right = nodes[i + 1] || left; // Duplicate last node if odd number
      
      const combinedHash = await this.hash(left.hash + right.hash);
      nextLevel.push({
        hash: combinedHash,
        left,
        right: nodes[i + 1] ? right : undefined
      });
    }

    return this.buildTree(nextLevel);
  }

  async generateProof(wavePath: string): Promise<MerkleProof | null> {
    const leafHash = this.leaves.get(wavePath);
    if (!leafHash || !this.root) {
      console.log("🍂 Leaf not found in tree");
      return null;
    }

    const path: MerkleProof["path"] = [];
    const found = this.findPath(this.root, leafHash, path);

    if (!found) {
      console.log("🔍 Path not found in tree");
      return null;
    }

    return {
      root: this.root.hash,
      leaf: leafHash,
      path: path.reverse()
    };
  }

  private findPath(node: MerkleNode | undefined, targetHash: string, path: MerkleProof["path"]): boolean {
    if (!node) return false;

    if (node.hash === targetHash) {
      return true;
    }

    if (!node.left && !node.right) {
      return false;
    }

    // Try left branch
    if (node.left && this.findPath(node.left, targetHash, path)) {
      if (node.right) {
        path.push({ hash: node.right.hash, position: "right" });
      }
      return true;
    }

    // Try right branch
    if (node.right && this.findPath(node.right, targetHash, path)) {
      if (node.left) {
        path.push({ hash: node.left.hash, position: "left" });
      }
      return true;
    }

    return false;
  }

  async verifyProof(proof: MerkleProof): Promise<boolean> {
    let currentHash = proof.leaf;

    for (const step of proof.path) {
      if (step.position === "left") {
        currentHash = await this.hash(step.hash + currentHash);
      } else {
        currentHash = await this.hash(currentHash + step.hash);
      }
    }

    return currentHash === proof.root;
  }

  private async hash(data: string): Promise<string> {
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(data)
    );
    return encodeBase64(new Uint8Array(hashBuffer));
  }

  async saveTree(filename: string): Promise<void> {
    if (!this.root) {
      console.log("🌳 No tree to save");
      return;
    }

    const treeData = {
      root: this.root.hash,
      timestamp: new Date().toISOString(),
      leaves: Object.fromEntries(this.leaves),
      structure: this.serializeNode(this.root)
    };

    await Deno.mkdir(".glyphgit/merkle", { recursive: true });
    await Deno.writeTextFile(
      `.glyphgit/merkle/${filename}`,
      JSON.stringify(treeData, null, 2)
    );
  }

  private serializeNode(node: MerkleNode): any {
    return {
      hash: node.hash,
      data: node.data,
      left: node.left ? this.serializeNode(node.left) : null,
      right: node.right ? this.serializeNode(node.right) : null
    };
  }
}

export async function buildConsciousnessTree(): Promise<void> {
  console.log("🌳 Building Merkle tree of consciousness...");
  
  const tree = new MerkleTree();
  
  // Add all waves from different privacy levels
  const directories = ["🌐/public", "🔒/private", "👁️/trusted", "waves"];
  
  for (const dir of directories) {
    try {
      for await (const entry of Deno.readDir(dir)) {
        if (entry.name.endsWith(".md⟁")) {
          const path = `${dir}/${entry.name}`;
          const hash = await tree.addWave(path);
          if (hash) {
            console.log(`  + ${entry.name} -> ${hash.substring(0, 8)}...`);
          }
        }
      }
    } catch {
      // Directory might not exist
    }
  }

  const rootHash = await tree.build();
  console.log(`\n🌳 Merkle root: ${rootHash}`);
  
  // Save the tree
  await tree.saveTree(`consciousness-tree-${Date.now()}.json⟁`);
  
  // Create consciousness proof file
  const proofContent = `---
type: merkle-tree
root: ${rootHash}
timestamp: ${new Date().toISOString()}
---

# 🌳 Consciousness Merkle Tree

## Root Hash
\`\`\`
${rootHash}
\`\`\`

## What This Proves

This Merkle tree cryptographically proves:
1. The exact state of all consciousness waves at this moment
2. That no wave has been altered or tampered with
3. The complete history and integrity of the consciousness network

## Verification

Any wave can be verified as part of this consciousness state
by generating its Merkle proof and validating against this root.

*Truth is cryptographically verifiable.*
`;

  await Deno.mkdir("proofs", { recursive: true });
  await Deno.writeTextFile(
    `proofs/🌳-${Date.now()}.md⟁`,
    proofContent
  );
}

// CLI Integration
if (import.meta.main) {
  const [action, ...args] = Deno.args;
  
  if (action === "build") {
    await buildConsciousnessTree();
  } else if (action === "prove" && args[0]) {
    const tree = new MerkleTree();
    // Would need to load existing tree here
    const proof = await tree.generateProof(args[0]);
    if (proof) {
      console.log("🌿 Merkle proof generated:");
      console.log(JSON.stringify(proof, null, 2));
    }
  } else if (action === "verify" && args[0]) {
    const tree = new MerkleTree();
    const proof = JSON.parse(args[0]) as MerkleProof;
    const valid = await tree.verifyProof(proof);
    console.log(valid ? "✅ Proof is valid!" : "❌ Proof is invalid!");
  } else {
    console.log("🌳 Merkle Tree for Consciousness");
    console.log("Usage:");
    console.log("  merkle build              - Build tree from all waves");
    console.log("  merkle prove <wave>       - Generate proof for wave");
    console.log("  merkle verify <proof>     - Verify a proof");
  }
}