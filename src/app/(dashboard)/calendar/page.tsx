'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AgentAvatar } from '@/components/ui/AgentAvatar';
import {
  Clock,
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Play,
  Pause,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HOURS = Array.from({ length: 19 }, (_, i) => i + 5); // 5 AM .. 23 (11 PM)

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

/** Very small cron parser -- covers the seed expressions. */
function parseCron(expr: string): { description: string; hour: number | null; minute: number; dayOfWeek: number | null; isAlwaysRunning: boolean } {
  const parts = expr.split(' ');
  const [minute, hour, , , dayOfWeek] = parts;

  // "*/N * * * *" -- frequent interval
  if (minute.startsWith('*/')) {
    const interval = parseInt(minute.slice(2), 10);
    return { description: `Every ${interval} min`, hour: null, minute: 0, dayOfWeek: null, isAlwaysRunning: true };
  }

  const h = parseInt(hour, 10);
  const m = parseInt(minute, 10);
  const timeStr = `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;

  // Specific day of week
  if (dayOfWeek !== '*') {
    const dayNames = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
    const dow = parseInt(dayOfWeek, 10);
    return { description: `${dayNames[dow]} at ${timeStr}`, hour: h, minute: m, dayOfWeek: dow, isAlwaysRunning: false };
  }

  return { description: `Daily at ${timeStr}`, hour: h, minute: m, dayOfWeek: null, isAlwaysRunning: false };
}

/** Get the Monday of the week containing `date`. */
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun .. 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatWeekLabel(monday: Date): string {
  const sunday = addDays(monday, 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${monday.toLocaleDateString('en-US', opts)} - ${sunday.toLocaleDateString('en-US', opts)}, ${sunday.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CalendarPage() {
  const { scheduledTasks, agents } = useStore();

  const today = new Date();
  const [weekOffset, setWeekOffset] = useState(0);
  const [pausedIds, setPausedIds] = useState<Set<string>>(new Set());

  const monday = addDays(getMonday(today), weekOffset * 7);

  const getAgent = (agentId?: string | null) =>
    agentId ? agents.find((a) => a.id === agentId) : undefined;

  const togglePause = (id: string) => {
    setPausedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Separate always-running vs calendar tasks
  const parsed = scheduledTasks.map((st) => ({ ...st, parsed: parseCron(st.cron_expression) }));
  const alwaysRunning = parsed.filter((st) => st.parsed.isAlwaysRunning);
  const calendarTasks = parsed.filter((st) => !st.parsed.isAlwaysRunning);

  // Determine which calendar tasks fall on which day column
  // Daily tasks appear on every day; weekly tasks appear on their specific day
  const tasksForDay = (dayIndex: number) => {
    // dayIndex 0=Mon(1) .. 6=Sun(0)
    const jsDow = dayIndex === 6 ? 0 : dayIndex + 1; // convert to JS day-of-week
    return calendarTasks.filter((st) => {
      if (st.parsed.dayOfWeek === null) return true; // daily
      return st.parsed.dayOfWeek === jsDow;
    });
  };

  // Next 3 upcoming tasks for "Next Up" panel
  const getUpcoming = () => {
    const now = new Date();
    type Upcoming = { id: string; name: string; agentId?: string | null; color?: string; nextDate: Date; parsed: ReturnType<typeof parseCron> };
    const items: Upcoming[] = [];

    for (const st of parsed) {
      if (pausedIds.has(st.id)) continue;
      if (st.parsed.isAlwaysRunning) {
        // Next run in <interval> minutes from now
        const interval = parseInt(st.cron_expression.split(' ')[0].slice(2), 10);
        const next = new Date(now.getTime() + interval * 60 * 1000);
        items.push({ id: st.id, name: st.name, agentId: st.agent_id, color: st.color, nextDate: next, parsed: st.parsed });
      } else {
        // Find next occurrence
        const d = new Date();
        if (st.parsed.hour !== null) {
          d.setHours(st.parsed.hour, st.parsed.minute, 0, 0);
        }
        if (d <= now) d.setDate(d.getDate() + 1);
        if (st.parsed.dayOfWeek !== null) {
          while (d.getDay() !== st.parsed.dayOfWeek) d.setDate(d.getDate() + 1);
        }
        items.push({ id: st.id, name: st.name, agentId: st.agent_id, color: st.color, nextDate: d, parsed: st.parsed });
      }
    }

    items.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
    return items.slice(0, 3);
  };

  const upcoming = getUpcoming();

  const formatCountdown = (target: Date) => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return 'Now';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `in ${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    if (hrs < 24) return `in ${hrs}h ${remainMins}m`;
    const days = Math.floor(hrs / 24);
    return `in ${days}d ${hrs % 24}h`;
  };

  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-accent-blue" />
          <h1 className="text-xl font-semibold text-text-primary">Calendar</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Week navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset((p) => p - 1)}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
            >
              {formatWeekLabel(monday)}
            </button>
            <button
              onClick={() => setWeekOffset((p) => p + 1)}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Add Schedule */}
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-accent-blue rounded-lg hover:bg-accent-blue/80 transition-colors">
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>
        </div>
      </div>

      {/* ---- Body ---- */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ---- Main area (always-running + grid) ---- */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {/* Always Running */}
          {alwaysRunning.length > 0 && (
            <div className="px-6 pt-4 pb-2">
              <div className="flex items-center gap-2 mb-2">
                <Repeat className="w-4 h-4 text-accent-green" />
                <span className="text-xs font-semibold uppercase tracking-wider text-accent-green">
                  Always Running
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {alwaysRunning.map((st) => {
                  const agent = getAgent(st.agent_id);
                  return (
                    <div
                      key={st.id}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-accent-green/30 bg-accent-green/5"
                    >
                      {/* Pulsing green dot */}
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-green" />
                      </span>
                      <span className="text-sm font-medium text-text-primary">{st.name}</span>
                      <Badge variant="green" size="sm">{st.parsed.description}</Badge>
                      {agent && <AgentAvatar agent={agent} size="sm" showStatus={false} />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weekly Calendar Grid */}
          <div className="px-6 py-4">
            <div className="rounded-xl border border-border bg-bg-card overflow-hidden">
              {/* Day header row */}
              <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border">
                {/* Time gutter label */}
                <div className="px-2 py-2 text-[10px] font-medium text-text-tertiary uppercase tracking-wider text-center">
                  Time
                </div>
                {DAY_NAMES.map((name, i) => {
                  const dayDate = addDays(monday, i);
                  const isToday = isSameDay(dayDate, today);
                  return (
                    <div
                      key={name}
                      className={`px-2 py-2 text-center border-l border-border ${isToday ? 'bg-accent-blue/10' : ''}`}
                    >
                      <span className={`text-xs font-semibold ${isToday ? 'text-accent-blue' : 'text-text-secondary'}`}>
                        {name}
                      </span>
                      <span className={`block text-[10px] mt-0.5 ${isToday ? 'text-accent-blue' : 'text-text-tertiary'}`}>
                        {dayDate.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Time rows */}
              {HOURS.map((hour) => {
                return (
                  <div key={hour} className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border last:border-b-0">
                    {/* Time label */}
                    <div className="px-2 py-3 text-[10px] text-text-tertiary text-right pr-3 tabular-nums">
                      {formatHour(hour)}
                    </div>

                    {/* Day cells */}
                    {DAY_NAMES.map((_, dayIdx) => {
                      const dayDate = addDays(monday, dayIdx);
                      const isToday = isSameDay(dayDate, today);
                      const dayTasks = tasksForDay(dayIdx).filter((st) => st.parsed.hour === hour);

                      return (
                        <div
                          key={dayIdx}
                          className={`relative border-l border-border min-h-[48px] px-1 py-0.5 ${
                            isToday ? 'bg-accent-blue/5' : ''
                          }`}
                        >
                          {dayTasks.map((st) => {
                            const agent = getAgent(st.agent_id);
                            const isPaused = pausedIds.has(st.id);
                            return (
                              <div
                                key={st.id}
                                className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 mb-0.5 text-xs font-medium truncate ${
                                  isPaused ? 'opacity-40' : ''
                                }`}
                                style={{
                                  backgroundColor: `${st.color || '#3b82f6'}20`,
                                  borderLeft: `3px solid ${st.color || '#3b82f6'}`,
                                  color: st.color || '#3b82f6',
                                }}
                              >
                                {agent && (
                                  <span className="shrink-0">
                                    <AgentAvatar agent={agent} size="sm" showStatus={false} />
                                  </span>
                                )}
                                <span className="truncate text-text-primary">{st.name}</span>
                                <span className="ml-auto text-[10px] text-text-tertiary whitespace-nowrap">
                                  {formatHour(hour)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ---- Next Up Panel ---- */}
        <div className="w-72 shrink-0 border-l border-border bg-bg-primary overflow-y-auto">
          <div className="px-4 py-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-accent-yellow" />
              <h2 className="text-sm font-semibold text-text-primary">Next Up</h2>
            </div>

            <div className="space-y-3">
              {upcoming.map((item) => {
                const agent = getAgent(item.agentId);
                const isPaused = pausedIds.has(item.id);
                return (
                  <Card key={item.id} className="relative">
                    <CardContent className="space-y-2">
                      <div className="flex items-start gap-2">
                        {/* Color dot */}
                        <span
                          className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color || '#3b82f6' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                          {agent && (
                            <p className="text-xs text-text-tertiary mt-0.5">{agent.name}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-secondary">
                          {formatCountdown(item.nextDate)}
                        </span>
                        {/* Active / paused toggle */}
                        <button
                          onClick={() => togglePause(item.id)}
                          className={`p-1 rounded-md transition-colors ${
                            isPaused
                              ? 'text-accent-yellow hover:bg-accent-yellow/10'
                              : 'text-accent-green hover:bg-accent-green/10'
                          }`}
                          title={isPaused ? 'Resume' : 'Pause'}
                        >
                          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {upcoming.length === 0 && (
                <p className="text-xs text-text-tertiary text-center py-6">No upcoming tasks</p>
              )}
            </div>
          </div>

          {/* All scheduled tasks list */}
          <div className="px-4 pb-4">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">All Schedules</h3>
            <div className="space-y-2">
              {parsed.map((st) => {
                const agent = getAgent(st.agent_id);
                const isPaused = pausedIds.has(st.id);
                return (
                  <div
                    key={st.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bg-hover transition-colors ${
                      isPaused ? 'opacity-50' : ''
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: st.color || '#3b82f6' }}
                    />
                    <span className="flex-1 text-xs text-text-primary truncate">{st.name}</span>
                    <Badge variant="default" size="sm">{st.parsed.description}</Badge>
                    <button
                      onClick={() => togglePause(st.id)}
                      className={`p-0.5 rounded transition-colors ${
                        isPaused
                          ? 'text-accent-yellow hover:bg-accent-yellow/10'
                          : 'text-accent-green hover:bg-accent-green/10'
                      }`}
                      title={isPaused ? 'Resume' : 'Pause'}
                    >
                      {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
