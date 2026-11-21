import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, MapPin, Sparkles, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import heroWide from '../assets/figma/hero-traveler-wide.png';
import hero from '../assets/figma/hero-traveler.png';
import { Logo } from '../components/Logo';
import { useAuth } from '../lib/auth';

const PASSWORD_RULE = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

function Field({ label, icon, error, hint, children }: { label: string; icon: React.ReactNode; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className={`field ${error ? 'field--error' : ''}`}>
      <span className="field__label">{label}</span>
      <span className="field__control">{icon}{children}</span>
      {error ? <small className="field__error">{error}</small> : hint && <small className="field__hint">{hint}</small>}
    </label>
  );
}

function PasswordInput({ value, onChange, placeholder, autoComplete, name }: { value: string; onChange: (value: string) => void; placeholder: string; autoComplete: string; name: string }) {
  const [shown, setShown] = useState(false);
  return (
    <>
      <input name={name} type={shown ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} required />
      <button type="button" className="field__toggle" onClick={() => setShown((current) => !current)} aria-label={shown ? 'Hide password' : 'Show password'}>
        {shown ? <Eye size={19} /> : <EyeOff size={19} />}
      </button>
    </>
  );
}

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const register = mode === 'register';
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';
  const { login, register: signUp } = useAuth();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [remember, setRemember] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof values) => (value: string) => setValues((current) => ({ ...current, [key]: value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (register && values.name.trim().length < 2) next.name = 'Please enter your name (at least 2 characters).';
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = 'Enter a valid email address.';
    if (!values.password) next.password = 'Enter your password.';
    if (register) {
      if (values.password.length < 12 || !PASSWORD_RULE.test(values.password)) next.password = 'Use at least 12 characters, with uppercase, lowercase and a number.';
      if (values.confirm !== values.password) next.confirm = 'Passwords do not match.';
      if (!agreed) next.agreed = 'Please accept the terms to continue.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;
    setBusy(true);
    try {
      if (register) await signUp(values.name.trim(), values.email.trim(), values.password);
      else await login(values.email.trim(), values.password, remember);
      navigate(from, { replace: true });
    } catch (error) {
      setFormError((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <header className="home-nav">
        <Logo />
        <div className="home-nav__right">
          <span>{register ? 'Already collecting memories?' : 'New to MemoMap?'}</span>
          <Link className="btn btn--outline" to={register ? '/sign-in' : '/create-account'} state={location.state}>{register ? 'Sign In' : 'Create New Account'}</Link>
        </div>
        <Link to="/" className="auth__back" aria-label="Back to home"><ArrowLeft size={22} /></Link>
      </header>

      <main className="auth__body">
        <form className="auth__form" onSubmit={submit} noValidate>
          <p className="eyebrow"><Sparkles size={16} />Your personal travel companion</p>
          <h1>{register ? 'Create New Account' : 'Welcome back.'}</h1>
          <p className="auth__lede">{register ? <>Every journey starts with a moment.<br />Make a little place for yours.</> : <>Your places, your photos, your stories.<br />Sign in to pick up where you left off.</>}</p>

          {formError && <div className="alert" role="alert">{formError}</div>}

          {register && (
            <Field label="Full name" icon={<UserRound size={19} />} error={errors.name}>
              <input name="name" value={values.name} onChange={(event) => set('name')(event.target.value)} placeholder="Enter your full name" autoComplete="name" required />
            </Field>
          )}
          <Field label="Email address" icon={<Mail size={19} />} error={errors.email}>
            <input name="email" type="email" value={values.email} onChange={(event) => set('email')(event.target.value)} placeholder="you@example.com" autoComplete="email" required />
          </Field>
          <Field label="Password" icon={<Lock size={19} />} error={errors.password} hint={register ? 'Use at least 12 characters, with uppercase, lowercase and a number.' : undefined}>
            <PasswordInput name="password" value={values.password} onChange={set('password')} placeholder={register ? 'Create a password' : 'Enter your password'} autoComplete={register ? 'new-password' : 'current-password'} />
          </Field>
          {register && (
            <Field label="Confirm password" icon={<Lock size={19} />} error={errors.confirm}>
              <PasswordInput name="confirm" value={values.confirm} onChange={set('confirm')} placeholder="Re-enter your password" autoComplete="new-password" />
            </Field>
          )}

          {register ? (
            <label className={`check ${errors.agreed ? 'check--error' : ''}`}>
              <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
              <span>I agree to the <b>Terms of Service</b> and <b>Privacy Policy.</b></span>
            </label>
          ) : (
            <div className="auth__row">
              <label className="check">
                <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                <span>Remember me</span>
              </label>
              <button type="button" className="link" onClick={() => setNotice('Password reset is not available yet. Please contact support@memomap.app.')}>Forgot password?</button>
            </div>
          )}
          {errors.agreed && <small className="field__error">{errors.agreed}</small>}
          {notice && <p className="auth__notice">{notice}</p>}

          <button className="btn btn--primary btn--block btn--lg" disabled={busy}>
            {busy ? (register ? 'Creating account…' : 'Signing in…') : register ? 'Create New Account' : 'Sign In'}
            {!busy && <ArrowRight size={18} />}
          </button>
          <p className="auth__switch">
            {register ? 'Already have an account? ' : 'New to MemoMap? '}
            <Link to={register ? '/sign-in' : '/create-account'} state={location.state}>{register ? 'Sign In' : 'Create New Account'}</Link>
          </p>
        </form>

        <aside className="auth__art">
          <div className="hero__frame">
            <picture>
              <source media="(max-width: 760px)" srcSet={heroWide} />
              <img className="hero__img" src={hero} alt="" />
            </picture>
          </div>
          <div className="hero__card">
            <b>Some places stay with you.</b>
            <span>Give every moment a place to belong.</span>
            <small><MapPin size={15} />Made for your Sri Lankan adventures</small>
          </div>
        </aside>
      </main>

      <footer className="home-foot">
        <span>© 2026 MemoMap</span>
        <span>Collect moments. Explore your journey.</span>
      </footer>
    </div>
  );
}
