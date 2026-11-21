import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowRight, Camera, Heart, Images, MapPin, Sparkles } from 'lucide-react';
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet';
import { Link } from 'react-router-dom';
import heroWide from '../assets/figma/hero-traveler-wide.png';
import hero from '../assets/figma/hero-traveler.png';
import beach from '../assets/figma/photo-beach.png';
import hills from '../assets/figma/photo-hills.png';
import tea from '../assets/figma/photo-tea-trail.png';
import temple from '../assets/figma/photo-temple.png';
import waterfall from '../assets/figma/photo-waterfall.png';
import { Logo, LogoMark } from '../components/Logo';
import { TILE_ATTRIBUTION, TILE_URL } from '../lib/mapConfig';
import { useAuth } from '../lib/auth';
import { useInView, useReducedMotion } from '../lib/motion';

const samplePins = [
  { name: 'Jaffna', at: [9.6615, 80.0255] },
  { name: 'Kandy', at: [7.2906, 80.6337] },
  { name: 'Colombo', at: [6.9271, 79.8612] },
  { name: 'Nuwara Eliya', at: [6.9497, 80.7891] },
  { name: 'Ella', at: [6.8667, 81.0466] },
  { name: 'Galle', at: [6.0367, 80.217] },
] as const;

function dropPin(index: number, animate: boolean) {
  const root = document.createElement('span');
  root.className = `map-pin${animate ? ' map-pin--drop' : ''}`;
  root.style.animationDelay = `${index * 160}ms`;
  root.innerHTML = '<span class="map-pin__head"></span>';
  return L.divIcon({ html: root, className: 'map-pin-wrap', iconSize: [30, 38], iconAnchor: [15, 38] });
}

function PreviewMap() {
  const [ref, visible] = useInView<HTMLDivElement>(0.25);
  const reduced = useReducedMotion();
  return (
    <div ref={ref} className="preview-map">
      {visible && (
        <MapContainer center={[7.75, 80.65]} zoom={7} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} boxZoom={false} keyboard={false} className="preview-map__canvas">
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <Polyline positions={samplePins.map((pin) => [...pin.at])} pathOptions={{ color: '#7c62ef', weight: 2, dashArray: '6 7', opacity: 0.7, className: reduced ? '' : 'route-draw' }} />
          {samplePins.map((pin, index) => <Marker key={pin.name} position={[...pin.at]} icon={dropPin(index, !reduced)} interactive={false} />)}
        </MapContainer>
      )}
      <span className="preview-map__badge">Sample preview</span>
      <article className="preview-map__card preview-map__card--a">
        <img src={beach} alt="" />
        <span><b>Galle Fort Weekend</b><small>Galle · Feb 2026</small></span>
      </article>
      <article className="preview-map__card preview-map__card--b">
        <img src={hills} alt="" />
        <span><b>Little Adam&apos;s Peak</b><small>Ella · Aug 2026</small></span>
      </article>
    </div>
  );
}

function Reveal({ children, className = '', as: Tag = 'section' }: { children: React.ReactNode; className?: string; as?: 'section' | 'div' }) {
  const [ref, visible] = useInView<HTMLElement>(0.15);
  return <Tag ref={ref as React.Ref<never>} className={`reveal ${visible ? 'is-visible' : ''} ${className}`}>{children}</Tag>;
}

export default function HomePage() {
  const user = useAuth((state) => state.user);
  const reduced = useReducedMotion();
  const primary = user ? { to: '/dashboard', label: 'Open your map' } : { to: '/create-account', label: 'Get Started' };

  return (
    <div className="home">
      <header className="home-nav">
        <Logo />
        <div className="home-nav__right">
          {user ? (
            <Link className="btn btn--outline" to="/dashboard">Go to Dashboard</Link>
          ) : (
            <>
              <span>Already collecting memories?</span>
              <Link className="btn btn--outline" to="/sign-in">Sign In</Link>
            </>
          )}
        </div>
      </header>

      <section className="hero">
        <div className="hero__brand-mobile" aria-hidden="true">
          <svg className="brand-route" viewBox="0 0 240 110">
            <path id="brand-route-path" className="brand-route__line" d="M12 90 C 50 108, 96 104, 120 96 S 190 84, 208 64 S 226 40, 232 32" />
            <g className="brand-route__plane">
              <path d="M0 -6 L14 0 L0 6 L3 0 Z" fill="#5b3fd9" />
              {!reduced && <animateMotion dur="5s" repeatCount="indefinite" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="linear"><mpath href="#brand-route-path" /></animateMotion>}
            </g>
          </svg>
          <LogoMark size={88} className="brand-route__pin" />
          <p className="hero__brand-word">Memo<span>Map</span></p>
          <p className="hero__brand-tag">Your Memories<br /><span>on a Map</span></p>
        </div>

        <div className="hero__copy">
          <p className="eyebrow"><Sparkles size={16} />Your personal travel companion</p>
          <h1>
            <span>Your Memories.</span>
            <span>Your Places.</span>
            <span>Your Story.</span>
          </h1>
          <p className="hero__lede">Keep the places that moved you and the moments that made you. Pin your memories to a map and relive your journey, one story at a time.</p>
          <div className="hero__actions">
            <Link className="btn btn--primary btn--lg" to={primary.to}><ArrowRight size={18} />{primary.label}</Link>
            {!user && <Link className="btn btn--outline btn--lg" to="/sign-in">Sign In</Link>}
          </div>
          <ul className="hero__features">
            <li><MapPin size={16} />Pin your places</li>
            <li><Images size={16} />Keep your photos</li>
            <li><Heart size={16} />Relive the feeling</li>
          </ul>
        </div>

        <div className="hero__art">
          <div className="hero__frame">
            <picture>
              <source media="(max-width: 760px)" srcSet={heroWide} />
              <img className="hero__img" src={hero} alt="A traveller in a sun hat reading a map above misty green mountains" />
            </picture>
            <span className="hero__pin" aria-hidden="true">
              <i className="hero__pulse" />
              <LogoMark size={46} />
            </span>
            <svg className="hero__route" viewBox="0 0 300 200" aria-hidden="true">
              <path id="hero-route-path" d="M20 180 C 80 150, 90 90, 150 80 S 250 40, 290 12" />
              <g>
                <path d="M0 -7 L16 0 L0 7 L4 0 Z" fill="#fff" />
                {!reduced && <animateMotion dur="7s" repeatCount="indefinite" rotate="auto"><mpath href="#hero-route-path" /></animateMotion>}
              </g>
            </svg>
          </div>
          <div className="hero__card">
            <b>Some places stay with you.</b>
            <span>Give every moment a place to belong.</span>
            <small><MapPin size={15} />Made for your Sri Lankan adventures</small>
          </div>
          <figure className="polaroid polaroid--one" aria-hidden="true"><img src={temple} alt="" /><figcaption>Jaffna · Apr</figcaption></figure>
          <figure className="polaroid polaroid--two" aria-hidden="true"><img src={waterfall} alt="" /><figcaption>Badulla · May</figcaption></figure>
        </div>
      </section>

      <Reveal className="home-preview">
        <div className="home-preview__copy">
          <p className="eyebrow"><MapPin size={16} />Your memory map</p>
          <h2>Every pin opens a story.</h2>
          <p>Drop a pin wherever something happened. Your map fills up with the places that matter, and each one opens the photos and words you saved there.</p>
          <ul className="checklist">
            <li>Real map with every place you&apos;ve been</li>
            <li>Tap a pin to jump back into the moment</li>
            <li>A dashed trail that follows your journey in order</li>
          </ul>
        </div>
        <PreviewMap />
      </Reveal>

      <Reveal className="home-steps">
        <h2>Three small steps. A lifetime of places.</h2>
        <div className="home-steps__grid">
          <article><span className="home-steps__icon"><MapPin /></span><b>Pin the place</b><p>Search for it, tap the map or use where you are right now.</p></article>
          <article><span className="home-steps__icon"><Camera /></span><b>Add the photos</b><p>Attach the pictures that bring the moment straight back.</p></article>
          <article><span className="home-steps__icon"><Heart /></span><b>Relive it any time</b><p>Browse your map, timeline and favourites whenever you miss a place.</p></article>
        </div>
      </Reveal>

      <Reveal className="home-cta">
        <img src={tea} alt="" />
        <div>
          <h2>Your next memory is waiting to happen.</h2>
          <p>Start your map today. It&apos;s private to you.</p>
          <Link className="btn btn--light btn--lg" to={primary.to}>{primary.label}<ArrowRight size={18} /></Link>
        </div>
      </Reveal>

      <footer className="home-foot">
        <span>© 2026 MemoMap</span>
        <span>Collect moments. Explore your journey.</span>
      </footer>
    </div>
  );
}
