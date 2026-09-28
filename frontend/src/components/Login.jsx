import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, RefreshCw, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

function Captcha({ onValid }) {
  const make = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return { q: `${a} + ${b} = ?`, answer: a + b };
  };
  const [captcha, setCaptcha] = useState(make);
  const [value, setValue] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  if (verified) return null;

  const check = () => {
    if (Number(value) === captcha.answer) {
      setVerified(true);
      setError('');
      setValue('');
      onValid(true);
      return;
    }
    setVerified(false);
    setError('CAPTCHA is not correct. Please try again.');
    setValue('');
    setCaptcha(make());
    onValid(false);
  };

  const refresh = () => {
    setCaptcha(make());
    setValue('');
    setError('');
    setVerified(false);
    onValid(false);
  };

  return (
    <div className="captcha">
      <div className="captcha-row">
        <strong>{captcha.q}</strong>
        <button type="button" onClick={refresh} aria-label="New CAPTCHA"><RefreshCw size={15} /></button>
      </div>
      <input inputMode="numeric" value={value} onChange={(e) => { setValue(e.target.value); setError(''); }} placeholder="Enter answer" aria-label="CAPTCHA answer" />
      <button type="button" className="captcha-check" onClick={check}>I'M NOT A ROBOT</button>
      {error && <small className="captcha-error"><AlertCircle size={13} />{error}</small>}
    </div>
  );
}

export default function Login({ onLogin, user, mode = 'login' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [show, setShow] = useState(false);
  const [captcha, setCaptcha] = useState(false);
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [forgotStep, setForgotStep] = useState('email');
  const [accountExists, setAccountExists] = useState(false);

  useEffect(() => {
    setMsg('');
    setSuccess('');
    setCaptcha(false);
    setName('');
    setEmail('');
    setPassword('');
    setConfirm('');
    setCode('');
    setForgotStep('email');
    setAccountExists(false);
  }, [mode]);

  if (user) {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <span className="eyebrow">NOVIS ACCOUNT</span>
          <h1>Welcome, {user.name}</h1>
          <p>Your account is active. Order status, courier updates and query replies will appear in notifications.</p>
          <div className="account-actions">
            <Link className="lux-btn gold" to="/notifications">VIEW ORDER UPDATES</Link>
            <Link className="lux-btn" to="/">CONTINUE SHOPPING</Link>
          </div>
        </div>
      </section>
    );
  }

  const submit = async (event) => {
    event.preventDefault();
    setMsg('');
    setSuccess('');

    if (!captcha) {
      setMsg('Please complete the CAPTCHA check before continuing.');
      return;
    }

    try {
      setBusy(true);

      if (mode === 'forgot' && forgotStep === 'email') {
        const data = await api('/auth/forgot-password', {
          method: 'POST',
          body: { email: email.trim() },
        });

        if (!data.exists) {
          setAccountExists(false);
          setMsg('No NOVIS account was found with this email. Please create an account first.');
          return;
        }

        setAccountExists(true);
        setForgotStep('verify');
        setSuccess(data.devCode ? `Verification code: ${data.devCode}` : 'A new verification code has been sent to your email.');
        return;
      }

      if (mode === 'forgot') {
        if (!/^\d{6}$/.test(code)) {
          setMsg('Please enter the 6-digit verification code.');
          return;
        }
        if (password.length < 8) {
          setMsg('Password must be at least 8 characters.');
          return;
        }
        if (password !== confirm) {
          setMsg('Passwords do not match.');
          return;
        }

        const data = await api('/auth/reset-password', {
          method: 'POST',
          body: { email: email.trim(), code, password },
        });
        setSuccess(data.message || 'Password updated. You can now sign in.');
        setForgotStep('done');
        setPassword('');
        setConfirm('');
        setCode('');
        return;
      }

      if (mode === 'signup') {
        if (name.trim().length < 2) {
          setMsg('Please enter your full name.');
          return;
        }
        if (password.length < 8) {
          setMsg('Password must be at least 8 characters.');
          return;
        }
        if (password !== confirm) {
          setMsg('Passwords do not match.');
          return;
        }
        const data = await api('/auth/register', { method: 'POST', body: { name: name.trim(), email: email.trim(), password } });
        localStorage.setItem('novis-token', data.token);
        window.location.href = '/';
        return;
      }

      await onLogin(email.trim(), password);
    } catch (error) {
      setMsg(error?.message || 'Something went wrong. Please check the information and try again.');
    } finally {
      setBusy(false);
    }
  };

  const forgotDone = mode === 'forgot' && forgotStep === 'done';

  return (
    <section className="auth-page">
      <div className="auth-visual">
        <div><span>THE NOVIS STANDARD</span><h2>Time is personal.</h2></div>
      </div>
      <div className="auth-card">
        <span className="eyebrow">{mode === 'login' ? 'SIGN IN' : mode === 'signup' ? 'CREATE ACCOUNT' : 'RESET PASSWORD'}</span>
        <h1>{mode === 'forgot' ? (forgotDone ? 'Password updated' : forgotStep === 'verify' ? 'Enter your new code' : 'Forgot your password?') : mode === 'signup' ? 'Create your NOVIS account' : 'Welcome back'}</h1>
        <p>
          {mode === 'forgot'
            ? (forgotDone ? 'Your old password is no longer valid. Use your new password to sign in.' : forgotStep === 'verify' ? 'We found your account. Enter the new 6-digit code and choose a new password. Your old password is not required.' : 'Enter your registered email. If the account exists, you will receive a fresh verification code.')
            : mode === 'signup'
              ? 'Create an account to save your details and orders.'
              : 'Sign in to manage your orders and profile.'}
        </p>

        {!forgotDone && (
          <form onSubmit={submit} autoComplete="off">
            {mode === 'signup' && (
              <label>FULL NAME
                <input autoComplete="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
              </label>
            )}

            <label>EMAIL ADDRESS
              <div className="input-icon">
                <Mail size={16} />
                <input autoComplete="email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" readOnly={mode === 'forgot' && forgotStep === 'verify'} />
              </div>
            </label>

            {mode === 'forgot' && forgotStep === 'verify' && (
              <label>6-DIGIT VERIFICATION CODE
                <input inputMode="numeric" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" />
              </label>
            )}

            {mode !== 'forgot' && (
              <label>PASSWORD
                <div className="input-icon">
                  <Lock size={16} />
                  <input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={8} type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" />
                  <button type="button" onClick={() => setShow((value) => !value)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </label>
            )}

            {mode === 'forgot' && forgotStep === 'verify' && (
              <>
                <label>NEW PASSWORD
                  <div className="input-icon">
                    <Lock size={16} />
                    <input autoComplete="new-password" required minLength={8} type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" />
                    <button type="button" onClick={() => setShow((value) => !value)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </label>
                <label>CONFIRM NEW PASSWORD
                  <input autoComplete="new-password" required minLength={8} type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat new password" />
                </label>
              </>
            )}

            <Captcha onValid={setCaptcha} />
            <button className="lux-btn gold" type="submit" disabled={busy}>
              {busy ? 'PLEASE WAIT…' : mode === 'forgot' ? (forgotStep === 'verify' ? 'UPDATE PASSWORD' : 'CHECK EMAIL') : mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </button>
          </form>
        )}

        {success && <small className="form-msg success-msg"><CheckCircle2 size={14} />{success}</small>}
        {msg && <small className="form-msg error-msg"><AlertCircle size={14} />{msg}</small>}

        {mode === 'forgot' && forgotStep === 'verify' && accountExists && (
          <button className="resend-code" type="button" onClick={() => { setForgotStep('email'); setCaptcha(false); setSuccess(''); setMsg(''); }}>
            USE ANOTHER EMAIL / GET A NEW CODE
          </button>
        )}

        <div className="auth-links">
          {mode === 'login' && <><Link to="/forgot-password">Forgot password?</Link><Link to="/signup">Create account</Link></>}
          {mode === 'signup' && <Link to="/login">Already have an account? Sign in</Link>}
          {mode === 'forgot' && <><Link to="/login">Back to sign in</Link>{!accountExists && <Link to="/signup">Create account</Link>}</>}
        </div>
      </div>
    </section>
  );
}
