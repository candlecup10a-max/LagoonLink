import React, { useState } from 'react';
import { Smartphone, X, Copy, Check, ExternalLink, Download } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from './usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
}) => {
  const { isInstallable, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  const appUrl =
    typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyUrl = () => {
    if (!appUrl || typeof navigator === 'undefined') return;
    navigator.clipboard?.writeText(appUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadMobileLauncher = () => {
    const launcherHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <title>LagoonLink Mobile App</title>
  <style>
    html, body, iframe { margin: 0; padding: 0; width: 100%; height: 100%; border: 0; background: #07131D; overflow: hidden; }
  </style>
</head>
<body>
  <iframe src="${appUrl}" allow="autoplay; fullscreen"></iframe>
</body>
</html>`;
    const blob = new Blob([launcherHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LagoonLink-Mobile-App.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {variant === 'banner' ? (
        <button
          type="button"
          onClick={async () => {
            if (isInstallable) {
              const accepted = await install();
              if (!accepted) setShowGuide(true);
            } else {
              setShowGuide(true);
            }
          }}
          className="w-full max-w-[304px] min-h-[38px] py-2 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-transform whitespace-nowrap"
        >
          <Smartphone className="w-4 h-4" />
          <span>Get App / Install on Phone</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={async () => {
            if (isInstallable) {
              const accepted = await install();
              if (!accepted) setShowGuide(true);
            } else {
              setShowGuide(true);
            }
          }}
          className="min-h-[32px] px-2.5 py-1 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-[10px] flex items-center gap-1 whitespace-nowrap shrink-0 shadow-sm transition-colors"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Get App</span>
        </button>
      )}

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3">
          <div className="w-full max-w-[336px] rounded-2xl bg-slate-900 border border-white/15 p-4 shadow-2xl text-left space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-white">
                Download & Install LagoonLink
              </h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close install guide"
                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {isInstallable && (
              <button
                type="button"
                onClick={install}
                className="w-full min-h-[38px] rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Install Directly to Home Screen</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadMobileLauncher}
              className="w-full min-h-[38px] rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Mobile App Launcher (.html)</span>
            </button>

            <div className="rounded-xl bg-slate-950/80 border border-white/10 p-2.5 space-y-2 text-[11px] text-slate-300 leading-relaxed">
              <div className="font-semibold text-sky-300">
                1. Install on Android or iPhone (PWA)
              </div>
              {isIOS ? (
                <p>
                  Open in <strong>Safari</strong>, tap <strong>Share</strong>,
                  then tap <strong>Add to Home Screen</strong>.
                </p>
              ) : (
                <p>
                  Tap <strong>Open Tab</strong> below to open outside the preview
                  frame, then tap your browser menu (<strong>⋮</strong>) →{' '}
                  <strong>Install app / Add to Home screen</strong>.
                </p>
              )}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="flex-1 min-h-[32px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-white flex items-center justify-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-sky-400" />
                      <span>Copy Mobile Link</span>
                    </>
                  )}
                </button>
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[32px] px-2.5 py-1 rounded-lg bg-sky-500/20 border border-sky-400/40 text-[10px] font-medium text-sky-300 flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Tab</span>
                </a>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/80 border border-white/10 p-2.5 space-y-1 text-[11px] text-slate-300 leading-relaxed">
              <div className="font-semibold text-amber-300">
                2. Build Native Android .APK
              </div>
              <p className="text-[10px] text-slate-400">
                • Paste your Shared App URL into <strong>PWABuilder.com</strong>{' '}
                → <strong>Package for Stores → Android</strong> to download an{' '}
                <code className="text-emerald-300">.apk</code> file directly.
                <br />• Or export the project ZIP and run{' '}
                <code className="text-sky-300">
                  npx @capacitor/cli add android
                </code>
                .
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full min-h-[36px] rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-500 px-3.5 py-1 text-[11px] font-semibold text-slate-950 shadow-lg whitespace-nowrap">
      <span className="h-2 w-2 rounded-full bg-slate-950 animate-pulse" />
      <span>Offline Mode — Cached dataset sprites active</span>
    </div>
  );
};
