<template>
    <div class="background-shading">
        <div class="signin-form">
            <div class="logo">SAVES</div>
            <div class="form-wrapper">
                <div class="title">登录到Saves</div>
                <form name="login" id="login-form" action="/login" method="post" class="ga-decorate-linking">
                    <table class="form-table">
                        <tbody><tr>
                            <td><label>用户名</label></td>
                            <td><input type="text" class="form-input" name="username" data-validate="required" value="" autofocus="" placeholder="用户名"></td>
                        </tr>
                        <tr>
                            <td><label>密码</label></td>
                            <td><input type="password" name="password" class="form-input" data-validate="required" placeholder="密码"></td>
                        </tr>
                        </tbody></table>

                    <div class="button-wrapper">
                        <button type="submit" class="btn with-spinner">
                            <span class="zoom">登录</span>
                            <div class="spinner-white"></div>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'login'
  }
</script>