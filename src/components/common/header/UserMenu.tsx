import React, { useEffect, useRef, useState } from 'react';
import { LogIn, LogOut, Sparkles, ShieldCheck, ChevronDown, UserCircle2 } from 'lucide-react';
import { UserProfile } from '../../../types/user';
import { CURRENT_RELEASE } from '../../updates/versionConfig';

interface UserMenuProps {
  user?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onSignOut?: () => Promise<unknown> | void;
  onOpenWhatsNew?: () => void;
}

/** Avatar con menú de cuenta (sesión iniciada) o botón "Iniciar sesión" (sin sesión). */
export default function UserMenu({ user, onOpenAuthModal, onSignOut, onOpenWhatsNew }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Cerrar con clic fuera o con Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <button type="button" className="tf-login-btn" onClick={onOpenAuthModal}>
        <LogIn size={16} />
        <span className="tf-hide-xs">Iniciar sesión</span>
      </button>
    );
  }

  const name = user.displayName || user.username || user.email?.split('@')[0] || 'Viajero';
  const initial = name.charAt(0).toUpperCase();
  const versionLabel = CURRENT_RELEASE.version.split('.').slice(0, 2).join('.');

  const run = (fn?: () => unknown) => () => {
    setOpen(false);
    fn?.();
  };

  return (
    <div className="tf-user-menu" ref={rootRef}>
      <button
        type="button"
        className={`tf-avatar-btn ${open ? 'open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Cuenta: ${name}`}
      >
        <span className="tf-avatar">
          {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initial}
        </span>
        <ChevronDown size={14} className="tf-avatar-chevron" />
      </button>

      {open && (
        <div className="tf-menu-panel animate-scale-up" role="menu">
          <div className="tf-menu-profile">
            <span className="tf-avatar lg">{user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initial}</span>
            <div className="tf-menu-profile-text">
              <strong>
                {name}
                {user.role === 'admin' && (
                  <span className="tf-role-pill"><ShieldCheck size={11} /> Admin</span>
                )}
              </strong>
              {user.email && <small>{user.email}</small>}
              {user.role === 'guest' && <small>Sesión de prueba · al cerrarla no podrás volver</small>}
            </div>
          </div>

          <div className="tf-menu-divider" />

          <button type="button" role="menuitem" className="tf-menu-item" onClick={run(onOpenAuthModal)}>
            <UserCircle2 size={17} />
            <span>Mi cuenta</span>
          </button>
          {onOpenWhatsNew && (
            <button type="button" role="menuitem" className="tf-menu-item" onClick={run(onOpenWhatsNew)}>
              <Sparkles size={17} />
              <span>Novedades</span>
              <span className="tf-menu-badge">v{versionLabel}</span>
            </button>
          )}

          <div className="tf-menu-divider" />

          <button type="button" role="menuitem" className="tf-menu-item danger" onClick={run(onSignOut)}>
            <LogOut size={17} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}
