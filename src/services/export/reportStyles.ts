// Estilos del documento imprimible (ventana independiente para "Guardar como PDF").
// Viven aquí y no en index.css porque el informe se abre como un documento aparte
// que no carga la hoja de estilos de la app.
export const REPORT_CSS = `
  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 24px; background: #ffffff; color: #0f172a;
    font-family: 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif;
    font-size: 12.5px; line-height: 1.45;
  }
  .toolbar {
    position: sticky; top: 0; display: flex; gap: 8px; justify-content: flex-end;
    padding: 10px 0 16px; background: #ffffff;
  }
  .toolbar button {
    font: inherit; font-weight: 700; padding: 10px 16px; border-radius: 10px; cursor: pointer;
    border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a;
  }
  .toolbar button.primary { background: #0369a1; border-color: #0369a1; color: #ffffff; }
  .hero { border-bottom: 3px solid #0ea5e9; padding-bottom: 12px; margin-bottom: 18px; }
  .brand { font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #0284c7; }
  h1 { margin: 4px 0 2px; font-size: 26px; line-height: 1.15; }
  .sub { color: #475569; font-size: 13px; }
  h2 { font-size: 16px; margin: 22px 0 10px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .kpi { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; }
  .kpi .label { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #64748b; font-weight: 700; }
  .kpi .value { font-size: 16px; font-weight: 800; margin-top: 2px; }
  .kpi .hint { font-size: 11px; color: #64748b; }
  .kpi.ok .value { color: #047857; }
  .kpi.warn .value { color: #b91c1c; }
  .bar { height: 8px; border-radius: 99px; background: #e2e8f0; overflow: hidden; margin-top: 10px; }
  .bar span { display: block; height: 100%; background: #0ea5e9; }
  .day { break-inside: avoid; margin-bottom: 12px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
  .day-head {
    display: flex; justify-content: space-between; align-items: baseline; gap: 8px;
    padding: 8px 12px; background: #f1f5f9; font-weight: 800;
  }
  .day-head .count { font-size: 11px; color: #64748b; font-weight: 600; }
  .empty { padding: 8px 12px; color: #94a3b8; font-style: italic; }
  .act { display: grid; grid-template-columns: 56px 1fr auto; gap: 10px; padding: 8px 12px; border-top: 1px solid #f1f5f9; }
  .act:first-of-type { border-top: none; }
  .act .time { font-weight: 800; color: #0369a1; }
  .act .title { font-weight: 700; }
  .act .title .done { color: #047857; margin-right: 4px; }
  .act .meta { color: #64748b; font-size: 11.5px; }
  .act .meta a { color: #0369a1; text-decoration: none; }
  .act .tip { color: #92400e; font-size: 11.5px; margin-top: 2px; }
  .act .items { margin: 4px 0 0; padding-left: 16px; color: #334155; font-size: 11.5px; }
  .act .cost { font-weight: 700; white-space: nowrap; text-align: right; }
  .act.note { background: #fffbeb; }
  .pill { display: inline-block; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 99px; background: #e0f2fe; color: #075985; margin-left: 4px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  th { font-size: 10.5px; text-transform: uppercase; letter-spacing: .05em; color: #64748b; }
  td.num, th.num { text-align: right; white-space: nowrap; }
  tfoot td { font-weight: 800; border-top: 2px solid #cbd5e1; }
  .footer { margin-top: 24px; color: #94a3b8; font-size: 10.5px; text-align: center; }
  @media (max-width: 640px) {
    body { padding: 14px; }
    .kpis { grid-template-columns: repeat(2, 1fr); }
    .act { grid-template-columns: 44px 1fr; }
    .act .cost { grid-column: 2; text-align: left; }
  }
  @media print {
    body { padding: 0; }
    .toolbar { display: none; }
    a { color: inherit; }
  }
`;
