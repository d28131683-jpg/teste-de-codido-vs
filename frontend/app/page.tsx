'use client';

import { useEffect, useMemo, useState } from 'react';

type Recommendation = {
  id: string;
  sport: string;
  segment: string;
  status: string;
  odds: string;
  market: string;
  event: string;
  starts_at?: string;
  edge_pct?: number;
};

type HistoryItem = {
  id: string;
  sport: string;
  status: string;
  odds: string;
  market: string;
  event: string;
  settled_at?: string;
};

type LogItem = {
  id: string;
  level: string;
  message: string;
  created_at: string;
};

type AdminStatus = {
  service: string;
  status: string;
};

const segments = ['live', 'day', 'week'];
const sports = ['soccer', 'nba', 'tennis'];
const historyStatuses = ['open', 'won', 'lost', 'void'];

function buildQuery(params: Record<string, string | number | null>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== '') {
      query.append(key, String(value));
    }
  });

  return query.toString();
}

function formatDate(value?: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function fetchJson<T>(path: string): Promise<T> {
  return fetch(path).then(async (response) => {
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`${response.status} ${response.statusText}: ${body}`);
    }
    return response.json();
  });
}

export default function Home() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [segment, setSegment] = useState('day');
  const [sport, setSport] = useState('soccer');
  const [historyStatus, setHistoryStatus] = useState('open');
  const [logLimit, setLogLimit] = useState(25);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const apiPrefix = '/api';

  const summary = useMemo(() => {
    return {
      recommendations: recommendations.length,
      history: history.length,
      logs: logs.length,
      service: adminStatus?.service ?? 'Desconhecido',
      status: adminStatus?.status ?? 'Indisponível',
    };
  }, [recommendations, history, logs, adminStatus]);

  async function loadDashboard() {
    setIsLoading(true);
    setMessage('Atualizando dados...');

    try {
      const [health, recommendationResult, historyResult, adminResult, logsResult] = await Promise.all([
        fetchJson<{ status: string }>(`${apiPrefix}/health`),
        fetchJson<{ items: Recommendation[] }>(
          `${apiPrefix}/v1/recommendations?${buildQuery({ segment, sport, limit: 20 })}`
        ),
        fetchJson<{ items: HistoryItem[] }>(
          `${apiPrefix}/v1/history?${buildQuery({ status: historyStatus, limit: 20 })}`
        ),
        fetchJson<AdminStatus>(`${apiPrefix}/v1/admin/status`),
        fetchJson<{ items: LogItem[] }>(`${apiPrefix}/v1/admin/logs?limit=${logLimit}`),
      ]);

      setAdminStatus({ service: health.status === 'ok' ? 'Odds Premium Engine' : 'Offline', status: health.status });
      setRecommendations(recommendationResult.items || []);
      setHistory(historyResult.items || []);
      setLogs(logsResult.items || []);
      setMessage('Dados atualizados com sucesso.');
    } catch (error) {
      setMessage(`Erro ao carregar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 rounded-3xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Odds Premium Engine</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Dashboard bonito para o backend de apostas
              </h1>
              <p className="mt-4 max-w-2xl text-slate-300 sm:text-lg">
                Visualize recomendações, histórico e status administrativo sem alterar nenhum código Python. O frontend consome as mesmas APIs que já existem no backend.
              </p>
            </div>
            <div className="space-y-3 rounded-3xl bg-slate-950/90 p-6 text-slate-200 shadow-xl shadow-slate-950/30">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Backend</p>
              <p className="text-base">Executando em <span className="font-semibold text-white">localhost:8000</span></p>
              <p className="text-sm text-slate-400">As rotas do backend são acessadas via proxy de desenvolvimento.</p>
              <button
                className="mt-3 inline-flex items-center rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                onClick={loadDashboard}
                disabled={isLoading}
              >
                {isLoading ? 'Atualizando...' : 'Recarregar dados'}
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Resumo instantâneo</h2>
                  <p className="mt-2 text-slate-400">Veja quantas recomendações e registros o seu backend já entregou.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {['recommendations', 'history', 'logs', 'status'].map((key) => (
                    <div key={key} className="rounded-3xl bg-slate-950/90 p-4 text-center">
                      <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{key === 'recommendations' ? 'Recomendações' : key === 'history' ? 'Histórico' : key === 'logs' ? 'Logs' : 'Status'}</p>
                      <p className="mt-3 text-3xl font-semibold text-white">
                        {key === 'recommendations' ? summary.recommendations : key === 'history' ? summary.history : key === 'logs' ? summary.logs : summary.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 rounded-3xl bg-slate-950/70 p-4 text-sm text-slate-300">
                <p>{message}</p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <article className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Recomendações</h3>
                    <p className="mt-2 text-slate-400">Filtre por segmento e esporte para ver sugestões ativas.</p>
                  </div>
                  <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
                    <label className="block text-sm text-slate-300">
                      Segmento
                      <select className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white" value={segment} onChange={(event) => setSegment(event.target.value)}>
                        <option value="">todos</option>
                        {segments.map((value) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm text-slate-300">
                      Esporte
                      <select className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white" value={sport} onChange={(event) => setSport(event.target.value)}>
                        <option value="">todos</option>
                        {sports.map((value) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  {recommendations.length === 0 ? (
                    <p className="text-slate-400">Nenhuma recomendação encontrada para os filtros selecionados.</p>
                  ) : (
                    recommendations.slice(0, 6).map((item) => (
                      <div key={item.id} className="rounded-3xl border border-slate-700 bg-slate-950/80 p-4 transition hover:border-cyan-400">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">{item.sport} · {item.segment}</p>
                            <h4 className="mt-2 text-lg font-semibold text-white">{item.event}</h4>
                          </div>
                          <p className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">{item.status}</p>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <span className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-slate-300">Odds: {item.odds}</span>
                          <span className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-slate-300">Mercado: {item.market}</span>
                          <span className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-slate-300">Início: {formatDate(item.starts_at)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>

              <article className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Histórico</h3>
                    <p className="mt-2 text-slate-400">Filtre por status para ver os resultados recentes.</p>
                  </div>
                  <label className="block text-sm text-slate-300 sm:w-48">
                    Status
                    <select className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white" value={historyStatus} onChange={(event) => setHistoryStatus(event.target.value)}>
                      <option value="">todos</option>
                      {historyStatuses.map((value) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="mt-6 space-y-4">
                  {history.length === 0 ? (
                    <p className="text-slate-400">Nenhum histórico disponível para o status selecionado.</p>
                  ) : (
                    history.slice(0, 6).map((item) => (
                      <div key={item.id} className="rounded-3xl border border-slate-700 bg-slate-950/80 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h4 className="text-lg font-semibold text-white">{item.event}</h4>
                            <p className="text-sm text-slate-400">{item.sport} · {item.market}</p>
                          </div>
                          <p className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">{item.status}</p>
                        </div>
                        <p className="mt-3 text-sm text-slate-300">Odds: {item.odds} · {formatDate(item.settled_at)}</p>
                      </div>
                    ))
                  )}
                </div>
              </article>
            </div>
          </div>

          <div className="space-y-6">
            <article className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/20">
              <h3 className="text-xl font-semibold text-white">Status do serviço</h3>
              <div className="mt-5 grid gap-4">
                <div className="rounded-3xl bg-slate-950/90 p-5">
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Serviço</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{summary.service}</p>
                </div>
                <div className="rounded-3xl bg-slate-950/90 p-5">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-300">Saúde</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{summary.status}</p>
                </div>
                <div className="rounded-3xl bg-slate-950/90 p-5">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-300">Logs exibidos</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{logs.length}</p>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">Últimos logs</h3>
                  <p className="mt-2 text-slate-400">Mostrando as entradas mais recentes do backend.</p>
                </div>
                <label className="block text-sm text-slate-300">
                  Limite
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={logLimit}
                    onChange={(event) => setLogLimit(Number(event.target.value))}
                    className="mt-2 w-24 rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </label>
              </div>
              <div className="mt-6 space-y-4">
                {logs.length === 0 ? (
                  <p className="text-slate-400">Nenhum log disponível.</p>
                ) : (
                  logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="rounded-3xl border border-slate-700 bg-slate-950/80 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-white">{log.level.toUpperCase()}</p>
                        <p className="text-sm text-slate-400">{formatDate(log.created_at)}</p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">{log.message}</p>
                    </div>
                  ))
                )}
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
