@Library('vega-shared-library') _

def commitHash = 'UNKNOWN'

pipeline {
  agent any
  options {
    skipDefaultCheckout true
    parallelsAlwaysFailFast()
  }
  stages {
    stage('approbation') {
      steps {
        sh 'printenv'
        checkout scm
        script {
          commitHash = getCommitHash()
        }
        runApprobation ignoreFailure: false,
          frontendBranch: commitHash,
          type: 'frontend',
      }
    }
  }
}
