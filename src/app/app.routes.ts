import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./customer/home/home').then(m => m.Home)
  },
  {
    path: 'menu',
    loadComponent: () => import('./customer/menu/menu').then(m => m.Menu)
  },
  {
    path: 'cart',
    loadComponent: () => import('./customer/cart/cart').then(m => m.Cart)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./customer/checkout/checkout').then(m => m.Checkout)
  },
  {
    path: 'confirmation/:id',
    loadComponent: () => import('./customer/confirmation/confirmation').then(m => m.Confirmation)
  },
  {
    path:'contact',
    loadComponent:()=>import('./customer/contact/contact').then(m=>m.Contact)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login').then(m => m.Login)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./admin/admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'menu',
        loadComponent: () => import('./admin/menu-management/menu-management').then(m => m.MenuManagement)
      },
      {
        path: 'orders',
        loadComponent: () => import('./admin/order-management/order-management').then(m => m.OrderManagement)
      },
      {
        path: 'settings',
        loadComponent: () => import('./admin/settings/settings').then(m => m.Settings)
      },
      {
        path: 'pickup-slots',
        loadComponent: () => import('./admin/pickup-slots/pickup-slots').then(m => m.PickupSlots)
      },
      {
  path: 'locations',
  loadComponent: () => import('./admin/locations/locations').then(m => m.Locations)
},
{
  path: 'messages',
  loadComponent: () => import('./admin/messages/messages').then(m => m.Messages)
},
    ]
  },
  { path: '**', redirectTo: 'home' }
];