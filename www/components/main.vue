<template>

    <div class="row no-gutters">
        <div class="col-md-3 col-12 slide-nav">
            <ul class="nav flex-column nav-pills">
                <li class="nav-item">
                    <a class="all nav-link active" href="javascript:void(0);"><i class="fa fa-file" aria-hidden="false">　所有文件</i></a>
                </li>
                <li class="nav-item">
                    <a class="documents nav-link" href="javascript:void(0);"><i class="fa fa-file-text-o" aria-hidden="true">　文档</i></a>
                </li>
                <li class="nav-item">
                    <a class="pictures nav-link" href="javascript:void(0);"><i class="fa fa-file-image-o" aria-hidden="true">　图片</i></a>
                </li>
                <li class="nav-item">
                    <a class="others nav-link" href="javascript:void(0);"><i class="fa fa-file-o" aria-hidden="true">　其它文件</i></a>
                </li>
                <li class="nav-tabs"></li>
                <li class="nav-item">
                    <a class="nav-link" v-on:click="logout" href="javascript:void(0);"><i class="fa fa-paper-plane-o" aria-hidden="true">　注销</i></a>
                </li>
            </ul>
        </div>
        <div class="col-md-9 push-md-3 col-12">
            <div class="main container-fluid"></div>
        </div>
    </div>
</template>

<script>
  export default {
    methods: {
      logout () {
        $.ajax({
          url: '/api/auth',
          type: 'delete'
        })
          .done(() => {
          this.$router.push('/login');
          });
      }
    },
    created () {
      $(function () {
        $('.nav-pills a').click(function (e) {
          e.preventDefault();
          $(this).tab('show');
        });
      });
    }
  }
</script>

<style>
    .nav-pills .nav-link {
        border-radius: 0;
    }
</style>