import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { HomeIcon, UsersIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Influencers', href: '/influencers', icon: UsersIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-semibold text-blue-600">Influencer Invest</h1>
              </div>
              <div className="flex flex-col flex-grow mt-5">
                <nav className="flex-1 px-2 space-y-1 bg-white">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        classNames(
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                          'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={classNames(
                              isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500',
                              'mr-3 flex-shrink-0 h-6 w-6'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </>
                      )}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1 flex">
                <h2 className="text-2xl font-semibold text-gray-800 self-center">
                  Instagram Influencer Investment Analysis
                </h2>
              </div>
            </div>
          </div>

          <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}