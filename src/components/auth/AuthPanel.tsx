import React, { useState } from 'react';
import { AuthApi } from '../../hooks/useAuth';
import { GoogleButton, AuthMessage } from './AuthFields';
import { LoginForm, SignUpForm, ForgotPasswordForm, EmailSentNotice } from './AuthForms';

type View = 'login' | 'signup' | 'forgot' | 'sent';

const TITLES: Record<View, { title: string; subtitle: string }> = {
  login: { title: 'Bienvenido de nuevo', subtitle: 'Inicia sesión para ver tus viajes.' },
  signup: { title: 'Crea tu cuenta', subtitle: 'Gratis. Tus viajes, en todos tus dispositivos.' },
  forgot: { title: 'Recuperar contraseña', subtitle: 'Te ayudamos a volver a entrar.' },
  sent: { title: 'Revisa tu correo', subtitle: 'Te enviamos un enlace.' }
};

/** Formularios de acceso: iniciar sesión, crear cuenta, Google y recuperar contraseña. */
export default function AuthPanel({ auth }: { auth: AuthApi }) {
  const [view, setView] = useState<View>('login');
  const [sent, setSent] = useState<{ email: string; kind: 'signup' | 'reset' }>({ email: '', kind: 'signup' });
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setGoogleError(null);
    const res = await auth.signInWithGoogle(); // redirige a Google; al volver, la sesión ya está iniciada
    if (res.error) setGoogleError(res.error);
  };

  const formProps = {
    auth,
    onDone: () => undefined, // al iniciar sesión, App.tsx muestra la app automáticamente
    onGoTo: (v: 'login' | 'signup' | 'forgot') => setView(v),
    onEmailSent: (email: string, kind: 'signup' | 'reset') => {
      setSent({ email, kind });
      setView('sent');
    }
  };

  return (
    <div className="tf-auth-panel">
      <div className="tf-auth-panel-head">
        <h1>{TITLES[view].title}</h1>
        <p>{TITLES[view].subtitle}</p>
      </div>

      {view === 'sent' ? (
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
  );
}
