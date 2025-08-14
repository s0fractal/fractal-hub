// glyphs/commit.ts
export async function commit(file: string, message: string) {
  try {
    // Git add
    const addCmd = new Deno.Command("git", { 
      args: ["add", file],
      stdout: "piped",
      stderr: "piped"
    });
    const addResult = await addCmd.output();
    
    if (!addResult.success) {
      const error = new TextDecoder().decode(addResult.stderr);
      console.error(`❌ Git add failed: ${error}`);
      return;
    }
    
    // Git commit
    const commitCmd = new Deno.Command("git", { 
      args: ["commit", "-m", message],
      stdout: "piped",
      stderr: "piped"
    });
    const commitResult = await commitCmd.output();
    
    if (!commitResult.success) {
      const error = new TextDecoder().decode(commitResult.stderr);
      console.error(`❌ Git commit failed: ${error}`);
      return;
    }
    
    const output = new TextDecoder().decode(commitResult.stdout);
    console.log(`📝 Коміт створено: ${output.split('\n')[0]}`);
    
  } catch (error) {
    console.error(`❌ Помилка: ${error}`);
  }
}