import { AIProvider, AIInsight, Insights } from '../types';

export async function generateAIInsights(
  insights: Insights,
  provider: AIProvider
): Promise<AIInsight> {
  const prompt = buildPrompt(insights);

  if (provider.name === 'claude') {
    return generateClaudeInsights(prompt, provider);
  } else if (provider.name === 'gemini') {
    return generateGeminiInsights(prompt, provider);
  }

  throw new Error('Unsupported AI provider');
}

function buildPrompt(insights: Insights): string {
  const categoryBreakdown = insights.categoryBreakdown
    .map(c => `- ${c.category}: $${c.amount.toFixed(2)} (${c.percentage.toFixed(1)}%)`)
    .join('\n');

  const topMerchants = insights.topMerchants
    .map(m => `- ${m.merchant}: $${m.amount.toFixed(2)} (${m.count} transactions)`)
    .join('\n');

  return `Analyze this personal finance data and provide actionable insights:

Financial Summary:
- Total Income: $${insights.totalIncome.toFixed(2)}
- Total Expenses: $${insights.totalExpenses.toFixed(2)}
- Net Savings: $${insights.netSavings.toFixed(2)}
- Savings Rate: ${insights.savingsRate.toFixed(1)}%
- Daily Average Spending: $${insights.dailyAverage.toFixed(2)}
- Burn Rate: ${insights.burnRate.toFixed(0)} days

Category Breakdown:
${categoryBreakdown}

Top Merchants:
${topMerchants}

Please provide:
1. A brief summary (2-3 sentences) of the overall financial health
2. 3-5 specific recommendations for improving finances
3. Any warnings or concerns about spending patterns
4. Opportunities for optimization or savings

Format your response as JSON with this structure:
{
  "summary": "...",
  "recommendations": ["...", "..."],
  "warnings": ["...", "..."],
  "opportunities": ["...", "..."]
}`;
}

async function generateClaudeInsights(
  prompt: string,
  provider: AIProvider
): Promise<AIInsight> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: provider.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback if JSON parsing fails
    return {
      summary: content,
      recommendations: [],
      warnings: [],
      opportunities: [],
    };
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to generate insights from Claude');
  }
}

async function generateGeminiInsights(
  prompt: string,
  provider: AIProvider
): Promise<AIInsight> {
  try {
    const model = provider.model || 'gemini-pro';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${provider.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback if JSON parsing fails
    return {
      summary: content,
      recommendations: [],
      warnings: [],
      opportunities: [],
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate insights from Gemini');
  }
}

export function validateAPIKey(provider: AIProvider): boolean {
  if (!provider.apiKey || provider.apiKey.trim() === '') {
    return false;
  }

  if (provider.name === 'claude') {
    return provider.apiKey.startsWith('sk-ant-');
  } else if (provider.name === 'gemini') {
    return provider.apiKey.length > 20; // Basic validation
  }

  return false;
}
