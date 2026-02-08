'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Clock,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

interface UsageData {
  date: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  sessions: number;
}

// Pricing for Claude Opus 4.5 (per 1M tokens)
const PRICING = {
  input: 5,
  output: 25,
};

// Calculate cost from tokens
function calculateCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens * PRICING.input + outputTokens * PRICING.output) / 1_000_000;
}

// Mock data generator (in production, this would come from Gateway/Supabase)
function generateMockData(): UsageData[] {
  const data: UsageData[] = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Simulate varying usage
    const baseInput = 50000 + Math.random() * 100000;
    const baseOutput = 20000 + Math.random() * 50000;
    const inputTokens = Math.floor(baseInput);
    const outputTokens = Math.floor(baseOutput);
    
    data.push({
      date: date.toISOString().split('T')[0],
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      cost: calculateCost(inputTokens, outputTokens),
      sessions: Math.floor(5 + Math.random() * 20),
    });
  }
  
  return data;
}

export default function CostsPage() {
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [budget] = useState(100); // $100/month budget
  
  useEffect(() => {
    setUsageData(generateMockData());
  }, []);

  const totalCost = usageData.reduce((sum, d) => sum + d.cost, 0);
  const totalTokens = usageData.reduce((sum, d) => sum + d.totalTokens, 0);
  const totalSessions = usageData.reduce((sum, d) => sum + d.sessions, 0);
  const avgCostPerDay = totalCost / (usageData.length || 1);
  const projectedMonthly = avgCostPerDay * 30;
  const budgetUsed = (projectedMonthly / budget) * 100;

  const today = usageData[usageData.length - 1];
  const yesterday = usageData[usageData.length - 2];
  const costChange = today && yesterday ? ((today.cost - yesterday.cost) / yesterday.cost) * 100 : 0;

  const maxCost = Math.max(...usageData.map(d => d.cost), 1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2 text-text-primary">
          <DollarSign className="w-5 h-5 text-accent-green" />
          API Costs
        </h1>
        <p className="text-sm text-text-tertiary mt-1">
          Track API usage and costs for NEVA operations
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">7-Day Spend</span>
              <DollarSign className="w-4 h-4 text-accent-green" />
            </div>
            <p className="text-2xl font-bold text-text-primary">${totalCost.toFixed(2)}</p>
            <div className="flex items-center gap-1 mt-1">
              {costChange >= 0 ? (
                <TrendingUp className="w-3 h-3 text-accent-red" />
              ) : (
                <TrendingDown className="w-3 h-3 text-accent-green" />
              )}
              <span className={`text-xs ${costChange >= 0 ? 'text-accent-red' : 'text-accent-green'}`}>
                {Math.abs(costChange).toFixed(1)}% vs yesterday
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Projected Monthly</span>
              <BarChart3 className="w-4 h-4 text-accent-purple" />
            </div>
            <p className="text-2xl font-bold text-text-primary">${projectedMonthly.toFixed(2)}</p>
            <div className="flex items-center gap-1 mt-1">
              {budgetUsed > 100 ? (
                <AlertTriangle className="w-3 h-3 text-accent-red" />
              ) : (
                <Zap className="w-3 h-3 text-accent-yellow" />
              )}
              <span className={`text-xs ${budgetUsed > 100 ? 'text-accent-red' : 'text-text-tertiary'}`}>
                {budgetUsed.toFixed(0)}% of ${budget} budget
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Total Tokens</span>
              <Zap className="w-4 h-4 text-accent-yellow" />
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {(totalTokens / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-text-tertiary mt-1">
              {(totalTokens / usageData.length / 1000).toFixed(1)}K avg/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Sessions</span>
              <Clock className="w-4 h-4 text-accent-blue" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{totalSessions}</p>
            <p className="text-xs text-text-tertiary mt-1">
              ${(totalCost / totalSessions).toFixed(3)} avg/session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-primary">Monthly Budget</h3>
            <Badge variant={budgetUsed > 100 ? 'red' : budgetUsed > 80 ? 'yellow' : 'green'}>
              ${projectedMonthly.toFixed(2)} / ${budget}
            </Badge>
          </div>
          <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                budgetUsed > 100 ? 'bg-accent-red' : 
                budgetUsed > 80 ? 'bg-accent-yellow' : 'bg-accent-green'
              }`}
              style={{ width: `${Math.min(budgetUsed, 100)}%` }}
            />
          </div>
          <p className="text-xs text-text-tertiary mt-2">
            Based on 7-day average of ${avgCostPerDay.toFixed(2)}/day
          </p>
        </CardContent>
      </Card>

      {/* Daily Breakdown */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Daily Usage (Last 7 Days)</h3>
          <div className="space-y-3">
            {usageData.map((day, idx) => {
              const isToday = idx === usageData.length - 1;
              return (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-20 text-xs text-text-tertiary">
                    {isToday ? 'Today' : new Date(day.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1">
                    <div className="h-6 bg-bg-tertiary rounded overflow-hidden flex">
                      <div 
                        className="h-full bg-accent-blue/60"
                        style={{ width: `${(day.inputTokens / (day.inputTokens + day.outputTokens)) * (day.cost / maxCost) * 100}%` }}
                        title={`Input: ${(day.inputTokens / 1000).toFixed(1)}K tokens`}
                      />
                      <div 
                        className="h-full bg-accent-purple/60"
                        style={{ width: `${(day.outputTokens / (day.inputTokens + day.outputTokens)) * (day.cost / maxCost) * 100}%` }}
                        title={`Output: ${(day.outputTokens / 1000).toFixed(1)}K tokens`}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm font-medium text-text-primary">${day.cost.toFixed(2)}</span>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-xs text-text-tertiary">{day.sessions} sessions</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-accent-blue/60" />
              <span className="text-xs text-text-tertiary">Input tokens (${PRICING.input}/1M)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-accent-purple/60" />
              <span className="text-xs text-text-tertiary">Output tokens (${PRICING.output}/1M)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Info */}
      <Card className="bg-bg-secondary/50">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Current Model Pricing</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-text-tertiary">Model</p>
              <p className="font-medium text-text-primary">Claude Opus 4.5</p>
            </div>
            <div>
              <p className="text-text-tertiary">Input</p>
              <p className="font-medium text-text-primary">${PRICING.input} / 1M tokens</p>
            </div>
            <div>
              <p className="text-text-tertiary">Output</p>
              <p className="font-medium text-text-primary">${PRICING.output} / 1M tokens</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
