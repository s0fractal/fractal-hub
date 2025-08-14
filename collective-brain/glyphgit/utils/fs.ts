// utils/fs.ts
export async function writeFileStr(path: string, content: string) {
  const encoder = new TextEncoder();
  await Deno.writeFile(path, encoder.encode(content));
}