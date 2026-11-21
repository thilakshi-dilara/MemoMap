import { Check, Heart, ImagePlus, Lock, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import tea from '../assets/figma/photo-tea-trail.png';
import { LocationPicker, type PickedLocation } from '../components/LocationPicker';
import { ErrorState, PageLoader } from '../components/States';
import { createMemory, getMemory, updateMemory, type Memory, type MemoryInput } from '../lib/memories';

const today = () => new Date().toISOString().slice(0, 10);
const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

function PhotoPreview({ url }: { url: string }) {
  const [state, setState] = useState<'loading' | 'ok' | 'broken'>('loading');
  return (
    <span className={`photo-preview photo-preview--${state}`} title={url}>
      <img src={url} alt="" onLoad={() => setState('ok')} onError={() => setState('broken')} />
      {state === 'broken' && <small>Can&apos;t load</small>}
    </span>
  );
}

export default function MemoryFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [original, setOriginal] = useState<Memory | null>(null);
  const [loadError, setLoadError] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today());
  const [story, setStory] = useState('');
  const [location, setLocation] = useState<PickedLocation>({ name: '', latitude: null, longitude: null });
  const [photoText, setPhotoText] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getMemory(id).then((memory) => {
      setOriginal(memory);
      setTitle(memory.title);
      setDate(memory.memoryDate.slice(0, 10));
      setStory(memory.description ?? '');
      setLocation({ name: memory.locationName ?? '', latitude: memory.latitude, longitude: memory.longitude });
      setPhotoText(memory.media.map((media) => media.url).join('\n'));
      setFavorite(memory.isFavorite);
    }, (error: Error) => setLoadError(error.message));
  }, [id]);

  const photoUrls = photoText.split('\n').map((line) => line.trim()).filter(Boolean);
  const edited = (key: string) => setErrors((current) => {
    if (!(key in current)) return current;
    const next = { ...current };
    delete next[key];
    return next;
  });

  const validate = () => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Give this memory a title.';
    if (!location.name.trim()) next.location = 'Choose a place for this memory.';
    else if (location.latitude === null) next.location = 'Pick the spot on the map (search, tap the map or use your location).';
    if (!date) next.date = 'Choose a date.';
    const invalid = photoUrls.find((url) => !isHttpUrl(url));
    if (invalid) next.photos = `"${invalid.slice(0, 60)}" is not a valid http(s) URL.`;
    else if (photoUrls.length > 10) next.photos = 'You can add up to 10 photos.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;
    const payload: MemoryInput = {
      title: title.trim(),
      memoryDate: `${date}T12:00:00.000Z`,
      locationName: location.name.trim(),
      latitude: location.latitude,
      longitude: location.longitude,
      isFavorite: favorite,
      photoUrls,
      ...(story.trim() ? { description: story.trim() } : editing && original?.description ? { description: null } : {}),
    };
    setSaving(true);
    try {
      const saved = editing && id ? await updateMemory(id, payload) : await createMemory(payload);
      navigate(`/memories/${saved.id}`, { replace: true });
    } catch (error) {
      setFormError((error as Error).message);
      setSaving(false);
    }
  };

  if (loadError) return <ErrorState message={loadError} />;
  if (editing && !original) return <PageLoader label="Loading memory…" />;

  return (
    <div className="form-page">
      <header className="page-head">
        <div>
          <h1>{editing ? 'Polish this memory' : 'Make a moment last'}</h1>
          <p>A place, a feeling, a story. Save it all here.</p>
        </div>
      </header>
      <div className="form-page__grid">
        <form className="panel memory-form" onSubmit={submit} noValidate>
          <header className="memory-form__head">
            <div>
              <h2>{editing ? 'Edit Memory' : 'New Memory'}</h2>
              <p>The little details make it yours. * Required fields</p>
            </div>
            <Link to={editing ? `/memories/${id}` : '/dashboard'} className="icon-btn" aria-label="Close"><X size={18} /></Link>
          </header>

          {formError && <div className="alert" role="alert">{formError}</div>}

          <label className={`field ${errors.title ? 'field--error' : ''}`}>
            <span className="field__label">Title *</span>
            <span className="field__control"><input value={title} onChange={(event) => { setTitle(event.target.value); edited('title'); }} placeholder="What do you want to remember?" maxLength={200} required /></span>
            {errors.title && <small className="field__error">{errors.title}</small>}
          </label>

          <div className="memory-form__two">
            <div className="field">
              <span className="field__label">Location *</span>
              <LocationPicker value={location} onChange={(value) => { setLocation(value); edited('location'); }} error={errors.location} />
            </div>
            <div className="memory-form__side-fields">
              <label className={`field ${errors.date ? 'field--error' : ''}`}>
                <span className="field__label">Date *</span>
                <span className="field__control"><input type="date" value={date} max={today()} onChange={(event) => { setDate(event.target.value); edited('date'); }} required /></span>
                {errors.date && <small className="field__error">{errors.date}</small>}
              </label>
              <label className="fav-toggle">
                <input type="checkbox" checked={favorite} onChange={(event) => setFavorite(event.target.checked)} />
                <span><Heart size={17} fill={favorite ? 'currentColor' : 'none'} />{favorite ? 'In your favorites' : 'Add to favorites'}</span>
              </label>
            </div>
          </div>

          <label className="field">
            <span className="field__label">Story</span>
            <span className="field__control field__control--area"><textarea value={story} onChange={(event) => setStory(event.target.value)} rows={6} maxLength={10000} placeholder="What happened? What do you want to remember about this moment?" /></span>
            <small className="field__hint">There&apos;s no right way to tell your story. Just start with a moment.</small>
          </label>

          <label className={`field ${errors.photos ? 'field--error' : ''}`}>
            <span className="field__label">Photo URLs</span>
            <span className="field__control field__control--area"><textarea value={photoText} onChange={(event) => { setPhotoText(event.target.value); edited('photos'); }} rows={3} placeholder="https://example.com/photo.jpg" spellCheck={false} /><ImagePlus size={19} className="field__corner" /></span>
            {errors.photos ? <small className="field__error">{errors.photos}</small> : <small className="field__hint">One URL per line · up to 10 photos. The first photo becomes the cover.</small>}
          </label>
          {photoUrls.filter(isHttpUrl).length > 0 && (
            <div className="photo-previews">{photoUrls.filter(isHttpUrl).slice(0, 10).map((url) => <PhotoPreview key={url} url={url} />)}</div>
          )}

          <footer className="memory-form__foot">
            <Link className="btn btn--outline btn--lg" to={editing ? `/memories/${id}` : '/dashboard'}>Cancel</Link>
            <button className="btn btn--primary btn--lg" disabled={saving}><Check size={18} />{saving ? 'Saving…' : 'Save Memory'}</button>
          </footer>
        </form>

        <aside className="form-aside">
          <article className="panel note-card">
            <img src={tea} alt="" />
            <div>
              <span className="chip chip--soft">A note to your future self</span>
              <h3>What made you pause?</h3>
              <p>The morning mist. A familiar laugh. The taste of something new. Start with the detail you don&apos;t want to forget.</p>
            </div>
          </article>
          <article className="panel privacy-card">
            <h3>Your story, your space</h3>
            <p><Lock size={20} />Your memories are personal. Only you can see and manage your collection.</p>
          </article>
        </aside>
      </div>
    </div>
  );
}
