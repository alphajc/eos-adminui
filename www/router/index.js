/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Created by gavin at 4/15/17 2:53 PM.
 */

import Vue from 'vue';
import Router from 'vue-router';
import Files from '@/components/files';
import Login from '@/components/login';
import Main from '@/components/main';

import '@/style/main.css';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      beforeEnter: (to, from, next) => {
        $.get('/api/auth')
          .done(function () {
            next('/files');
          })
          .fail(function () {
            next('/login');
          });
      }
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/files',
      component: Files,
      children: [
        {
          path: 'list',
          component: Main
        },
        {
          path: 'form',
          component: Main
        },
        {
          path: 'recent',
          component: Main
        }
      ],
      beforeEnter: (to, from, next) => {
        $.get('/api/auth')
          .done(function () {
            next();
          })
          .fail(function () {
            next('/login');
          });
      }
    }
  ]
});
