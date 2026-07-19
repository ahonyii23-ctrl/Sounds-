import React, { useState, useEffect } from 'react';
import { UserStats, WordProgress, SpellingWord, UserSettings } from '../types';
import { TINT_PRESETS } from '../data';
import { 
  googleSignIn, 
  initAuth, 
  logout, 
  sendProgressEmail, 
  fetchSpellingListsFromGmail,
  auth
} from '../utils/googleAuth';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, LogOut, Send, Download, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GmailDashboardProps {
  stats: UserStats;
  progressList: WordProgress[];
  settings: UserSettings;
  onWordsImported: (words: SpellingWord[]) => void;
}

export const GmailDashboard: React.FC<GmailDashboardProps> = ({
  stats,
  progressList,
  settings,
  onWordsImported
}) => {
  const activeTint = TINT_PRESETS[settings.tint];
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Email sending state
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Word importing state
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string; count?: number } | null>(null);

  useEffect(() => {
    // Listen for auth state on load
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setNeedsAuth(false);
        if (currentUser.email) {
          setRecipientEmail(currentUser.email); // Default to user's own email for convenience
        }
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        if (result.user.email) {
          setRecipientEmail(result.user.email);
        }
      }
    } catch (err) {
      console.error('Google Sign-In failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setNeedsAuth(true);
      setEmailStatus(null);
      setImportStatus(null);
    } catch (err) {
      console.error('Google Sign-Out failed:', err);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || isSending) return;

    // Explicit confirmation dialog for sending emails on behalf of the user
    const confirmed = window.confirm(
      `Send spelling progress report to ${recipientEmail} via your Gmail account?`
    );
    if (!confirmed) return;

    setIsSending(true);
    setEmailStatus(null);
    try {
      await sendProgressEmail(recipientEmail, stats, progressList);
      setEmailStatus({
        success: true,
        message: `Progress report sent successfully to ${recipientEmail}! Check your inbox! 🏆`
      });
    } catch (err: any) {
      setEmailStatus({
        success: false,
        message: 'Could not send email. Please check your network and Google Workspace permissions.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleImportWords = async () => {
    if (isImporting) return;
    setIsImporting(true);
    setImportStatus(null);

    try {
      const imported = await fetchSpellingListsFromGmail();
      if (imported.length > 0) {
        onWordsImported(imported);
        setImportStatus({
          success: true,
          count: imported.length,
          message: `Awesome! Imported ${imported.length} new spelling word(s) from your Gmail! 📩`
        });
      } else {
        setImportStatus({
          success: false,
          message: 'No spelling list emails found in your Gmail. (Make sure you received an email with subject "Sound Bridges Spelling List")'
        });
      }
    } catch (err: any) {
      setImportStatus({
        success: false,
        message: 'Could not import. Please check your internet connection or Gmail API status.'
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className={`p-6 rounded-3xl border-2 shadow-md transition-all duration-300 bg-white ${activeTint.textClass} border-gray-150`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 text-red-600 rounded-2xl">
            <Mail size={24} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold font-fredoka flex items-center gap-1.5">
              Parent & Teacher Gmail Hub
            </h3>
            <p className="text-xs text-gray-500 leading-snug">
              Connect Gmail to share spelling certificates and import custom worksheets!
            </p>
          </div>
        </div>

        {!needsAuth && user && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:border-red-200 hover:bg-red-50 text-xs font-bold text-gray-500 hover:text-red-700 rounded-xl transition-all cursor-pointer"
            id="gmail-hub-btn-signout"
          >
            <LogOut size={13} />
            Disconnect
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {needsAuth ? (
          <motion.div
            key="logged-out-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center py-6 space-y-4"
          >
            <div className="p-3 bg-red-50 text-red-500 rounded-full">
              <Mail size={32} />
            </div>
            <div className="max-w-md space-y-1.5">
              <p className="text-sm font-bold">Connect Your Google Account</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Sound Bridges spelling board integrates with Gmail to let you securely email progress updates, stars, and unlock custom word worksheets emailed by parents or teachers.
              </p>
            </div>

            {/* Styled Google Sign-In button */}
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={`flex items-center gap-3 px-5 py-3 border border-gray-300 rounded-2xl font-semibold shadow-sm text-sm bg-white hover:bg-gray-50 active:scale-98 transition-all cursor-pointer ${
                isLoggingIn ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              id="gmail-hub-btn-signin"
            >
              {isLoggingIn ? (
                <RefreshCw size={18} className="animate-spin text-gray-500" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              )}
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
            
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold justify-center pt-2">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>Secure Connection • Tokens Cached in Memory Only</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="logged-in-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 animate-fadeIn"
          >
            {/* User details summary */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-150">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full border border-gray-300" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center">
                  {user.displayName ? user.displayName[0] : 'U'}
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-gray-800">{user.displayName || 'Parent/Teacher'}</p>
                <p className="text-[11px] text-gray-500 font-medium">{user.email}</p>
              </div>
              <div className="ml-auto">
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                  Connected
                </span>
              </div>
            </div>

            {/* Split layout for actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Action 1: Send Spelling Certificate Email */}
              <div className="space-y-3 p-4 border border-gray-100 bg-gray-50/40 rounded-2xl">
                <h4 className="text-sm font-black font-fredoka text-gray-800 flex items-center gap-1.5">
                  <span className="text-base">🏆</span> Send Achievement Certificate
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Compose and send a beautiful spelling progress report summary directly to any email address via your Gmail!
                </p>

                <form onSubmit={handleSendEmail} className="space-y-2 pt-2">
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Recipient Email</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="parent-or-teacher@email.com"
                      className="flex-1 p-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-gray-700"
                      id="gmail-recipient-input"
                    />
                    <button
                      type="submit"
                      disabled={isSending || progressList.length === 0}
                      className={`px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        (isSending || progressList.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      id="gmail-send-certificate-btn"
                    >
                      {isSending ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                      <span>Send</span>
                    </button>
                  </div>
                  {progressList.length === 0 && (
                    <span className="text-[10px] text-amber-600 font-bold block">
                      ⚠️ Practice at least 1 word first to unlock reports.
                    </span>
                  )}
                </form>

                {/* Email Sending Result */}
                {emailStatus && (
                  <div className={`p-3 rounded-xl flex items-start gap-2 text-xs ${
                    emailStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {emailStatus.success ? <CheckCircle2 size={15} className="shrink-0 text-emerald-500 mt-0.5" /> : <AlertCircle size={15} className="shrink-0 text-red-500 mt-0.5" />}
                    <span>{emailStatus.message}</span>
                  </div>
                )}
              </div>

              {/* Action 2: Import Word worksheets from Gmail */}
              <div className="space-y-3 p-4 border border-gray-100 bg-gray-50/40 rounded-2xl">
                <h4 className="text-sm font-black font-fredoka text-gray-800 flex items-center gap-1.5">
                  <span className="text-base">📩</span> Import Gmail Word Lists
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Teachers or parents can email lists of custom spelling words to this mailbox and import them onto the board.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleImportWords}
                    disabled={isImporting}
                    className={`w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98 transition-all ${
                      isImporting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    id="gmail-import-words-btn"
                  >
                    {isImporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                    <span>Scan Gmail for Word Lists</span>
                  </button>
                </div>

                {/* Import Status Display */}
                {importStatus && (
                  <div className={`p-3 rounded-xl flex items-start gap-2 text-xs ${
                    importStatus.success ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {importStatus.success ? <CheckCircle2 size={15} className="shrink-0 text-indigo-500 mt-0.5" /> : <AlertCircle size={15} className="shrink-0 text-amber-500 mt-0.5" />}
                    <div className="leading-snug">
                      <span className="block font-bold">{importStatus.success ? 'Success!' : 'No Lists Found'}</span>
                      <span className="text-[11px] opacity-90">{importStatus.message}</span>
                    </div>
                  </div>
                )}

                {/* Quick Info Box */}
                <div className="p-2.5 bg-yellow-50/60 border border-yellow-100 rounded-xl text-[10px] text-yellow-800 leading-relaxed">
                  <p className="font-bold mb-0.5">💡 How to import custom words:</p>
                  <p>Send an email with subject <strong>"Sound Bridges Spelling List"</strong> containing your custom words as comma-separated text (e.g. <i>balloon, rocket, bubble</i>), then click Scan above!</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
