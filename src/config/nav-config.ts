import { NavItem } from '@/types';
import {
  FINANCIAL_WRITE_ROLES,
  MEMBER_WRITE_ROLES,
  STAFF_ROLES
} from '@/lib/auth/roles';

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
    access: { requireOrg: true, roles: [...STAFF_ROLES] }
  },
  {
    title: 'Início',
    url: '/dashboard/portal',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['p', 'r'],
    items: [],
    access: { role: 'org:member' }
  },
  {
    title: 'Membros',
    url: '/dashboard/members',
    icon: 'members',
    isActive: false,
    shortcut: ['m', 'b'],
    items: [],
    access: { requireOrg: true, roles: [...MEMBER_WRITE_ROLES] }
  },
  {
    title: 'Tipos de Cobrança',
    url: '/dashboard/charge-types',
    icon: 'billing',
    isActive: false,
    shortcut: ['t', 'c'],
    items: [],
    access: { requireOrg: true, roles: [...FINANCIAL_WRITE_ROLES] }
  },
  {
    title: 'Cobranças',
    url: '#',
    icon: 'charges',
    isActive: false,
    shortcut: ['c', 'b'],
    items: [
      {
        title: 'Lançamentos',
        url: '/dashboard/charges',
        icon: 'charges',
        shortcut: ['c', 'l']
      },
      {
        title: 'Lançamento Mensal',
        url: '/dashboard/charges/recurring',
        icon: 'repeat',
        shortcut: ['c', 'r']
      }
    ],
    access: { requireOrg: true, roles: [...FINANCIAL_WRITE_ROLES] }
  },
  {
    title: 'Pagamentos',
    url: '/dashboard/payments',
    icon: 'payments',
    isActive: false,
    shortcut: ['p', 'g'],
    items: [],
    access: { requireOrg: true, roles: [...FINANCIAL_WRITE_ROLES] }
  },
  {
    title: 'Caixa Geral',
    url: '/dashboard/cash-transactions',
    icon: 'cashRegister',
    isActive: false,
    shortcut: ['c', 'x'],
    items: [],
    access: { requireOrg: true, roles: [...FINANCIAL_WRITE_ROLES] }
  },
  {
    title: 'Relatórios',
    url: '/dashboard/reports',
    icon: 'reports',
    isActive: false,
    shortcut: ['r', 'l'],
    items: [],
    access: { requireOrg: true, roles: [...STAFF_ROLES] }
  },
  {
    title: 'Auditoria',
    url: '/dashboard/audit-logs',
    icon: 'reports',
    isActive: false,
    shortcut: ['a', 'u'],
    items: [],
    access: { requireOrg: true, roles: [...STAFF_ROLES] }
  },
  {
    title: 'Fechamento Mensal',
    url: '/dashboard/period-closing',
    icon: 'lock',
    isActive: false,
    shortcut: ['f', 'm'],
    items: [],
    access: { requireOrg: true, roles: [...FINANCIAL_WRITE_ROLES] }
  },

  {
    title: 'Minha Conta',
    url: '#',
    icon: 'account',
    isActive: false,
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
