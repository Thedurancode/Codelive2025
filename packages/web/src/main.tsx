import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import './index.css';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

// Layout Components
const Layout = lazy(() => import('./Layout').then(m => ({ default: m.default })));
const LayoutNavbar = lazy(() => import('./LayoutNavbar').then(m => ({ default: m.default })));
const DragAndDropSrcmdModal = lazy(() => import('./components/drag-and-drop-srcmd-modal').then(m => ({ default: m.DragAndDropSrcmdModal })));

// Route Components
const Home = lazy(() => import('./routes/home').then(m => ({ default: m.default })));
const AppContext = lazy(() => import('./routes/apps/context').then(m => ({ default: m.AppContext })));
const AppProviders = lazy(() => import('./routes/apps/context').then(m => ({ default: m.AppProviders })));
const AppPreview = lazy(() => import('./routes/apps/preview').then(m => ({ default: m.default })));
const AppFiles = lazy(() => import('./routes/apps/files').then(m => ({ default: m.default })));
const AppFilesShow = lazy(() => import('./routes/apps/files-show').then(m => ({ default: m.default })));
const Session = lazy(() => import('./routes/session').then(m => ({ default: m.default })));
const Settings = lazy(() => import('./routes/settings').then(m => ({ default: m.default })));
const Secrets = lazy(() => import('./routes/secrets').then(m => ({ default: m.default })));
const About = lazy(() => import('./routes/about').then(m => ({ default: m.default })));
const Pricing = lazy(() => import('./routes/pricing').then(m => ({ default: m.default })));
const ErrorPage = lazy(() => import('./error').then(m => ({ default: m.default })));

// Loaders
import { loader as configLoader } from './Layout';
import { loader as homeLoader } from './routes/home';
import {
  index as appIndex,
  preview as appPreview,
  filesShow as appFilesShow,
} from './routes/apps/loaders';
import sessionLoader from './routes/session';
import secretsLoader from './routes/secrets';

// Initialize PostHog
if (process.env.NODE_ENV === 'production') {
  posthog.init('phc_bQjmPYXmbl76j8gW289Qj9XILuu1STRnIfgCSKlxdgu', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // Disable automatic pageview capture
  });
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <DragAndDropSrcmdModal>
          <Layout>
            <LayoutNavbar>
              <Suspense fallback={<div className="min-h-screen bg-background" />}>
                <Home />
              </Suspense>
            </LayoutNavbar>
          </Layout>
        </DragAndDropSrcmdModal>
      </Suspense>
    ),
    errorElement: (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <ErrorPage />
      </Suspense>
    ),
    loader: homeLoader,
  },
  {
    path: '/',
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    errorElement: <ErrorPage />,
    loader: configLoader,
    children: [
      {
        path: '/srcbooks/:id',
        loader: sessionLoader,
        element: (
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <Session />
          </Suspense>
        ),
        errorElement: (
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <ErrorPage />
          </Suspense>
        ),
      },
      {
        path: '/apps/:id',
        loader: appIndex,
        element: <AppContext />,
        errorElement: <ErrorPage />,
        children: [
          {
            path: '',
            loader: appPreview,
            element: (
              <AppProviders>
                <AppPreview />
              </AppProviders>
            ),
          },
          {
            path: '/apps/:id/files',
            loader: appPreview,
            element: (
              <AppProviders>
                <AppFiles />
              </AppProviders>
            ),
          },
          {
            path: '/apps/:id/files/:path',
            loader: appFilesShow,
            element: (
              <AppProviders>
                <AppFilesShow />
              </AppProviders>
            ),
          },
        ],
      },
      {
        path: '/',
        element: (
          <LayoutNavbar>
            <Outlet />
          </LayoutNavbar>
        ),
        loader: configLoader,
        children: [
          {
            path: '/secrets',
            loader: secretsLoader,
            element: (
              <Suspense fallback={<div className="min-h-screen bg-background" />}>
                <Secrets />
              </Suspense>
            ),
            errorElement: (
              <Suspense fallback={<div className="min-h-screen bg-background" />}>
                <ErrorPage />
              </Suspense>
            ),
          },
          {
            path: '/pricing',
            element: (
              <Suspense fallback={<div className="min-h-screen bg-background" />}>
                <Pricing />
              </Suspense>
            ),
            errorElement: (
              <Suspense fallback={<div className="min-h-screen bg-background" />}>
                <ErrorPage />
              </Suspense>
            ),
          },
          {
            path: '/settings',
            element: <Settings />,
            errorElement: <ErrorPage />,
          },
          {
            path: '/about',
            element: <About />,
            errorElement: <ErrorPage />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <RouterProvider router={router} />
      </Suspense>
    </PostHogProvider>
  </React.StrictMode>
);
