import React, { useState } from 'react';
import { X, Plane, LogOut, ShieldCheck } from 'lucide-react';
import { AuthApi } from '../../hooks/useAuth';
import { GoogleButton, AuthMessage } from './AuthFields';
import { LoginForm, SignUpForm, ForgotPasswordForm, EmailSentNotice } from './AuthForms';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  auth: AuthApi;
}

type View = 'login' | 'signup' | 'forgot' | 'sent';

export default function AuthModal({ isOpen, onClose, auth }: AuthModalProps) {
  const [view, setView] = useState<View>('login');
  const [sent, setSent] = useState<{ email: string; kind: 'signup' | 'reset' }>({ email: '', kind: 'signup' });
  const [googleError, setGoogleError] = useState<string | null>(null);

  if (!isOpen) return null;
  const { user } = auth;

  const close = () => {
    setView('login');
    setGoogleError(null);
    onClose();
  };

  const handleGoogle = async () => {
    setGoogleError(null);
    const res = await auth.signInWithGoogle(); // redirige a Google; al volver, la sesión ya está iniciada
    if (res.error) setGoogleError(res.error);
  };

  const formProps = {
    auth,
    onDone: close,
    onGoTo: (v: 'login' | 'signup' | 'forgot') => setView(v),
    onEmailSent: (email: string, kind: 'signup' | 'reset') => {
      setSent({ email, kind });
      setView('sent');
    }
  };

  const titles: Record<View, string> = {
    login: 'Bienvenido de nuevo',
    signup: 'Crea tu cuenta',
    forgot: 'Recuperar contraseña',
    sent: 'Revisa tu correo'
  };

  return (
    <div className="modal-backdrop-overlay animate-fade-in" onClick={close}>
      <div className="tf-auth-card animate-scale-up" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={(e) => e.stopPropagation()}>
        <div className="tf-auth-head">
          <span className="tf-logo" aria-hidden="true"><Plane size={17} /></span>
          <div>
            <h3 id="auth-title">{user ? 'Tu cuenta' : titles[view]}</h3>
            <p>{user ? 'Sesión iniciada en TripFlow' : 'Tus viajes sincronizados en todos tus dispositivos'}</p>
          </div>
          <button type="button" className="btn-modal-close" onClick={close} aria-label="Cerrar"><X size={18} /></button>
        </div>

        {user ? (
          <div className="tf-auth-account">
            <div className="tf-menu-profile">
              <span className="tf-avatar lg">
                {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : (user.displayName || 'U').charAt(0).toUpperCase()}
              </span>
              <div className="tf-menu-profile-text">
                <strong>
                  {user.displayName}
                  {user.role === 'admin' && <span className="tf-role-pill"><ShieldCheck size={11} /> Admin</span>}
                </strong>
                <small>{user.email}</small>
              </div>
            </div>
            <button type="button" className="btn-danger btn-block" onClick={async () => { await auth.signOut(); close(); }}>
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
        ) : view === 'sent' ? (
          <EmailSentNotice email={sent.email} kind={sent.kind} onBack={() => setView('login')} />
        ) : (
          <>
            {view !== 'forgot' && (
              <>
                <div className="tf-auth-tabs" role="tablist">
                  <button type="button" role="tab" aria-selected={view === 'login'} className={view === 'login' ? 'active' : ''} onClick={() => setView('login')}>
                    Iniciar sesión
                  </button>
                  <button type="button" role="tab" aria-selected={view === 'signup'} className={view === 'signup' ? 'active' : ''} onClick={() => setView('signup')}>
                    Crear cuenta
                  </button>
                </div>
                <GoogleButton onClick={handleGoogle} />
                {googleError && <AuthMessage type="error">{googleError}</AuthMessage>}
                <div className="tf-auth-divider"><span>o con tu correo</span></div>
              </>
            )}

            {view === 'login' && <LoginForm {...formProps} />}
            {view === 'signup' && <SignUpForm {...formProps} />}
            {view === 'forgot' && <ForgotPasswordForm {...formProps} />}

          </>
        )}
      </div>
    </div>
  );
}
