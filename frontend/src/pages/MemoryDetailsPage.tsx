import { ArrowLeft, ArrowRight, Bookmark, CalendarDays, ChevronLeft, ChevronRight, Heart, MapPin, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MemoryMap } from '../components/MemoryMap';
import { ErrorState, PageLoader } from '../components/States';
import { deleteMemory, formatDate, getMemory, hasCoords, updateMemory, type Memory } from '../lib/memories';

export default function MemoryDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [actionError, setActionError] = useState('');

  const asList = useMemo(() => (memory ? [memory] : []), [memory]);

  useEffect(() => {
    getMemory(id).then(setMemory, (reason: Error) => setError(reason.message));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!memory) return <PageLoader label="Opening memory…" />;

  const photos = memory.media.filter((media) => media.type === 'IMAGE');
  const photo = photos[index];

  const toggleFavorite = async () => {
    setBusy(true);
    setActionError('');
    try {
      setMemory(await updateMemory(memory.id, { isFavorite: !memory.isFavorite }));
    } catch (reason) {
      setActionError((reason as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setActionError('');
    try {
      await deleteMemory(memory.id);
      navigate('/gallery', { replace: true });
    } catch (reason) {
      setActionError((reason as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="details">
      <div className="details__top">
        <Link to="/gallery" className="back-link"><ArrowLeft size={18} />All memories</Link>
        <button className={`icon-btn heart ${memory.isFavorite ? 'is-on' : ''}`} onClick={toggleFavorite} disabled={busy} aria-pressed={memory.isFavorite} aria-label={memory.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
          <Heart size={22} fill={memory.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="details__hero">
        {photo ? (
          <img key={photo.id} src={photo.url} alt={memory.title} />
        ) : hasCoords(memory) ? (
          <MemoryMap memories={asList} className="details__hero-map" />
        ) : (
          <div className="details__hero-empty"><MapPin size={32} />No photos yet</div>
        )}
        {photos.length > 1 && (
          <div className="carousel-ctl">
            <button onClick={() => setIndex((index - 1 + photos.length) % photos.length)} aria-label="Previous photo"><ChevronLeft size={16} /></button>
            <span>{index + 1} / {photos.length}</span>
            <button onClick={() => setIndex((index + 1) % photos.length)} aria-label="Next photo"><ChevronRight size={16} /></button>
          </div>
        )}
      </div>

      <div className="details__grid">
        <article className="panel details__main">
          {memory.isFavorite && <span className="chip chip--soft"><Heart size={12} fill="currentColor" />Favorite</span>}
          <h1>{memory.title}</h1>
          <p className="details__meta"><MapPin size={17} />{memory.locationName ?? 'No location'} <CalendarDays size={17} />{formatDate(memory.memoryDate, 'long')}</p>
          <h4 className="overline">The story</h4>
          <p className="details__story">{memory.description || 'No story written yet. Edit this memory to add one.'}</p>
          {actionError && <div className="alert" role="alert">{actionError}</div>}
          <div className="details__actions">
            <button className="btn btn--primary btn--lg" onClick={toggleFavorite} disabled={busy}><Bookmark size={18} fill={memory.isFavorite ? 'currentColor' : 'none'} />{memory.isFavorite ? 'Saved to Favorites' : 'Save Memory'}</button>
            <Link className="btn btn--outline btn--lg" to={`/memories/${memory.id}/edit`}><Pencil size={17} />Edit memory</Link>
          </div>
        </article>

        <aside className="details__side">
          <article className="panel">
            <header className="panel__head"><h2>Photos</h2><span className="see-all">{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</span></header>
            {photos.length === 0 ? <p className="muted">No photos attached. <Link to={`/memories/${memory.id}/edit`}>Add photo URLs</Link></p> : (
              <div className="details__photos">
                {photos.map((media, position) => (
                  <button key={media.id} className={position === index ? 'is-active' : ''} onClick={() => setIndex(position)} aria-label={`Show photo ${position + 1}`}>
                    <img src={media.url} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </article>
          <article className="panel">
            <h2>A place to remember</h2>
            <div className="place-card">
              <MapPin size={22} className="accent" />
              <div>
                <b>{memory.locationName ?? 'No location yet'}</b>
                {hasCoords(memory) && <small>{memory.latitude.toFixed(4)}°N, {memory.longitude.toFixed(4)}°E</small>}
                {hasCoords(memory) && <Link to={`/map?focus=${memory.id}`}>View on your map <ArrowRight size={14} /></Link>}
              </div>
            </div>
          </article>
          {confirming ? (
            <div className="confirm" role="alertdialog" aria-label="Confirm delete">
              <p>Delete this memory and its photos? This can&apos;t be undone.</p>
              <div>
                <button className="btn btn--outline" onClick={() => setConfirming(false)} disabled={busy}>Keep it</button>
                <button className="btn btn--danger" onClick={remove} disabled={busy}><Trash2 size={16} />{busy ? 'Deleting…' : 'Delete'}</button>
              </div>
            </div>
          ) : (
            <button className="delete-link" onClick={() => setConfirming(true)}><Trash2 size={16} />Delete memory</button>
          )}
        </aside>
      </div>
    </div>
  );
}
