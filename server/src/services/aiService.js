import axios from 'axios';
import IssueDetail from '../models/IssueDetail.js';

const DAY = 24 * 60 * 60 * 1000;

async function callGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) return null;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const { data } = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { contents: [{ parts: [{ text: prompt }] }] },
    { timeout: 12000 }
  );
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

async function callHuggingFaceClassification(text) {
  if (!process.env.HUGGINGFACE_API_KEY) return null;
  const { data } = await axios.post(
    'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
    {
      inputs: text,
      parameters: {
        candidate_labels: ['Bug', 'Feature', 'Documentation', 'Testing', 'Performance', 'Other']
      }
    },
    {
      headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
      timeout: 12000
    }
  );
  return data.labels?.[0] || null;
}

export async function classifyIssue(issue) {
  const cached = await IssueDetail.findOne({ owner: issue.owner, repo: issue.repo, issueNumber: issue.number });
  if (cached?.aiCategory && cached.lastChecked && Date.now() - cached.lastChecked.getTime() < DAY) {
    return cached.aiCategory;
  }

  const prompt = `Classify this GitHub issue into one category: Bug, Feature, Documentation, Testing, Performance, Other. Reply with only the category.\nTitle: ${issue.title}\nBody: ${issue.body || ''}`;
  try {
    const answer = (await callGemini(prompt)) || (await callHuggingFaceClassification(`${issue.title}\n${issue.body || ''}`));
    return ['Bug', 'Feature', 'Documentation', 'Testing', 'Performance', 'Other'].find(
      (category) => answer?.toLowerCase().includes(category.toLowerCase())
    ) || 'Other';
  } catch {
    return 'Other';
  }
}

export async function predictAssignment(comments) {
  if (!process.env.GEMINI_API_KEY || !comments.length) return 'UNCERTAIN';
  const text = comments
    .slice(-5)
    .map((comment) => `@${comment.user?.login || 'unknown'}: ${comment.body}`)
    .join('\n\n');
  try {
    const answer = await callGemini(
      `Based on these GitHub issue comments, is someone actively working on this issue? Reply with only: YES, NO, or UNCERTAIN.\n\n${text}`
    );
    const normalized = answer?.toUpperCase().match(/YES|NO|UNCERTAIN/)?.[0];
    return normalized || 'UNCERTAIN';
  } catch {
    return 'UNCERTAIN';
  }
}

export async function summarizeIssue(owner, repo, issueNumber, issue, comments) {
  const cached = await IssueDetail.findOne({ owner, repo, issueNumber });
  if (cached?.aiSummary && cached.lastChecked && Date.now() - cached.lastChecked.getTime() < DAY) {
    return cached.aiSummary;
  }

  if (!process.env.GEMINI_API_KEY) return 'AI summary unavailable. Add GEMINI_API_KEY to enable two-line summaries.';
  const prompt = `Summarize this GitHub issue in exactly two short lines for an open-source contributor.\nTitle: ${issue.title}\nBody: ${issue.body || ''}\nRecent comments: ${comments.slice(-5).map((c) => c.body).join('\n')}`;
  try {
    return (await callGemini(prompt)) || 'No summary available.';
  } catch {
    return 'AI summary unavailable right now.';
  }
}
