/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Created by gavin at 4/15/17 2:53 PM.
 */

import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/home';
import Login from '@/components/login';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    }
  ]
});
