module.exports = shipit => {
  // Load shipit-deploy tasks
  require('shipit-deploy')(shipit)
  require('shipit-shared')(shipit);

  shipit.initConfig({
    default: {
      deployTo: '/mnt/www/app-name',
      repositoryUrl: 'https://github.com/user/super-project.git',
      keepReleases: 8,
      ignores: ['.git', 'node_modules', 'logs'],
      shared: {
        overwrite: true,
        dirs: ['node_modules', 'logs'],
        files: [
          'pm2.config.json'
        ],
      }
    },
    staging: {
      servers: 'deploy@staging.super-project.com',
      branch: 'develop',
    },
    production: {
      servers: [{
        host: '47.100.235.38',
        user: 'deploy',
      }],
      branch: 'master'
    }
  })

  // 监听部署事件，在部署中不同生命周期中插入任务
  shipit.on('deploy', function () {
    shipit.on('published', async function () {
      await shipit.remote('npm install --production', { cwd: `${shipit.config.deployTo}/current`})
      // await shipit.start('pm2:start');
    })
  })

  // shipit staging pm2:start
  shipit.task('pm2:start', function() {
    console.log('======= - pm2 start - =======')
    console.log('--- before status ---')
    shipit.remote('pm2 list', {cwd: `${shipit.config.deployTo}/current`});
    console.log('--- run start or restart task ---')
    shipit.remote('pm2 startOrGracefulReload pm2.config.json', {cwd: `${shipit.config.deployTo}/current`});
    console.log('--- end status ---')
    setTimeout(() => {
      shipit.remote('pm2 list', {cwd: `${shipit.config.deployTo}/current`});
    }, 5000)
  })
}
