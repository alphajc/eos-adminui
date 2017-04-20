<template>
    <div>
        <nav class="navbar navbar-toggleable-md navbar-inverse sticky-top">
            <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse"
                    data-target="#navbarTogglerSaves" aria-controls="navbarTogglerSaves" aria-expanded="false"
                    aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <a class="navbar-brand logo" href="https://github.com/gavin-chan/saves"><span class="p-1">SAVES</span></a>

            <div class="collapse navbar-collapse" id="navbarTogglerSaves">
                <ul class="navbar-nav mr-auto mt-2 mt-md-0">
                    <li class="nav-item active">
                        <router-link class="nav-link" to="/files/list">文件列表<span class="sr-only">(current)</span>
                        </router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/files/form">文件上传</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/files/recent">我最近用过的</router-link>
                    </li>
                </ul>
                <form class="form-inline my-2 my-lg-0">
                    <input class="form-control mr-sm-2" type="text" placeholder="Search">
                    <button class="btn btn-outline-success my-2 my-sm-0" type="submit">查找</button>
                </form>
            </div>
        </nav>
        <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="promptModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="promptModalLabel">{{modal_title}}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <ul class="list-group">
                            <template v-for="result in results">
                                <li class="list-group-item list-group-item-success" v-if="result.filename">
                                    {{result.filename}}上传成功
                                </li>
                                <li class="list-group-item list-group-item-warning" v-if="result.detail">
                                    {{result.detail.filename}}:{{result.message}}
                                </li>
                            </template>
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal">关闭</button>
                    </div>
                </div>
            </div>
        </div>
        <router-view></router-view>
    </div>
</template>

<script>
  export default {
    data () {
      return {
        modal_title: null,
        results: []
      }
    },
    mounted () {
      $(".navbar-collapse .nav-item").click(function (e) {
        e.preventDefault();
        $(this).tab('show');
      });
      $('#myModal').on('shown.bs.modal', function () {
        $('#myInput').focus();
      })
    }
  }
</script>

<style>
    .navbar-brand.logo {
        background: transparent;
    }

    .navbar {
        background: #336;
    }

    @media only screen and (min-width: 768px) {
        .slide-nav {
            min-height: 700px;
            position: fixed;
            box-shadow: 1px 0 rgba(0, 0, 0, 0.1);
        }
    }
</style>