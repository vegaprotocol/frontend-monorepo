'use strict';
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                  ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, '__esModule', { value: true });
var fs = require('fs');
var path = require('path');
var child_process_1 = require('child_process');
var log = require('npmlog');
var dotenv = require('dotenv');
process.env['NX_GIT_COMMIT_HASH'] = (0, child_process_1.execSync)(
  'git rev-parse HEAD'
)
  .toString()
  .replace(/[\r\n]/gm, '');
process.env['NX_GIT_ORIGIN_URL'] = (0, child_process_1.execSync)(
  'git remote get-url origin'
)
  .toString()
  .replace('ssh://git@', 'https://')
  .replace('.git', '')
  .replace(/[\r\n]/gm, '');
var logEnvData = function (envMap, envFiles, env, defaultEnvFile, loggerScope) {
  if (env && !envMap[env]) {
    log.warn(loggerScope, 'No environment called "'.concat(env, '" found.'));
    log.info(
      loggerScope,
      envFiles.length > 0
        ? 'You can create a new environment by putting an ".env.'
            .concat(
              env,
              '" file in your project root, or you can use the following available ones: '
            )
            .concat(envFiles.join(', '), '.')
        : 'To get started with environments, you can create an ".env" file in your project root with the desired variables.'
    );
  }
  if (!envMap[env]) {
    log.info(
      loggerScope,
      defaultEnvFile
        ? 'Using "'.concat(
            defaultEnvFile,
            '" as the default project environment.'
          )
        : 'Serving the project only using the environment variables scoped to your CLI.'
    );
  } else {
    log.info(
      loggerScope,
      'Using "'.concat(envMap[env], '" as the default project environment.')
    );
  }
};
var filenameToEnv = function (filename) {
  return filename.replace('.env.', '');
};
var getDefaultEnvFile = function (envMap) {
  return envMap['local'] || envMap['.env'];
};
var getEnvFile = function (env, envFiles, loggerScope) {
  var envMap = envFiles.reduce(function (acc, filename) {
    var _a;
    return __assign(
      __assign({}, acc),
      ((_a = {}), (_a[filenameToEnv(filename)] = filename), _a)
    );
  }, {});
  var defaultEnvFile = getDefaultEnvFile(envMap);
  logEnvData(envMap, envFiles, env, defaultEnvFile, loggerScope);
  return envMap[env] || defaultEnvFile;
};
function setup(env, context, loggerScope) {
  return __awaiter(this, void 0, void 0, function () {
    var root, workspacePath, files, envFile;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          root = context.workspace.projects[context.projectName].root;
          workspacePath = path.join(context.cwd, root);
          return [4 /*yield*/, fs.promises.readdir(workspacePath)];
        case 1:
          files = _a.sent();
          envFile = getEnvFile(
            env,
            files.filter(function (f) {
              return f.startsWith('.env');
            }),
            loggerScope
          );
          if (env && envFile) {
            dotenv.config({
              path: path.join(workspacePath, envFile),
              override: true,
            });
          }
          return [2 /*return*/];
      }
    });
  });
}
exports.default = setup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAtZW52aXJvbm1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZXR1cC1lbnZpcm9ubWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsdUJBQXlCO0FBQ3pCLDJCQUE2QjtBQUM3QiwrQ0FBeUM7QUFDekMsNEJBQThCO0FBQzlCLCtCQUFpQztBQUdqQyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsSUFBQSx3QkFBUSxFQUFDLG9CQUFvQixDQUFDO0tBQy9ELFFBQVEsRUFBRTtLQUNWLE9BQU8sQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLElBQUEsd0JBQVEsRUFBQywyQkFBMkIsQ0FBQztLQUNyRSxRQUFRLEVBQUU7S0FDVixPQUFPLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQztLQUNqQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztLQUNuQixPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBRTNCLElBQU0sVUFBVSxHQUFHLFVBQ2pCLE1BQThCLEVBQzlCLFFBQWtCLEVBQ2xCLEdBQVksRUFDWixjQUF1QixFQUN2QixXQUFvQjtJQUVwQixJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN2QixHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxrQ0FBMEIsR0FBRyxjQUFVLENBQUMsQ0FBQztRQUMvRCxHQUFHLENBQUMsSUFBSSxDQUNOLFdBQVcsRUFDWCxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUM7WUFDakIsQ0FBQyxDQUFDLGdFQUF3RCxHQUFHLHdGQUE2RSxRQUFRLENBQUMsSUFBSSxDQUNuSixJQUFJLENBQ0wsTUFBRztZQUNOLENBQUMsQ0FBQyxrSEFBa0gsQ0FDdkgsQ0FBQztLQUNIO0lBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNoQixHQUFHLENBQUMsSUFBSSxDQUNOLFdBQVcsRUFDWCxjQUFjO1lBQ1osQ0FBQyxDQUFDLGtCQUFVLGNBQWMsMkNBQXVDO1lBQ2pFLENBQUMsQ0FBQyw4RUFBOEUsQ0FDbkYsQ0FBQztLQUNIO1NBQU07UUFDTCxHQUFHLENBQUMsSUFBSSxDQUNOLFdBQVcsRUFDWCxrQkFBVSxNQUFNLENBQUMsR0FBRyxDQUFDLDJDQUF1QyxDQUM3RCxDQUFDO0tBQ0g7QUFDSCxDQUFDLENBQUM7QUFFRixJQUFNLGFBQWEsR0FBRyxVQUFDLFFBQWdCLElBQUssT0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBN0IsQ0FBNkIsQ0FBQztBQUUxRSxJQUFNLGlCQUFpQixHQUFHLFVBQUMsTUFBOEI7SUFDdkQsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNDLENBQUMsQ0FBQztBQUVGLElBQU0sVUFBVSxHQUFHLFVBQUMsR0FBVyxFQUFFLFFBQWtCLEVBQUUsV0FBb0I7SUFDdkUsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FDNUIsVUFBQyxHQUFHLEVBQUUsUUFBUTs7UUFBSyxPQUFBLHVCQUNkLEdBQUcsZ0JBQ0wsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFHLFFBQVEsT0FDbkM7SUFIaUIsQ0FHakIsRUFDRixFQUFFLENBQ0gsQ0FBQztJQUVGLElBQU0sY0FBYyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pELFVBQVUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxjQUFjLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFFL0QsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksY0FBYyxDQUFDO0FBQ3ZDLENBQUMsQ0FBQztBQUVGLFNBQThCLEtBQUssQ0FDakMsR0FBVyxFQUNYLE9BQXdCLEVBQ3hCLFdBQW9COzs7Ozs7b0JBRVosSUFBSSxHQUFLLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBcEQsQ0FBcUQ7b0JBQzNELGFBQWEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBRXJDLHFCQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFBOztvQkFBaEQsS0FBSyxHQUFHLFNBQXdDO29CQUVoRCxPQUFPLEdBQUcsVUFBVSxDQUN4QixHQUFHLEVBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQXBCLENBQW9CLENBQUMsRUFDekMsV0FBVyxDQUNaLENBQUM7b0JBRUYsSUFBSSxHQUFHLElBQUksT0FBTyxFQUFFO3dCQUNsQixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO3FCQUM1RTs7Ozs7Q0FDRjtBQW5CRCx3QkFtQkMifQ==
