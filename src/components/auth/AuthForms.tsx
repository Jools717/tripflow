import React, { useState } from 'react';
import { Loader2, MailCheck } from 'lucide-react';
import { AuthApi } from '../../hooks/useAuth';
import { AuthField, PasswordField, AuthMessage, MIN_PASSWORD } from './AuthFields';

type Msg = { type: 'error' | 'success'; text: string } | null;
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

interface FormProps {
  auth: AuthApi;
  onDone: () => void;
  onGoTo: (view: 'login' | 'signup' | 'forgot') => void;
  onEmailSent: (email: string, kind: 'signup' | 'reset') => void;
}

export function LoginForm({ auth, onDone, onGoTo }: FormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email) || !password) return setMsg({ type: 'error', text: 'Escribe tu correo y tu contraseña.' });
    setBusy(true);
    setMsg(null);
    const res = await auth.signInWithEmail(email, password);
    setBusy(false);
    if (res.error) {
      setUnconfirmed(Boolean(res.unconfirmed));
      return setMsg({ type: 'error', text: res.error });
    }
    onDone();
  };

  const resend = async () => {
    const res = await auth.resendConfirmationEmail(email);
    setMsg(res.error ? { type: 'error', text: res.error } : { type: 'success', text: 'Te enviamos de nuevo el correo de confirmación.' });
    setUnconfirmed(false);
  };

  return (
    <form className="tf-auth-form" onSubmit={submit} noValidate>
      <AuthField id="login-email" label="Correo" type="email" autoComplete="email" inputMode="email"
        value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
      <PasswordField id="login-password" label="Contraseña" autoComplete="current-password"
        value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tu contraseña" />
      <button type="button" className="tf-auth-link align-end" onClick={() => onGoTo('forgot')}>¿Olvidaste tu contraseña?</button>
      {msg && <AuthMessage type={msg.type}>{msg.text}</AuthMessage>}
      {unconfirmed && <button type="button" className="tf-auth-link" onClick={resend}>Reenviar correo de confirmación</button>}
      <button type="submit" className="tf-auth-submit" disabled={busy}>
        {busy && <Loader2 size={16} className="directions-spin" />} Iniciar sesión
      </button>
    </form>
  );
}

export function SignUpForm({ auth, onDone, onEmailSent }: FormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setMsg({ type: 'error', text: 'Escribe tu nombre.' });
    if (!isEmail(email)) return setMsg({ type: 'error', text: 'Escribe un correo válido.' });
    if (password.length < MIN_PASSWORD) return setMsg({ type: 'error', text: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.` });
    if (password !== confirm) return setMsg({ type: 'error', text: 'Las contraseñas no coinciden.' });
    setBusy(true);
    setMsg(null);
    const res = await auth.signUpWithEmail(name, email, password);
    setBusy(false);
    if (res.error) return setMsg({ type: 'error', text: res.error });
    if (res.needsConfirmation) return onEmailSent(email, 'signup');
    onDone();
  };

  return (
    <form className="tf-auth-form" onSubmit={submit} noValidate>
      <AuthField id="signup-name" label="Nombre" autoComplete="name" value={name}
        onChange={(e) => setName(e.target.value)} placeholder="¿Cómo te llamas?" />
      <AuthField id="signup-email" label="Correo" type="email" autoComplete="email" inputMode="email"
        value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
      <PasswordField id="signup-password" label="Contraseña" autoComplete="new-password" value={password}
        onChange={(e) => setPassword(e.target.value)} hint={`Mínimo ${MIN_PASSWORD} caracteres.`} />
      <PasswordField id="signup-confirm" label="Repite la contraseña" autoComplete="new-password" value={confirm}
        onChange={(e) => setConfirm(e.target.value)} />
      {msg && <AuthMessage type={msg.type}>{msg.text}</AuthMessage>}
      <button type="submit" className="tf-auth-submit" disabled={busy}>
        {busy && <Loader2 size={16} className="directions-spin" />} Crear cuenta
      </button>
      <p className="tf-auth-legal">Te enviaremos un correo para confirmar que es tuyo.</p>
    </form>
  );
}

export function ForgotPasswordForm({ auth, onGoTo, onEmailSent }: FormProps) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) return setMsg({ type: 'error', text: 'Escribe el correo de tu cuenta.' });
    setBusy(true);
    const res = await auth.requestPasswordReset(email);
    setBusy(false);
    if (res.error) return setMsg({ type: 'error', text: res.error });
    onEmailSent(email, 'reset');
  };

  return (
    <form className="tf-auth-form" onSubmit={submit} noValidate>
      <p className="tf-auth-intro">Escribe tu correo y te enviaremos un enlace para crear una contraseña nueva.</p>
      <AuthField id="forgot-email" label="Correo" type="email" autoComplete="email" inputMode="email"
        value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
      {msg && <AuthMessage type={msg.type}>{msg.text}</AuthMessage>}
      <button type="submit" className="tf-auth-submit" disabled={busy}>
        {busy && <Loader2 size={16} className="directions-spin" />} Enviar enlace
      </button>
      <button type="button" className="tf-auth-link" onClick={() => onGoTo('login')}>Volver a iniciar sesión</button>
    </form>
  );
}

export function EmailSentNotice({ email, kind, onBack }: { email: string; kind: 'signup' | 'reset'; onBack: () => void }) {
  return (
    <div className="tf-auth-sent">
      <span className="tf-auth-sent-icon"><MailCheck size={28} /></span>
      <h4>Revisa tu correo</h4>
      <p>
        Enviamos un enlace a <strong>{email}</strong>{' '}
        {kind === 'signup' ? 'para confirmar tu cuenta. Ábrelo y volverás a TripFlow con la sesión iniciada.' : 'para crear una contraseña nueva.'}
      </p>
      <p className="tf-auth-hint">¿No llega? Mira en spam o promociones; puede tardar unos minutos.</p>
      <button type="button" className="tf-auth-link" onClick={onBack}>Volver a iniciar sesión</button>
    </div>
  );
}
