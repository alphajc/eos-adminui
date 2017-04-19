<template>

    <div class="row no-gutters">
        <div class="col-md-2 col-12 slide-nav">
            <ul class="nav flex-column nav-pills">
                <li class="nav-item">
                    <a class="all nav-link active" href="javascript:void(0);"><i class="fa fa-file" aria-hidden="false">　所有文件</i></a>
                </li>
                <li class="nav-item">
                    <a class="documents nav-link" href="javascript:void(0);"><i class="fa fa-file-text-o"
                                                                                aria-hidden="true">　文档</i></a>
                </li>
                <li class="nav-item">
                    <a class="pictures nav-link" href="javascript:void(0);"><i class="fa fa-file-image-o"
                                                                               aria-hidden="true">　图片</i></a>
                </li>
                <li class="nav-item">
                    <a class="others nav-link" href="javascript:void(0);"><i class="fa fa-file-o" aria-hidden="true">　其它文件</i></a>
                </li>
                <li class="nav-tabs"></li>
                <li class="nav-item">
                    <a class="nav-link" v-on:click="logout" href="javascript:void(0);"><i class="fa fa-paper-plane-o"
                                                                                          aria-hidden="true">　注销</i></a>
                </li>
            </ul>
        </div>
        <div class="col-md-10 push-md-2 col-12">
            <div class="main container-fluid" id="content">
                <div v-if="error" class="alert alert-danger">{{error.message}}</div>
                <table class="table">
                    <thead class="thead-default">
                    <tr>
                        <th>文件名</th>
                        <th>大小(Byte)</th>
                        <th>可见性</th>
                        <th>上传时间</th>
                        <th>上传者</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody class="table-striped">
                    <tr v-for="item in items">
                        <td>{{item.filename}}</td>
                        <td>{{item.size}}</td>
                        <td>{{item.visibility}}</td>
                        <td>{{item.last_modify}}</td>
                        <td>{{item.uploaded_by}}</td>
                        <td><a v-bind:href="'/api/files/' + item.uuid"><i class="fa fa-download" aria-hidden="true"></i></a></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
  export default {
    data () {
      return {
        items: null,
        error: null
      }
    },
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
      $.get('/api/filelist')
        .done( (data) => {
          this.items = data;
        })
        .fail( (xhr) => {
          this.error = JSON.parse(xhr.responseText);
        });
    }
  }
</script>

<style>
    .nav-pills .nav-link {
        border-radius: 0;
    }
</style>