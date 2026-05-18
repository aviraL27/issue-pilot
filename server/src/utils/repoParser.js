export function parseRepoUrl(input = '') {
  const value = input.trim().replace(/\/$/, '');

  const shorthand = value.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (shorthand) return { owner: shorthand[1], repo: shorthand[2] };

  try {
    const url = new URL(value);
    if (url.hostname !== 'github.com') throw new Error('Only github.com URLs are supported');
    const [owner, repo] = url.pathname.split('/').filter(Boolean);
    if (!owner || !repo) throw new Error('Missing owner or repo');
    return { owner, repo: repo.replace(/\.git$/, '') };
  } catch {
    throw Object.assign(new Error('Invalid GitHub repo URL'), { statusCode: 400 });
  }
}
