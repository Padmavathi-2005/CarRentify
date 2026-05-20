import { Controller, Get, Header } from '@nestjs/common';
import { BackupService } from './backup.service';

@Controller()
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('backup')
  @Header('Content-Type', 'text/html')
  async handleBackup() {
    const result = await this.backupService.runBackup();

    if (result.success) {
      const detailsHtml = `
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Backup File</span>
            <span class="meta-value">${result.filePath}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Backup Directory</span>
            <span class="meta-value">db_backups/</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">File Size</span>
            <span class="meta-value">${result.fileSizeKb} KB</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Completed At</span>
            <span class="meta-value">${result.timestamp}</span>
          </div>
        </div>
        <div class="details-title">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
          Backed Up Collections
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Collection Name</th>
                <th>Documents Count</th>
              </tr>
            </thead>
            <tbody>
              ${result.collections
                .map(
                  (c) => `
                <tr>
                  <td><strong>${c.name}</strong></td>
                  <td><span class="badge-count">${c.count} docs</span></td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `;

      const actionButtonHtml = `
        <a href="/restore" class="btn btn-primary">
          <svg style="width: 18px; height: 18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19" /></svg>
          Restore Database from this Backup
        </a>
        <a href="/backup" class="btn btn-secondary">
          Run Backup Again
        </a>
      `;

      return this.renderPage(
        'Backup Successful',
        'success',
        'Database Backup Completed',
        'All Mongo collections have been successfully serialized and stored in the backup folder.',
        detailsHtml,
        actionButtonHtml
      );
    } else {
      const detailsHtml = `
        <div class="details-title" style="color: var(--error);">
          Backup Execution Failure
        </div>
        <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 12px;">The database backup process encountered an error:</p>
        <div class="error-box">${result.error}</div>
      `;

      const actionButtonHtml = `
        <a href="/backup" class="btn btn-primary">
          Retry Backup
        </a>
      `;

      return this.renderPage(
        'Backup Failed',
        'error',
        'Database Backup Failed',
        'An error occurred during the backup execution process.',
        detailsHtml,
        actionButtonHtml
      );
    }
  }

  @Get('restore')
  @Header('Content-Type', 'text/html')
  async handleRestore() {
    const result = await this.backupService.runRestore();

    if (result.success) {
      const detailsHtml = `
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Restored From</span>
            <span class="meta-value">${result.filePath}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Cleared Collections</span>
            <span class="meta-value">${result.clearedCollections.length} collections</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Restored Collections</span>
            <span class="meta-value">${result.restoredCollections.length} collections</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Completed At</span>
            <span class="meta-value">${result.timestamp}</span>
          </div>
        </div>
        <div class="details-title">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Restored Database Collections
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Collection Name</th>
                <th>Documents Count</th>
              </tr>
            </thead>
            <tbody>
              ${result.restoredCollections
                .map(
                  (c) => `
                <tr>
                  <td><strong>${c.name}</strong></td>
                  <td><span class="badge-count">${c.count} docs</span></td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `;

      const actionButtonHtml = `
        <a href="/backup" class="btn btn-primary">
          <svg style="width: 18px; height: 18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
          Run New Backup
        </a>
      `;

      return this.renderPage(
        'Restore Successful',
        'success',
        'Database Restore Completed',
        'The database has been dropped and successfully restored to the latest backup state.',
        detailsHtml,
        actionButtonHtml
      );
    } else {
      const detailsHtml = `
        <div class="details-title" style="color: var(--error);">
          Database Restore Failure
        </div>
        <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 12px;">The restoration process encountered an error:</p>
        <div class="error-box">${result.error}</div>
      `;

      const actionButtonHtml = `
        <a href="/restore" class="btn btn-primary">
          Retry Restore
        </a>
        <a href="/backup" class="btn btn-secondary">
          Go to Backup Page
        </a>
      `;

      return this.renderPage(
        'Restore Failed',
        'error',
        'Database Restore Failed',
        'An error occurred during the database restore process.',
        detailsHtml,
        actionButtonHtml
      );
    }
  }

  private renderPage(
    title: string,
    status: 'success' | 'error',
    heading: string,
    subheading: string,
    detailsHtml: string,
    actionButtonHtml: string
  ): string {
    const statusColor = status === 'success' ? '#10b981' : '#ef4444';
    const statusBg = status === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    const statusBorder = status === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
    const statusShadow = status === 'success' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';

    const iconSvg =
      status === 'success'
        ? `<svg xmlns="http://www.w3.org/2000/svg" class="status-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" class="status-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
           </svg>`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - CarRentify DB Admin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #0b0f19;
      --card-bg: rgba(17, 24, 39, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --primary: #e31c5f;
      --primary-glow: rgba(227, 28, 95, 0.18);
      --accent: #bd174f;
      --success: #10b981;
      --error: #ef4444;
      --status-color: ${statusColor};
      --status-bg: ${statusBg};
      --status-border: ${statusBorder};
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Outfit', sans-serif;
      background-color: var(--bg-dark);
      color: var(--text-primary);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow-x: hidden;
      position: relative;
    }

    /* Ambient background glows */
    body::before {
      content: '';
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
      top: -100px;
      left: -100px;
      z-index: 0;
      pointer-events: none;
    }

    body::after {
      content: '';
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(189, 23, 79, 0.08) 0%, transparent 70%);
      bottom: -150px;
      right: -150px;
      z-index: 0;
      pointer-events: none;
    }

    .container {
      width: 100%;
      max-width: 640px;
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 
                  0 0 50px rgba(227, 28, 95, 0.05);
      position: relative;
      z-index: 1;
      animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 32px;
    }

    .status-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: var(--status-bg);
      border: 1px solid var(--status-border);
      color: var(--status-color);
      margin-bottom: 20px;
      box-shadow: 0 10px 20px ${statusShadow};
    }

    .status-icon {
      width: 32px;
      height: 32px;
    }

    .app-title {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--primary);
      margin-bottom: 8px;
    }

    .heading {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 10px;
      background: linear-gradient(135deg, #fff 0%, #a1a1aa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subheading {
      font-size: 15px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .content-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 32px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding-bottom: 20px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .meta-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
    }

    .meta-value {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
      word-break: break-all;
    }

    .details-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .details-title svg {
      width: 16px;
      height: 16px;
      color: var(--primary);
    }

    .table-container {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
    }

    /* Custom Scrollbar */
    .table-container::-webkit-scrollbar {
      width: 6px;
    }
    .table-container::-webkit-scrollbar-track {
      background: transparent;
    }
    .table-container::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }
    .table-container::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }

    th {
      font-weight: 600;
      color: var(--text-secondary);
      background: rgba(255, 255, 255, 0.03);
      padding: 10px 14px;
      position: sticky;
      top: 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(8px);
    }

    td {
      padding: 10px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: var(--text-primary);
    }

    tr:last-child td {
      border-bottom: none;
    }

    .badge-count {
      display: inline-block;
      padding: 2px 8px;
      background: rgba(227, 28, 95, 0.1);
      border: 1px solid rgba(227, 28, 95, 0.15);
      color: var(--primary);
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 14px 28px;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      gap: 8px;
      border: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      color: white;
      box-shadow: 0 8px 20px rgba(227, 28, 95, 0.25);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(227, 28, 95, 0.35);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(227, 28, 95, 0.3);
      color: var(--text-primary);
    }

    .btn-secondary:hover {
      background: rgba(227, 28, 95, 0.08);
      border-color: var(--primary);
      transform: translateY(-2px);
    }

    .btn-danger {
      background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
      color: white;
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.2);
    }

    .btn-danger:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(239, 68, 68, 0.3);
    }

    .error-box {
      font-family: monospace;
      font-size: 12px;
      background: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.15);
      border-radius: 8px;
      padding: 12px;
      color: var(--error);
      word-break: break-all;
      white-space: pre-wrap;
      max-height: 150px;
      overflow-y: auto;
      text-align: left;
    }

    .footer {
      text-align: center;
      margin-top: 24px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .footer a {
      color: var(--primary);
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="status-badge">
        ${iconSvg}
      </div>
      <div class="app-title">CarRentify Database Operations</div>
      <h1 class="heading">${heading}</h1>
      <p class="subheading">${subheading}</p>
    </div>

    <div class="content-card">
      ${detailsHtml}
    </div>

    <div class="actions">
      ${actionButtonHtml}
    </div>

    <div class="footer">
      Powered by CarRentify Admin Engine &bull; <a href="/">Go to Home</a>
    </div>
  </div>
</body>
</html>
    `;
  }
}
