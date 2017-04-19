<template>
    <div class="background-shading">
        <div class="signin-form">
            <div class="logo align-middle p-2">SAVES</div>
            <div class="form-wrapper">
                <div class="title">登录到Saves</div>
                <div v-if="error" class="alert alert-danger">{{error.message}}</div>
                <form name="login" id="login-form" v-on:submit.prevent="doLogin" class="ga-decorate-linking">
                    <table class="form-table">
                        <tbody><tr>
                            <td><label>用户名</label></td>
                            <td><input type="text" class="form-input" v-model="username" data-validate="required" value="" autofocus="" placeholder="用户名"></td>
                        </tr>
                        <tr>
                            <td><label>密码</label></td>
                            <td><input type="password" v-model="password" class="form-input" data-validate="required" placeholder="密码"></td>
                        </tr>
                        </tbody></table>

                    <div class="button-wrapper">
                        <button type="submit" class="btn with-spinner">
                            <div v-if="loading" class="spinner-white process"></div>
                            <span v-else class="zoom">登录</span>
                        </button>
                    </div>
                </form>
                <footer>
                    <div class="h-25 d-inline-block">&copy;2017 all rights reserved.</div>
                </footer>
            </div>
        </div>
    </div>
</template>

<script>
  export default {
    data () {
      return {
        loading: null,
        error: null,
        username: null,
        password: null
      }
    },
    methods: {
      doLogin () {
        this.loading = true;
        $.post('/api/auth', {username:this.username,password:this.password})
          .done(() => {
            setInterval(()=>{
              $.get('/api/ping')
                .done(() => {
                  //nothing
                })
                .fail(() => {
                  alert('网络连接已断开．');
                  this.$router.replace('/login');
                });
            }, 30000);
            this.$router.push('/files')
          })
          .fail((xhr) => {
            this.error = JSON.parse(xhr.responseText);

          })
          .always(() => {
            this.loading = false;
          });
      }
    }
  }
</script>

<style>
    footer div , .title {
        text-align: center;
        width: 100%;
    }
</style>