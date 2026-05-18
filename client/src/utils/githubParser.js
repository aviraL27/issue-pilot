export function parseRepoInput(input = '') {
  const value = input.trim().replace(/\/$/, '');
  if (/^[\w.-]+\/[\w.-]+$/.test(value)) return value;
  try {
    const url = new URL(value);
    const [owner, repo] = url.pathname.split('/').filter(Boolean);
    return owner && repo ? `${owner}/${repo.replace(/\.git$/, '')}` : value;
  } catch {
    return value;
  }
}
