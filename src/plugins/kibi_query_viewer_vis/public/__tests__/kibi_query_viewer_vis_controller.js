describe('Kibi Controllers', function () {
  var $scope;
  var Promise = require('bluebird');
  var ngMock = require('ngMock');
  var expect = require('expect.js');
  var globalState;

  function init(options) {
    ngMock.module('kibana', function ($provide) {
      $provide.constant('kbnDefaultAppId', '');
      $provide.constant('kibiDefaultDashboardId', '');
    });

    ngMock.module('apps/settings');

    ngMock.module('kibana/query_engine_client', function ($provide) {
      $provide.service('queryEngineClient', function () {
        return {
          clearCache: function () {
            return Promise.resolve();
          },
          getQueriesHtmlFromServer: function () {
            var resp = {
              data: {
                snippets: options.snippet ? [ options.snippet ] : [],
                error: options.snippetError
              }
            };
            return Promise.resolve(resp);
          }
        };
      });
    });

    ngMock.inject(function ($rootScope, $controller, _globalState_) {
      globalState = _globalState_;
      $scope = $rootScope;
      $scope.vis = {
        params: options.params
      };
      $controller('KibiQueryViewerVisController', { $scope: $scope });
      $scope.$digest();
    });
  }

  describe('Kibi query viewer controller', function () {
    it('should not render templates if no query is set', function () {
      var params = {};

      init({ params: params });
      $scope.renderTemplates();
      expect($scope.holder.html).to.be('');
      expect($scope.holder.activeFetch).to.be(false);
    });

    it('should display no result', function (done) {
      var params = {
        queryOptions: [ 123 ]
      };

      init({ params: params });
      $scope.renderTemplates().then(function () {
        expect($scope.holder.html).to.be('No result');
        expect($scope.holder.activeFetch).to.be(false);
        done();
      });
    });

    it('should display the template', function (done) {
      var params = {
        queryOptions: [
          {
            queryId: 123
          }
        ]
      };
      var snippet = {
        html: 'grishka',
        data: {
          config: {
            id: 123
          }
        }
      };

      init({ params: params, snippet: snippet });
      $scope.renderTemplates().then(function () {
        expect($scope.holder.html).to.contain('grishka');
        expect($scope.holder.activeFetch).to.be(false);
        done();
      });
    });

    it('should warn that the query is not activated', function (done) {
      var params = {
        queryOptions: [
          {
            queryId: 123
          }
        ]
      };
      var snippet = {
        queryActivated: false
      };

      init({ params: params, snippet: snippet });
      $scope.renderTemplates().then(function () {
        expect($scope.holder.html).to.contain('No query template is triggered now. Select a document?');
        expect($scope.holder.activeFetch).to.be(false);
        done();
      }).catch(done);
    });
  });
});
