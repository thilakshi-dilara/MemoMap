import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { GuestOnly, RequireAuth } from '../components/RequireAuth';
import { PageLoader } from '../components/States';

const Home = lazy(() => import('../pages/HomePage'));
const Auth = lazy(() => import('../pages/AuthPages'));
const Dashboard = lazy(() => import('../pages/DashboardPage'));
const MapPage = lazy(() => import('../pages/MapPage'));
const Gallery = lazy(() => import('../pages/GalleryPage'));
const Timeline = lazy(() => import('../pages/TimelinePage'));
const Stats = lazy(() => import('../pages/StatsPage'));
const Profile = lazy(() => import('../pages/ProfilePage'));
const MemoryDetails = lazy(() => import('../pages/MemoryDetailsPage'));
const MemoryForm = lazy(() => import('../pages/MemoryFormPage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader label="Loading MemoMap…" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/welcome" element={<Navigate to="/" replace />} />
        <Route path="/sign-in" element={<GuestOnly><Auth mode="login" /></GuestOnly>} />
        <Route path="/create-account" element={<GuestOnly><Auth mode="register" /></GuestOnly>} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/memories" element={<Navigate to="/gallery" replace />} />
            <Route path="/memories/new" element={<MemoryForm />} />
            <Route path="/memories/:id" element={<MemoryDetails />} />
            <Route path="/memories/:id/edit" element={<MemoryForm key="edit" />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Navigate to="/profile#settings" replace />} />
            <Route path="/new-memory" element={<Navigate to="/memories/new" replace />} />
            <Route path="/memory-details" element={<Navigate to="/gallery" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
