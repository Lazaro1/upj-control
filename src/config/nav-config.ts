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
    access: { requireOrg: true, excludeRole: 'org:member' }
  },
  {
    title: 'Meu Portal',
    url: '/dashboard/portal',
    icon: 'profile',
    isActive: false,
    shortcut: ['p', 'r'],
    items: [],
    access: { requireOrg: true, role: 'org:member' }
  },
  {
    title: 'Membros',
    url: '/dashboard/members',
    icon: 'members',
    isActive: false,
    shortcut: ['m', 'b'],
    items: [],
    access: { requireOrg: true, excludeRole: 'org:member' }
  },
  {
    title: 'Tipos de Cobrança',
    url: '/dashboard/charge-types',
    icon: 'billing',
    isActive: false,
    shortcut: ['t', 'c'],
    items: [],
    access: { requireOrg: true, excludeRole: 'org:member' }
  },
  {
    title: 'Cobranças Manuais',
    url: '/dashboard/charges',
    icon: 'charges',
    isActive: false,
    shortcut: ['c', 'b'],
    items: [],
    access: { requireOrg: true, excludeRole: 'org:member' }
  },
  {
    title: 'Pagamentos',
    url: '/dashboard/payments',
    icon: 'payments',
    isActive: false,
    shortcut: ['p', 'g'],
    items: [],
    access: { requireOrg: true, excludeRole: 'org:member' }
  },

  {
    title: 'Minha Conta',
    url: '#',
    icon: 'account',
    isActive: true,
    items: [
      {
        title: 'Meu Perfil',
        url: '/dashboard/profile',
        icon: 'profile',
        shortcut: ['m', 'm']
      }
    ]
  }
];
