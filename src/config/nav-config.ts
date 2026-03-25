import { NavItem } from '@/types';

/**
 * Navigation configuration with RBAC support
 *
 * Clerk Roles (configurados no painel):
 *   org:admin     — Controle total
 *   org:treasurer — Gestão financeira (tesoureiro)
 *   org:manager   — Visualização / relatórios (diretoria)
 *   org:member    — Portal individual (irmão)
 */
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [],
    // Visível para admin, treasurer e manager (member não vê o dashboard geral)
    access: { requireOrg: true }
  },
  {
    title: 'Membros',
    url: '/dashboard/members',
    icon: 'members',
    isActive: false,
    shortcut: ['m', 'b'],
    items: [],
    access: { requireOrg: true }
  },
  {
    title: 'Workspaces',
    url: '/dashboard/workspaces',
    icon: 'workspace',
    isActive: false,
    items: []
  },
  {
    title: 'Teams',
    url: '/dashboard/workspaces/team',
    icon: 'teams',
    isActive: false,
    items: [],
    access: { requireOrg: true }
  },
  {
    title: 'Account',
    url: '#',
    icon: 'account',
    isActive: true,
    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'profile',
        shortcut: ['m', 'm']
      },
      {
        title: 'Notifications',
        url: '/dashboard/notifications',
        icon: 'notification',
        shortcut: ['n', 'n']
      },
      {
        title: 'Login',
        shortcut: ['l', 'l'],
        url: '/',
        icon: 'login'
      }
    ]
  }
];
